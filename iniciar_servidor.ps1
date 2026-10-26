# Liga o servidor local (se ainda não estiver ligado) e ESPERA até ele responder.
# Usado pelo ABRIR_COMO_APP.cmd. Sai com código 0 se o servidor está pronto, 1 se não conseguiu.
param([int]$Porta = 8765)
$raiz = $PSScriptRoot
function Aberta { try { $t = New-Object Net.Sockets.TcpClient; $t.Connect('127.0.0.1', $Porta); $t.Close(); return $true } catch { return $false } }
if (-not (Aberta)) {
  Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$raiz\servidor_local.ps1`"", '-Porta', $Porta
  for ($i = 0; $i -lt 60 -and -not (Aberta); $i++) { Start-Sleep -Milliseconds 500 }
}
if (Aberta) { exit 0 } else { exit 1 }
