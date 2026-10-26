@echo off
REM Abre a app, faz backup e guarda automaticamente na pasta de backups

setlocal
set PORTA=8765
set BASE=http://localhost:%PORTA%

echo.
echo ===============================================================
echo   FAZER BACKUP - Gestao de Materiais de Catenaria
echo ===============================================================
echo.
echo 1. O servidor vai iniciar
echo 2. A app abre no navegador
echo 3. Clica em "Backup (JSON)" - descarrega para Downloads
echo 4. O ficheiro move-se AUTOMATICAMENTE para a pasta de backups
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\iniciar_servidor.ps1" -Porta %PORTA%
if errorlevel 1 (
  echo ERRO: Nao consegui ligar o servidor.
  pause
  exit /b 1
)

start "" "%BASE%/app/gestao_armazem_catenaria.html"

REM Depois, monitora Downloads e move backups
echo.
echo A monitorizar Downloads para novos backups...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0mover_backups_automaticamente.ps1"

endlocal
