# GUIA DE CRIAÇÃO DE VÍDEOS TUTORIAIS

## 📊 Status

✅ **Completo:**
- Aplicação funcionando em http://localhost:8765
- 12 scripts de narração em português (PT-PT)
- Plano de execução definido
- Ferramentas documentadas

⏳ **Próximo:**
- Gravar vídeos com OBS Studio (manual)
- Gerar áudio com TTS
- Processar com FFmpeg
- Integrar no MANUAL.html

---

## 🎬 AS 12 SECÇÕES

| Nº | Título | Duração | Script | Status |
|----|--------|---------|--------|--------|
| 1 | Início e Menu Lateral | 2:30 | ✅ | Pronto |
| 2 | Stock - Consultar Materiais | 3:00 | ✅ | Pronto |
| 3 | Entradas - Registar Chegadas | 3:30 | ✅ | Pronto |
| 4 | Saídas - Registar Saídas | 3:30 | ✅ | Pronto |
| 5 | Transferências entre Armazéns | 3:00 | ✅ | Pronto |
| 6 | Encomendas - Pedidos de Compra | 3:30 | ✅ | Pronto |
| 7 | Consumos - Relatório de Saídas | 3:00 | ✅ | Pronto |
| 8 | Projeto - Visualizar Postes | 3:30 | ✅ | Pronto |
| 9 | Materiais por Poste | 3:00 | ✅ | Pronto |
| 10 | Relatórios - Análises | 3:30 | ✅ | Pronto |
| 11 | Backup e Restauração | 2:30 | ✅ | Pronto |
| 12 | Definições - Configurar | 3:00 | ✅ | Pronto |
| | **TOTAL** | **~36 min** | | |

---

## 📁 ESTRUTURA DE PASTAS

```
documentacao/
├── scripts_videos/          # 12 scripts de narração em português
│   ├── 01_PLANO_EXECUCAO_VIDEOS.md
│   ├── 01_inicio_menu_lateral_script.txt
│   ├── 02_stock_consultar_materiais_script.txt
│   ├── ...
│   └── 12_definicoes_configurar_script.txt
├── audio_videos/            # Áudio gerado (TTS)
│   ├── 01_audio.wav
│   ├── 02_audio.wav
│   └── ...
├── videos/                  # Vídeos finais (MP4)
│   ├── 01_inicio_menu_lateral.mp4
│   ├── 02_stock_consultar_materiais.mp4
│   └── ...
├── gerar_videos.py          # Script de geração (estrutura)
├── gerar_audio_tts.ps1      # Script para gerar áudio TTS
├── README_VIDEOS.md         # Este ficheiro
└── MANUAL.html              # Manual com links para vídeos
```

---

## 🚀 ROTEIRO DE IMPLEMENTAÇÃO

### FASE 1: Preparação (30 minutos)

**1.1 Instalar OBS Studio**
```
Descarregar: https://obsproject.com/
Instalação: Próximo, Próximo, Instalar
```

