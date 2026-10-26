@echo off
REM ========== Gestor Materiais de Catenaria - Abrir como APP ==========
REM  - Primeira vez: abre a página de entrada para instalar como atalho
REM  - Depois: usa o atalho do desktop (executa com "direto")
REM =====================================================================

setlocal
set PORTA=8765
set BASE=http://localhost:%PORTA%

echo.
echo =================================================================
echo   GESTAO DE MATERIAIS DE CATENARIA (DTE)
echo   Iniciando servidor e app...
echo =================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar_servidor.ps1" -Porta %PORTA%
if errorlevel 1 (
  echo.
  echo ERRO: Nao consegui ligar o servidor local.
  echo Tenta outra vez ou contacta o Rui.
  pause
  exit /b 1
)

if /i "%~1"=="direto" (
  REM Modo direto (desde atalho do desktop)
  where msedge >nul 2>nul
  if not errorlevel 1 (
    start "" msedge --app=%BASE%/gestao_materiais_catenaria.html?modo=normal
  ) else (
    start "" "%BASE%/gestao_materiais_catenaria.html?modo=normal"
  )
) else (
  REM Primeira vez (desde SharePoint): mostra página de entrada
  start "" "%BASE%/entrada.html"
)

endlocal
