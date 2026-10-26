# ========================================
# AGENTES AGENDADOS - Task Scheduler
# Gestão de Materiais de Catenária
# ========================================

param(
    [ValidateSet("instalar", "desinstalar", "listar", "testar")]
    [string]$Acao = "listar"
)

# Carrega configuração
$configPath = Join-Path $PSScriptRoot "automacao_config.json"
if (-not (Test-Path $configPath)) {
    Write-Host "❌ automacao_config.json não encontrado!"
    exit 1
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json
$logPath = Join-Path $PSScriptRoot "logs\log_agents.txt"
$projectRoot = $PSScriptRoot

function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logPath -Value $logEntry
    Write-Host $logEntry
}

function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal $currentUser
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

# ========================================
# ROTINA 1: SINCRONIZAÇÃO HORÁRIA
# ========================================
function Register-SyncHoraria {
    Log-Message "📋 Registando: SINCRONIZAÇÃO HORÁRIA (a cada 60 minutos)"

    $taskName = "GestaoMateriais_SyncHoraria"
    $scriptPath = Join-Path $projectRoot "sistemas\sincronizacao_horaria.ps1"

    # Script da tarefa
    $scriptContent = @"
`$configPath = '$configPath'
`$logPath = '$logPath'

function Log-Message {
    param([string]`$message)
    `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    `$logEntry = "[`$timestamp] `$message"
    Add-Content -Path `$logPath -Value `$logEntry
    Write-Host `$logEntry
}

Log-Message "━━━ SYNC HORÁRIA iniciada"

# Verifica mudanças
`$changes = git -C '$projectRoot' status --porcelain | Measure-Object | Select-Object -ExpandProperty Count

if (`$changes -gt 0) {
    Log-Message "📝 Mudanças detectadas: `$changes ficheiro(s)"

    # Cria backup
    `$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    `$backupFile = Join-Path '$projectRoot' "backups\hourl\sync_horaria_`$timestamp.zip"

    # Adiciona ao git
    git -C '$projectRoot' add -A
    git -C '$projectRoot' commit -m "Auto-sync horária: `$([datetime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))" 2>&1 | ForEach-Object {
        Log-Message "  `$_"
    }

    Log-Message "✅ Sincronização completa"
} else {
    Log-Message "ℹ️  Sem mudanças a sincronizar"
}

Log-Message "━━━ SYNC HORÁRIA concluída"
"@

    Set-Content -Path $scriptPath -Value $scriptContent -Force

    # Cria tarefa no Task Scheduler
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 60) -RepeatIndefinitely
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
    Log-Message "✅ Tarefa registada: $taskName"
}

# ========================================
# ROTINA 2: BACKUP DIÁRIO
# ========================================
function Register-BackupDiario {
    Log-Message "📋 Registando: BACKUP DIÁRIO (22:00)"

    $taskName = "GestaoMateriais_BackupDiario"
    $scriptPath = Join-Path $projectRoot "sistemas\backup_diario.ps1"

    # Script da tarefa
    $scriptContent = @"
`$configPath = '$configPath'
`$logPath = (Split-Path '$logPath') + '\log_backup_daily.txt'
`$projectRoot = '$projectRoot'

function Log-Message {
    param([string]`$message)
    `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    `$logEntry = "[`$timestamp] `$message"
    Add-Content -Path `$logPath -Value `$logEntry
    Write-Host `$logEntry
}

Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Log-Message "💾 BACKUP DIÁRIO iniciado"

`$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
`$backupDir = Join-Path `$projectRoot "backups\dailies"
`$backupFile = Join-Path `$backupDir "backup_`$timestamp.zip"

