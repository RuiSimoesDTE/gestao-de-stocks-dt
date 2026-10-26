# Guia Prático: Sistema Completo de Segurança

**Gestão de Materiais de Catenária - DTE**

---

## 📋 Índice

1. [Quickstart - Primeiros Passos](#quickstart)
2. [Cenários Reais](#cenários)
3. [Troubleshooting](#troubleshooting)
4. [Integração em Workflows](#integração)
5. [Boas Práticas](#boas-práticas)

---

## <a name="quickstart">🚀 Quickstart - Primeiros Passos</a>

### Modificação Simples (Recomendado)

```powershell
# 1. Abrir sessão segura
PS> .\orquestrador_seguranca.ps1 abrir MANUAL "Adicionado índice de PDFs"

# ✅ Resultado esperado:
# ╔════════════════════════════════════════════════════════════════╗
# ║         ABRINDO SESSÃO DE MODIFICAÇÃO SEGURA                  ║
# ╚════════════════════════════════════════════════════════════════╝
# 
# Ficheiro: MANUAL
# Descrição: Adicionado índice de PDFs
# Utilizador: Claude
# Hora: 2026-10-14 14:30:00
#
# 📌 Passo 1: Adquirir lock...
# ✓ Lock adquirido para [MANUAL] por Claude
#
# 💾 Passo 2: Criar backup...
# ✓ Backup criado: MANUAL_2026-10-14_143000.html (52KB) - Razão: Sessão de modificação: ...
#
# ✅ Sessão aberta com sucesso!
#    Lock: Adquirido
#    Backup: Criado
#    
# 💡 Dica: Feche a sessão com 'FecharSessao MANUAL' quando terminar

# 2. Modificar ficheiro
# → Editar em editor de código: C:\...\MANUAL.html
# → Testar no navegador: F5 ou Ctrl+Shift+R

# 3. Fechar sessão com actualização de versão
PS> .\orquestrador_seguranca.ps1 fechar MANUAL -versioning

# ✅ Resultado esperado:
# ╔════════════════════════════════════════════════════════════════╗
# ║         FECHANDO SESSÃO DE MODIFICAÇÃO                        ║
# ╚════════════════════════════════════════════════════════════════╝
#
# 🔄 Passo 1: Actualizar versão...
# ✓ Versão actualizada: MANUAL 1.0.0 → 1.0.1
#   Descrição: Adicionado índice de PDFs
#
# 📌 Passo 2: Libertar lock...
# ✓ Lock libertado para [MANUAL] por Claude
#
# ✅ Sessão fechada com sucesso!
#    Versão: Actualizada
#    Lock: Libertado

# 4. Utilizadores verão: "✨ Actualização disponível!"
```

---

## <a name="cenários">📚 Cenários Reais</a>

### Cenário 1: Edição Rápida do MANUAL

```powershell
# Situação: Rui quer adicionar uma seção no MANUAL

# Terminal 1: Abrir sessão
PS> .\orquestrador_seguranca.ps1 abrir MANUAL "Adicionado guia de segurança"

# Esperar resposta:
# ✅ Sessão aberta com sucesso!
#    Lock: Adquirido
#    Backup: Criado

# Agora pode editar com segurança!
# (O lock impede outro agente de mexer)

# Editar: C:\...\documentacao\MANUAL.html
# Adicionar conteúdo, testar, etc.

# Terminal 1: Fechar com versioning
PS> .\orquestrador_seguranca.ps1 fechar MANUAL -versioning

# ✅ Versão: 1.0.0 → 1.0.1
#    Utilizadores verão: "Actualização disponível!"
```

### Cenário 2: Atualização da App com Múltiplos Ficheiros

```powershell
# Situação: Implementar novo feature na app

# Passo 1: Abrir sessão APP (a principal)
PS> .\orquestrador_seguranca.ps1 abrir APP "Novo módulo de relatórios"

# ✅ Lock adquirido para [APP]
# ✅ Backup criado: APP_2026-10-14_143000.html

# Editar múltiplos ficheiros:
# ├── C:\...\app\gestao_armazem_catenaria.html
# ├── C:\...\app\sw.js (se necessário)
# └── Testar no navegador

# Passo 2: Fechar com versioning
PS> .\orquestrador_seguranca.ps1 fechar APP -versioning

# ✅ Versão: 2.3.1 → 2.3.2
#    Service worker notifica: "Actualização disponível!"
```

### Cenário 3: Erro Durante Modificação - Recuperação Rápida

```powershell
# Situação: Edição saiu errada, precisa voltar atrás

# Opção 1: Ver backups disponíveis
PS> .\sistema_backup.ps1 list MANUAL

# Resultado:
# Backups:
# 
#   • MANUAL - MANUAL_2026-10-14_143000.html
#     ├─ Tamanho: 50.78 KB
#     ├─ Data: 2026-10-14 14:30:00.000 (menos de um minuto atrás)
#     └─ Motivo: Sessão de modificação: ...
#   
#   • MANUAL - MANUAL_2026-10-14_142500.html
#     ├─ Tamanho: 49.34 KB
#     ├─ Data: 2026-10-14 14:25:00.000 (5 minutos atrás)
#     └─ Motivo: Sessão de modificação: ...

# Opção 2: Restaurar backup
PS> .\sistema_backup.ps1 restore MANUAL_2026-10-14_143000.html

# Ou usar o orquestrador para recuperação automática:
PS> .\orquestrador_seguranca.ps1 recuperar MANUAL MANUAL_2026-10-14_143000.html

# ✅ Ficheiro restaurado!
```

### Cenário 4: Lock Preso (Timeout ou Erro)

```powershell
# Situação: Sistema preso, mensagem de erro "Não consegui adquirir lock"

# Passo 1: Ver locks ativos
PS> .\sistema_lock.ps1 status

# Resultado:
# Locks activos:
#   • .lock_MANUAL - Claude (12345) - 150s atrás

# Passo 2: Ver log detalhado
PS> .\sistema_lock.ps1 log 50

# Resultado mostra histórico completo

# Passo 3: Forçar limpeza (se lock tem >120 segundos)
PS> .\sistema_lock.ps1 cleanup

# Ou forçar recuperação com orquestrador:
PS> .\orquestrador_seguranca.ps1 recuperar MANUAL

# ✅ Lock libertado forcadamente!
```

### Cenário 5: Auditar Versões

```powershell
# Ver todas as versões actuais
PS> .\sistema_versioning.ps1 get

# Resultado:
# Versões Actuais:
#
#   MANUAL: 1.0.1
#   APP: 2.3.2
#   SW: 2026-10-14-07
#
# Última actualização: 2026-10-14 14:45:00.000

# Ver histórico de mudanças
PS> .\sistema_versioning.ps1 log MANUAL 20

# Resultado:
# Changelog (últimas 20 entradas):
#
#   MANUAL: 1.0.0 → 1.0.1
#     ├─ 2026-10-14 14:45:00.000
#     └─ Adicionado guia de segurança

# Ver status geral
PS> .\orquestrador_seguranca.ps1 status

# Resultado mostra tudo: locks ativos, backups, versões, changelog
```

---

## <a name="troubleshooting">🔧 Troubleshooting</a>

### Problema: "Não consegui adquirir lock"

**Causa:** Outro processo tem o ficheiro bloqueado

**Solução:**

```powershell
# 1. Ver quem tem o lock
PS> .\sistema_lock.ps1 status MANUAL

# 2. Se o lock é antigo (>120s), remover
PS> .\sistema_lock.ps1 cleanup

# 3. Se ainda assim não funcionar, forçar
PS> .\orquestrador_seguranca.ps1 recuperar MANUAL
```

---

### Problema: "Erro ao criar backup"

**Causa:** Ficheiro não existe ou sem permissões

**Solução:**

```powershell
# 1. Verificar se ficheiro existe
PS> Test-Path "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\documentacao\MANUAL.html"

# 2. Verificar permissões
PS> Get-Item "C:\...\MANUAL.html" | Get-Acl

# 3. Se está bloqueado por outro programa, fechar:
PS> Get-Process | Where-Object {$_.Handles -gt 100} | Stop-Process -Force
```

---

### Problema: Espaço em disco cheio

**Causa:** Demasiados backups guardados

**Solução:**

```powershell
# Ver tamanho total de backups
PS> .\sistema_backup.ps1 status

# Resultado mostra:
# Total de backups: 45
# Tamanho total: 2.34 MB

# Limpar automaticamente (manter apenas 10 versões)
PS> .\sistema_backup.ps1 cleanup

# Ou especificar ficheiro
PS> .\sistema_backup.ps1 cleanup MANUAL
```

---

### Problema: "Versão não encontrada no HTML"

**Causa:** Meta tags não inseridas corretamente

**Solução:**

```powershell
# 1. Verificar se tag existe no ficheiro
PS> Select-String '<meta name="version"' "C:\...\MANUAL.html"

# 2. Se não existir, adicionar manualmente:
# No <head> do HTML:
<meta name="version" content="1.0.0">
<meta name="last-updated" content="2026-10-14T14:00:00Z">

# 3. Tentar actualizar versão novamente
PS> .\sistema_versioning.ps1 update MANUAL "Corrigido versionamento"
```

---

## <a name="integração">🔗 Integração em Workflows</a>

### Template: Script de Modificação Segura

```powershell
# script_modificar_manual.ps1
# Exemplo: Script que modifica MANUAL.html de forma segura

param(
    [string]$NovaSecao = "",
    [string]$Descricao = "Modificação automática"
)

# Importar funções do orquestrador
. ".\orquestrador_seguranca.ps1"

# 1. Abrir sessão
$sessionOK = AbrirSessao -FileKey "MANUAL" -Descricao $Descricao
if (-not $sessionOK) {
    Write-Error "Não consegui abrir sessão"
    exit 1
}

try {
    # 2. Ler ficheiro
    $path = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\documentacao\MANUAL.html"
    $conteudo = Get-Content $path -Raw -Encoding UTF8
    
    # 3. Aplicar modificação
    if ($NovaSecao) {
        $conteudo = $conteudo.Replace(
            "<!-- INSERIR_AQUI -->",
            $NovaSecao
        )
    }
    
    # 4. Guardar
    Set-Content -Path $path -Value $conteudo -Encoding UTF8 -NoNewline
    
    Write-Host "✅ Modificação realizada com sucesso" -ForegroundColor Green
    
} catch {
    Write-Error "Erro durante modificação: $_"
    FecharSessao -FileKey "MANUAL" -IncluirVersioning:$false
    exit 1
}

# 5. Fechar com versioning
$closed = FecharSessao -FileKey "MANUAL" -IncluirVersioning:$true -DescricaoVersioning $Descricao

if ($closed) {
    exit 0
} else {
    exit 1
}
```

**Usar:**

```powershell
.\script_modificar_manual.ps1 -Descricao "Adicionado novo guia"
```

---

### Integração com CI/CD

```powershell
# exemplo_pipeline.ps1
# Para use em GitHub Actions ou Azure Pipelines

param(
    [string]$FileKey,
    [string]$Branch = "main"
)

# Setup
$ErrorActionPreference = "Stop"

# 1. Abrir sessão
Write-Host "Abrindo sessão de modificação..." -ForegroundColor Cyan
.\orquestrador_seguranca.ps1 abrir $FileKey "Pipeline: $Branch"

# 2. Fazer modificações (exemplo: pull de repositório)
git pull origin $Branch

# 3. Fechar com versioning
Write-Host "Fechando sessão com versioning..." -ForegroundColor Cyan
.\orquestrador_seguranca.ps1 fechar $FileKey -versioning

Write-Host "Pipeline completado!" -ForegroundColor Green
```

---

## <a name="boas-práticas">✨ Boas Práticas</a>

### ✅ Fazer

- **Sempre usar o orquestrador** para abrir/fechar sessões
- **Verificar status antes** de começar edições críticas
- **Usar descrições claras** para documentar mudanças
- **Listar backups** se precisar reverter
- **Fechar com versioning** para notificar utilizadores
- **Verificar logs** se algo saiu errado

### ❌ NÃO Fazer

- **NÃO editar ficheiros durante locks** (vai falhar)
- **NÃO apagar backups** manualmente (deixar sistema gerir)
- **NÃO usar força (`-Force`)** sem saber o que faz
- **NÃO pular passos** do fluxo seguro
- **NÃO esquecer de fechar sessões** (liberta lock)
- **NÃO confiar em sincronização manual** (usar sistema)

---

### Checklist Antes de Modificação

```
□ Sessão aberta com descrição clara?
□ Lock adquirido com sucesso?
□ Backup criado automaticamente?
□ Ficheiro editado com cuidado?
□ Testado no navegador?
□ Sem erros console?
□ Sessão fechada com versioning?
□ Utilizadores notificados?
□ Versão incrementada?
□ Log regista tudo?
```

---

### Documentação de Mudanças

```powershell
# Bom exemplo:
.\orquestrador_seguranca.ps1 abrir MANUAL "Adicionado índice de PDFs com links"

# Outro bom exemplo:
.\orquestrador_seguranca.ps1 abrir APP "Feature: Modo offline melhorado"

# Mau exemplo:
.\orquestrador_seguranca.ps1 abrir MANUAL "Mudança"  # Muito vago!
```

---

## 📞 Contacto & Suporte

**Sistema desenvolvido por:** Claude (Anthropic)  
**Para:** Rui Simões (DTE)  
**Email:** rui16simoes@gmail.com

**Em caso de problema:**

1. Verificar logs: `.\sistema_lock.ps1 log 50`
2. Ver status: `.\orquestrador_seguranca.ps1 status`
3. Listar backups: `.\sistema_backup.ps1 list`
4. Recuperar: `.\orquestrador_seguranca.ps1 recuperar FICHEIRO`

---

**Última atualização:** 2026-10-14  
**Versão do Sistema:** 1.0.0
