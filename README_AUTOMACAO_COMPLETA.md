# 🤖 SISTEMA COMPLETO DE AUTOMAÇÃO
## Gestão de Materiais de Catenária DTE

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Componentes](#componentes)
3. [Instalação](#instalação)
4. [Como Usar](#como-usar)
5. [Configuração](#configuração)
6. [Monitoramento](#monitoramento)

---

## 🎯 Visão Geral

Sistema completo de automação com 3 componentes:

1. **File Watcher** - Monitora ficheiros em tempo real
2. **Scheduled Agents** - Executa tarefas agendadas  
3. **Hooks Claude Code** - Integração com editor

### O que faz?

- Monitora mudanças em ficheiros (HTML, JSON, PDF)
- Cria backups automáticos a cada mudança
- Versiona ficheiros incrementalmente
- Sincroniza para OneDrive automaticamente
- Executa tarefas agendadas (horária, diária, semanal)
- Protege com sistema de locks
- Registra tudo em logs detalhados
- Notifica utilizadores

---

## 📦 Componentes

### 1️⃣ FILE WATCHER (file_watcher.ps1)

Monitora em tempo real: app/, documentacao/, recursos/

Ficheiros monitorados:
- app/gestao_armazem_catenaria.html
- dados_armazem_catenaria.json
- documentacao/MANUAL.html
- documentacao/MANUAL.pdf

---

### 2️⃣ SCHEDULED AGENTS (agentes_agendados.ps1)

ROTINA 1: Sincronização Horária
- Quando: A cada 60 minutos
- O quê: Backup + versioning + publicação
- Log: logs/log_sync_hourly.txt

ROTINA 2: Backup Diário
- Quando: Diariamente às 22:00
- O quê: Backup ZIP completo
- Retenção: 30 dias
- Log: logs/log_backup_daily.txt

ROTINA 3: Limpeza Semanal
- Quando: Sextas às 18:00
- O quê: Limpeza de logs >60 dias, backups >30 dias
- Log: logs/log_cleanup_weekly.txt

---

### 3️⃣ HOOKS CLAUDE CODE (.claude/settings.json)

Integração automática com editor:

- before_file_write: Adquire lock
- after_file_write: Backup + Versioning
- before_git_push: Valida integridade
- after_git_push: Sincroniza para OneDrive

---

## 🚀 Instalação

### Passos

1. Verificar ficheiros:
   ls file_watcher.ps1
   ls agentes_agendados.ps1
   ls automacao_config.json

2. Instalar automação (como Administrador):
   powershell -NoProfile -ExecutionPolicy Bypass -File iniciar_automacao.ps1 -Acao instalar

3. Iniciar File Watcher:
   powershell -NoProfile -ExecutionPolicy Bypass -File iniciar_automacao.ps1 -Acao iniciar

4. Verificar status:
   powershell -NoProfile -ExecutionPolicy Bypass -File iniciar_automacao.ps1 -Acao status

---

## 💡 Cenários de Uso

### Cenário 1: Edição Manual
- Você edita ficheiro
- Hook adquire lock
- Cria backup + incrementa versão
- File Watcher sincroniza para OneDrive
- ✅ Automático

### Cenário 2: Sincronização Horária
- Cada hora verifica mudanças
- Se houver: backup + versioning + publicação
- ✅ Automático

### Cenário 3: Backup Diário
- 22:00 cada dia
- Backup ZIP completo
- Mantém 30 dias
- ✅ Automático

---

## 📊 Monitoramento

Ver logs:
- Log principal: logs/log_automacao.txt
- File Watcher: logs/log_watcher.txt
- Backups: logs/log_backup_daily.txt

Agentes agendados:
- Get-ScheduledTask -TaskName "GestaoMateriais_*"

Backups criados:
- backups/hourl/ (horários)
- backups/dailies/ (diários)
- backups/weekly/ (arquivados)

---

## 🔧 Troubleshooting

Problem: File Watcher não inicia
Solution: powershell -NoProfile -ExecutionPolicy Bypass -File file_watcher.ps1

Problem: OneDrive não sincroniza
Check: Caminho OneDrive acessível, permissões de escrita

Problem: Agentes não executam
Solution: Get-ScheduledTask -TaskName "GestaoMateriais_*" | Start-ScheduledTask

Problem: Locks travados
Solution: Remove-Item locks\*.lock -Force

---

## ✅ Checklist Final

- Ficheiros criados em gestao_de_stocks_dte/
- automacao_config.json com caminho OneDrive correto
- Instalação executada
- File Watcher iniciado
- Agentes em Task Scheduler
- Primeiro backup criado
- OneDrive sincronizou
- Logs aparecem em logs/

---

**Pronto para usar! Consulte os logs para detalhes.**

Versão: 1.0 | Data: 2026-10-14
