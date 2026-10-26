# Arquitetura do Sistema Completo de Segurança

**Gestão de Materiais de Catenária - DTE**  
**Versão: 1.0.0 | Data: 2026-10-14**

---

## 📊 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SISTEMA COMPLETO DE SEGURANÇA                    │
│                                                                     │
│  4 Subsistemas Integrados + Orquestrador Central + Documentação    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Componentes do Sistema

### 1️⃣ Lock File System (sistema_lock.ps1)

**Responsabilidade:** Controlo de acesso concorrente

```
┌─────────────────────────────────────────────────────────┐
│                    LOCK FILE SYSTEM                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AcquireLock(MANUAL)                                   │
│  ├─ Tenta criar: ./locks/.lock_MANUAL                 │
│  ├─ Se existe: espera até 30s (retry 1s)              │
│  ├─ Se timeout: liberta lock antigo (>120s)           │
│  └─ Regista em: log_lock.txt                          │
│                                                         │
│  ReleaseLock(MANUAL)                                   │
│  ├─ Remove: ./locks/.lock_MANUAL                      │
│  └─ Regista sucesso em log_lock.txt                   │
│                                                         │
│  CheckLockStatus()                                     │
│  └─ Lista locks activos + idade                       │
│                                                         │
│  CleanupOldLocks()                                     │
│  └─ Remove locks antigos (>300s)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Ficheiros:**
- `sistema_lock.ps1` - Script principal
- `./locks/.lock_MANUAL` - Ficheiro de lock (JSON)
- `./logs/log_lock.txt` - Log de eventos

---

### 2️⃣ Backup System (sistema_backup.ps1)

**Responsabilidade:** Cópias e reversão segura

```
┌─────────────────────────────────────────────────────────┐
│                    BACKUP SYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CreateBackup(MANUAL, "Razão")                        │
│  ├─ Gera nome: MANUAL_2026-10-14_143000.html         │
│  ├─ Copia ficheiro para: ./backups/                   │
│  ├─ Regista metadados em HISTORICO_BACKUPS.json      │
│  └─ Máximo: 10 versões (remove antigos)              │
│                                                         │
│  RestoreBackup(MANUAL_2026-10-14_143000.html)        │
│  ├─ Cria backup do ficheiro actual (pré-restore)     │
│  ├─ Restaura versão anterior                          │
│  └─ Regista evento em log_backup.txt                 │
│                                                         │
│  ListBackups([MANUAL|APP])                            │
│  └─ Lista com: tamanho, data, motivo                 │
│                                                         │
│  CleanupOldBackups()                                  │
│  └─ Manter apenas últimas 10 versões                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Ficheiros:**
- `sistema_backup.ps1` - Script principal
- `./backups/FICHEIRO_YYYYMMDD_HHMMSS.ext` - Backups
- `./backups/HISTORICO_BACKUPS.json` - Índice
- `./logs/log_backup.txt` - Log de eventos

---

### 3️⃣ Versioning System (sistema_versioning.ps1)

**Responsabilidade:** Versionamento automático

```
┌─────────────────────────────────────────────────────────┐
│                    VERSIONING SYSTEM                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  UpdateVersion(MANUAL, "Descrição")                   │
│  ├─ Incrementa: 1.0.0 → 1.0.1 (patch)               │
│  ├─ Actualiza meta tag no HTML                        │
│  ├─ Adiciona ao changelog                             │
│  └─ Regista em: versoes.json                          │
│                                                         │
│  SetVersion(MANUAL, "2.0.0")                          │
│  ├─ Define versão específica                          │
│  └─ Suporta MAJOR.MINOR.PATCH                         │
│                                                         │
│  GetVersion([MANUAL|APP|SW])                          │
│  ├─ Retorna versão atual                              │
│  └─ Mostra última atualização                         │
│                                                         │
│  ViewChangelog([MANUAL] [20])                         │
│  ├─ Lista últimas N mudanças                          │
│  └─ Com timestamp e descrição                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Ficheiros:**
- `sistema_versioning.ps1` - Script principal
- `./versoes.json` - Histórico de versões
- `./logs/log_versioning.txt` - Log de eventos

---

### 4️⃣ Orchestrator (orquestrador_seguranca.ps1)

**Responsabilidade:** Coordenação dos 3 subsistemas

```
┌─────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AbrirSessao(MANUAL, "Descrição")                     │
│  ├─ 1. AcquireLock()                                  │
│  ├─ 2. CreateBackup()                                 │
│  └─ 3. Log início em log_lock.txt                    │
│                                                         │
│  FecharSessao(MANUAL, -versioning)                    │
│  ├─ 1. UpdateVersion() [opcional]                    │
│  ├─ 2. ReleaseLock()                                  │
│  └─ 3. Log fim em log_lock.txt                       │
│                                                         │
│  FluxoCompleto($FileKey, $Acao, -Versioning)         │
│  ├─ Abrir → Executar → Fechar                         │
│  └─ Rollback automático se erro                       │
│                                                         │
│  StatusGeral()                                         │
│  └─ Mostra: locks, backups, versões, changelog       │
│                                                         │
│  RecuperarDeErro(MANUAL, [backup_name])              │
│  ├─ Liberta lock forcadamente                         │
│  └─ Oferece restauração                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Ficheiro:**
- `orquestrador_seguranca.ps1` - Script principal

