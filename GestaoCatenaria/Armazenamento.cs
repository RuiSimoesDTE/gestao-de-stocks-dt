using Microsoft.Data.Sqlite;

namespace GestaoCatenaria;

/// <summary>
/// Guarda o estado completo da aplicação (todas as obras) numa base SQLite.
/// Cada gravação cria uma versão nova — nada é apagado, o histórico fica todo.
/// É esse histórico que serve de backup automático.
/// </summary>
public class Armazenamento
{
    private readonly string _ligacao;

    public Armazenamento(string caminhoBase)
    {
        var pasta = Path.GetDirectoryName(caminhoBase);
        if (!string.IsNullOrEmpty(pasta)) Directory.CreateDirectory(pasta);
        _ligacao = new SqliteConnectionStringBuilder { DataSource = caminhoBase }.ToString();
        Criar();
    }

    private SqliteConnection Abrir()
    {
        var c = new SqliteConnection(_ligacao);
        c.Open();
        return c;
    }

    private void Criar()
    {
        using var c = Abrir();
        using var cmd = c.CreateCommand();
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS Versoes (
                Versao       INTEGER PRIMARY KEY AUTOINCREMENT,
                Dados        TEXT    NOT NULL,
                GravadoEm    TEXT    NOT NULL,
                GravadoPor   TEXT    NOT NULL,
                Nota         TEXT    NOT NULL DEFAULT ''
            );";
        cmd.ExecuteNonQuery();
    }

    /// <summary>Número da última versão. Zero quando a base ainda está vazia.</summary>
    public long UltimaVersao()
    {
        using var c = Abrir();
        using var cmd = c.CreateCommand();
        cmd.CommandText = "SELECT COALESCE(MAX(Versao), 0) FROM Versoes;";
        return Convert.ToInt64(cmd.ExecuteScalar());
    }

    /// <summary>Estado mais recente. Devolve null quando a base está vazia.</summary>
    public EstadoGravado? Ultimo()
    {
        using var c = Abrir();
        using var cmd = c.CreateCommand();
        cmd.CommandText = "SELECT Versao, Dados, GravadoEm, GravadoPor, Nota FROM Versoes ORDER BY Versao DESC LIMIT 1;";
        using var r = cmd.ExecuteReader();
        return r.Read() ? Ler(r) : null;
    }

    public EstadoGravado? Obter(long versao)
    {
        using var c = Abrir();
        using var cmd = c.CreateCommand();
        cmd.CommandText = "SELECT Versao, Dados, GravadoEm, GravadoPor, Nota FROM Versoes WHERE Versao = $v;";
        cmd.Parameters.AddWithValue("$v", versao);
        using var r = cmd.ExecuteReader();
        return r.Read() ? Ler(r) : null;
    }

    /// <summary>Últimas gravações, sem os dados — para mostrar o histórico.</summary>
    public List<RegistoVersao> Historico(int limite = 100)
    {
        var lista = new List<RegistoVersao>();
        using var c = Abrir();
        using var cmd = c.CreateCommand();
        cmd.CommandText = "SELECT Versao, GravadoEm, GravadoPor, Nota, LENGTH(Dados) FROM Versoes ORDER BY Versao DESC LIMIT $n;";
        cmd.Parameters.AddWithValue("$n", limite);
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            lista.Add(new RegistoVersao(
                r.GetInt64(0), r.GetString(1), r.GetString(2), r.GetString(3), r.GetInt64(4)));
        }
        return lista;
    }

    /// <summary>
    /// Grava uma versão nova. Só aceita se quem grava partiu da última versão —
    /// assim ninguém escreve por cima do trabalho de outra pessoa sem dar por isso.
    /// </summary>
    public ResultadoGravacao Gravar(string dados, long versaoBase, string gravadoPor, string nota)
    {
        using var c = Abrir();
        using var tx = c.BeginTransaction();

        using (var atual = c.CreateCommand())
        {
            atual.Transaction = tx;
            atual.CommandText = "SELECT COALESCE(MAX(Versao), 0) FROM Versoes;";
            var ultima = Convert.ToInt64(atual.ExecuteScalar());
            if (versaoBase != ultima)
            {
                tx.Rollback();
                return new ResultadoGravacao(false, ultima, "conflito");
            }
        }

        using (var ins = c.CreateCommand())
        {
            ins.Transaction = tx;
            ins.CommandText = @"INSERT INTO Versoes (Dados, GravadoEm, GravadoPor, Nota)
                                VALUES ($d, $e, $p, $n);
                                SELECT last_insert_rowid();";
            ins.Parameters.AddWithValue("$d", dados);
            ins.Parameters.AddWithValue("$e", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
            ins.Parameters.AddWithValue("$p", string.IsNullOrWhiteSpace(gravadoPor) ? "(sem nome)" : gravadoPor);
            ins.Parameters.AddWithValue("$n", nota ?? "");
            var nova = Convert.ToInt64(ins.ExecuteScalar());
            tx.Commit();
            return new ResultadoGravacao(true, nova, "gravado");
        }
    }

    private static EstadoGravado Ler(SqliteDataReader r) =>
        new(r.GetInt64(0), r.GetString(1), r.GetString(2), r.GetString(3), r.GetString(4));
}

public record EstadoGravado(long Versao, string Dados, string GravadoEm, string GravadoPor, string Nota);

public record RegistoVersao(long Versao, string GravadoEm, string GravadoPor, string Nota, long Tamanho);

public record ResultadoGravacao(bool Ok, long Versao, string Estado);
