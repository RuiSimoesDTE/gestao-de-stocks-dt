# Sistema de Versionamento Automático
# Gestão de Materiais de Catenária (DTE)
# Incrementa versão nos ficheiros críticos

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

$VERSION_FILE = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\versoes.json"
$LOG_FILE = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\logs\log_versioning.txt"

# Ficheiros com versionamento
$FILES_VERSIONS = @{
    "MANUAL" = @{
        path = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\documentacao\MANUAL.html"
        pattern = '<meta name="version" content="([^"]+)">'
        replacement = '<meta name="version" content="{VERSION}">'
    }
    "APP" = @{
        path = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\app\gestao_armazem_catenaria.html"
        pattern = 'APP_VERSION.*?"([^"]+)"'
        replacement = 'APP_VERSION":{VERSION}"'
    }
    "SW" = @{
        path = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\app\sw.js"
        pattern = "const VERSAO = '([^']+)';"
        replacement = "const VERSAO = '{VERSION}';"
    }
}

# Criar directório de logs se não existir
if (-not (Test-Path (Split-Path $LOG_FILE))) {
    New-Item -ItemType Directory -Force -Path (Split-Path $LOG_FILE) | Out-Null
}

# Inicializar ficheiro de versões
if (-not (Test-Path $VERSION_FILE)) {
    $initialVersion = @{
        MANUAL = "1.0.0"
        APP = "2.3.1"
        SW = "2026-10-14-06"
        last_updated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")
        changelog = @()
    }
    $initialVersion | ConvertTo-Json -Depth 10 | Set-Content $VERSION_FILE
}

# ============================================================================
# FUNÇÕES
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

function IncrementVersion {
    param(
        [string]$Version,
        [string]$Part = "patch"  # major, minor, patch
    )

    # Para SW, usar formato data-número
    if ($Version -match "^\d{4}-\d{2}-\d{2}-\d+$") {
        $parts = $Version -split '-'
        $date = "$($parts[0])-$($parts[1])-$($parts[2])"
        $num = [int]$parts[3] + 1
        return "$date-$num"
    }

    # Para versionamento semântico (MAJOR.MINOR.PATCH)
    $parts = $Version -split '\.'
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]

    switch ($Part) {
        "major" { $major++; $minor = 0; $patch = 0 }
        "minor" { $minor++; $patch = 0 }
        "patch" { $patch++ }
    }

    return "$major.$minor.$patch"
}

function UpdateVersion {
    param(
        [string]$FileKey,
        [string]$NewVersion = $null,
        [string]$ChangeDescription = ""
    )

    if (-not $FILES_VERSIONS.ContainsKey($FileKey)) {
        LogEvent "✗ Ficheiro desconhecido: $FileKey" "ERROR"
        return $false
    }

    $fileConfig = $FILES_VERSIONS[$FileKey]
    $filePath = $fileConfig.path

    if (-not (Test-Path $filePath)) {
        LogEvent "✗ Ficheiro não encontrado: $filePath" "ERROR"
        return $false
    }

    # Carregar versões
    $versions = Get-Content $VERSION_FILE -Raw | ConvertFrom-Json
    $currentVersion = $versions.$FileKey

    # Gerar nova versão se não especificada
    if (-not $NewVersion) {
        $NewVersion = IncrementVersion -Version $currentVersion -Part "patch"
    }

    try {
        # Ler ficheiro
        $content = Get-Content $filePath -Raw

        # Substituir versão
        $updatedContent = $content -replace $fileConfig.pattern, ($fileConfig.replacement -replace "{VERSION}", $NewVersion)

        # Verificar se mudou
        if ($updatedContent -eq $content) {
            LogEvent "⚠ Nenhuma mudança de versão para $FileKey (padrão não encontrado)" "WARN"
            # Continuar mesmo assim - pode ser primeira vez
        }

        # Escrever ficheiro
        Set-Content -Path $filePath -Value $updatedContent -Encoding UTF8 -NoNewline

        # Atualizar ficheiro de versões
        $versions.$FileKey = $NewVersion
        $versions.last_updated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")

        # Adicionar ao changelog
        $changeEntry = @{
            ficheiro = $FileKey
            versao_anterior = $currentVersion
            versao_nova = $NewVersion
            descricao = $ChangeDescription
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")
            usuario = $env:USERNAME
        }

        $versions.changelog += $changeEntry

        # Limitar changelog a últimas 100 entradas
        if ($versions.changelog.Count -gt 100) {
            $versions.changelog = @($versions.changelog | Select-Object -Last 100)
        }

        $versions | ConvertTo-Json -Depth 10 | Set-Content $VERSION_FILE

        LogEvent "✓ Versão actualizada: $FileKey $currentVersion → $NewVersion"
        if ($ChangeDescription) {
            LogEvent "  Descrição: $ChangeDescription"
        }

        return $true

    } catch {
        LogEvent "✗ Erro ao actualizar versão para $FileKey : $_" "ERROR"
        return $false
    }
}