---

## 🔄 Fluxo de Operação

### Fluxo Normal: Modificação Segura

```
UTILIZADOR
   │
   ├─ PS> .\orquestrador_seguranca.ps1 abrir MANUAL "Descrição"
   │
   ├─► LOCK SYSTEM
   │   └─ AcquireLock(MANUAL)
   │       └─ ./locks/.lock_MANUAL criado ✓
   │
   ├─► BACKUP SYSTEM
   │   └─ CreateBackup(MANUAL)
   │       ├─ MANUAL_2026-10-14_143000.html criado
   │       └─ HISTORICO_BACKUPS.json atualizado
   │
   ├─ EDITAR FICHEIRO
   │   └─ C:\...\MANUAL.html (protegido por lock)
   │
   ├─ TESTAR
   │   └─ Navegador: F5 / Ctrl+Shift+R
   │
   ├─ PS> .\orquestrador_seguranca.ps1 fechar MANUAL -versioning
   │
   ├─► VERSIONING SYSTEM
   │   └─ UpdateVersion(MANUAL)
   │       ├─ 1.0.0 → 1.0.1 ✓
   │       ├─ Meta tag no HTML atualizada
   │       └─ versoes.json atualizado
   │
   ├─► LOCK SYSTEM
   │   └─ ReleaseLock(MANUAL)
   │       └─ ./locks/.lock_MANUAL removido ✓
   │
   └─► NOTIFICATION SYSTEM
       └─ App detecta versão nova
           └─ "✨ Actualização disponível!"
```

---

### Fluxo de Erro: Recuperação

```
ERRO DURANTE MODIFICAÇÃO
   │
   ├─ Utilizador para edição
   │
   ├─ PS> .\orquestrador_seguranca.ps1 recuperar MANUAL
   │
   ├─► LOCK SYSTEM
   │   └─ ReleaseLock(MANUAL) [forçado]
   │       └─ Lock libertado ✓
   │
   ├─► BACKUP SYSTEM
   │   └─ ListBackups(MANUAL)
   │       └─ Lista versões disponíveis
   │
   ├─ PS> .\sistema_backup.ps1 restore MANUAL_2026-10-14_143000.html
   │
   ├─► BACKUP SYSTEM
   │   └─ RestoreBackup()
   │       ├─ Cria backup pré-restore
   │       └─ Restaura versão anterior ✓
   │
   └─ FICHEIRO RESTAURADO
```

---

## 📁 Estrutura de Directórios

```
C:\Users\dst7973\Desktop\gestao_de_stocks_dte\
│
├── 🔒 SEGURANÇA
│   ├── sistema_lock.ps1
│   ├── sistema_backup.ps1
│   ├── sistema_versioning.ps1
│   ├── orquestrador_seguranca.ps1
│   ├── README_SISTEMA_SEGURANCA.txt
│   ├── GUIA_PRATICO_SEGURANCA.md
│   ├── INTEGRACAO_NO_HTML.md
│   └── ARQUITETURA_SISTEMA.md
│
├── 📁 locks/                          (criado automaticamente)
│   ├── .lock_MANUAL
│   └── .lock_APP
│
├── 📁 backups/                        (criado automaticamente)
│   ├── MANUAL_2026-10-14_143000.html
│   ├── MANUAL_2026-10-14_143100.html
│   ├── APP_2026-10-14_143200.html
│   └── HISTORICO_BACKUPS.json
│
├── 📁 logs/                           (criado automaticamente)
│   ├── log_lock.txt
│   ├── log_backup.txt
│   └── log_versioning.txt
│
├── 📊 versoes.json                    (versionamento)
│
├── 📁 app/
│   ├── gestao_armazem_catenaria.html  (com APP_VERSION)
│   ├── update-notification.js         (notificações)
│   ├── sw.js                          (com VERSAO)
│   └── ...
│
└── 📁 documentacao/
    ├── MANUAL.html                    (com <meta version>)
    └── ...
```

---

## 🔌 Integração com HTML/Service Worker

### Fluxo de Detecção de Actualização

```
┌──────────────────────────────────────────────────────────────┐
│                   DETECÇÃO DE ACTUALIZAÇÃO                   │
└──────────────────────────────────────────────────────────────┘

1. ALTERAÇÃO NO sw.js
   └─ const VERSAO = '2026-10-14-07' (incrementou)

2. SERVICE WORKER
   ├─ Detecta VERSAO nova
   ├─ self.addEventListener('install')
   ├─ Limpa cache antigo
   └─ Instala novo cache

3. APP (update-notification.js)
   ├─ Verifica cada 60s
   ├─ Compara localStorage[APP_VERSION]
   ├─ Se versão nova detectada:
   │   └─ showUpdateNotification()
   └─ Mostra modal: "✨ Actualização disponível!"

4. UTILIZADOR
   ├─ Clica: "🔄 Recarregar agora"
   ├─ location.reload()
   └─ App carrega versão nova
```

