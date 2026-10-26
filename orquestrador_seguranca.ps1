# Orquestrador de Segurança Integrado
# Gestão de Materiais de Catenária (DTE)
# Coordena: Lock, Backup, Versioning, e Notificações

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

$ROOT_DIR = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte"
$LOCK_SYSTEM = Join-Path $ROOT_DIR "sistema_lock.ps1"
$BACKUP_SYSTEM = Join-Path $ROOT_DIR "sistema_backup.ps1"
$VERSION_SYSTEM = Join-Path $ROOT_DIR "sistema_versioning.ps1"

# ============================================================================
# FUNÇÃO: AbrirSessao
# ============================================================================

function AbrirSessao {
    param(
        [string]$FileKey,      # "MANUAL", "APP", etc.
        [string]$Descricao,    # Descrição da modificação
        [string]$Usuario = "Claude"
    )

    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║         ABRINDO SESSÃO DE MODIFICAÇÃO SEGURA                  ║
╚════════════════════════════════════════════════════════════════╝

Ficheiro: $FileKey
Descrição: $Descricao
Utilizador: $Usuario
Hora: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@ -ForegroundColor Cyan

    # 1. Adquirir lock
    Write-Host "📌 Passo 1: Adquirir lock..." -ForegroundColor Yellow
    & $LOCK_SYSTEM acquire $FileKey
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao adquirir lock!" -ForegroundColor Red
        return $false
    }

    # 2. Criar backup
    Write-Host ""
    Write-Host "💾 Passo 2: Criar backup..." -ForegroundColor Yellow
    & $BACKUP_SYSTEM create $FileKey "Sessão de modificação: $Descricao"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao criar backup!" -ForegroundColor Red
        & $LOCK_SYSTEM release $FileKey
        return $false
    }

    Write-Host ""
    Write-Host "✅ Sessão aberta com sucesso!" -ForegroundColor Green
    Write-Host "   Lock: Adquirido" -ForegroundColor Green
    Write-Host "   Backup: Criado" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Dica: Feche a sessão com 'FecharSessao $FileKey' quando terminar" -ForegroundColor Cyan

    return $true
}

# ============================================================================
# FUNÇÃO: FecharSessao
# ============================================================================

function FecharSessao {
    param(
        [string]$FileKey,
        [switch]$IncluirVersioning,
        [string]$DescricaoVersioning = ""
    )

    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║         FECHANDO SESSÃO DE MODIFICAÇÃO                        ║
╚════════════════════════════════════════════════════════════════╝

Ficheiro: $FileKey
Hora: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@ -ForegroundColor Cyan

    # 1. Actualizar versão (opcional)
    if ($IncluirVersioning) {
        Write-Host "🔄 Passo 1: Actualizar versão..." -ForegroundColor Yellow
        & $VERSION_SYSTEM update $FileKey $DescricaoVersioning
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Aviso: Falha ao actualizar versão" -ForegroundColor Yellow
        }
    }

    # 2. Libertar lock
    Write-Host ""
    Write-Host "📌 Passo $(if ($IncluirVersioning) { '2' } else { '1' }): Libertar lock..." -ForegroundColor Yellow
    & $LOCK_SYSTEM release $FileKey
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao libertar lock!" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "✅ Sessão fechada com sucesso!" -ForegroundColor Green
    Write-Host "   Versão: $(if ($IncluirVersioning) { 'Actualizada' } else { 'Não alterada' })" -ForegroundColor Green
    Write-Host "   Lock: Libertado" -ForegroundColor Green

    return $true
}

# ============================================================================
# FUNÇÃO: FluxoCompleto
# ============================================================================

function FluxoCompleto {
    param(
        [string]$FileKey,
        [string]$Descricao,
        [scriptblock]$AccaoModificacao,
        [switch]$Versioning
    )

    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       INICIANDO FLUXO COMPLETO DE MODIFICAÇÃO SEGURA          ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

    # Abrir sessão
    $opened = AbrirSessao -FileKey $FileKey -Descricao $Descricao
    if (-not $opened) {
        return $false
    }

    # Executar ação de modificação
    Write-Host ""
    Write-Host "🔧 Passo 3: Executar modificação..." -ForegroundColor Yellow
    try {
        & $AccaoModificacao
        $success = $?
    } catch {
        Write-Host "❌ Erro durante modificação: $_" -ForegroundColor Red
        $success = $false
    }

    if (-not $success) {
        Write-Host "Reversão: Libertando lock sem versioning..." -ForegroundColor Yellow
        & $LOCK_SYSTEM release $FileKey
        return $false
    }

    # Fechar sessão
    Write-Host ""
    $closed = FecharSessao -FileKey $FileKey -IncluirVersioning:$Versioning -DescricaoVersioning $Descricao

    return $closed
}

# ============================================================================
# FUNÇÃO: StatusGeral
# ============================================================================

function StatusGeral {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║           STATUS GERAL DO SISTEMA DE SEGURANÇA                ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

    Write-Host "🔒 Status de Locks:" -ForegroundColor Yellow
    & $LOCK_SYSTEM status

    Write-Host ""
    Write-Host "💾 Status de Backups:" -ForegroundColor Yellow
    & $BACKUP_SYSTEM status

    Write-Host ""
    Write-Host "📊 Versões Actuais:" -ForegroundColor Yellow
    & $VERSION_SYSTEM get
}

# ============================================================================
# FUNÇÃO: RecuperarDeErro
# ============================================================================

