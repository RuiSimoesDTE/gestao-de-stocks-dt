# Script para ler PDFs e desenhos tecnicos automaticamente
# Usa Poppler (pdftoppm, pdftotext) e Tesseract OCR

param(
    [string]$PdfPath,
    [switch]$OCR = $false,
    [string]$OutputDir = $null,
    [string]$Lang = "por"
)

# Caminhos das ferramentas
$poplerBin = "C:\Users\$env:USERNAME\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin"
$tesseractBin = "C:\Program Files\PDF24\tesseract"
$pdftotext = "$poplerBin\pdftotext.exe"
$pdftoppm = "$poplerBin\pdftoppm.exe"
$tesseract = "$tesseractBin\tesseract.exe"

function Test-PDF {
    param([string]$Path)
    $pdf = Get-Item $Path -ErrorAction SilentlyContinue
    if (-not $pdf) {
        Write-Host "[ERRO] Arquivo PDF nao encontrado: $Path" -ForegroundColor Red
        exit 1
    }
    return $pdf
}

function Extract-TextFromPDF {
    param([string]$PdfPath, [string]$OutputFile)

    Write-Host "[1] Extraindo texto do PDF..." -ForegroundColor Cyan

    & $pdftotext $PdfPath $OutputFile 2>&1 | Out-Null

    if (Test-Path $OutputFile) {
        $size = (Get-Item $OutputFile).Length
        Write-Host "    [OK] Texto extraido: $(Get-Item $OutputFile | Select-Object -ExpandProperty Name) ($size bytes)" -ForegroundColor Green
        return $OutputFile
    } else {
        Write-Host "    [ERRO] Falha ao extrair texto" -ForegroundColor Red
        return $null
    }
}

function Convert-PDFToImages {
    param([string]$PdfPath, [string]$OutputDir)

    Write-Host "[2] Convertendo PDF para imagens PNG..." -ForegroundColor Cyan

    $prefix = Join-Path $OutputDir ([System.IO.Path]::GetFileNameWithoutExtension($PdfPath))
    & $pdftoppm -png $PdfPath $prefix 2>&1 | Out-Null

    $images = @(Get-ChildItem "$OutputDir\*-*.png" -ErrorAction SilentlyContinue)
    if ($images.Count -gt 0) {
        Write-Host "    [OK] $($images.Count) pagina(s) convertida(s) para PNG" -ForegroundColor Green
        return $images
    } else {
        Write-Host "    [ERRO] Falha ao converter para imagens" -ForegroundColor Red
        return @()
    }
}

function Run-OCR {
    param([string]$ImagePath, [string]$Lang)

    Write-Host "    [OCR] Processando: $(Split-Path $ImagePath -Leaf)" -ForegroundColor Yellow

    $prefix = [System.IO.Path]::Combine((Split-Path $ImagePath), [System.IO.Path]::GetFileNameWithoutExtension($ImagePath))
    & $tesseract $ImagePath $prefix -l $Lang 2>&1 | Out-Null

    $txtFile = "$prefix.txt"
    if (Test-Path $txtFile) {
        $text = Get-Content $txtFile -Raw
        Write-Host "      [OK] OCR completo ($($text.Length) caracteres)" -ForegroundColor Green
        return $text
    }
    return $null
}

function Main {
    if (-not $PdfPath) {
        Write-Host "Uso: .\ler-pdf.ps1 -PdfPath <caminho_pdf> [-OCR] [-OutputDir <dir>] [-Lang por|eng]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Exemplos:" -ForegroundColor White
        Write-Host "  .\ler-pdf.ps1 -PdfPath desenho_306.pdf"
        Write-Host "  .\ler-pdf.ps1 -PdfPath desenho_306.pdf -OCR"
        Write-Host "  .\ler-pdf.ps1 -PdfPath desenho_306.pdf -OCR -Lang por"
        exit 1
    }

    # Validar PDF
    $pdf = Test-PDF $PdfPath

    # Criar diretorio de saida
    if (-not $OutputDir) {
        $OutputDir = Join-Path (Split-Path $PdfPath) "$($pdf.BaseName)_extracted"
    }

    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "PROCESSANDO PDF: $($pdf.Name)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. Extrair texto
    $txtFile = Extract-TextFromPDF $PdfPath "$OutputDir\$($pdf.BaseName).txt"

    # 2. Converter para imagens
    Write-Host ""
    $images = Convert-PDFToImages $PdfPath $OutputDir

    # 3. OCR opcional
    if ($OCR -and $images.Count -gt 0) {
        Write-Host ""
        Write-Host "[3] Executando OCR em $($images.Count) imagem(ns)..." -ForegroundColor Cyan

        $ocrResults = @()
        foreach ($img in $images) {
            $text = Run-OCR $img.FullName $Lang
            if ($text) {
                $ocrResults += @{
                    imagem = $img.Name
                    texto = $text.Substring(0, [Math]::Min(500, $text.Length))
                }
            }
        }

        # Guardar resultados OCR
        $ocrResults | ConvertTo-Json | Out-File "$OutputDir\ocr_resultados.json" -Encoding UTF8
    }

    # Resumo
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "PROCESSAMENTO COMPLETO" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Saida: $OutputDir" -ForegroundColor Green
    Write-Host "Arquivos criados:" -ForegroundColor White
    Get-ChildItem $OutputDir | ForEach-Object { Write-Host "   - $($_.Name)" }
    Write-Host ""
}

# Executar
Main
