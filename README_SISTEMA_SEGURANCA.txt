╔════════════════════════════════════════════════════════════════════════════════╗
║                   SISTEMA COMPLETO DE SEGURANÇA E SINCRONIZAÇÃO               ║
║            Gestão de Materiais de Catenária - Documentação Técnica             ║
╚════════════════════════════════════════════════════════════════════════════════╝

VERSÃO: 1.0.0
DATA: 2026-10-14
UTILIZADOR: Claude + Rui Simões

════════════════════════════════════════════════════════════════════════════════
1. COMPONENTES DO SISTEMA
════════════════════════════════════════════════════════════════════════════════

O sistema é composto por 4 subsistemas independentes mas coordenados:

1️⃣  SISTEMA DE LOCK FILE (sistema_lock.ps1)
   └─ Controlo de acesso concorrente (mutex)
   └─ Impede 2 agentes mexerem no mesmo ficheiro
   └─ Timeout automático após 30 segundos
   └─ Ficheiros: /.lock_* com metadados JSON

2️⃣  SISTEMA DE BACKUP (sistema_backup.ps1)
   └─ Cópias timestamped antes de alterações
   └─ Histórico completo em HISTORICO_BACKUPS.json
   └─ Limite automático: 10 versões por ficheiro
   └─ Reversão rápida em caso de erro
   └─ Estrutura: ./backups/FICHEIRO_YYYY-MM-DD_HHMMSS.ext

3️⃣  SISTEMA DE VERSIONING (sistema_versioning.ps1)
   └─ Incremento automático de versão
   └─ Suporta semântico (MAJOR.MINOR.PATCH)
   └─ Changelog completo em versoes.json
   └─ Atualiza meta tags no HTML

4️⃣  ORQUESTRADOR INTEGRADO (orquestrador_seguranca.ps1)
   └─ Coordena os 3 subsistemas
   └─ Fluxo: lock → backup → modificação → versioning → release
   └─ Modo recuperação para emergências
   └─ Interface unificada

════════════════════════════════════════════════════════════════════════════════
2. FLUXO DE TRABALHO SEGURO
════════════════════════════════════════════════════════════════════════════════

PASSO A PASSO:

  1. ABRIR SESSÃO
     .\orquestrador_seguranca.ps1 abrir MANUAL "Descrição da modificação"

     ├─ Adquire lock (espera até 30s se bloqueado)
     ├─ Cria backup automático
     └─ Regista início em log_lock.txt

  2. MODIFICAR FICHEIRO
     ├─ Editar: C:\...\MANUAL.html
     ├─ Editar: C:\...\gestao_armazem_catenaria.html
     └─ Testar no navegador

  3. FECHAR SESSÃO COM VERSIONING
     .\orquestrador_seguranca.ps1 fechar MANUAL -versioning

     ├─ Incrementa versão automaticamente
     ├─ Adiciona ao changelog
     ├─ Liberta lock
     └─ Service worker notifica utilizador

════════════════════════════════════════════════════════════════════════════════
3. ESTRUTURA DE FICHEIROS
════════════════════════════════════════════════════════════════════════════════

C:\Users\dst7973\Desktop\gestao_de_stocks_dte\
├── sistema_lock.ps1                 🔒 Lock file manager
├── sistema_backup.ps1               💾 Backup manager
├── sistema_versioning.ps1           📊 Version manager
├── orquestrador_seguranca.ps1       🎯 Main orchestrator
├── locks\                           📁 Lock files (runtime)
│   └── .lock_MANUAL                 (JSON com metadados)
│   └── .lock_APP
├── backups\                         📁 Backup storage
│   ├── MANUAL_2026-10-14_143000.html
│   ├── MANUAL_2026-10-14_143100.html
│   ├── APP_2026-10-14_143200.html
│   └── HISTORICO_BACKUPS.json       📋 Índice de backups
├── logs\                            📁 Logs de operações
│   ├── log_lock.txt                 🔐 Lock events
│   ├── log_backup.txt               💾 Backup events
│   └── log_versioning.txt           📝 Version changes
├── versoes.json                     📊 Version history
└── documentacao\
    └── MANUAL.html                  (com meta version)
└── app\
    ├── gestao_armazem_catenaria.html (com APP_VERSION)
    └── sw.js                        (com VERSAO)

