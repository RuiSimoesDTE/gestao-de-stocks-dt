# Sistema de Backup Automático
# Gestão de Materiais de Catenária (DTE)
# Cria cópias timestamped antes de cada alteração crítica

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

$BACKUP_DIR = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\backups"
$HISTORY_FILE = Join-Path $BACKUP_DIR "HISTORICO_BACKUPS.json"
$LOG_FILE = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\logs\log_backup.txt"
$MAX_BACKUP_VERSIONS = 10  # Manter apenas as 10 versões mais recentes

# Ficheiros críticos a fazer backup
$CRITICAL_FILES = @{
    "MANUAL" = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\documentacao\MANUAL.html"
    "APP" = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\app\gestao_armazem_catenaria.html"
    "APP_DATA" = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\app\gestao_armazem_catenaria.json"
    "SW" = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\app\sw.js"
}

# Criar directórios se não existirem
if (-not (Test-Path $BACKUP_DIR)) { New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null }
if (-not (Test-Path (Split-Path $LOG_FILE))) { New-Item -ItemType Directory -Force -Path (Split-Path $LOG_FILE) | Out-Null }

# Criar ficheiro de histórico se não existir
if (-not (Test-Path $HISTORY_FILE)) {
    @{
        criado = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")
        versao = "1.0"
        backups = @()
    } | ConvertTo-Json -Depth 10 | Set-Content $HISTORY_FILE
}

# ============================================================================
# FUNÇÕES DE LOG
# ============================================================================

function LogEvent {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")
    $logLine = "[$timestamp] [$Level] $Message"

    if ($Level -eq "ERROR") {
        Write-Host $logLine -ForegroundColor Red
    } elseif ($Level -eq "WARN") {
        Write-Host $logLine -ForegroundColor Yellow
    } else {
        Write-Host $logLine -ForegroundColor Green
    }

    Add-Content -Path $LOG_FILE -Value $logLine -Force
}

# ============================================================================
# FUNÇÃO: CreateBackup
# ============================================================================

function CreateBackup {
    param(
        [string]$FileKey,           # "MANUAL", "APP", etc.
        [string]$Reason = "Manual backup",
        [string]$ProcessName = "Claude"
    )

    if (-not $CRITICAL_FILES.ContainsKey($FileKey)) {
        LogEvent "✗ Ficheiro desconhecido: $FileKey" "ERROR"
        return $null
    }

    $sourceFile = $CRITICAL_FILES[$FileKey]

    if (-not (Test-Path $sourceFile)) {
        LogEvent "✗ Ficheiro não encontrado: $sourceFile" "ERROR"
        return $null
    }

    # Gerar nome do backup com timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $sourceExt = [System.IO.Path]::GetExtension($sourceFile)
    $backupName = "${FileKey}_${timestamp}${sourceExt}"
    $backupPath = Join-Path $BACKUP_DIR $backupName

    try {
        # Copiar ficheiro
        Copy-Item -Path $sourceFile -Destination $backupPath -Force

        # Obter informações
        $fileInfo = Get-Item $sourceFile
        $backupInfo = Get-Item $backupPath
        $fileSize = $fileInfo.Length

        # Registar no histórico
        $history = Get-Content $HISTORY_FILE -Raw | ConvertFrom-Json

        $entry = @{
            ficheiro = $FileKey
            caminho_original = $sourceFile
            backup = $backupName
            caminho_backup = $backupPath
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")
            tamanho_bytes = $fileSize
            tamanho_kb = [math]::Round($fileSize / 1024, 2)
            motivo = $Reason
            processo = $ProcessName
            usuario = $env:USERNAME
            maquina = $env:COMPUTERNAME
        }

        $history.backups += $entry
        $history | ConvertTo-Json -Depth 10 | Set-Content $HISTORY_FILE

        LogEvent "✓ Backup criado: $backupName ($([math]::Round($fileSize/1024))KB) - Razão: $Reason"
        return $backupPath

    } catch {
        LogEvent "✗ Erro ao criar backup para $FileKey : $_" "ERROR"
        return $null
    }
}

