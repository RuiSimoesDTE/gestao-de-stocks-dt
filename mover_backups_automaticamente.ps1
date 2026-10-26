# Move automaticamente os backups da pasta Downloads para a SharePoint
# Uso: powershell -ExecutionPolicy Bypass -File mover_backups_automaticamente.ps1
# Depois deixa isto a correr em background para monitorizar novos backups

$pastaDownloads = "$env:USERPROFILE\Downloads"
$pastaSharePoint = "C:\Users\dst7973\OneDrive - Domingos da Silva Teixeira, S.A\Obras_dte_IC - 00_Obras\Gestao de Materiais de Catenaria\backups"
$padraoBackup = "backup_gestao_stocks_*.json"

# Criar pasta de backups se não existir
if (-not (Test-Path $pastaSharePoint)) {
  New-Item -ItemType Directory -Path $pastaSharePoint -Force | Out-Null
  Write-Host "✓ Pasta de backups criada: $pastaSharePoint"
}

# Mover backups existentes
$backups = Get-ChildItem -Path $pastaDownloads -Filter $padraoBackup -ErrorAction SilentlyContinue
foreach ($backup in $backups) {
  $destino = Join-Path $pastaSharePoint $backup.Name
  Move-Item -LiteralPath $backup.FullName -Destination $destino -Force
  Write-Host "✓ Movido: $($backup.Name)"
}

# Monitorizar novos backups em tempo real
Write-Host "`n📁 A monitorizar Downloads para novos backups..."
Write-Host "   (Os backups serão movidos automaticamente para: $pastaSharePoint)`n"

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $pastaDownloads
$watcher.Filter = $padraoBackup
$watcher.IncludeSubdirectories = $false

$action = {
  $item = $Event.SourceEventArgs.Name
  $fullPath = Join-Path $pastaDownloads $item
  Start-Sleep -Milliseconds 500  # Espera que o ficheiro termine de escrever
  if (Test-Path $fullPath) {
    $destino = Join-Path $pastaSharePoint $item
    Move-Item -LiteralPath $fullPath -Destination $destino -Force -ErrorAction SilentlyContinue
    Write-Host "✓ $(Get-Date -Format 'HH:mm:ss') — Backup movido: $item"
  }
}

Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action | Out-Null
$watcher.EnableRaisingEvents = $true

Write-Host "🔄 Monitorização ativa. Pressiona Ctrl+C para parar.`n"
while ($true) { Start-Sleep -Seconds 1 }