════════════════════════════════════════════════════════════════════════════════
4. COMANDOS PRINCIPAIS
════════════════════════════════════════════════════════════════════════════════

ORQUESTRADOR (uso recomendado):

  # Abrir sessão
  .\orquestrador_seguranca.ps1 abrir MANUAL "Adicionado sistema de backup"

  # Fechar com versioning
  .\orquestrador_seguranca.ps1 fechar MANUAL -versioning

  # Ver status geral
  .\orquestrador_seguranca.ps1 status

  # Recuperação de emergência
  .\orquestrador_seguranca.ps1 recuperar MANUAL MANUAL_2026-10-14_143000.html

LOCK (directo):

  .\sistema_lock.ps1 acquire MANUAL           # Adquirir lock
  .\sistema_lock.ps1 release MANUAL           # Libertar lock
  .\sistema_lock.ps1 status [MANUAL|APP]     # Ver locks ativos
  .\sistema_lock.ps1 log 50                   # Ver últimas 50 linhas de log
  .\sistema_lock.ps1 cleanup                  # Remover locks antigos (>5 min)

BACKUP (directo):

  .\sistema_backup.ps1 create MANUAL "Razão"         # Criar backup
  .\sistema_backup.ps1 list [MANUAL|APP]             # Listar backups
  .\sistema_backup.ps1 cleanup [MANUAL|APP]          # Remover antigos
  .\sistema_backup.ps1 restore MANUAL_2026-10-14_143000.html
  .\sistema_backup.ps1 status

VERSIONING (directo):

  .\sistema_versioning.ps1 update MANUAL "Descrição"  # Incrementar patch
  .\sistema_versioning.ps1 get [MANUAL|APP]          # Ver versão atual
  .\sistema_versioning.ps1 log [MANUAL] [20]         # Ver changelog
  .\sistema_versioning.ps1 set MANUAL 2.0.0          # Versão específica

════════════════════════════════════════════════════════════════════════════════
5. FORMATOS DE DADOS
════════════════════════════════════════════════════════════════════════════════

LOCK FILE (.lock_MANUAL):
{
  "process": "Claude",
  "acquired": "2026-10-14 14:30:00.123",
  "pid": 12345,
  "machine": "DST7973",
  "user": "Administrator"
}

HISTORICO_BACKUPS.json:
{
  "criado": "2026-10-14 14:00:00.000",
  "versao": "1.0",
  "backups": [
    {
      "ficheiro": "MANUAL",
      "caminho_original": "C:\\...\\MANUAL.html",
      "backup": "MANUAL_2026-10-14_143000.html",
      "caminho_backup": "C:\\...\\backups\\MANUAL_2026-10-14_143000.html",
      "timestamp": "2026-10-14 14:30:00.000",
      "tamanho_bytes": 52000,
      "tamanho_kb": 50.78,
      "motivo": "Antes de alteração PDF",
      "processo": "Claude",
      "usuario": "Administrator",
      "maquina": "DST7973"
    }
  ]
}

versoes.json:
{
  "MANUAL": "1.0.1",
  "APP": "2.3.1",
  "SW": "2026-10-14-06",
  "last_updated": "2026-10-14 14:35:00.000",
  "changelog": [
    {
      "ficheiro": "MANUAL",
      "versao_anterior": "1.0.0",
      "versao_nova": "1.0.1",
      "descricao": "Adicionado sistema de backup",
      "timestamp": "2026-10-14 14:35:00.000",
      "usuario": "Administrator"
    }
  ]
}

════════════════════════════════════════════════════════════════════════════════
6. INTEGRAÇÃO NO HTML
════════════════════════════════════════════════════════════════════════════════

NO MANUAL.html (<head>):

  <meta name="version" content="1.0.1">
  <meta name="last-updated" content="2026-10-14T14:30:00Z">
  <meta name="changelog" content="Adicionado sistema de backup">

NO gestao_armazem_catenaria.html (SEED_DATA):

  {
    "APP_VERSION": "2.3.1",
    "LAST_UPDATE": "2026-10-14T14:30:00Z",
    "BACKUP_ENABLED": true,
    "LOCK_ENABLED": true
  }

NO sw.js:

  const VERSAO = '2026-10-14-06';
  // Quando há mudança no HTML: '2026-10-14-07', etc.

