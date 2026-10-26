# ⏰ CRONOGRAMA DE AUTOMAÇÃO
## Gestão de Materiais de Catenária

---

## 📅 Horários de Execução

### DIARIAMENTE

| Hora | Tarefa | Duração | Log |
|------|--------|---------|-----|
| **Contínuo** | 🔄 File Watcher | Sempre ativo | log_watcher.txt |
| **00:00** | ⏰ Sync Horária (Meia-noite) | ~30s | log_sync_hourly.txt |
| **01:00** | ⏰ Sync Horária | ~30s | log_sync_hourly.txt |
| **02:00** | ⏰ Sync Horária | ~30s | log_sync_hourly.txt |
| ... | ... | ... | ... |
| **22:00** | 📦 Backup Diário | ~2min | log_backup_daily.txt |
| **23:00** | ⏰ Sync Horária | ~30s | log_sync_hourly.txt |

### SEMANALMENTE

| Dia | Hora | Tarefa | Duração | Log |
|-----|------|--------|---------|-----|
| Segunda | 10:00 | 📋 Relatório (manual) | - | - |
| Quarta | 10:00 | 📋 Relatório (manual) | - | - |
| **Sexta** | **18:00** | **🧹 Limpeza Semanal** | **~5min** | **log_cleanup_weekly.txt** |
| Sexta | 22:00 | 📦 Backup Diário | ~2min | log_backup_daily.txt |

---

## 🕐 Detalhes de Execução

### Sincronização Horária (A cada 60 minutos)

```
Minuto 0 de cada hora:
├─ Verifica mudanças (git diff)
├─ Se há mudanças:
│  ├─ Cria backup em backups/hourl/
│  ├─ Incrementa versão (.version)
│  ├─ Sincroniza para OneDrive
│  └─ Registra em log_sync_hourly.txt
└─ Duração: ~30 segundos
```

**Horas de execução por dia:**
- 00:00, 01:00, 02:00, ... 23:00 (24 execuções)

---

### Backup Diário (22:00)

```
22:00 cada dia:
├─ Cria pasta: backups/dailies/
├─ Compacta ficheiros em ZIP:
│  ├─ app/gestao_armazem_catenaria.html
│  ├─ dados_armazem_catenaria.json
│  ├─ documentacao/MANUAL.html
│  └─ documentacao/MANUAL.pdf
├─ Nome: backup_YYYY-MM-DD_HHMMSS.zip
├─ Regista em log_backup_daily.txt
└─ Duração: ~2 minutos
```

**Retenção:** Últimos 30 dias
**Tamanho típico:** ~5-10 MB por backup

---

### Limpeza Semanal (Sexta, 18:00)

```
Sexta 18:00:
├─ Remove logs antigos (> 60 dias)
│  └─ Paste: logs/
├─ Remove backups antigos (> 30 dias)
│  ├─ Pasta: backups/hourl/
│  └─ Pasta: backups/dailies/
├─ Compacta histórico para archive
│  └─ Pasta: backups/weekly/
├─ Regista em log_cleanup_weekly.txt
└─ Duração: ~5 minutos
```

---

## 📊 Estimativas de Espaço

### Tamanho Típico de Ficheiros

```
app/gestao_armazem_catenaria.html    ~2 MB
dados_armazem_catenaria.json         ~1 MB
documentacao/MANUAL.html             ~0.5 MB
documentacao/MANUAL.pdf              ~3 MB
recursos/logos e ícones              ~0.5 MB
────────────────────────────────────────
Total ficheiros principais           ~7 MB
```

### Espaço Ocupado por Backups

```
Backups horários (1 semana):
  ~7 MB × 168 execuções = ~1 GB

Backups diários (30 dias):
  ~7-10 MB × 30 dias = ~300 MB

Total máximo: ~1.3 GB
(Limpeza semanal reduz para ~200 MB após dia 31)
```

---

## 🔄 Fluxo de Dados

```
EVENTO (mudança de ficheiro)
  ↓
FILE WATCHER detecta
  ↓
Aguarda 500ms (para terminar escrita)
  ↓
Adquire LOCK
  ↓
┌─────────────────────────────────┐
│ BACKUP                          │
│ backups/hourl/ficheiro_YYMMDDhhmmss.ext │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ VERSIONING                      │
│ ficheiro.ext.version incrementa │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ SYNC ONEDRIVE                   │
│ Copia para pasta partilhada     │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ NOTIFICAÇÃO                     │
│ Enfileira mensagem              │
└─────────────────────────────────┘
  ↓
LIBERTA LOCK
  ↓
✅ COMPLETO
```

---

## 📈 Estatísticas Diárias

**Assumindo 10 mudanças por dia:**

| Métrica | Valor |
|---------|-------|
| Mudanças detectadas | 10 |
| Backups criados | 10 |
| Ficheiros .version | +1 |
| Sincronizações OneDrive | 10+ (24 horárias) |
| Entradas de log | ~100 |
| Espaço utilizado | ~70 MB |

---

## 🎯 Objetivos do Cronograma

| Objetivo | Como | Frequência |
|----------|------|-----------|
| **Proteção de dados** | Backups automáticos | Contínuo + Diário |
| **Sincronização** | File Watcher + Horária | Contínuo + Horária |
| **Auditoria** | Logs completos | Contínuo |
| **Limpeza** | Remove antigos | Semanal |
| **Performance** | Reduz espaço | Semanal |

---

## ⚠️ Notas Importantes

1. **File Watcher deve estar sempre ativo**
   - Inicie com: `iniciar_automacao.ps1 -Acao iniciar`
   - Ou configure startup automático

2. **Task Scheduler executa mesmo offline**
   - Se estiver ligado ao PC quando chegar a hora
   - Caso contrário, executa ao ligar

3. **OneDrive deve estar sincronizado**
   - Verifique que pasta existe
   - Permissões de escrita necessárias

4. **Backups crescem indefinidamente sem limpeza**
   - Limpeza semanal remove automaticamente
   - Mantenha disco com espaço livre

5. **Logs ocupam espaço com o tempo**
   - Mantêm-se por 60 dias
   - Depois são removidos automaticamente

---

## 🔔 Alertas Importantes

### Se File Watcher cair:
- Agentes agendados ainda funcionam
- Mas não há proteção em tempo real
- Reinicie: `iniciar_automacao.ps1 -Acao iniciar`

### Se Task Scheduler falhar:
- File Watcher continua ativo
- Mas não há backups agendados
- Verifique Task Scheduler: `Get-ScheduledTask -TaskName "GestaoMateriais_*"`

### Se OneDrive não sincroniza:
- Backups locais continuam
- Mas não há backup na nuvem
- Verifique caminho e permissões

---

## 📱 Como Acompanhar

### Verificar que está tudo a funcionar:

```powershell
# Ver logs em tempo real
Get-Content logs\log_watcher.txt -Tail 20 -Wait

# Ver próximas execuções
Get-ScheduledTask -TaskName "GestaoMateriais_*" | 
  Select TaskName, NextRunTime, LastRunTime

# Ver espaço utilizado
du -sh backups
du -sh logs
```

---

## ✅ Checklist Diário

Recomendações para acompanhar a automação:

- [ ] File Watcher está ativo (verificar processo PowerShell)
- [ ] Sem locks travados (`ls locks\` vazio)
- [ ] Últimas mudanças em `log_watcher.txt`
- [ ] OneDrive tem ficheiros actualizados
- [ ] Espaço em disco disponível (>500 MB)

---

**Próxima limpeza semanal:** Sexta próxima 18:00

Versão: 1.0 | Data: 2026-10-14
