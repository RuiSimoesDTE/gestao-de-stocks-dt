# ========================================
# INICIAR AUTOMAÇÃO COMPLETA
# Setup e início do sistema
# ========================================

param(
    [ValidateSet("instalar", "iniciar", "parar", "status")]
    [string]$Acao = "instalar"
)

$projectRoot = $PSScriptRoot
$configPath = Join-Path $projectRoot "automacao_config.json"
$logPath = Join-Path $projectRoot "logs\log_automacao.txt"

# Cria diretórios necessários
$dirs = @("logs", "locks", "backups/hourl", "backups/dailies", "backups/weekly", "sistemas")
foreach ($dir in $dirs) {
    $fullPath = Join-Path $projectRoot $dir
    if (-not (Test-Path $fullPath)) { mkdir $fullPath -Force | Out-Null }
}

if (-not (Test-Path (Split-Path $logPath))) { mkdir (Split-Path $logPath) -Force | Out-Null }

function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logPath -Value $logEntry -Force
    Write-Host $logEntry
}

function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal $currentUser
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

function Install-Automation {
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "📦 INSTALAÇÃO DE AUTOMAÇÃO COMPLETA"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1. Verifica configuração
    if (-not (Test-Path $configPath)) {
        Log-Message "❌ automacao_config.json não encontrado!"
        return $false
    }
    Log-Message "✅ Configuração carregada"
    
    # 2. Verifica ficheiros principais
    $mainFiles = @(
        "file_watcher.ps1",
        "agentes_agendados.ps1",
        "sistema_lock.ps1",
        "sistema_backup_versioning.ps1",
        "validar_antes_publicacao.ps1",
        "sincronizar_onedrive.ps1"
    )
    
    $missing = @()
    foreach ($file in $mainFiles) {
        if (-not (Test-Path (Join-Path $projectRoot $file))) {
            $missing += $file
        }
    }
    
    if ($missing.Count -gt 0) {
        Log-Message "❌ Ficheiros faltam:"
        $missing | ForEach-Object { Log-Message "   - $_" }
        return $false
    }
    Log-Message "✅ Todos os scripts encontrados"
    
    # 3. Instala agentes (se admin)
    if (Test-Admin) {
        Log-Message ""
        Log-Message "🔧 Instalando agentes agendados..."
        & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $projectRoot "agentes_agendados.ps1") instalar 2>&1 | ForEach-Object { Log-Message "$_" }
    } else {
        Log-Message "⚠️  Execute como Administrador para instalar agentes agendados:"
        Log-Message '   powershell -NoProfile -ExecutionPolicy Bypass -File agentes_agendados.ps1 instalar'
    }
    
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "✅ INSTALAÇÃO CONCLUÍDA"
    Log-Message ""
    Log-Message "Próximos passos:"
    Log-Message "  1. Iniciar File Watcher: .\iniciar_automacao.ps1 -Acao iniciar"
    Log-Message "  2. Verificar status: .\iniciar_automacao.ps1 -Acao status"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    return $true
}

function Start-Automation {
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "🚀 INICIANDO FILE WATCHER"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    Log-Message "O File Watcher está a correr..."
    Log-Message "Pressione Ctrl+C para parar"
    Log-Message ""
    
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $projectRoot "file_watcher.ps1")
}

function Stop-Automation {
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "🛑 PARANDO AUTOMAÇÃO"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Procura processos do file_watcher
    $processes = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*file_watcher*"
    }
    
    if ($processes) {
        $processes | ForEach-Object {
            Log-Message "Terminando processo: $($_.Id)"
            Stop-Process -Id $_.Id -Force
        }
        Log-Message "✅ Processos terminados"
    } else {
        Log-Message "ℹ️  Nenhum processo de automação em execução"
    }
}

function Show-Status {
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Log-Message "📊 STATUS DE AUTOMAÇÃO"
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Ficheiros de configuração
    Log-Message ""
    Log-Message "📁 FICHEIROS:"
    @(
        "file_watcher.ps1",
        "agentes_agendados.ps1",
        "automacao_config.json"
    ) | ForEach-Object {
        $path = Join-Path $projectRoot $_
        if (Test-Path $path) {
            $size = (Get-Item $path).Length
            Log-Message "   ✅ $_ ($([math]::Round($size/1KB, 2)) KB)"
        } else {
            Log-Message "   ❌ $_"
        }
    }
    
    # Directórios
    Log-Message ""
    Log-Message "📂 DIRECTÓRIOS:"
    @(
        "logs",
        "locks",
        "backups",
        "sistemas"
    ) | ForEach-Object {
        $path = Join-Path $projectRoot $_
        if (Test-Path $path) {
            $count = (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
            Log-Message "   ✅ $_ ($count itens)"
        } else {
            Log-Message "   ⚠️  $_"
        }
    }
    
    # Agentes
    Log-Message ""
    Log-Message "⏰ AGENTES AGENDADOS:"
    Get-ScheduledTask -TaskName "GestaoMateriais_*" -ErrorAction SilentlyContinue | ForEach-Object {
        $status = if ($_.State -eq "Ready") { "✅" } else { "⚠️ " }
        Log-Message "   $status $($_.TaskName) - $($_.State)"
    }
    
    # Últimos logs
    Log-Message ""
    Log-Message "📋 ÚLTIMOS LOGS:"
    if (Test-Path $logPath) {
        Get-Content $logPath -Tail 10 | ForEach-Object {
            Log-Message "   $_"
        }
    }
    
    Log-Message ""
    Log-Message "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Executa
switch ($Acao.ToLower()) {
    "instalar" { Install-Automation }
    "iniciar" { Start-Automation }
    "parar" { Stop-Automation }
    "status" { Show-Status }
    default { Show-Status }
}
