# Guia de Colaboração - Gestão de Materiais de Catenária

## Para o seu Colega: Como Trabalhar com a Aplicação

### Configuração Inicial (Fazer uma única vez)

1. **Instalar Git** (se ainda não tiver)
   - https://git-scm.com/download/win
   - Durante instalação: usar UTF-8, deixar as opções por defeito

2. **Clonar o repositório** (copiar o projeto para o PC dele)
   ```bash
   git clone https://github.com/RuiSimoesDTE/gestao-de-stocks-dt.git
   cd gestao-de-stocks-dt
   ```

3. **Configurar identidade** (para saber quem fez cada mudança)
   ```bash
   git config --global user.name "Nome do Colega"
   git config --global user.email "email@exemplo.pt"
   ```

### Fluxo de Trabalho Diário

**Antes de começar a trabalhar:**
```bash
git pull
```
(Traz as mudanças mais recentes que o Rui fez)

**Trabalhar normalmente** na aplicação (`gestao_armazem_catenaria.html`)

**Quando terminar:**
```bash
git add -A
git commit -m "Descrição do que foi feito"
git push
```

Exemplo:
```bash
git add -A
git commit -m "Acrescentar 5 guias AT para Vendas Novas"
git push
```

### O que Fazer em Caso de Conflito

Se aparecer mensagem de "conflito" ao fazer `push`:

1. Fazer `git pull` novamente
2. Git avisa qual ficheiro tem conflito
3. Ver o ficheiro em editor de texto
4. Escolher qual versão guardar (ou juntar as duas)
5. Fazer `git add` e `git commit` novamente
6. Fazer `git push`

### Locais de Trabalho

A aplicação funciona em **3 locais** com os mesmos dados:

1. **Desktop** (Rui) - `C:\Users\dst7973\Desktop\gestao_de_stocks_dte`
2. **PC do Colega** - `[local onde clonou]`
3. **GitHub Pages** - https://ruisimoesdte.github.io/gestao-de-stocks-dt/gestao_armazem_catenaria.html

**Dados sincronizados automaticamente:**
- `dados_partilhados/dte_estado_dst7973.json` → ficheiro único, mesmo em todos os locais

### Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `git status` | Ver ficheiros alterados |
| `git log --oneline` | Ver histórico de mudanças |
| `git pull` | Trazer mudanças do servidor |
| `git push` | Enviar mudanças para o servidor |
| `git diff` | Ver exatamente o que mudou |

### Dúvidas Frequentes

**P: Posso trabalhar enquanto o Rui também trabalha?**
R: Sim! Se editarem coisas diferentes, git junta automaticamente. Se editarem a mesma coisa, avisa para resolver manualmente.

**P: E se eu fizer um erro e quiser voltar atrás?**
R: `git log` mostra histórico. Pode reverter para qualquer versão anterior.

**P: Posso fazer backup?**
R: Sim! GitHub guarda todas as versões. É o backup automático.

---

**Contacto:** Se tiver dúvidas, envie a mensagem de erro que aparece.