**1.2 Configurar OBS Studio**
- Abrir OBS Studio
- Cenas:
  - Cena 1: "Gravação de Vídeos"
  - Source: Captura de Janela (Chrome/Edge com http://localhost:8765)
  - Resolução: 1920x1080
  - FPS: 30

**1.3 Teste de Gravação**
```
1. Clicar "Iniciar Gravação"
2. Esperar 10 segundos
3. Clicar "Parar Gravação"
4. Verificar ficheiro criado
```

---

### FASE 2: Gravação de Vídeos (3-4 horas)

Para cada um dos 12 vídeos:

**2.1 Abrir o script**
```
Abrir ficheiro: documentacao/scripts_videos/NN_*.txt
Ler os passos de navegação
```

**2.2 Navegar pela secção**
- Clique nos botões conforme o script
- Preencha formulários
- Interaja com a interface
- Grave ~2-4 minutos por vídeo

**2.3 Exportar o vídeo**
- OBS salva automaticamente em: `Videos/`
- Renomear para: `NN_titulo.mp4`

---

### FASE 3: Gerar Áudio TTS (1-2 horas)

**Opção A: Usar Windows Text-to-Speech (Recomendado)**

```powershell
# Executar o script
cd C:\Users\dst7973\Desktop\gestao_de_stocks_dte\documentacao
.\gerar_audio_tts.ps1
```

Isto vai:
- Ler todos os 12 scripts
- Gerar áudio WAV em português (PT-PT)
- Salvar em `audio_videos/`

**Opção B: Usar Google Translate TTS Online**

1. Instalar extensão: "Google Translate"
2. Copiar texto do script
3. Colar na extensão (Language: Portuguese - Portugal)
4. Descarregar áudio
5. Salvar como `NN_audio.wav`

**Opção C: Usar API ElevenLabs (Premium)**

```
Descarregar em: https://elevenlabs.io/
Usar voz portuguesa: "Filipa"
Exportar para WAV
```

---

### FASE 4: Sincronizar Áudio + Vídeo (1-2 horas)

Usar FFmpeg para juntar vídeo + áudio:

```powershell
# Exemplo para o vídeo 1:
ffmpeg -i videos/01_inicio_menu_lateral.mp4 `
        -i audio_videos/01_audio.wav `
        -c:v copy -c:a aac -shortest `
        videos/01_inicio_menu_lateral_FINAL.mp4

# Script automático (criar ficheiro batch):
# Para todos os 12 vídeos:
for /L %%i in (1,1,12) do (
    ffmpeg -i videos/%%02d_*.mp4 -i audio_videos/%%02d_audio.wav -c:v copy -c:a aac -shortest videos/%%02d_FINAL.mp4
)
```

---

### FASE 5: Integração no MANUAL.html (30 minutos)

**5.1 Atualizar MANUAL.html**

Procure por: `<!-- VÍDEOS TUTORIAIS -->`

Adicione:
```html
<div class="video-section">
    <h3>Vídeo Tutorial: Início e Menu Lateral</h3>
    <video width="100%" controls style="max-width: 800px; border-radius: 8px;">
        <source src="videos/01_inicio_menu_lateral_FINAL.mp4" type="video/mp4">
        Seu navegador não suporta vídeo HTML5.
    </video>
    <p>Duração: 2:30</p>
    <p>Aprenda a navegar no menu e usar as funcionalidades básicas.</p>
</div>
```

**5.2 Testar links**
- Abrir MANUAL.html num navegador
- Verificar se todos os vídeos carregam
- Testar play/pause/fullscreen

---

## 🎙️ QUALIDADE DE ÁUDIO (Português PT-PT)

### Dicas Importantes

1. **Pronúncia Clara:**
   - Fale devagar
   - Articule bem as palavras
   - Evite sotaque brasileiro

2. **Volume:**
   - -3dB a 0dB (não muito alto)
   - Evitar picos

3. **Fundo Silencioso:**
   - Gravar num local quieto
   - Sem ruído de ventiladores/ar

4. **Duração:**
   - Respeitar os tempos indicados
   - 2:30 a 3:30 por vídeo

---

## 📋 CHECKLIST

### Preparação
- [ ] Instalar OBS Studio
- [ ] Configurar resolução (1920x1080, 30fps)
- [ ] Fazer teste de gravação

### Gravação
- [ ] Vídeo 1 gravado
- [ ] Vídeo 2 gravado
- [ ] ... Vídeos 3-12 gravados
- [ ] Todos os 12 vídeos em `videos/`

### Áudio
- [ ] Script Python/PowerShell testado
- [ ] TTS API configurada
- [ ] Áudio para vídeo 1 gerado
- [ ] ... Áudio para vídeos 2-12 gerado
- [ ] Todos os 12 áudios em `audio_videos/`

### Processamento
- [ ] FFmpeg instalado
- [ ] Vídeo 1 sincronizado (vídeo + áudio)
- [ ] ... Vídeos 2-12 sincronizados
- [ ] Todos os 12 vídeos finais em `videos/`

### Integração
- [ ] MANUAL.html atualizado
- [ ] Links de vídeos funcionais
- [ ] Testado em navegador
- [ ] Publicado na SharePoint

---

## ⚙️ FERRAMENTAS NECESSÁRIAS

### Obrigatório

| Ferramenta | Link | Custo |
|-----------|------|-------|
| OBS Studio | https://obsproject.com | Gratuito |
| FFmpeg | https://ffmpeg.org | Gratuito |
| PowerShell | Windows incluído | Gratuito |
| Navegador | Chrome/Edge | Gratuito |

### Opcional (Para Qualidade Melhorada)

| Ferramenta | Link | Custo |
|-----------|------|-------|
| Audacity | https://www.audacityteam.org | Gratuito |
| ElevenLabs | https://elevenlabs.io | €5-100/mês |
| DaVinci Resolve | https://www.blackmagicdesign.com | Gratuito |

---

## 📞 CONTACTOS

**Utilizador Principal:** Rui Simões  
**Email:** rui16simoes@gmail.com  
**Empresa:** DTE Instalações Especiais  
**Departamento:** Catenária  

**Dúvidas? Contacte Claude Code.**

---

## 📝 NOTAS

1. **Português de Portugal (PT-PT)**
   - Essencial para qualidade profissional
   - Pronuncia portuguesa, vocabulário português

2. **Offline vs Online**
   - TTS local (Windows) não precisa Internet
   - Google Translate TTS precisa conexão
   - ElevenLabs precisa API key

3. **Reutilização**
   - Se a app mudar, gravar novamente apenas as secções alteradas
   - Áudio pode ser reutilizado se o script não mudar

4. **Publicação**
   - Ficheiros MP4 em `videos/`
   - Integrados no MANUAL.html
   - Publicados na SharePoint

---

## 🎯 OBJETIVO FINAL

✅ 12 vídeos tutoriais de 2-4 minutos  
✅ Narração em português (PT-PT)  
✅ Explicações passo-a-passo  
✅ Integrados no MANUAL.html  
✅ Acessíveis online/offline  
✅ Fáceis de atualizar no futuro  

---

**Versão:** 1.0  
**Data:** 14/10/2026  
**Criado por:** Claude Haiku 4.5 (Anthropic)
