# ========================================
# SISTEMA DE BACKUP + VERSIONING
# Cria backups automáticos e versiona
# ========================================

param(
    [ValidateSet("processar", "listar", "restaurar")]
    [string]$Acao = "processar",
    [string]$Ficheiro = ""
)

$configPath = Join-Path $PSScriptRoot "automacao_config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$backupPath = Join-Path $PSScriptRoot $config.backup.pasta_backup_horaria
$logPath = Join-Path $PSScriptRoot "logs\log_backup.txt"

if (-not (Test-Path $backupPath)) { mkdir $backupPath -Force | Out-Null }
if (-not (Test-Path (Split-Path $logPath))) { mkdir (Split-Path $logPath) -Force | Out-Null }

function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logPath -Value $logEntry -Force
    Write-Host $logEntry
}

function Create-Backup {
    param([string]$filePath)
    
    if (-not (Test-Path $filePath)) {
        Log-Message "⚠️  Ficheiro não encontrado: $filePath"
        return $null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $fileExt = [System.IO.Path]::GetExtension($filePath)
    $backupFile = Join-Path $backupPath "$fileName`_$timestamp$fileExt"
    
    try {
        Copy-Item -Path $filePath -Destination $backupFile -Force
        Log-Message "💾 Backup criado: $([System.IO.Path]::GetFileName($backupFile))"
        return $backupFile
    } catch {
        Log-Message "❌ Erro ao criar backup: $_"
        return $null
    }
}

function Increment-Version {
    param([string]$filePath)
    
    $versionFile = "$filePath.version"
    $version = 1
    
    if (Test-Path $versionFile) {
        try {
            $version = [int](Get-Content $versionFile) + 1
        } catch {
            $version = 1
        }
    }
    
    $version | Set-Content $versionFile -Force
    Log-Message "📈 Versão incrementada para v$version"
    
    return "v$version"
}

function Process-File {
    param([string]$filePath)
    
    if (-not $filePath) {
        Log-Message "⚠️  Caminho não especificado"
        return $false
    }
    
    Log-Message "🔄 Processando: $(Split-Path -Leaf $filePath)"
    
    # Cria backup
    Create-Backup $filePath | Out-Null
    
    # Incrementa versão
    $version = Increment-Version $filePath
    
    Log-Message "✅ Processamento completo: $(Split-Path -Leaf $filePath) - $version"
    return $true
}

function List-Backups {
    param([string]$filePath)
    
    if (-not $filePath) {
        Write-Host "📁 Todos os backups:"
        Get-ChildItem $backupPath -File | Sort-Object LastWriteTime -Descending
        return
    }
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    Write-Host "📁 Backups de: $fileName"
    Get-ChildItem $backupPath -Filter "$fileName`_*" | Sort-Object LastWriteTime -Descending
}

function Restore-Backup {
    param([string]$backupFile)
    
    if (-not (Test-Path $backupFile)) {
        Log-Message "❌ Backup não encontrado: $backupFile"
        return $false
    }
    
    $originalName = ($backupFile -split '_\d{8}_\d{6}')[0] + [System.IO.Path]::GetExtension($backupFile)
    
    if (-not (Test-Path $originalName)) {
        Log-Message "⚠️  Ficheiro original não encontrado"
        return $false
    }
    
    # Cria backup do ficheiro actual antes de restaurar
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $safetyBackup = Join-Path $backupPath "safety_$timestamp`_$(Split-Path -Leaf $originalName)"
    Copy-Item -Path $originalName -Destination $safetyBackup -Force
    Log-Message "🔐 Safety backup criado"
    
    # Restaura
    Copy-Item -Path $backupFile -Destination $originalName -Force
    Log-Message "✅ Restaurado: $originalName"
    
    return $true
}

# Executa
switch ($Acao.ToLower()) {
    "processar" { 
        if ($Ficheiro) {
            Process-File $Ficheiro
        } else {
            Log-Message "⚠️  Nenhum ficheiro especificado"
        }
    }
    "listar" { List-Backups $Ficheiro }
    "restaurar" { Restore-Backup $Ficheiro }
}
