# ========================================
# VALIDAÇÃO ANTES DE GIT PUSH
# ========================================

$logPath = Join-Path $PSScriptRoot "logs\log_validation.txt"
$projectRoot = $PSScriptRoot

if (-not (Test-Path (Split-Path $logPath))) { mkdir (Split-Path $logPath) -Force | Out-Null }

function Log-Message {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logPath -Value $logEntry -Force
    Write-Host $logEntry
}

Log-Message "🔍 VALIDAÇÃO PRÉ-PUBLICAÇÃO iniciada"

# Validações
$erros = @()

# 1. Verifica se há locks pendentes
$lockPath = Join-Path $projectRoot "locks"
if (Test-Path $lockPath) {
    $lockFiles = Get-ChildItem $lockPath -Filter "*.lock" -ErrorAction SilentlyContinue
    if ($lockFiles.Count -gt 0) {
        Log-Message "⚠️  Locks pendentes encontrados:"
        $lockFiles | ForEach-Object { 
            Log-Message "   - $($_.Name)"
            $erros += "Lock em: $($_.Name)"
        }
    }
}

# 2. Verifica integridade dos JSON principais
$jsonFiles = @(
    "dados_armazem_catenaria.json",
    "automacao_config.json"
)

foreach ($jsonFile in $jsonFiles) {
    $path = Join-Path $projectRoot $jsonFile
    if (Test-Path $path) {
        try {
            Get-Content $path -Raw | ConvertFrom-Json | Out-Null
            Log-Message "✅ JSON válido: $jsonFile"
        } catch {
            Log-Message "❌ JSON inválido: $jsonFile - $_"
            $erros += "JSON inválido: $jsonFile"
        }
    }
}

# 3. Verifica se HTML principal existe
$htmlPath = Join-Path $projectRoot "app\gestao_armazem_catenaria.html"
if (Test-Path $htmlPath) {
    Log-Message "✅ HTML principal encontrado"
} else {
    Log-Message "❌ HTML principal não encontrado"
    $erros += "HTML principal não encontrado"
}

# 4. Verifica estado do git
try {
    $gitStatus = git -C $projectRoot status --porcelain 2>&1
    $changesCount = ($gitStatus | Measure-Object | Select-Object -ExpandProperty Count)
    Log-Message "📊 Mudanças: $changesCount"
} catch {
    Log-Message "⚠️  Erro ao verificar git: $_"
}

# Resultado final
Log-Message ""
if ($erros.Count -eq 0) {
    Log-Message "✅ VALIDAÇÃO PASSOU - Pronto para publicar"
    exit 0
} else {
    Log-Message "❌ VALIDAÇÃO FALHOU - $($erros.Count) erro(s):"
    $erros | ForEach-Object { Log-Message "   ❌ $_" }
    exit 1
}