function RecuperarDeErro {
    param(
        [string]$FileKey,
        [string]$BackupName = $null
    )

    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║              RECUPERAÇÃO DE ERRO / REVERSÃO                   ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Red

    Write-Host "⚠️  Modo de recuperação ativado para: $FileKey" -ForegroundColor Red
    Write-Host ""

    # Forçar libertação de lock
    Write-Host "1️⃣  Libertando lock forcadamente..." -ForegroundColor Yellow
    & $LOCK_SYSTEM release $FileKey

    # Listar backups
    Write-Host ""
    Write-Host "2️⃣  Backups disponíveis:" -ForegroundColor Yellow
    & $BACKUP_SYSTEM list $FileKey

    if ($BackupName) {
        Write-Host ""
        Write-Host "3️⃣  Restaurando backup: $BackupName" -ForegroundColor Yellow
        & $BACKUP_SYSTEM restore $BackupName
    } else {
        Write-Host ""
        Write-Host "💡 Dica: Use 'RecuperarDeErro $FileKey <backup_name>' para restaurar" -ForegroundColor Cyan
    }
}

# ============================================================================
# INTERFACE INTERACTIVA
# ============================================================================

if ($args.Count -eq 0) {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║    Orquestrador de Segurança - Gestão de Materiais (DTE)     ║
╚════════════════════════════════════════════════════════════════╝

COMANDOS PRINCIPAIS:

  abrir MANUAL [descrição]
    Abre sessão segura de modificação (adquire lock + cria backup)

  fechar MANUAL [-versioning]
    Fecha sessão segura (liberta lock + opcional atualiza versão)

  status
    Mostra status geral do sistema (locks, backups, versões)

  recuperar MANUAL [backup_name]
    Modo de emergência - liberta lock forcadamente e restaura

EXEMPLO DE USO SEGURO:

  # Abrir sessão
  .\orquestrador_seguranca.ps1 abrir MANUAL "Adicionado manual de uso"

  # Modificar ficheiro...

  # Fechar com atualização de versão
  .\orquestrador_seguranca.ps1 fechar MANUAL -versioning

COMANDOS AVANÇADOS (submétodos):

  lock <action> <resource>
    .\orquestrador_seguranca.ps1 lock acquire MANUAL
    .\orquestrador_seguranca.ps1 lock release MANUAL
    .\orquestrador_seguranca.ps1 lock status

  backup <action> [resource]
    .\orquestrador_seguranca.ps1 backup create MANUAL
    .\orquestrador_seguranca.ps1 backup list
    .\orquestrador_seguranca.ps1 backup cleanup

  version <action> [resource]
    .\orquestrador_seguranca.ps1 version get
    .\orquestrador_seguranca.ps1 version update MANUAL
    .\orquestrador_seguranca.ps1 version log

"@
    exit
}

$command = $args[0].ToLower()

switch ($command) {
    "abrir" {
        $fileKey = if ($args.Count -gt 1) { $args[1] } else { $null }
        $descricao = if ($args.Count -gt 2) { $args[2..($args.Count-1)] -join " " } else { "Modificação de ficheiro" }

        if (-not $fileKey) {
            Write-Host "Erro: especifique o ficheiro (MANUAL ou APP)" -ForegroundColor Red
            exit 1
        }

        AbrirSessao -FileKey $fileKey -Descricao $descricao
    }

    "fechar" {
        $fileKey = if ($args.Count -gt 1) { $args[1] } else { $null }
        $versioning = $args -contains "-versioning"
        $descricao = if ($args.Count -gt 2 -and -not $versioning) { $args[2..($args.Count-1)] -join " " } else { "" }

        if (-not $fileKey) {
            Write-Host "Erro: especifique o ficheiro (MANUAL ou APP)" -ForegroundColor Red
            exit 1
        }

        FecharSessao -FileKey $fileKey -IncluirVersioning:$versioning -DescricaoVersioning $descricao
    }

    "status" {
        StatusGeral
    }

    "recuperar" {
        $fileKey = if ($args.Count -gt 1) { $args[1] } else { $null }
        $backupName = if ($args.Count -gt 2) { $args[2] } else { $null }

        if (-not $fileKey) {
            Write-Host "Erro: especifique o ficheiro (MANUAL ou APP)" -ForegroundColor Red
            exit 1
        }

        RecuperarDeErro -FileKey $fileKey -BackupName $backupName
    }

    "lock" {
        $action = if ($args.Count -gt 1) { $args[1] } else { "status" }
        $resource = if ($args.Count -gt 2) { $args[2] } else { "" }

        if ($resource) {
            & $LOCK_SYSTEM $action $resource
        } else {
            & $LOCK_SYSTEM $action
        }
    }

    "backup" {
        $action = if ($args.Count -gt 1) { $args[1] } else { "status" }
        $resource = if ($args.Count -gt 2) { $args[2] } else { "" }

        if ($resource) {
            & $BACKUP_SYSTEM $action $resource
        } else {
            & $BACKUP_SYSTEM $action
        }
    }

    "version" {
        $action = if ($args.Count -gt 1) { $args[1] } else { "get" }
        $resource = if ($args.Count -gt 2) { $args[2] } else { "" }

        if ($resource) {
            & $VERSION_SYSTEM $action $resource
        } else {
            & $VERSION_SYSTEM $action
        }
    }

    default {
        Write-Host "Comando desconhecido: $command" -ForegroundColor Red
        exit 1
    }
}
