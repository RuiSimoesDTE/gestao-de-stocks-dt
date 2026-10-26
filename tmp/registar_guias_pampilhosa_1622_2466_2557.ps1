$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$jsonPath = Join-Path $root 'dados_armazem_catenaria.json'
$htmlPath = Join-Path $root 'gestao_armazem_catenaria.html'
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
Copy-Item -LiteralPath $jsonPath -Destination "$jsonPath.backup_antes_guias_pampilhosa_$stamp"
Copy-Item -LiteralPath $htmlPath -Destination (Join-Path $root "gestao_armazem_catenaria_backup_antes_guias_pampilhosa_$stamp.html")

$db = Get-Content -Raw -Encoding UTF8 $jsonPath | ConvertFrom-Json -AsHashtable

$newMaterials = @(
  @{id='M-GT1622-LOTE'; codigo='GT-1622-LOTE'; desc='Palete com ferragens de catenária - conteúdo não discriminado na guia'; un='lote'; cat='Material'; min=0; sap=''; ref='GT ATDT202601GT/1622'; fornecedor='Transferência interna DTE'; tipo='Consumível'},
  @{id='M-GT2466-CS'; codigo='BOBINE-CS-1923'; desc='Bobine de cabo de suporte 1923 m (1135 kg)'; un='kg'; cat='Material'; min=0; sap=''; ref='GT ATDT202601GT/2466'; fornecedor='Transferência interna DTE'; tipo='Consumível'}
)

function Add-Materials($target) {
  $ids=@{}; foreach($m in $target['materiais']){$ids[[string]$m['id']]=$true}
  foreach($m in $newMaterials){if(-not $ids.ContainsKey($m['id'])){$target['materiais'] += $m}}
}

$items = @(
  @{id='mv-gt1622-lote'; data='2026-05-11'; codigo='GT-1622-LOTE'; qtd=1; doc='GT ATDT202601GT/1622'; obs='Palete com ferragens de catenária - conteúdo não discriminado na guia'},
  @{id='mv-gt1622-12mm'; data='2026-05-11'; codigo='4026589'; qtd=1003; doc='GT ATDT202601GT/1622'; obs='Bobine de cabo de bronze 12 mm, matrícula 948229/2, 264 kg'},
  @{id='mv-gt1622-25mm'; data='2026-05-11'; codigo='9D'; qtd=502; doc='GT ATDT202601GT/1622'; obs='Bobine de cabo de bronze 25 mm, matrícula 948220/1, 244 kg'},
  @{id='mv-gt1622-95mm'; data='2026-05-11'; codigo='9L'; qtd=500; doc='GT ATDT202601GT/1622'; obs='Bobine de cabo de alimentação em cobre 95 mm², 1195 kg'},
  @{id='mv-gt1622-cunhas'; data='2026-05-11'; codigo='4037858'; qtd=280; doc='GT ATDT202601GT/1622'; obs='Cunhas de madeira'},
  @{id='mv-gt2466-suporte'; data='2026-07-08'; codigo='BOBINE-CS-1923'; qtd=1135; doc='GT ATDT202601GT/2466'; obs='Bobine de cabo de suporte 1923 m; quantidade de stock conforme unidade da guia: 1135 kg'},
  @{id='mv-gt2557-640'; data='2026-07-14'; codigo='640'; qtd=200; doc='GT ATDT202601GT/2557'; obs='Terminais de pêndulo'},
  @{id='mv-gt2557-639'; data='2026-07-14'; codigo='639'; qtd=200; doc='GT ATDT202601GT/2557'; obs='Meias grifes de cabo de suporte - equivalem a 100 grifes completas'},
  @{id='mv-gt2557-638'; data='2026-07-14'; codigo='638'; qtd=200; doc='GT ATDT202601GT/2557'; obs='Meias grifes de fio de contacto - equivalem a 100 grifes completas'}
)

function Add-Movements($target) {
  $byCode=@{}; foreach($m in $target['materiais']){$byCode[[string]$m['codigo']]=$m}
  $ids=@{}; foreach($m in $target['movimentos']){$ids[[string]$m['id']]=$true}
  foreach($x in $items){
    if(-not $byCode.ContainsKey($x.codigo)){throw "Código não encontrado: $($x.codigo)"}
    if(-not $ids.ContainsKey($x.id)){
      $target['movimentos'] += @{
        id=$x.id; data=$x.data; tipo='entrada'; mat=$byCode[$x.codigo]['id']; qtd=$x.qtd;
        arm='Armazém Catenária'; armDst=$null; doc=$x.doc; origem='Pampilhosa - Rua das Cerâmicas';
        dest='Obra IC-0019 - Vendas Novas (Coruche)';
        obs="Transferência Pampilhosa -> Vendas Novas | Responsável: Hélder Rodrigues | $($x.obs)";
        user='Hélder Rodrigues'; ref=$null
      }
    }
  }
  foreach($mv in $target['movimentos']){
    if(([string]$mv['doc']) -match 'GT ATDT202601GT/2466'){
      $mv['origem']='Pampilhosa - Rua das Cerâmicas'
      $mv['dest']='Obra IC-0019 - Vendas Novas (Coruche)'
      $mv['user']='Hélder Rodrigues'
      if(([string]$mv['obs']) -notmatch 'Hélder Rodrigues'){
        $mv['obs']='Transferência Pampilhosa -> Vendas Novas | Responsável: Hélder Rodrigues | '+([string]$mv['obs'])
      }
    }
  }
}

