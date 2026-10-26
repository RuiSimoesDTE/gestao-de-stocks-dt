# Script PowerShell para gerar áudio TTS em português de Portugal
# Usa Google Translate TTS (gratuito, sem API key necessária)

param(
    [string]$ScriptsDir = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\documentacao\scripts_videos",
    [string]$AudioDir = "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\documentacao\audio_videos",
    [string]$Lang = "pt-PT"  # Português de Portugal
)

Write-Host "================================================================================"
Write-Host "GERADOR DE ÁUDIO TTS - GESTÃO DE MATERIAIS DE CATENÁRIA"
Write-Host "================================================================================"
Write-Host ""

# Verificar se FFmpeg está instalado
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
    Write-Host "⚠️  FFmpeg não está instalado ou não está no PATH"
    Write-Host ""
    Write-Host "Para instalar FFmpeg:"
    Write-Host "1. Descarregar em: https://ffmpeg.org/download.html"
    Write-Host "2. Extrair e adicionar ao PATH"
    Write-Host "3. Verificar: ffmpeg -version"
    Write-Host ""
    exit 1
}

Write-Host "✅ FFmpeg encontrado"
Write-Host ""

# ============================================================================
# OPÇÃO 1: Usar API Google Translate TTS (Gratuito)
# ============================================================================

function Gerar-Audio-Google {
    param([string]$Texto, [string]$OutputFile)

    # Codificar o texto para URL
    $TextoEncodado = [System.Web.HttpUtility]::UrlEncode($Texto)

    # URL da API Google Translate TTS
    $Url = "https://translate.google.com/translate_tts?ie=UTF-8&q=$TextoEncodado&tl=$Lang&client=tw-ob&total=1&idx=0"

    try {
        # Usar Invoke-WebRequest para descarregar
        Invoke-WebRequest -Uri $Url -OutFile $OutputFile -UserAgent "Mozilla/5.0" -ErrorAction Stop
        return $true
    } catch {
        Write-Host "❌ Erro ao descarregar áudio: $_"
        return $false
    }
}

# ============================================================================
# OPÇÃO 2: Usar Microsoft Edge Text-to-Speech (Local, sem Internet)
# ============================================================================

function Gerar-Audio-Edge {
    param([string]$Texto, [string]$OutputFile)

    # Usa o motor de TTS do Edge/Windows (SAPI)
    $VoiceFile = "C:\temp\tts_temp.xml"

    # Criar ficheiro SSML (Speech Synthesis Markup Language)
    $ssml = @"
<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xml:lang="pt-PT">
    <voice name="pt-PT-Joana">
        $Texto
    </voice>
</speak>
"@

    Set-Content -Path $VoiceFile -Value $ssml -Encoding UTF8

    # Usar PowerShell TTS (requer Windows 10+)
    try {
        Add-Type -AssemblyName System.Speech
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $speak.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
        $speak.Rate = -1  # Um pouco mais lento para clareza
        $speak.Volume = 100

        $audioFile = New-Object System.IO.FileStream($OutputFile, [System.IO.FileMode]::Create)
        $speak.SetOutputToAudioStream($audioFile, [System.Speech.Synthesis.SpeechAudioFormatInfo]::new())
        $speak.Speak($Texto)
        $audioFile.Close()

        return $true
    } catch {
        Write-Host "❌ Erro ao gerar áudio: $_"
        return $false
    }
}

# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

function Gerar-Todos-Audios {
    $scriptFiles = Get-ChildItem -Path $ScriptsDir -Filter "*_script.txt" | Sort-Object Name

    Write-Host "Encontrados $($scriptFiles.Count) scripts para processar"
    Write-Host ""

    $contador = 0
    foreach ($scriptFile in $scriptFiles) {
        $contador++

        # Extrair número do vídeo
        $nomeArquivo = $scriptFile.BaseName
        $numero = $nomeArquivo.Substring(0, 2)

        # Ler o script
        $conteudo = Get-Content -Path $scriptFile.FullName -Encoding UTF8 -Raw

        # Extrair apenas a parte da narração (entre SCRIPT DE NARRAÇÃO e PASSOS)
        $inicio = $conteudo.IndexOf("SCRIPT DE NARRAÇÃO")
        $fim = $conteudo.IndexOf("PASSOS DE NAVEGAÇÃO")

        if ($inicio -eq -1 -or $fim -eq -1) {
            Write-Host "⚠️  [$numero] Formato inválido em $($scriptFile.Name)"
            continue
        }

        $narrador = $conteudo.Substring($inicio + 82, $fim - $inicio - 82).Trim()
        $narrador = $narrador -replace "^-+\n", ""  # Remove linha de dashes

        # Ficheiro de saída
        $audioFile = Join-Path $AudioDir "$numero`_audio.wav"

        Write-Host "🎬 [$contador/$($scriptFiles.Count)] Vídeo $numero"
        Write-Host "   📝 Script: $($scriptFile.Name)"
        Write-Host "   🎵 Áudio: $(Split-Path $audioFile -Leaf)"

        # Tentar gerar áudio (usar Opção 2: Windows TTS local)
        if (Gerar-Audio-Edge -Texto $narrador -OutputFile $audioFile) {
            Write-Host "   ✅ Áudio gerado com sucesso"
        } else {
            Write-Host "   ⚠️  Falha ao gerar áudio (pode tentar manualmente)"
        }

        Write-Host ""
    }

    Write-Host "================================================================================"
    Write-Host "✅ PROCESSAMENTO CONCLUÍDO"
    Write-Host "================================================================================"
    Write-Host ""
    Write-Host "Ficheiros de áudio criados em: $AudioDir"
}

# ============================================================================
# EXECUTAR
# ============================================================================

Gerar-Todos-Audios

Write-Host "PRÓXIMOS PASSOS:"
Write-Host ""
Write-Host "1. Instalar OBS Studio se não tiver:"
Write-Host "   https://obsproject.com/"
Write-Host ""
Write-Host "2. Usar OBS para gravar os vídeos:"
Write-Host "   - Abrir http://localhost:8765"
Write-Host "   - Seguir os passos de navegação de cada script"
Write-Host "   - Gravar 2-4 minutos por vídeo"
Write-Host ""
Write-Host "3. Sincronizar áudio + vídeo com FFmpeg:"
Write-Host "   ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac output.mp4"
Write-Host ""
