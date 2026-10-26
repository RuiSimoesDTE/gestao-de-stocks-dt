@echo off
REM Abrir Manual de Gestao de Materiais de Catenaria - Tipo Manual de Carro
REM Ficheiro: ABRIR_MANUAL.cmd

cls
echo.
echo ================================================================================
echo   ABRINDO MANUAL DE GESTAO DE MATERIAIS DE CATENARIA
echo   Tipo "Manual de Carro" - Guia Visual e Pratico
echo ================================================================================
echo.

REM Obter caminho do ficheiro MANUAL.html
set "MANUAL_PATH=%~dp0MANUAL.html"

REM Verificar se ficheiro existe
if not exist "%MANUAL_PATH%" (
    echo ERRO: Ficheiro MANUAL.html nao encontrado!
    echo Caminho esperado: %MANUAL_PATH%
    echo.
    pause
    exit /b 1
)

REM Abrir no navegador padrao
echo Abrindo: %MANUAL_PATH%
echo.
start "" "%MANUAL_PATH%"

echo Manual aberto no seu navegador web!
echo.
echo Dicas:
echo - Use Ctrl+F para pesquisar por funcionalidade
echo - Clique no indice para ir a uma secção específica
echo - Use Ctrl+P para imprimir ou guardar como PDF
echo.
pause
