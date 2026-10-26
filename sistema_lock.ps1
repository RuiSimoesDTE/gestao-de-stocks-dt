# ========================================
# SISTEMA DE LOCKS
# Controla acesso exclusivo aos ficheiros
# ========================================

param(
    [ValidateSet("adquirir", "libertar")]
    [string]$Acao = "adquirir",
    [string]$Ficheiro = ""
)

$lockPath = Join-Path $PSScriptRoot "locks"
$logPath = Join-Path $PSScriptRoot "logs\log_locks.txt"

if (-not (Test-Path $lockPath)) { mkdir $lockPath -Force | Out-Null }
if (-not (Test-Path (Split-Path $logPath))) { mkdir (Split-Path $logPath) -Force | Out-Null }

function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logPath -Value $logEntry -Force
}

function Acquire-Lock {
    param([string]$filePath)
    
    if (-not $filePath) {
        Log-Message "⚠️  Caminho não especificado"
        return $false
    }
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $lockFile = Join-Path $lockPath "$fileName.lock"
    
    # Verifica lock existente
    if (Test-Path $lockFile) {
        $lockAge = (Get-Date) - (Get-Item $lockFile).LastWriteTime
        if ($lockAge.TotalMinutes -lt 30) {
            Log-Message "⏳ Lock existe para: $fileName (aguardando...)"
            Start-Sleep -Seconds 2
            return Acquire-Lock $filePath
        } else {
            Log-Message "⚠️  Lock expirado para: $fileName (removendo...)"
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Cria lock
    @{
        file = $filePath
        timestamp = Get-Date -Format "o"
        user = $env:USERNAME
        process = $PID
    } | ConvertTo-Json | Set-Content -Path $lockFile -Force
    
    Log-Message "🔒 Lock adquirido: $fileName"
    return $true
}

function Release-Lock {
    param([string]$filePath)
    
    if (-not $filePath) { return }
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $lockFile = Join-Path $lockPath "$fileName.lock"
    
    if (Test-Path $lockFile) {
        Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
        Log-Message "🔓 Lock liberado: $fileName"
    }
}

# Executa
switch ($Acao.ToLower()) {
    "adquirir" { Acquire-Lock $Ficheiro }
    "libertar" { Release-Lock $Ficheiro }
}
