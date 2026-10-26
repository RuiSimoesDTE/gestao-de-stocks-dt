# Servidor local para a aplicação (PWA) — Gestão de Materiais de Catenária (DTE)
# Serve a pasta deste ficheiro em http://localhost:<porta>/ (só neste computador; não fica visível na rede).
# Também grava e lê os ficheiros de estado de cada pessoa na pasta "dados_partilhados" (sem janelas de escolher pasta):
#   GET  /_sinc/lista            -> lista dos ficheiros dte_estado_*.json
#   GET  /_sinc/quem             -> nome de utilizador do Windows
#   POST /_sinc/gravar/<nome>    -> grava dte_estado_<...>.json (só esse formato de nome, só na pasta dados_partilhados)
# Uso: servidor_local.ps1 [-Porta 8765]    (normalmente é o ABRIR_COMO_APP.cmd que o liga)
param([int]$Porta = 8765)

$raiz = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$dados = Join-Path $raiz 'dados_partilhados'
$tipos = @{
  '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.mjs' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.csv' = 'text/csv; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8'; '.md' = 'text/plain; charset=utf-8'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'
  '.pdf' = 'application/pdf'
  '.xlsx' = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

function Responder($resp, $codigo, $texto, $tipo) {
  $b = [System.Text.Encoding]::UTF8.GetBytes($texto)
  $resp.StatusCode = $codigo; $resp.ContentType = $tipo
  $resp.Headers.Add('Cache-Control', 'no-store')
  $resp.ContentLength64 = $b.Length
  $resp.OutputStream.Write($b, 0, $b.Length); $resp.Close()
}

$ouvinte = New-Object System.Net.HttpListener
$ouvinte.Prefixes.Add("http://localhost:$Porta/")
$ouvinte.Prefixes.Add("http://127.0.0.1:$Porta/")
try { $ouvinte.Start() } catch { Write-Host "Não foi possível abrir a porta $Porta (já está a ser usada?). $($_.Exception.Message)"; exit 1 }
Write-Host "Servidor local ligado em http://localhost:$Porta/  (pasta: $raiz)"

while ($ouvinte.IsListening) {
  $ctx = $ouvinte.GetContext()
  $resp = $ctx.Response
  try {
    $metodo = $ctx.Request.HttpMethod
    $caminho = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)

    # ---- sincronização: lista, nome do utilizador do Windows e gravação ----
    if ($caminho -eq '/_sinc/lista' -and $metodo -eq 'GET') {
      $nomes = @()
      if (Test-Path -LiteralPath $dados) { $nomes = @(Get-ChildItem -LiteralPath $dados -Filter 'dte_estado_*.json' -File | ForEach-Object { $_.Name }) }
      Responder $resp 200 (ConvertTo-Json -InputObject $nomes -Compress) 'application/json; charset=utf-8'; continue
    }
    if ($caminho -eq '/_sinc/quem' -and $metodo -eq 'GET') { Responder $resp 200 (ConvertTo-Json -InputObject @{ utilizador = $env:USERNAME } -Compress) 'application/json; charset=utf-8'; continue }
    if ($caminho.StartsWith('/_sinc/gravar/') -and ($metodo -eq 'POST' -or $metodo -eq 'PUT')) {
      $nome = $caminho.Substring('/_sinc/gravar/'.Length)
      # só o próprio programa grava: cabeçalho especial (obriga a pré-verificação do navegador) e origem local
      $origem = $ctx.Request.Headers['Origin']
      if ($ctx.Request.Headers['X-DTE-Sinc'] -ne '1' -or ($origem -and $origem -notmatch '^http://(localhost|127\.0\.0\.1):\d+$')) { Responder $resp 403 'não autorizado' 'text/plain; charset=utf-8'; continue }
      if ($nome -notmatch '^dte_estado_[a-z0-9_]{1,60}\.json$') { Responder $resp 400 'nome inválido' 'text/plain; charset=utf-8'; continue }
      if ($ctx.Request.ContentLength64 -gt 80MB) { Responder $resp 413 'ficheiro demasiado grande' 'text/plain; charset=utf-8'; continue }
      if (-not (Test-Path -LiteralPath $dados)) { New-Item -ItemType Directory -Path $dados -Force | Out-Null }
      $ms = New-Object System.IO.MemoryStream
      $ctx.Request.InputStream.CopyTo($ms)
      $txt = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
      try { $null = ConvertFrom-Json -InputObject $txt -ErrorAction Stop } catch { Responder $resp 400 'JSON inválido' 'text/plain; charset=utf-8'; continue }
      $destino = Join-Path $dados $nome
      $tmp = $destino + '.tmp'
      [System.IO.File]::WriteAllBytes($tmp, $ms.ToArray())
      if (Test-Path -LiteralPath $destino) { Remove-Item -LiteralPath $destino -Force }
      Move-Item -LiteralPath $tmp -Destination $destino -Force
      Responder $resp 200 'ok' 'text/plain; charset=utf-8'; continue
    }

    if ($metodo -ne 'GET' -and $metodo -ne 'HEAD') { $resp.StatusCode = 405; $resp.Close(); continue }
    if ($caminho -eq '/' -or $caminho -eq '') { $caminho = '/entrada.html' }
    # nunca sair da pasta, nem servir pastas/ficheiros ocultos (.git, .codex_tmp, ...) ou módulos de código do sistema
    $partes = $caminho.Split('/') | Where-Object { $_ -ne '' }
    if (($partes | Where-Object { $_ -eq '..' -or $_.StartsWith('.') -or $_ -eq 'node_modules' }).Count -gt 0) { $resp.StatusCode = 404; $resp.Close(); continue }
    $ficheiro = [System.IO.Path]::GetFullPath((Join-Path $raiz ($caminho.TrimStart('/').Replace('/', '\'))))
    if (-not $ficheiro.StartsWith($raiz, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $ficheiro -PathType Leaf)) {
      $resp.StatusCode = 404; $resp.Close(); continue
    }
    $ext = [System.IO.Path]::GetExtension($ficheiro).ToLowerInvariant()
    $resp.ContentType = $(if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' })
    $resp.Headers.Add('Cache-Control', 'no-cache')
    $bytes = [System.IO.File]::ReadAllBytes($ficheiro)
    $resp.ContentLength64 = $bytes.Length
    if ($metodo -eq 'GET') { $resp.OutputStream.Write($bytes, 0, $bytes.Length) }
    $resp.Close()
  } catch {
    try { $resp.Abort() } catch {}
  }
}