# ============================================================================
# FUNÇÃO: CleanupOldBackups
# ============================================================================

function CleanupOldBackups {
    param(
        [string]$FileKey = "*"  # "*" = todos, "MANUAL" = só manuais, etc.
    )

    $history = Get-Content $HISTORY_FILE -Raw | ConvertFrom-Json

    # Agrupar por ficheiro
    if ($FileKey -eq "*") {
        $groups = $history.backups | Group-Object -Property ficheiro
    } else {
        $groups = @($history.backups | Where-Object { $_.ficheiro -eq $FileKey } | Group-Object -Property ficheiro)
    }

    $removedCount = 0

    foreach ($group in $groups) {
        # Ordenar por data (mais recentes primeiro)
        $sorted = $group.Group | Sort-Object -Property timestamp -Descending

        # Remover os antigos (manter os 10 mais recentes)
        if ($sorted.Count -gt $MAX_BACKUP_VERSIONS) {
            $toRemove = $sorted | Select-Object -Skip $MAX_BACKUP_VERSIONS

            foreach ($backup in $toRemove) {
                try {
                    if (Test-Path $backup.caminho_backup) {
                        Remove-Item $backup.caminho_backup -Force
                        LogEvent "Backup removido: $($backup.backup)"
                        $removedCount++
                    }

                    # Remover do histórico
                    $history.backups = @($history.backups | Where-Object { $_.timestamp -ne $backup.timestamp })
                } catch {
                    LogEvent "⚠ Erro ao remover backup $($backup.backup): $_" "WARN"
                }
            }
        }
    }

    # Guardar histórico atualizado
    $history | ConvertTo-Json -Depth 10 | Set-Content $HISTORY_FILE

    Write-Host "Limpeza: $removedCount backups antigos removidos" -ForegroundColor Cyan
}

# ============================================================================
# FUNÇÃO: RestoreBackup
# ============================================================================

function RestoreBackup {
    param(
        [string]$BackupName,
        [switch]$Force
    )

    $history = Get-Content $HISTORY_FILE -Raw | ConvertFrom-Json
    $backupEntry = $history.backups | Where-Object { $_.backup -eq $BackupName } | Select-Object -First 1

    if (-not $backupEntry) {
        LogEvent "✗ Backup não encontrado: $BackupName" "ERROR"
        return $false
    }

    $backupPath = $backupEntry.caminho_backup
    $originalPath = $backupEntry.caminho_original

    if (-not (Test-Path $backupPath)) {
        LogEvent "✗ Ficheiro de backup não existe: $backupPath" "ERROR"
        return $false
    }

    # Confirmação
    if (-not $Force) {
        Write-Host "⚠ Vai restaurar de: $BackupName"
        Write-Host "   Para: $originalPath"
        $response = Read-Host "Tem a certeza? (sim/não)"
        if ($response -ne "sim") {
            Write-Host "Cancelado" -ForegroundColor Yellow
            return $false
        }
    }

    try {
        # Criar backup do ficheiro actual antes de restaurar
        $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
        $sourceExt = [System.IO.Path]::GetExtension($originalPath)
        $preCopy = "$originalPath.pre-restore-$timestamp$sourceExt"

        if (Test-Path $originalPath) {
            Copy-Item -Path $originalPath -Destination $preCopy -Force
            LogEvent "Backup pré-restauro criado: $(Split-Path $preCopy -Leaf)"
        }

        # Restaurar
        Copy-Item -Path $backupPath -Destination $originalPath -Force
        LogEvent "✓ Ficheiro restaurado de: $BackupName"
        return $true

    } catch {
        LogEvent "✗ Erro ao restaurar: $_" "ERROR"
        return $false
    }
}

# ============================================================================
# FUNÇÃO: ListBackups
# ============================================================================

