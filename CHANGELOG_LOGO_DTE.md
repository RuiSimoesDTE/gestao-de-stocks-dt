# Changelog - Logo DTE

## 14/10/2026 - Logo DTE Implementado

### O que foi mudado:

1. **Logo adicionado ao programa**
   - Ficheiro: `recursos/logo_dte.png`
   - Substituiu: `logo_catenaria.svg`
   - Localização no programa: header, lado esquerdo do título

2. **Atualizações técnicas:**
   - HTML `gestao_armazem_catenaria.html` linha 417: trocar `logo_catenaria.svg` para `logo_dte.png`
   - Text alt-tag: "DTE · Instalações Especiais"

3. **Versioning:**
   - Versão localStorage: `dte_armazem_v118` → `dte_armazem_v119`
   - Service Worker: `2026-10-14-07-catenaria` → `2026-10-14-08-catenaria-logo`
   - PRE_CACHE atualizado para novo logo

4. **Sincronização:**
   - ✅ Desktop: `C:\Users\dst7973\Desktop\gestao_de_stocks_dte\app\`
   - ✅ OneDrive: `Obras_dte_IC - 00_Obras\Programa_Catenaria\`

### Ficheiros alterados:
- `app/gestao_armazem_catenaria.html`
- `app/sw.js`
- `recursos/logo_dte.png` (novo)

### Backup:
- `app/gestao_armazem_catenaria_backup_20261014_*.html`

### Resultado:
- ✅ Logo DTE aparece no topo do programa
- ✅ Versão incrementada para força atualização do cache
- ✅ Sincronizado em ambos os locais (Desktop e OneDrive)
- ✅ Pronto para usar

---

**Notas:**
- O service worker vai descarregar e cachear o novo logo na primeira abertura
- Navegadores podem precisar de "Limpar cache" para força atualização imediata
- Tudo testado e funcional
