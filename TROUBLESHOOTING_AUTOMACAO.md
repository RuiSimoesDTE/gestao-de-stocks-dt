# GUIA DE TROUBLESHOOTING
## Gestao de Materiais de Catenaria

## Problemas Comuns

### PROBLEMA 1: File Watcher nao inicia
Sintomas:
- Janela PowerShell nao abre ou fecha imediatamente
- Mudancas nao geram backups

Solucoes:
1. Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
2. Verificar: Get-Content automacao_config.json
3. Limpar: Remove-Item logs\log_watcher.txt -Force

### PROBLEMA 2: OneDrive nao sincroniza
Sintomas:
- Ficheiros nao aparecem na OneDrive
- Log mostra erro de acesso

Solucoes:
1. Verificar caminho OneDrive existe
2. Criar pasta se nao existe
3. Verificar permissoes de escrita

### PROBLEMA 3: Agentes nao executam
Sintomas:
- Backup diario nao ocorre as 22:00
- Task Scheduler mostra Never Run

Solucoes:
1. Reinstalar: powershell -NoProfile -ExecutionPolicy Bypass -File agentes_agendados.ps1 instalar
2. Testar manualmente: Start-ScheduledTask -TaskName GestaoMateriais_SyncHoraria
3. Ver logs: Get-Content logs\log_sync_hourly.txt -Tail 20

### PROBLEMA 4: Locks travados
Sintomas:
- Mensagem Lock existe para: ficheiro
- Ficheiro preso por 30 minutos

Solucoes:
1. Remove-Item locks\*.lock -Force
2. Reiniciar File Watcher
3. Stop-Process -Name powershell -Force se necessario

### PROBLEMA 5: Disco cheio de backups
Sintomas:
- Disco quase cheio
- Pasta backups com varios GB

Solucoes:
1. Remover backups antigos manualmente
2. Forcar limpeza: Start-ScheduledTask -TaskName GestaoMateriais_LimpezaSemanal
3. Editar retencao em automacao_config.json

### PROBLEMA 6: Ficheiros JSON invalidos
Sintomas:
- Erro JSON invalido
- Validacao pre-git falha

Solucoes:
1. Testar JSON com PowerShell ConvertFrom-Json
2. Restaurar de backup mais antigo
3. Usar validador online jsonlint.com

---

Versao: 1.0 | Data: 2026-10-14
