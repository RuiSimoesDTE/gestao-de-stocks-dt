$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$jsonPath = Join-Path $root 'dados_armazem_catenaria.json'
$htmlPath = Join-Path $root 'gestao_armazem_catenaria.html'
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
Copy-Item -LiteralPath $jsonPath -Destination "$jsonPath.backup_antes_gt2127_$stamp"
Copy-Item -LiteralPath $htmlPath -Destination (Join-Path $root "gestao_armazem_catenaria_backup_antes_gt2127_$stamp.html")

$db = Get-Content -Raw -Encoding UTF8 $jsonPath | ConvertFrom-Json -AsHashtable
$items = @(
  @{ id='mv-gt2127-9p';     codigo='9P';           qtd=80;  obs='Transferência Pampilhosa -> Vendas Novas | Cabo de cobre flexível 95 mm²' },
  @{ id='mv-gt2127-4026589';codigo='4026589';      qtd=300; obs='Transferência Pampilhosa -> Vendas Novas | Cabo de bronze 12 mm' },
  @{ id='mv-gt2127-415b';   codigo='415B';         qtd=6;   obs='Transferência Pampilhosa -> Vendas Novas | Perno roscado curvo' },
  @{ id='mv-gt2127-417';    codigo='417';          qtd=3;   obs='Transferência Pampilhosa -> Vendas Novas | Perno roscado com olhal' },
  @{ id='mv-gt2127-273b';   codigo='273B';         qtd=3;   obs='Transferência Pampilhosa -> Vendas Novas | Barra para vara de comando manual de seccionador (código indicado: 273B)' },
  @{ id='mv-gt2127-640';    codigo='640';          qtd=200; obs='Transferência Pampilhosa -> Vendas Novas | Terminal de pêndulo' },
  @{ id='mv-gt2127-639';    codigo='639';          qtd=100; obs='Transferência Pampilhosa -> Vendas Novas | Grife de cabo de suporte completa' },
  @{ id='mv-gt2127-638';    codigo='638';          qtd=100; obs='Transferência Pampilhosa -> Vendas Novas | Grife de fio de contacto completa' },
  @{ id='mv-gt2127-varas';  codigo='VARA-CMD-SEC'; qtd=2;   obs='Transferência Pampilhosa -> Vendas Novas | Vara de comando para seccionador completa' }
)

$byCode = @{}
foreach ($m in $db['materiais']) { $byCode[[string]$m['codigo']] = $m }
$existing = @{}; foreach ($m in $db['movimentos']) { $existing[[string]$m['id']] = $true }
foreach ($item in $items) {
  if (-not $byCode.ContainsKey($item.codigo)) { throw "Código não encontrado no catálogo: $($item.codigo)" }
  if (-not $existing.ContainsKey($item.id)) {
    $db['movimentos'] += @{
      id=$item.id; data='2026-06-15'; tipo='entrada'; mat=$byCode[$item.codigo]['id']; qtd=$item.qtd;
      arm='Armazém Catenária'; armDst=$null; doc='GT ATDT202601GT/2127'; origem='Pampilhosa';
      dest='Obra IC-0019 - Vendas Novas'; obs=$item.obs; user=''; ref=$null
    }
  }
}
$db | ConvertTo-Json -Depth 100 -Compress | Set-Content -LiteralPath $jsonPath -Encoding UTF8

$html = Get-Content -Raw -Encoding UTF8 $htmlPath
$markerStart = 'const SEED_DATA='
$markerEnd = ';;'
$start = $html.IndexOf($markerStart)
if ($start -lt 0) { throw 'SEED_DATA não encontrado no HTML' }
$jsonStart = $start + $markerStart.Length
$end = $html.IndexOf($markerEnd, $jsonStart)
if ($end -lt 0) { throw 'Fim de SEED_DATA não encontrado no HTML' }
$seed = $html.Substring($jsonStart, $end-$jsonStart) | ConvertFrom-Json -AsHashtable
$seedByCode = @{}; foreach ($m in $seed['materiais']) { $seedByCode[[string]$m['codigo']] = $m }
$seedExisting = @{}; foreach ($m in $seed['movimentos']) { $seedExisting[[string]$m['id']] = $true }
foreach ($item in $items) {
  if (-not $seedByCode.ContainsKey($item.codigo)) { throw "Código não encontrado no SEED_DATA: $($item.codigo)" }
  if (-not $seedExisting.ContainsKey($item.id)) {
    $seed['movimentos'] += @{
      id=$item.id; data='2026-06-15'; tipo='entrada'; mat=$seedByCode[$item.codigo]['id']; qtd=$item.qtd;
      arm='Armazém Catenária'; armDst=$null; doc='GT ATDT202601GT/2127'; origem='Pampilhosa';
      dest='Obra IC-0019 - Vendas Novas'; obs=$item.obs; user=''; ref=$null
    }
  }
}
$newSeed = $seed | ConvertTo-Json -Depth 100 -Compress
$html = $html.Substring(0,$jsonStart) + $newSeed + $html.Substring($end)
Set-Content -LiteralPath $htmlPath -Value $html -Encoding UTF8

Write-Output "Registados $($items.Count) movimentos da GT/2127."
