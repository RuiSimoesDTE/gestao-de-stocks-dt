# 📦 Guia de Backups — Gestão de Materiais de Catenária

## 🎯 Objetivo

Os backups da aplicação são guardados automaticamente na pasta de SharePoint para ficar tudo integrado e sincronizado.

## 📍 Pasta de Backups

```
C:\Users\dst7973\OneDrive - Domingos da Silva Teixeira, S.A\Obras_dte_IC - 00_Obras\Gestao de Materiais de Catenaria\backups
```

## ⚙️ Como Funciona

### 1️⃣ **Fazer um Backup (Download)**

Na aplicação:
- Vai para o canto superior direito → procura o botão **"⬇ Backup (JSON)"**
- Ou em "Configurações" → **"⬇ Exportar backup (JSON)"**
- Clica e o ficheiro descarrega para a pasta **Downloads** do Windows

### 2️⃣ **Mover Automaticamente para SharePoint**

O script `mover_backups_automaticamente.ps1` faz isto por ti:

**Opção A — Executar manualmente (uma vez):**
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\dst7973\Desktop\gestao_de_stocks_dte\mover_backups_automaticamente.ps1"
```

**Opção B — Deixar a correr em background (RECOMENDADO):**
1. Abre o **PowerShell** (não como admin, na pasta do projeto)
2. Executa:
   ```powershell
   cd C:\Users\dst7973\Desktop\gestao_de_stocks_dte
   powershell -ExecutionPolicy Bypass -File mover_backups_automaticamente.ps1
   ```
3. Deixa isto aberto. Agora cada backup que descarregues é **movido automaticamente** para a SharePoint.

### 3️⃣ **Restaurar um Backup (Upload)**

Na aplicação:
- Vai para o botão **"⬆ Restaurar"** (ou "⬆ Restaurar backup")
- Escolhe um ficheiro JSON da pasta de backups
- Confirma — os dados são restaurados

## 📊 Estrutura de Ficheiros

```
Gestao de Materiais de Catenaria/
├── gestao_materiais_catenaria.html    (app principal)
├── sw.js                               (service worker)
├── manifest.webmanifest                (PWA config)
├── entrada.html                        (página inicial)
├── logo_dte_dst.png                    (logo DTE)
├── icons/                              (ícones da app)
├── guias_at/                           (guias de transporte AT)
├── guias_transferencia/                (guias entre obras)
├── projeto_vendas_novas/               (desenhos e montagens)
├── backups/ ⭐                         (BACKUPS — AQUI FICA TUDO)
│   ├── backup_gestao_stocks_todas_obras_2026-10-14.json
│   ├── backup_gestao_stocks_todas_obras_2026-10-13.json
│   └── ...
├── publicar_na_partilhada.ps1          (script de publicação)
└── mover_backups_automaticamente.ps1   (script de monitorização)
```

## 💡 Dicas

- ✅ **Faz backup regularmente** — antes de alterações grandes
- ✅ **Deixa o script a correr** — assim não precisas de mover manualmente
- ✅ **Todos os backups ficam na SharePoint** — acesso fácil, sincronizado, seguro
- ✅ **Podes restaurar antigos** — qualquer backup JSON pode ser restaurado
- ⚠️ **Não apagues backups antigos** — podem servir se algo correr mal

## 🔧 Troubleshooting

**P: O script está sempre a dizer que está a monitorizar mas nada acontece?**
R: Está a funcionar corretamente! Quando descarregares um backup, ele move automaticamente.

**P: Posso parar o script?**
R: Sim, pressiona `Ctrl+C` no PowerShell. Podes recomeçar quando quiseres.

**P: Tenho backups antigos na pasta Downloads, como os movo?**
R: Executa o script uma vez — ele move TODOS os backups encontrados.

**P: Onde estão os backups agora?**
R: Na pasta de backups da SharePoint. Vê em:
```
C:\Users\dst7973\OneDrive - Domingos da Silva Teixeira, S.A\Obras_dte_IC - 00_Obras\Gestao de Materiais de Catenaria\backups
```

---

**Contacta o Rui se tiveres problemas!** 📧 rui16simoes@gmail.com
