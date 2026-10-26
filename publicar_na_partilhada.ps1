# Publica a versão atual do programa na pasta partilhada "Gestao de Materiais de Catenaria" E no Desktop local.
# - copia só o que o programa precisa (HTML com o nome novo, página de entrada, manifestos, ícones, PDFs, servidores)
# - NÃO mexe em dados_partilhados (os dados de todos)
# - antes de copiar tira a proteção (escondido + só de leitura) e depois volta a pô-la
# Uso: powershell -ExecutionPolicy Bypass -File publicar_na_partilhada.ps1
$ErrorActionPreference = 'Stop'
$origem = Split-Path -Parent $MyInvocation.MyCommand.Path
$destinoSharePoint = 'C:\Users\dst7973\OneDrive - Domingos da Silva Teixeira, S.A\Obras_dte_IC - 00_Obras\Gestao de Materiais de Catenaria'
$destinoLocal = $origem
$visiveis = @('ABRIR_COMO_APP.cmd', 'LEIA_ME_PRIMEIRO.md', 'dados_partilhados')
if (-not (Test-Path -LiteralPath $destinoSharePoint)) { throw "A pasta partilhada não existe: $destinoSharePoint" }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$novoNome = 'gestao_materiais_catenaria.html'

function CopiarTexto($de, $para) {
  $t = [System.IO.File]::ReadAllText($de, [System.Text.Encoding]::UTF8)
  $t = $t -replace 'gestao_armazem_catenaria\.html', $novoNome
  [System.IO.File]::WriteAllText($para, $t, $utf8)
}

function PublicarPara($destino, $origem, $nomeLocalFiles) {
  if ($origem -eq $destino) { return }  # Não copiar para si mesmo

  # 1) tirar a proteção ao que é técnico (a pasta de dados não é tocada)
  if ($nomeLocalFiles) {
    Get-ChildItem -LiteralPath $destino -Force | Where-Object { $visiveis -notcontains $_.Name } | ForEach-Object {
      & attrib -R -H $_.FullName 2>$null | Out-Null
      if ($_.PSIsContainer) { & attrib -R -H "$($_.FullName)\*" /S /D 2>$null | Out-Null }
    }
  }

  # 2) copiar
  CopiarTexto "$origem\gestao_armazem_catenaria.html" "$destino\$novoNome"
  foreach ($f in 'entrada.html','manifest.webmanifest','manifest-operador.webmanifest','sw.js','access-config.json','ABRIR_COMO_APP.cmd','ABRIR_PARA_TELEMOVEL.cmd','servidor_local.ps1','iniciar_servidor.ps1','servidor_rede.mjs') {
    CopiarTexto "$origem\$f" "$destino\$f"
  }
  Copy-Item -LiteralPath "$origem\logo_dte_dst.png" -Destination $destino -Force
  foreach ($d in 'icons','modulos','guias_at','guias_transferencia','manual_pecas') { Copy-Item -LiteralPath "$origem\$d" -Destination $destino -Recurse -Force }
  Get-ChildItem -LiteralPath "$origem\projeto_vendas_novas\V09_IFTE_PDes" -File | Where-Object { $_.Extension -in '.pdf','.js' } | Copy-Item -Destination "$destino\projeto_vendas_novas\V09_IFTE_PDes" -Force
  Copy-Item -Path "$origem\projeto_vendas_novas\desenhos_normativo\*" -Destination "$destino\projeto_vendas_novas\desenhos_normativo" -Recurse -Force
  if (Test-Path "$destino\documentacao") { foreach ($f in 'POR_FAZER.md','LEIA_ME_PWA.md') { Copy-Item -LiteralPath "$origem\$f" -Destination "$destino\documentacao" -Force } }
  [System.IO.File]::WriteAllText("$destino\documentacao\VERSAO.txt", "Publicado em $(Get-Date -Format 'dd/MM/yyyy HH:mm')`r`n", $utf8)

  # 3) voltar a proteger: escondido + só de leitura (só para SharePoint)
  if ($nomeLocalFiles) {
    Get-ChildItem -LiteralPath $destino -Force | Where-Object { $visiveis -notcontains $_.Name } | ForEach-Object {
      & attrib +H +R $_.FullName 2>$null | Out-Null
      if ($_.PSIsContainer) { & attrib +H +R "$($_.FullName)\*" /S /D 2>$null | Out-Null }
    }
    & attrib -R "$destino\dados_partilhados" 2>$null | Out-Null
  }
}

PublicarPara $destinoSharePoint $origem $true
PublicarPara $destinoLocal $origem $false

Write-Host "Publicado em SharePoint: $destinoSharePoint"
Write-Host "Publicado em Local (Desktop): $destinoLocal"