Add-Materials $db
Add-Movements $db
$db | ConvertTo-Json -Depth 100 -Compress | Set-Content -LiteralPath $jsonPath -Encoding UTF8

$html = Get-Content -Raw -Encoding UTF8 $htmlPath
$markerStart='const SEED_DATA='; $start=$html.IndexOf($markerStart)
if($start -lt 0){throw 'SEED_DATA não encontrado'}
$jsonStart=$start+$markerStart.Length; $end=$html.IndexOf(';;',$jsonStart)
if($end -lt 0){throw 'Fim de SEED_DATA não encontrado'}
$seed=$html.Substring($jsonStart,$end-$jsonStart) | ConvertFrom-Json -AsHashtable
Add-Materials $seed
Add-Movements $seed
$newSeed=$seed | ConvertTo-Json -Depth 100 -Compress
$html=$html.Substring(0,$jsonStart)+$newSeed+$html.Substring($end)

$old2466='<tr><td>08/07/2026</td><td>GT ATDT202601GT/2466</td><td>Estaleiro DAI — Monte da Barca</td><td>Pampilhosa — Rua das Cerâmicas</td><td>Bobines de fio de contacto e cabo de suporte; alonga; 3 brocas; 1 contrapeso; 50 pêndulos; ferragens; 200 terminais</td><td><a class="btn sm" target="_blank" href="guias_at/GT_ATDT202601GT_2466 - BOBINES, PENDULOS E FERRAGENS CORUCHE.pdf">Abrir guia</a></td></tr>'
$new2466='<tr><td>08/07/2026</td><td>GT ATDT202601GT/2466</td><td>Pampilhosa — Rua das Cerâmicas</td><td>Coruche — Monte da Barca / antigas instalações DAI</td><td>Bobines de fio de contacto e cabo de suporte; alonga; 3 brocas; 1 contrapeso; 50 pêndulos; ferragens; 200 terminais<br><small>Responsável: Hélder Rodrigues</small></td><td><a class="btn sm" target="_blank" href="guias_at/GT_ATDT202601GT_2466 - BOBINES, PENDULOS E FERRAGENS CORUCHE.pdf">Abrir guia</a></td></tr>'
if($html.Contains($old2466)){$html=$html.Replace($old2466,$new2466)} elseif(-not $html.Contains('<td>GT ATDT202601GT/2466</td>')){throw 'Linha da GT/2466 não encontrada'}

$row1622='          <tr><td>11/05/2026</td><td>GT ATDT202601GT/1622</td><td>Pampilhosa — Rua das Cerâmicas</td><td>Coruche — Monte da Barca / antigas instalações DAI</td><td>1 palete de ferragens; 1.003 m cabo 12 mm; 502 m cabo 25 mm; 500 m cabo de alimentação 95 mm; 280 cunhas de madeira<br><small>Responsável: Hélder Rodrigues</small></td><td><a class="btn sm" target="_blank" href="guias_at/GT_ATDT202601GT_1622 - MATERIAL PARA CORUCHE, CUNHAS, BOBINES E FERRAGES.pdf">Abrir guia</a></td></tr>'
if(-not $html.Contains('<td>GT ATDT202601GT/1622</td>')){
  $anchor='          <tr><td>12/05/2026</td><td>GT ATDT202601GT/1637</td>'
  $html=$html.Replace($anchor,$row1622+"`r`n"+$anchor)
}
$row2557='          <tr><td>14/07/2026</td><td>GT ATDT202601GT/2557</td><td>Pampilhosa — Rua das Cerâmicas</td><td>Coruche — Monte da Barca / antigas instalações DAI</td><td>200 terminais de pêndulo; 200 meias grifes de cabo de suporte; 200 meias grifes de fio de contacto<br><small>Responsável: Hélder Rodrigues</small></td><td><a class="btn sm" target="_blank" href="guias_at/GT_ATDT202601GT_2557 - PIPOS E GRIFES PARA VENDAS NOVAS.pdf">Abrir guia</a></td></tr>'
if(-not $html.Contains('<td>GT ATDT202601GT/2557</td>')){
  $anchor='          <tr><td>14/07/2026</td><td>GT ATDT202601GT/2558</td>'
  $html=$html.Replace($anchor,$row2557+"`r`n"+$anchor)
}
Set-Content -LiteralPath $htmlPath -Value $html -Encoding UTF8

Copy-Item -LiteralPath 'C:\Users\dst7973\Desktop\GT_ATDT202601GT_1622 - MATERIAL PARA CORUCHE, CUNHAS, BOBINES E FERRAGES.pdf' -Destination (Join-Path $root 'guias_at\GT_ATDT202601GT_1622 - MATERIAL PARA CORUCHE, CUNHAS, BOBINES E FERRAGES.pdf') -Force
Copy-Item -LiteralPath 'C:\Users\dst7973\Desktop\GT_ATDT202601GT_2557 - PIPOS E GRIFES PARA VENDAS NOVAS.pdf' -Destination (Join-Path $root 'guias_at\GT_ATDT202601GT_2557 - PIPOS E GRIFES PARA VENDAS NOVAS.pdf') -Force
Write-Output 'Guias 1622, 2466 e 2557 atualizadas.'
