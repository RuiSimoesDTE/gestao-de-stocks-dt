# ========================================
# SINCRONIZAÇÃO PARA ONEDRIVE
# Publica ficheiros na OneDrive
# ========================================

param(
    [string]$Ficheiro = ""
)

$configPath = Join-Path $PSScriptRoot "automacao_config.json"
$logPath = Join-Path $PSScriptRoot "logs\log_sync_onedrive.txt"

if (-not (Test-Path $configPath)) {
    Write-Host "❌ Configuração não encontrada"
    exit 1
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json
$oneDrivePath = $config.onedrive.destino

if (-not (Test-Path (Split-Path $logPath))) { mkdir (Split-Path $logPath) -Force | Out-Null }

function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logPath -Value $logEntry -Force
    Write-Host $logEntry
}

function Sync-File {
    param([string]$sourcePath, [string]$destPath)
    
    if (-not (Test-Path $sourcePath)) {
        Log-Message "⚠️  Ficheiro não encontrado: $sourcePath"
        return $false
    }
    
    if (-not (Test-Path $destPath)) {
        Log-Message "⚠️  OneDrive não acessível: $destPath"
        return $false
    }
    
    try {
        $destFile = Join-Path $destPath ([System.IO.Path]::GetFileName($sourcePath))
        Copy-Item -Path $sourcePath -Destination $destFile -Force
        Log-Message "☁️  Sincronizado: $([System.IO.Path]::GetFileName($sourcePath))"
        return $true
    } catch {
        Log-Message "❌ Erro ao sincronizar: $_"
        return $false
    }
}

Log-Message "🔄 SINCRONIZAÇÃO ONEDRIVE iniciada"

if ($Ficheiro) {
    # Sincroniza ficheiro específico
    Sync-File $Ficheiro $oneDrivePath | Out-Null
} else {
    # Sincroniza ficheiros principais
    $ficheiros = @(
        "app/gestao_armazem_catenaria.html",
        "dados_armazem_catenaria.json",
        "documentacao/MANUAL.html",
        "documentacao/MANUAL.pdf"
    )
    
    $synced = 0
    foreach ($file in $ficheiros) {
        $fullPath = Join-Path $PSScriptRoot $file
        if (Sync-File $fullPath $oneDrivePath) {
            $synced++
        }
    }
    
    Log-Message "📊 Sincronizados: $synced/$($ficheiros.Count)"
}

Log-Message "✅ SINCRONIZAÇÃO CONCLUÍDA"