════════════════════════════════════════════════════════════════════════════════
7. NOTIFICAÇÃO AOS UTILIZADORES
════════════════════════════════════════════════════════════════════════════════

O Service Worker detecta automaticamente:

1. Mudança de versão no sw.js → força update
2. Mudança no HTML → detecta versão nova em localStorage
3. Mostra popup: "✨ Actualização disponível! Recarregar?"
4. Utilizador pode recarregar ou adiar

Script injected no HTML (update-notification.js):

  const versaoAtual = localStorage.getItem('APP_VERSION');
  fetch('./gestao_armazem_catenaria.html')
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const versaoNova = doc.querySelector('[data-version]')?.getAttribute('data-version');
      if (versaoNova && versaoNova !== versaoAtual) {
        mostrarNotificacao("Actualização disponível!");
      }
    });

════════════════════════════════════════════════════════════════════════════════
8. RECUPERAÇÃO DE EMERGÊNCIA
════════════════════════════════════════════════════════════════════════════════

SITUAÇÃO: Lock preso, ficheiro não consegue ser modificado

SOLUÇÃO 1: Ver locks ativos
  .\sistema_lock.ps1 status MANUAL

SOLUÇÃO 2: Ver log de locks
  .\sistema_lock.ps1 log 30

SOLUÇÃO 3: Remover locks antigos (>5 min)
  .\sistema_lock.ps1 cleanup

SOLUÇÃO 4: Forçar libertação + restaurar
  .\orquestrador_seguranca.ps1 recuperar MANUAL
  # Listar backups e escolher qual restaurar
  .\sistema_backup.ps1 restore MANUAL_2026-10-14_143000.html

════════════════════════════════════════════════════════════════════════════════
9. FLUXO DE TRABALHO RECOMENDADO
════════════════════════════════════════════════════════════════════════════════

ANTES DE CADA MODIFICAÇÃO IMPORTANTE:

  1. Abrir sessão
  2. Fazer backup verificável (.)
  3. Editar ficheiro
  4. Testar no navegador (F5 / Ctrl+Shift+R)
  5. Fechar sessão com versioning
  6. Utilizadores notificados automaticamente

EXEMPLO REAL:

  # Terminal 1: Abrir sessão
  PS> .\orquestrador_seguranca.ps1 abrir MANUAL "Adicionado índice de PDFs"

  ✅ Sessão aberta com sucesso!
     Lock: Adquirido
     Backup: Criado (MANUAL_2026-10-14_143000.html)

  # Editor de código: Modificar MANUAL.html
  # Navegador: Testar as alterações

  # Terminal 1: Fechar sessão
  PS> .\orquestrador_seguranca.ps1 fechar MANUAL -versioning

  ✅ Sessão fechada com sucesso!
     Versão: 1.0.0 → 1.0.1
     Lock: Libertado

  # Utilizadores veem: "✨ Actualização disponível! Recarregar?"

════════════════════════════════════════════════════════════════════════════════
10. MELHORIAS FUTURAS
════════════════════════════════════════════════════════════════════════════════

- [ ] Integração com Git (commit automático de backups)
- [ ] Sincronização com SharePoint
- [ ] Dashboard web de backups/versões
- [ ] Notificação por email ao Rui
- [ ] Historial visual de mudanças
- [ ] Diff automático entre versões
- [ ] Reversão em um clique
- [ ] Auditoria completa (quem, o quê, quando)
- [ ] API REST para automação
- [ ] Integração com Slack/Teams

════════════════════════════════════════════════════════════════════════════════
11. SUPORTE E CONTACTO
════════════════════════════════════════════════════════════════════════════════

Sistema desenvolvido por: Claude (Anthropic)
Para: Rui Simões (DTE)
Email: rui16simoes@gmail.com

Para problemas:
1. Verificar logs: .\sistema_lock.ps1 log
2. Ver status: .\orquestrador_seguranca.ps1 status
3. Listar backups: .\sistema_backup.ps1 list
4. Recuperar: .\orquestrador_seguranca.ps1 recuperar FICHEIRO

════════════════════════════════════════════════════════════════════════════════
FIM DA DOCUMENTAÇÃO
════════════════════════════════════════════════════════════════════════════════
