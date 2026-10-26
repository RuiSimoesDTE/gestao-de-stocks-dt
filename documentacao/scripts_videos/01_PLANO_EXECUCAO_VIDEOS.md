# PLANO DE EXECUÇÃO: 12 Vídeos Tutoriais em Português de Portugal

## STATUS ACTUAL

✅ **Aplicação funcional** em http://localhost:8765  
✅ **Estrutura de pastas criada**  
✅ **Scripts de narração prontos** (em português PT-PT)  
⏳ **Próximo: Geração de áudio e vídeos**  

---

## AS 12 SECÇÕES A GRAVAR

1. **Início e Menu Lateral** (2:30) - Apresentação da app
2. **Stock - Consultar Materiais** (3:00) - Como pesquisar stock
3. **Entradas - Registar Chegadas** (3:30) - Entrada de material
4. **Saídas - Registar Saídas** (3:30) - Saída de material
5. **Transferências entre Armazéns** (3:00) - Movimentação interna
6. **Encomendas - Pedidos de Compra** (3:30) - Gestão de encomendas
7. **Consumos - Relatório de Saídas** (3:00) - Análise de consumos
8. **Projeto - Visualizar Postes** (3:30) - Consulta de desenhos
9. **Materiais por Poste** (3:00) - BOM por poste
10. **Relatórios - Análises** (3:30) - Análises e dados
11. **Backup e Restauração** (2:30) - Salvaguarda de dados
12. **Definições - Configurar** (3:00) - Configurações gerais

**Total: ~36 minutos de vídeo**

---

## OPÇÕES DE IMPLEMENTAÇÃO

### OPÇÃO A: Automação Completa (Recomendada)

**Ferramentas:**
- Python com Playwright/Selenium (gravar ecrã automaticamente)
- Google Cloud Text-to-Speech API ou Microsoft Azure (gerar áudio PT-PT)
- FFmpeg (processar vídeos)
- Script batch para orquestrar tudo

**Vantagens:**
- Completo e rápido
- Repetivelmente testável
- Fácil atualizar se mudar a interface

**Desvantagens:**
- Requer configuração técnica inicial
- Precisa de credenciais de APIs

**Tempo estimado:** 2-3 dias (incluindo debugging)

---

### OPÇÃO B: Semi-automação (Realista)

**Ferramentas:**
- OBS Studio para gravar (manual)
- Google Translate TTS ou similar (gerar áudio)
- FFmpeg (processar vídeos)
- Script PowerShell para orquestração

**Vantagens:**
- Mais rápido que completamente manual
- Controlo visual sobre a gravação
- Áudio profissional em PT-PT

**Desvantagens:**
- Requer gravação manual de cada secção
- Mais tempo investimento do Rui

**Tempo estimado:** 1-2 dias (2-3 min por video + processamento)

---

### OPÇÃO C: Implementação Mínima (Mais Rápida)

**Abordagem:**
- Tirar screenshots de cada secção (automático)
- Gerar áudio com TTS (automático)
- Montar slideshow com imagens + áudio em FFmpeg

**Vantagens:**
- Muito rápido
- Funcional
- Sem necessidade de gravação manual

**Desvantagens:**
- Menos dinâmico (sem interações)
- Parece mais "slideshow" que "vídeo"

**Tempo estimado:** 4-6 horas

---

## RECOMENDAÇÃO: OPÇÃO B (Semi-Automação)

Porque:
1. Rápido o suficiente
2. Resultado profissional
3. Controlo sobre a qualidade
4. OBS Studio é gratuito e fácil

**Passos:**

### Fase 1: Preparação (30 min)
- [ ] Instalar OBS Studio
- [ ] Configurar cenário (resolução, bitrate, codec)
- [ ] Fazer um teste de gravação

### Fase 2: Gravação (3-4 horas)
- [ ] Gravar secção 1 (Início)
- [ ] Gravar secção 2 (Stock)
- [ ] Gravar secção 3 (Entradas)
- [ ] Gravar secção 4 (Saídas)
- [ ] Gravar secção 5 (Transferências)
- [ ] Gravar secção 6 (Encomendas)
- [ ] Gravar secção 7 (Consumos)
- [ ] Gravar secção 8 (Projeto - Postes)
- [ ] Gravar secção 9 (Materiais por Poste)
- [ ] Gravar secção 10 (Relatórios)
- [ ] Gravar secção 11 (Backup)
- [ ] Gravar secção 12 (Definições)

### Fase 3: Áudio TTS (1-2 horas)
- [ ] Gerar áudio para cada vídeo com TTS (PT-PT)
- [ ] Verificar qualidade da pronúncia

### Fase 4: Processamento (1-2 horas)
- [ ] Sincronizar áudio com vídeo em FFmpeg
- [ ] Adicionar transições (fade 1-2s entre secções)
- [ ] Exportar para MP4 (1080p, H264, AAC)

### Fase 5: Integração (30 min)
- [ ] Atualizar MANUAL.html com links para vídeos
- [ ] Testar links em navegador
- [ ] Publicar na SharePoint

---

## FERRAMENTAS NECESSÁRIAS

### OBS Studio (Gravar Vídeos)
```
Descarregar: https://obsproject.com/
Instalação: Simples, sem dependências
Configuração recomendada:
- Resolução: 1920x1080 (Full HD)
- FPS: 30
- Bitrate: 8000-10000 kbps
- Codec: H264
```

### FFmpeg (Processar Vídeos)
```
Descarregar: https://ffmpeg.org/download.html
Instalação: Descompactar e adicionar ao PATH
Uso: Linha de comando para sincronizar áudio/vídeo
```

### TTS API (Gerar Áudio)
```
Opção 1: Google Cloud Text-to-Speech
Opção 2: Microsoft Azure Speech Services
Opção 3: ElevenLabs (áudio muito natural)
Opção 4: Free online TTS (VoiceForge, etc.)
```

---

## ESTIMATIVA DE TEMPO

| Fase | Atividade | Tempo |
|------|-----------|-------|
| 1 | Preparação + testes | 30 min |
| 2 | Gravação 12 vídeos | 3-4 h |
| 3 | Gerar áudio | 1-2 h |
| 4 | Processar em FFmpeg | 1-2 h |
| 5 | Integração + testes | 30 min |
| **TOTAL** | | **6-8 horas** |

---

## PRÓXIMOS PASSOS

1. **Decidir qual OPÇÃO usar** (A, B ou C)
2. **Instalar ferramentas necessárias**
3. **Executar cada fase**
4. **Publicar na SharePoint**

---

## CONTACTOS

Utilizador: **Rui Simões**  
Email: **rui16simoes@gmail.com**  
Empresa: **DTE Instalações Especiais**  

Dúvidas ou precisar de ajuda? Contacte Claude.
