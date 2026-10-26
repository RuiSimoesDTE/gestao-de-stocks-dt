using System.Text;
using System.Text.Json;
using GestaoCatenaria;
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddResponseCompression(o =>
{
    o.EnableForHttps = true;
    o.Providers.Add<GzipCompressionProvider>();
    o.MimeTypes = new[] { "text/html", "text/css", "application/javascript", "application/json", "image/svg+xml" };
});

// Caminho da base de dados. Em Azure use "/home/dados/catenaria.db" (a pasta /home persiste).
var caminhoConfigurado = builder.Configuration["Armazenamento:Caminho"];
var caminhoBase = string.IsNullOrWhiteSpace(caminhoConfigurado)
    ? Path.Combine(builder.Environment.ContentRootPath, "App_Data", "catenaria.db")
    : caminhoConfigurado;
var armazem = new Armazenamento(caminhoBase);
builder.Services.AddSingleton(armazem);

var app = builder.Build();

app.UseResponseCompression();
app.UseStaticFiles();   // serve wwwroot: módulos, ícones, service worker, documentos

// ---------------------------------------------------------------------------
// Arranque: se a base estiver vazia, semeia com o estado exportado do programa.
// ---------------------------------------------------------------------------
if (armazem.UltimaVersao() == 0)
{
    var semente = Path.Combine(app.Environment.ContentRootPath, "Dados", "estado_inicial.json");
    if (File.Exists(semente))
    {
        var conteudo = File.ReadAllText(semente, Encoding.UTF8);
        armazem.Gravar(conteudo, 0, "arranque", "Estado inicial importado do programa local");
        app.Logger.LogInformation("Base semeada a partir de {ficheiro}", semente);
    }
    else
    {
        app.Logger.LogWarning("Sem Dados/estado_inicial.json — a aplicação arranca vazia e usa o SEED_DATA embebido.");
    }
}

// ---------------------------------------------------------------------------
// Página principal: o estado é injetado no HTML, para a aplicação abrir já com
// os dados do servidor em vez de ler o armazenamento do navegador.
// ---------------------------------------------------------------------------
var caminhoPagina = Path.Combine(app.Environment.ContentRootPath, "Paginas", "index.html");
string? modelo = null;

app.MapGet("/", (Armazenamento a) =>
{
    modelo ??= File.ReadAllText(caminhoPagina, Encoding.UTF8);
    var ultimo = a.Ultimo();
    var injecao = new StringBuilder();
    injecao.Append("window.__VERSAO_ESTADO=").Append(ultimo?.Versao ?? 0).Append(';');
    if (ultimo is not null)
    {
        injecao.Append("window.__ESTADO_INICIAL=").Append(ultimo.Dados).Append(';');
        injecao.Append("window.__ESTADO_GRAVADO_EM=").Append(JsonSerializer.Serialize(ultimo.GravadoEm)).Append(';');
        injecao.Append("window.__ESTADO_GRAVADO_POR=").Append(JsonSerializer.Serialize(ultimo.GravadoPor)).Append(';');
    }
    var html = modelo.Replace("/*__ESTADO_INJETADO__*/", injecao.ToString());
    return Results.Content(html, "text/html; charset=utf-8");
});

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
app.MapGet("/api/estado", (Armazenamento a) =>
{
    var u = a.Ultimo();
    if (u is null) return Results.Content("{\"versao\":0,\"dados\":null}", "application/json");
    return Results.Content(Envelope(u), "application/json");
});

app.MapGet("/api/estado/historico", (Armazenamento a) => Results.Json(a.Historico()));

app.MapGet("/api/estado/{versao:long}", (long versao, Armazenamento a) =>
{
    var e = a.Obter(versao);
    return e is null ? Results.NotFound() : Results.Content(Envelope(e), "application/json");
});

app.MapPost("/api/estado", (PedidoGravar pedido, HttpRequest req, Armazenamento a) =>
{
    if (pedido.dados.ValueKind != JsonValueKind.Object)
        return Results.BadRequest(new { erro = "Campo 'dados' em falta ou inválido." });

    var quem = req.Headers["X-Utilizador"].ToString();
    if (string.IsNullOrWhiteSpace(quem)) quem = "(sem nome)";

    var r = a.Gravar(pedido.dados.GetRawText(), pedido.versaoBase, quem, pedido.nota ?? "");

    if (!r.Ok)
    {
        // Alguém gravou entretanto. Não escrevemos por cima: devolvemos o conflito.
        return Results.Json(new { ok = false, estado = "conflito", versaoAtual = r.Versao }, statusCode: 409);
    }
    return Results.Json(new { ok = true, versao = r.Versao, gravadoPor = quem });
});

app.MapGet("/api/saude", (Armazenamento a) => Results.Json(new
{
    ok = true,
    versao = a.UltimaVersao(),
    servidor = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
}));

app.Run();

static string Envelope(EstadoGravado e)
{
    var sb = new StringBuilder();
    sb.Append("{\"versao\":").Append(e.Versao);
    sb.Append(",\"gravadoEm\":").Append(JsonSerializer.Serialize(e.GravadoEm));
    sb.Append(",\"gravadoPor\":").Append(JsonSerializer.Serialize(e.GravadoPor));
    sb.Append(",\"dados\":").Append(e.Dados);
    sb.Append('}');
    return sb.ToString();
}

/// <summary>Corpo do pedido de gravação vindo do navegador.</summary>
public record PedidoGravar(long versaoBase, JsonElement dados, string? nota);
