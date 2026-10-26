@echo off
rem Experimentar o programa num telemóvel (mesma rede Wi-Fi).
rem Liga um servidor nesta pasta e abre no computador uma página com o QR para ler com o telemóvel.
setlocal
chcp 65001 >nul
set NODE=
where node >nul 2>nul && set NODE=node
if "%NODE%"=="" if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe
if "%NODE%"=="" (
  echo Não encontrei o Node.js neste computador. Fala com o Claude para fazer outra forma.
  pause
  exit /b 1
)
echo A ligar o servidor para o telemóvel...
start "" "http://localhost:8766/_telemovel"
"%NODE%" "%~dp0servidor_rede.mjs" 8766
pause