---

## 📊 Fluxo de Dados

### Dados de Lock

```json
{
  "process": "Claude",
  "acquired": "2026-10-14 14:30:00.123",
  "pid": 12345,
  "machine": "DST7973",
  "user": "Administrator"
}
```

### Dados de Backup

```json
{
  "ficheiro": "MANUAL",
  "caminho_original": "C:\\...\\MANUAL.html",
  "backup": "MANUAL_2026-10-14_143000.html",
  "timestamp": "2026-10-14 14:30:00.000",
  "tamanho_bytes": 52000,
  "tamanho_kb": 50.78,
  "motivo": "Antes de alteração PDF",
  "processo": "Claude",
  "usuario": "Administrator",
  "maquina": "DST7973"
}
```

### Dados de Versioning

```json
{
  "ficheiro": "MANUAL",
  "versao_anterior": "1.0.0",
  "versao_nova": "1.0.1",
  "descricao": "Adicionado sistema de backup",
  "timestamp": "2026-10-14 14:35:00.000",
  "usuario": "Administrator"
}
```

---

## 🎯 Garantias do Sistema

### ✅ Segurança

- ✓ **Acesso Exclusivo:** Apenas 1 agente por vez (lock)
- ✓ **Reversibilidade:** Sempre há backup anterior
- ✓ **Rastreabilidade:** Log completo de tudo
- ✓ **Limpeza Automática:** Locks/backups antigos removidos

### ✅ Confiabilidade

- ✓ **Timeout Automático:** Lock não fica preso
- ✓ **Recuperação:** Modo emergência sempre disponível
- ✓ **Validação:** Verificação antes de cada ação
- ✓ **Rollback:** Restauração segura em caso de erro

### ✅ Usabilidade

- ✓ **Interface Simples:** Um comando para tudo
- ✓ **Documentação Completa:** Guias e exemplos
- ✓ **Feedback Claro:** Mensagens detalhadas
- ✓ **Notificações:** Utilizador sempre informado

---

## 🔄 Ciclo de Vida de uma Modificação

```
1. PREPARAÇÃO
   └─ Utilizador decide modificar ficheiro

2. AQUISIÇÃO
   └─ orquestrador: abrir MANUAL "Descrição"
      ├─ Lock adquirido
      └─ Backup criado

3. MODIFICAÇÃO
   └─ Editar ficheiro em editor de código
      └─ Lock impede outros agentes

4. TESTE
   └─ Verificar no navegador
      ├─ F5 (reload)
      ├─ Ctrl+Shift+R (hard reset)
      └─ Console: sem erros

5. FINALIZACAO
   └─ orquestrador: fechar MANUAL -versioning
      ├─ Versão incrementa
      ├─ Changelog atualizado
      └─ Lock libertado

6. NOTIFICACAO
   └─ Utilizadores notificados
      ├─ Service worker: versão nova
      ├─ App: "Actualização disponível!"
      └─ Utilizador recarrega
```

---

## 🚀 Uso Recomendado

### Para Modificações Simples

```powershell
# 3 linhas suficientes:
.\orquestrador_seguranca.ps1 abrir MANUAL "Descrição"
# Editar ficheiro...
.\orquestrador_seguranca.ps1 fechar MANUAL -versioning
```

### Para Auditorias

```powershell
# Ver tudo:
.\orquestrador_seguranca.ps1 status
```

### Para Recuperação

```powershell
# Em caso de erro:
.\orquestrador_seguranca.ps1 recuperar MANUAL
```

---

## 📈 Estatísticas do Sistema

### Após 1 mês de uso (estimado):

```
Lock Events:      ~100+
Backup Files:     ~30 (manter últimas 10)
Versions:         ~5 ficheiros
Changelog:        ~100 entradas
Total Size:       ~5-10 MB
Log Size:         ~1-2 MB
```

---

## 🔮 Futuras Melhorias

- [ ] Dashboard web de backups/versões
- [ ] Integração com Git (auto-commit)
- [ ] Sincronização com SharePoint
- [ ] Notificação por email
- [ ] Diff visual entre versões
- [ ] API REST para automação
- [ ] Auditoria avançada (Slack/Teams)
- [ ] Histórico visual interativo

---

## 📞 Contacto

**Desenvolvido por:** Claude (Anthropic)  
**Para:** Rui Simões (DTE)  
**Email:** rui16simoes@gmail.com  
**Data:** 2026-10-14  
**Versão:** 1.0.0  
**Status:** Pronto para produção ✅

---

## 🎓 Documentação Relacionada

- `README_SISTEMA_SEGURANCA.txt` - Overview técnico
- `GUIA_PRATICO_SEGURANCA.md` - Exemplos práticos
- `INTEGRACAO_NO_HTML.md` - Como integrar
- `update-notification.js` - Script de notificação
- `sistema_lock.ps1` - Lock manager
- `sistema_backup.ps1` - Backup manager
- `sistema_versioning.ps1` - Version manager
- `orquestrador_seguranca.ps1` - Orchestrator

---

**FIM DA ARQUITETURA**