function GetVersion {
    param(
        [string]$FileKey = "*"
    )

    $versions = Get-Content $VERSION_FILE -Raw | ConvertFrom-Json

    if ($FileKey -eq "*") {
        Write-Host "Versões Actuais:" -ForegroundColor Cyan
        Write-Host ""
        $versions.PSObject.Properties | ForEach-Object {
            if ($_.Name -ne "last_updated" -and $_.Name -ne "changelog") {
                Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor White
            }
        }
        Write-Host ""
        Write-Host "Última actualização: $($versions.last_updated)" -ForegroundColor Gray
    } else {
        return $versions.$FileKey
    }
}

function ViewChangelog {
    param(
        [string]$FileKey = "*",
        [int]$LastEntries = 20
    )

    $versions = Get-Content $VERSION_FILE -Raw | ConvertFrom-Json

    if ($FileKey -eq "*") {
        $entries = $versions.changelog | Sort-Object -Property timestamp -Descending | Select-Object -First $LastEntries
    } else {
        $entries = $versions.changelog | Where-Object { $_.ficheiro -eq $FileKey } | Sort-Object -Property timestamp -Descending | Select-Object -First $LastEntries
    }

    if ($entries.Count -eq 0) {
        Write-Host "Nenhuma entrada de changelog" -ForegroundColor Yellow
        return
    }

    Write-Host "Changelog (últimas $($entries.Count) entradas):" -ForegroundColor Cyan
    Write-Host ""

    $entries | ForEach-Object {
        Write-Host "  $($_.ficheiro): $($_.versao_anterior) → $($_.versao_nova)" -ForegroundColor White
        Write-Host "    ├─ $($_.timestamp)" -ForegroundColor DarkGray
        Write-Host "    └─ $($_.descricao)" -ForegroundColor DarkGray
    }
}

# ============================================================================
# INTERFACE INTERACTIVA
# ============================================================================

if ($args.Count -eq 0) {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║      Sistema de Versionamento para Gestão de Materiais        ║
╚════════════════════════════════════════════════════════════════╝

SINTAXE:
  .\sistema_versioning.ps1 <comando> [opções]

COMANDOS:
  update MANUAL [descrição]  Incrementar versão do MANUAL
  update APP [descrição]    Incrementar versão da APP
  update SW [descrição]     Incrementar versão do Service Worker
  set MANUAL <versão>       Definir versão específica
  get [MANUAL|APP]          Ver versão actual
  log [MANUAL|APP] [N]      Ver últimas N mudanças (default: 20)
  status                    Ver todas as versões e changelog

EXEMPLOS:
  .\sistema_versioning.ps1 update MANUAL "Adicionado sistema de backup"
  .\sistema_versioning.ps1 get
  .\sistema_versioning.ps1 log MANUAL 10
  .\sistema_versioning.ps1 set APP 2.4.0

"@
    exit
}

$command = $args[0].ToLower()
$param1 = if ($args.Count -gt 1) { $args[1] } else { "" }
$param2 = if ($args.Count -gt 2) { $args[2..($args.Count-1)] -join " " } else { "" }

switch ($command) {
    "update" {
        if (-not $param1) { Write-Host "Erro: especifique o ficheiro (MANUAL, APP, ou SW)" -ForegroundColor Red; exit 1 }
        $result = UpdateVersion -FileKey $param1 -ChangeDescription $param2
        exit if ($result) { 0 } else { 1 }
    }

    "set" {
        if (-not $param1 -or -not $param2) { Write-Host "Erro: especifique ficheiro e versão" -ForegroundColor Red; exit 1 }
        $result = UpdateVersion -FileKey $param1 -NewVersion $param2
        exit if ($result) { 0 } else { 1 }
    }

    "get" {
        GetVersion -FileKey ($param1 -or "*")
    }

    "log" {
        $lastEntries = if ($param2) { [int]$param2 } else { 20 }
        ViewChangelog -FileKey ($param1 -or "*") -LastEntries $lastEntries
    }

    "status" {
        GetVersion -FileKey "*"
        Write-Host ""
        ViewChangelog -FileKey "*" -LastEntries 10
    }

    default {
        Write-Host "Comando desconhecido: $command" -ForegroundColor Red
        exit 1
    }
}
