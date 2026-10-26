# Integração do Sistema de Segurança no HTML

**Gestão de Materiais de Catenária - DTE**

---

## 📋 O Que Integrar

### 1. **MANUAL.html** - Meta Tags de Versão

```html
<!-- Adicionar no <head> -->
<meta name="version" content="1.0.0">
<meta name="last-updated" content="2026-10-14T14:00:00Z">
<meta name="changelog" content="Adicionado sistema de backup e segurança">
```

**Localização no ficheiro:**
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Aqui no topo -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="version" content="1.0.0">           <!-- ADICIONAR ISTO -->
    <meta name="last-updated" content="2026-10-14T14:00:00Z">  <!-- ADICIONAR ISTO -->
    <title>Manual - Gestão de Materiais</title>
    ...
</head>
```

---

### 2. **gestao_armazem_catenaria.html** - Versão na App

```html
<!-- Integrar no SEED_DATA (JavaScript) -->
<script>
  const SEED_DATA = {
    APP_VERSION: "2.3.1",
    LAST_UPDATE: "2026-10-14T14:30:00Z",
    BACKUP_ENABLED: true,
    LOCK_ENABLED: true,
    SECURITY_SYSTEM: {
      version: "1.0.0",
      enabled: true,
      check_updates: true,
      notification_style: "modern"
    },
    // ... resto do SEED_DATA
  };
</script>
```

---

### 3. **update-notification.js** - Script de Notificação

```html
<!-- Adicionar no <head> ou antes de </body> -->
<script src="./update-notification.js"></script>
```

---

### 4. **sw.js** - Service Worker com Versioning

```javascript
// No topo do ficheiro
const VERSAO = '2026-10-14-06';

// Quando atualizar: '2026-10-14-07', etc.
```

---

## 🔄 Passo a Passo de Integração

### Passo 1: Adicionar Meta Tags ao MANUAL.html

```powershell
# 1. Abrir sessão
.\orquestrador_seguranca.ps1 abrir MANUAL "Integração de meta tags de versão"

# 2. Editar MANUAL.html
# Abrir em editor: C:\...\documentacao\MANUAL.html

# Encontrar a seção <head> e adicionar:
<meta name="version" content="1.0.0">
<meta name="last-updated" content="2026-10-14T14:00:00Z">

# 3. Testar no navegador
# Abrir MANUAL.html em Firefox/Chrome
# Inspecionar: Right-click → Inspect → Console
# Verificar não há erros

# 4. Fechar sessão
.\orquestrador_seguranca.ps1 fechar MANUAL -versioning
```

---

### Passo 2: Integrar Versioning na App

```powershell
# 1. Abrir sessão
.\orquestrador_seguranca.ps1 abrir APP "Integração de sistema de versioning"

# 2. Editar gestao_armazem_catenaria.html
# Buscar: const SEED_DATA = {
# Adicionar após a abertura:

const SEED_DATA = {
  APP_VERSION: "2.3.1",
  LAST_UPDATE: "2026-10-14T14:30:00Z",
  BACKUP_ENABLED: true,
  LOCK_ENABLED: true,
  SECURITY_SYSTEM: {
    version: "1.0.0",
    enabled: true,
    check_updates: true,
    notification_style: "modern"
  },
  // resto dos dados...
};

# 3. Testar
# Abrir app no navegador
# Abrir Console: F12 → Console
# Escrever: localStorage.getItem('APP_VERSION')
# Deve aparecer a versão da app

# 4. Fechar com versioning
.\orquestrador_seguranca.ps1 fechar APP -versioning
```

---

### Passo 3: Copiar update-notification.js

```powershell
# 1. Ficheiro já foi criado em:
# C:\Users\dst7973\Desktop\gestao_de_stocks_dte\app\update-notification.js

# 2. Adicionar referência no HTML
# No ficheiro: C:\...\app\gestao_armazem_catenaria.html
# No </head> ou antes de </body>:

<script src="./update-notification.js"></script>

# 3. Testar
# Abrir app no navegador
# Abrir Console: F12
# Deve ver: "[UpdateNotif] Inicializando sistema de notificação..."

# 4. Se quiser testar notificação:
# Abrir Console e executar:
# localStorage.setItem('APP_VERSION', 'teste');
# Deverá aparecer popup: "✨ Actualização disponível!"
```

---

### Passo 4: Atualizar sw.js

```powershell
# 1. Editar: C:\...\app\sw.js

# 2. Encontrar linha com:
# const VERSAO = '2026-10-14-06';

# 3. Quando fizer mudança no sw.js, incrementar:
# const VERSAO = '2026-10-14-07';  # incrementou de 06 para 07

# Ou em novo dia:
# const VERSAO = '2026-10-15-00';

# 4. Service worker irá:
# - Detectar versão nova
# - Forçar atualização do cache
# - Notificar app que há update disponível

# 5. App notifica utilizador:
# "✨ Actualização disponível! Recarregar?"
```

---

## 🧪 Teste de Integração

### Teste 1: Detecção de Versão

```powershell
# Terminal
PS> .\sistema_versioning.ps1 get MANUAL

# Resultado esperado:
# Versões Actuais:
# 
#   MANUAL: 1.0.0
#   APP: 2.3.1
#   SW: 2026-10-14-06
```

### Teste 2: Notificação no Navegador

```javascript
// Abrir Console do navegador (F12) e executar:

// Simular actualização
localStorage.setItem('APP_VERSION', 'fake-version');

// Recarregar página (F5)
// Deve aparecer: "✨ Actualização disponível!"
```

### Teste 3: Service Worker Update

```javascript
// Em sw.js, mudar VERSAO:
// const VERSAO = '2026-10-14-07';  // incrementou

// Recarregar app no navegador (Ctrl+F5 para hard refresh)
// Service worker irá:
// - Detectar versão nova
// - Notificar à app
// - App mostra notificação
```

### Teste 4: Fluxo Completo

```powershell
# 1. Abrir sessão
PS> .\orquestrador_seguranca.ps1 abrir MANUAL "Teste de integração"

# 2. Fazer pequena mudança no MANUAL.html (adicionar comentário)

# 3. Fechar com versioning
PS> .\orquestrador_seguranca.ps1 fechar MANUAL -versioning

# ✅ Resultado esperado:
# - Versão increments: 1.0.0 → 1.0.1
# - Changelog regista mudança
# - Utilizadores veem notificação (se app aberta)

# 4. Verificar
PS> .\sistema_versioning.ps1 log MANUAL 1

# Deve mostrar última mudança
```

---

## 📝 Checklist de Integração

### Ficheiro: MANUAL.html

- [ ] Meta tag `version` adicionada no `<head>`
- [ ] Meta tag `last-updated` adicionada
- [ ] Meta tag `changelog` adicionada (opcional)
- [ ] HTML valida (sem sintaxe errors)
- [ ] Testado no navegador (sem console errors)
- [ ] Backup criado antes de mudanças
- [ ] Versão atualizada depois

### Ficheiro: gestao_armazem_catenaria.html

- [ ] SEED_DATA tem `APP_VERSION`
- [ ] SEED_DATA tem `LAST_UPDATE`
- [ ] SEED_DATA tem `SECURITY_SYSTEM`
- [ ] `update-notification.js` incluído no HTML
- [ ] Script executado sem erros (console)
- [ ] `localStorage.getItem('APP_VERSION')` funciona
- [ ] Testado notificação (simular versão nova)

### Ficheiro: update-notification.js

- [ ] Ficheiro existe em: `./app/update-notification.js`
- [ ] Código com syntax válida
- [ ] Incluído no HTML com `<script src="./update-notification.js"></script>`
- [ ] Inicia sem erros (console)
- [ ] Notificação visual compatível com tema
- [ ] Funciona em mobile e desktop

### Ficheiro: sw.js

- [ ] Versão incrementa quando há mudanças
- [ ] Formato: `2026-10-14-06` (data-número)
- [ ] Cache limpa quando VERSAO muda
- [ ] Service worker reinstala automaticamente

---

## 🔍 Verificação de Integração

```powershell
# Verificar MANUAL.html
PS> (Get-Content "C:\...\MANUAL.html") -match 'version'
# Deve retornar: True

# Verificar gestao_armazem_catenaria.html
PS> (Get-Content "C:\...\gestao_armazem_catenaria.html") -match 'APP_VERSION'
# Deve retornar: True

# Verificar update-notification.js incluído
PS> (Get-Content "C:\...\gestao_armazem_catenaria.html") -match 'update-notification.js'
# Deve retornar: True

# Ver versões atuais
PS> .\sistema_versioning.ps1 get
# Mostra: MANUAL: 1.0.0, APP: 2.3.1, SW: 2026-10-14-06
```

---

## 🚨 Troubleshooting de Integração

### Problema: "Notificação não aparece"

**Causa:** update-notification.js não incluído no HTML

**Solução:**

```html
<!-- Adicionar antes de </body> -->
<script src="./update-notification.js"></script>
```

---

### Problema: "Versão não incrementa"

**Causa:** Meta tag ou script não encontrado

**Solução:**

```powershell
# Verificar meta tag existe
PS> Select-String '<meta name="version"' "C:\...\MANUAL.html"

# Se não existir, adicionar manualmente:
# No <head>: <meta name="version" content="1.0.0">

# Tentar atualizar versão
PS> .\sistema_versioning.ps1 update MANUAL "Teste"
```

---

### Problema: "Service worker cache não actualiza"

**Causa:** VERSAO no sw.js não incrementou

**Solução:**

```javascript
// Em sw.js, mudar:
const VERSAO = '2026-10-14-07';  // incrementou número

// Recarregar página com Ctrl+F5 (hard refresh)
// Service worker irá:
// 1. Detectar versão nova
// 2. Limpar cache antigo
// 3. Instalar novo cache
```

---

## ✅ Verificação Final

```powershell
# 1. Listar versões
.\sistema_versioning.ps1 status

# 2. Ver últimas mudanças
.\sistema_versioning.ps1 log

# 3. Verificar backups
.\sistema_backup.ps1 list

# 4. Testar fluxo completo
.\orquestrador_seguranca.ps1 status

# Tudo deve mostrar informações válidas!
```

---

## 📞 Suporte

Se tiver dúvidas sobre integração:

1. Verificar `README_SISTEMA_SEGURANCA.txt`
2. Ler `GUIA_PRATICO_SEGURANCA.md`
3. Contactar: rui16simoes@gmail.com

---

**Última atualização:** 2026-10-14  
**Status:** Pronto para integração completa
