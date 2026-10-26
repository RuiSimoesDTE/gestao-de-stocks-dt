# ========================================
# FILE WATCHER - Monitoramento Tempo Real
# Gestão de Materiais de Catenária
# ========================================

# Carrega configuração
$configPath = Join-Path $PSScriptRoot "automacao_config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json

$logPath = Join-Path $PSScriptRoot "logs\log_watcher.txt"
$lockPath = Join-Path $PSScriptRoot "locks"
$backupPath = Join-Path $PSScriptRoot "backups\hourl"

# Funções auxiliares
function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logPath -Value $logEntry
    Write-Host $logEntry
}

function Acquire-Lock {
    param([string]$filePath)
    $lockFile = Join-Path $lockPath "$([System.IO.Path]::GetFileNameWithoutExtension($filePath)).lock"

    # Se lock existe e é menor que 30 minutos, espera
    if (Test-Path $lockFile) {
        $lockAge = (Get-Date) - (Get-Item $lockFile).LastWriteTime
        if ($lockAge.TotalMinutes -lt 30) {
            Log-Message "⏳ Aguardando lock para $filePath..."
            Start-Sleep -Seconds 2
            return Acquire-Lock $filePath  # Recursivo
        }
    }

    # Cria lock
    New-Item -ItemType File -Path $lockFile -Force | Out-Null
    Log-Message "🔒 Lock adquirido para $filePath"
    return $lockFile
}

function Release-Lock {
    param([string]$lockFile)
    if (Test-Path $lockFile) {
        Remove-Item $lockFile -Force
        Log-Message "🔓 Lock liberado"
    }
}

function Create-Backup {
    param([string]$filePath, [string]$backupPath)

    if (-not (Test-Path $filePath)) {
        return $null
    }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $fileExt = [System.IO.Path]::GetExtension($filePath)
    $backupFile = Join-Path $backupPath "$fileName`_$timestamp$fileExt"

    Copy-Item -Path $filePath -Destination $backupFile -Force
    Log-Message "💾 Backup criado: $([System.IO.Path]::GetFileName($backupFile))"

    return $backupFile
}

function Increment-Version {
    param([string]$filePath)

    $versionFile = "$filePath.version"
    $version = 1

    if (Test-Path $versionFile) {
        $version = [int](Get-Content $versionFile) + 1
    }

    $version | Set-Content $versionFile
    Log-Message "📈 Versão incrementada: v$version"

    return $version
}

function Sync-To-OneDrive {
    param([string]$filePath)

    $oneDrivePath = $config.onedrive.destino

    if (-not (Test-Path $oneDrivePath)) {
        Log-Message "⚠️  OneDrive não está acessível: $oneDrivePath"
        return $false
    }

    $destFile = Join-Path $oneDrivePath ([System.IO.Path]::GetFileName($filePath))
    Copy-Item -Path $filePath -Destination $destFile -Force
    Log-Message "☁️  Sincronizado para OneDrive: $([System.IO.Path]::GetFileName($destFile))"

    return $true
}

function Write-Notification {
    param([string]$message)

    $notificationFile = Join-Path $PSScriptRoot "logs\notification_queue.txt"
    Add-Content -Path $notificationFile -Value $message
    Log-Message "📢 Notificação enfileirada: $message"
}

# Inicializa log
Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Log-Message "🚀 FILE WATCHER iniciado"
Log-Message "📁 Monitorando: $($config.file_watcher.pastas_monitoradas -join ', ')"
Log-Message "⏱️  Intervalo: $($config.file_watcher.intervalo_verificacao)ms"
Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cria FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PSScriptRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Ficheiros a monitorar (extensões)
$extensionsToWatch = $config.file_watcher.extensoes
$folderToWatch = $config.file_watcher.pastas_monitoradas

# Handler para mudanças de ficheiros
$Action = {
    param($source, $eventArgs)

    $filePath = $eventArgs.FullPath
    $fileName = [System.IO.Path]::GetFileName($filePath)
    $fileExt = [System.IO.Path]::GetExtension($filePath)

    # Ignora ficheiros não monitorados
    if ($fileExt -notin $extensionsToWatch) { return }

    # Ignora ficheiros de lock
    if ($fileName -match "\.lock$") { return }
    if ($fileName -match "\.version$") { return }

    # Ignora ficheiros de notificação
    if ($fileName -eq "notification_queue.txt") { return }

    $relPath = $filePath.Substring($PSScriptRoot.Length + 1)

    # Verifica se está em pasta monitorada
    $inMonitoredFolder = $false
    foreach ($folder in $folderToWatch) {
        if ($relPath -match "^$([regex]::Escape($folder))") {
            $inMonitoredFolder = $true
            break
        }
    }

    if (-not $inMonitoredFolder) { return }

    Log-Message "🔄 Mudança detectada: $relPath ($($eventArgs.ChangeType))"

    # Adquire lock
    $lockFile = Acquire-Lock $filePath

    try {
        # Aguarda um pouco para garantir que a escrita terminou
        Start-Sleep -Milliseconds 500

        # Cria backup
        Create-Backup $filePath $backupPath | Out-Null

        # Incrementa versão
        $version = Increment-Version $filePath

        # Sincroniza para OneDrive
        Sync-To-OneDrive $filePath | Out-Null

        # Notifica utilizadores
        $notification = "$relPath atualizado (v$version)"
        Write-Notification $notification

        Log-Message "✅ Processo completo: $relPath"
    }
    catch {
        Log-Message "❌ ERRO ao processar $relPath : $_"
    }
    finally {
        Release-Lock $lockFile
    }
}

# Registra handlers
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $Action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $Action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $Action | Out-Null

Log-Message "✅ Watchers registados. Aguardando mudanças..."
Log-Message ""

# Mantém o script ativo indefinidamente
try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
}
catch {
    Log-Message "⚠️  Erro: $_"
}
finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Log-Message "🛑 FILE WATCHER parado"
}