function ListBackups {
    param(
        [string]$FileKey = "*"
    )

    $history = Get-Content $HISTORY_FILE -Raw | ConvertFrom-Json

    if ($FileKey -eq "*") {
        $backups = $history.backups | Sort-Object -Property timestamp -Descending
    } else {
        $backups = $history.backups | Where-Object { $_.ficheiro -eq $FileKey } | Sort-Object -Property timestamp -Descending
    }

    if ($backups.Count -eq 0) {
        Write-Host "Nenhum backup encontrado" -ForegroundColor Yellow
        return
    }

    Write-Host "Backups:" -ForegroundColor Cyan
    Write-Host ""

    $backups | ForEach-Object {
        $age = ((Get-Date) - [datetime]::ParseExact($_.timestamp, "yyyy-MM-dd HH:mm:ss.fff", $null)).TotalSeconds
        $ageStr = if ($age -lt 60) { "$([math]::Round($age))s atrás" }
                  elseif ($age -lt 3600) { "$([math]::Round($age/60))min atrás" }
                  else { "$([math]::Round($age/3600,1))h atrás" }

        Write-Host "  • $($_.ficheiro)" -ForegroundColor White -NoNewline
        Write-Host " - $($_.backup)" -ForegroundColor Gray
        Write-Host "    ├─ Tamanho: $($_.tamanho_kb) KB" -ForegroundColor DarkGray
        Write-Host "    ├─ Data: $($_.timestamp) ($ageStr)" -ForegroundColor DarkGray
        Write-Host "    └─ Motivo: $($_.motivo)" -ForegroundColor DarkGray
        Write-Host ""
    }
}

# ============================================================================
# INTERFACE INTERACTIVA
# ============================================================================

if ($args.Count -eq 0) {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║       Sistema de Backup para Gestão de Materiais (DTE)        ║
╚════════════════════════════════════════════════════════════════╝

SINTAXE:
  .\sistema_backup.ps1 <comando> [opções]

COMANDOS:
  create MANUAL [razão]      Criar backup do MANUAL.html
  create APP [razão]        Criar backup da app
  list [MANUAL|APP]         Listar todos os backups
  cleanup [MANUAL|APP]      Remover backups antigos (>10 versões)
  restore <backup_name>     Restaurar um backup
  status                    Ver estatísticas de backups

EXEMPLOS:
  .\sistema_backup.ps1 create MANUAL "Antes de alteração"
  .\sistema_backup.ps1 list
  .\sistema_backup.ps1 list MANUAL
  .\sistema_backup.ps1 cleanup
  .\sistema_backup.ps1 restore MANUAL_2026-10-14_143000.html

"@
    exit
}

$command = $args[0].ToLower()
$param1 = if ($args.Count -gt 1) { $args[1] } else { "" }
$param2 = if ($args.Count -gt 2) { $args[2..($args.Count-1)] -join " " } else { "Manual backup" }

switch ($command) {
    "create" {
        if (-not $param1) { Write-Host "Erro: especifique o ficheiro (MANUAL, APP, APP_DATA, ou SW)" -ForegroundColor Red; exit 1 }
        $result = CreateBackup -FileKey $param1 -Reason $param2
        exit if ($result) { 0 } else { 1 }
    }

    "list" {
        ListBackups -FileKey ($param1 -or "*")
    }

    "cleanup" {
        CleanupOldBackups -FileKey ($param1 -or "*")
    }

    "restore" {
        if (-not $param1) { Write-Host "Erro: especifique o nome do backup" -ForegroundColor Red; exit 1 }
        $result = RestoreBackup -BackupName $param1
        exit if ($result) { 0 } else { 1 }
    }

    "status" {
        $history = Get-Content $HISTORY_FILE -Raw | ConvertFrom-Json
        Write-Host "Estatísticas de Backups:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Total de backups: $($history.backups.Count)"
        Write-Host "Tamanho total: $([math]::Round(($history.backups.tamanho_bytes | Measure-Object -Sum).Sum / 1024 / 1024, 2)) MB"
        Write-Host "Ficheiro de histórico: $HISTORY_FILE"
        Write-Host ""
        Write-Host "Por ficheiro:" -ForegroundColor Gray
        $history.backups | Group-Object -Property ficheiro | ForEach-Object {
            Write-Host "  • $($_.Name): $($_.Count) versões"
        }
    }

    default {
        Write-Host "Comando desconhecido: $command" -ForegroundColor Red
        exit 1
    }
}