# Cria pasta se não existe
if (-not (Test-Path `$backupDir)) { mkdir `$backupDir -Force | Out-Null }

# Ficheiros a incluir no backup
`$filesToBackup = @(
    Join-Path `$projectRoot "app\gestao_armazem_catenaria.html",
    Join-Path `$projectRoot "dados_armazem_catenaria.json",
    Join-Path `$projectRoot "documentacao\MANUAL.html",
    Join-Path `$projectRoot "documentacao\MANUAL.pdf"
)

try {
    # Compacta ficheiros
    `$filesToBackup | Where-Object { Test-Path `$_ } | Compress-Archive -DestinationPath `$backupFile -Force
    Log-Message "📦 Backup criado: `$backupFile"
    Log-Message "📊 Tamanho: $('{0:N2}' -f ((Get-Item `$backupFile).Length / 1MB)) MB"
} catch {
    Log-Message "❌ ERRO ao criar backup: `$_"
}

# Limpeza: Mantém últimos 30 dias
`$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem `$backupDir -Filter "backup_*.zip" | Where-Object { `$_.LastWriteTime -lt `$cutoffDate } | ForEach-Object {
    Remove-Item `$_.FullName -Force
    Log-Message "🗑️  Backup antigo removido: `$(`$_.Name)"
}

Log-Message "✅ BACKUP DIÁRIO concluído"
Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"@

    Set-Content -Path $scriptPath -Value $scriptContent -Force

    # Cria tarefa no Task Scheduler (22:00)
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -Daily -At "22:00"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
    Log-Message "✅ Tarefa registada: $taskName"
}

# ========================================
# ROTINA 3: LIMPEZA SEMANAL
# ========================================
function Register-LimpezaSemanal {
    Log-Message "📋 Registando: LIMPEZA SEMANAL (Sextas, 18:00)"

    $taskName = "GestaoMateriais_LimpezaSemanal"
    $scriptPath = Join-Path $projectRoot "sistemas\limpeza_semanal.ps1"

    # Script da tarefa
    $scriptContent = @"
`$configPath = '$configPath'
`$logPath = (Split-Path '$logPath') + '\log_cleanup_weekly.txt'
`$projectRoot = '$projectRoot'

function Log-Message {
    param([string]`$message)
    `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    `$logEntry = "[`$timestamp] `$message"
    Add-Content -Path `$logPath -Value `$logEntry
    Write-Host `$logEntry
}

Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Log-Message "🧹 LIMPEZA SEMANAL iniciada"

# 1. Remove logs antigos (> 60 dias)
`$logsDir = Join-Path `$projectRoot "logs"
`$cutoffDate = (Get-Date).AddDays(-60)
Get-ChildItem `$logsDir -Filter "log_*.txt" | Where-Object { `$_.LastWriteTime -lt `$cutoffDate } | ForEach-Object {
    Remove-Item `$_.FullName -Force
    Log-Message "🗑️  Log antigo removido: `$(`$_.Name)"
}

# 2. Remove backups antigos (> 30 dias) da pasta hourl
`$hourlyDir = Join-Path `$projectRoot "backups\hourl"
`$cutoffDate = (Get-Date).AddDays(-30)
if (Test-Path `$hourlyDir) {
    Get-ChildItem `$hourlyDir -Filter "*_*.html" -o -Filter "*_*.json" | Where-Object { `$_.LastWriteTime -lt `$cutoffDate } | ForEach-Object {
        Remove-Item `$_.FullName -Force
        Log-Message "🗑️  Backup horário removido: `$(`$_.Name)"
    }
}

# 3. Compacta histórico
`$dailyDir = Join-Path `$projectRoot "backups\dailies"
`$weeklyDir = Join-Path `$projectRoot "backups\weekly"
if (-not (Test-Path `$weeklyDir)) { mkdir `$weeklyDir -Force | Out-Null }

`$timestamp = Get-Date -Format "yyyy-ww"
`$weeklyArchive = Join-Path `$weeklyDir "archive_`$timestamp.zip"

try {
    Get-ChildItem `$dailyDir -Filter "backup_*.zip" -ErrorAction SilentlyContinue |
        Compress-Archive -DestinationPath `$weeklyArchive -Update -Force
    Log-Message "📦 Histórico compactado: archive_`$timestamp.zip"
} catch {
    Log-Message "⚠️  Erro ao compactar histórico: `$_"
}

Log-Message "✅ LIMPEZA SEMANAL concluída"
Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"@

    Set-Content -Path $scriptPath -Value $scriptContent -Force

    # Cria tarefa no Task Scheduler (Sextas, 18:00)
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Friday -At "18:00"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
    Log-Message "✅ Tarefa registada: $taskName"
}

# ========================================
# FUNÇÕES PRINCIPAIS
# ========================================

function Install-Agents {
    if (-not (Test-Admin)) {
        Write-Host "❌ Este script requer permissões de Administrador!"
        exit 1
    }

    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "📦 INSTALAÇÃO DE AGENTES AGENDADOS"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Cria pasta de scripts
    mkdir (Join-Path $projectRoot "sistemas") -Force -ErrorAction SilentlyContinue | Out-Null

    Register-SyncHoraria
    Register-BackupDiario
    Register-LimpezaSemanal

    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "✅ INSTALAÇÃO COMPLETA"
    Log-Message ""
}

function Uninstall-Agents {
    if (-not (Test-Admin)) {
        Write-Host "❌ Este script requer permissões de Administrador!"
        exit 1
    }

    Log-Message "🗑️  Desinstalando agentes..."

    @(
        "GestaoMateriais_SyncHoraria",
        "GestaoMateriais_BackupDiario",
        "GestaoMateriais_LimpezaSemanal"
    ) | ForEach-Object {
        Unregister-ScheduledTask -TaskName $_ -Confirm:$false -ErrorAction SilentlyContinue
        Log-Message "❌ Removida: $_"
    }

    Log-Message "✅ Desinstalação completa"
}

function List-Agents {
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "📋 AGENTES REGISTADOS NO TASK SCHEDULER"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    Get-ScheduledTask -TaskName "GestaoMateriais_*" -ErrorAction SilentlyContinue | ForEach-Object {
        Log-Message ""
        Log-Message "📅 Tarefa: $($_.TaskName)"
        Log-Message "   Estado: $($_.State)"
        Log-Message "   Próxima execução: $($_.NextRunTime)"
        Log-Message "   Última execução: $($_.LastRunTime)"
    }

    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

function Test-Agents {
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "🧪 TESTE DE AGENTES"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    @(
        "GestaoMateriais_SyncHoraria",
        "GestaoMateriais_BackupDiario",
        "GestaoMateriais_LimpezaSemanal"
    ) | ForEach-Object {
        Log-Message ""
        Log-Message "▶️  Testando: $_"
        Start-ScheduledTask -TaskName $_ -ErrorAction SilentlyContinue
        Log-Message "✅ Tarefa iniciada"
    }

    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ========================================
# EXECUTA
# ========================================

switch ($Acao.ToLower()) {
    "instalar" { Install-Agents }
    "desinstalar" { Uninstall-Agents }
    "testar" { Test-Agents }
    "listar" { List-Agents }
    default { List-Agents }
}
