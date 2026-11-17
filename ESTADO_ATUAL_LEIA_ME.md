# Estado atual do programa (27/10/2026)

Este ficheiro resume o que foi feito hoje, onde estão os dados e o que ainda falta decidir.
**Nada foi apagado nem restaurado no seu PC.**

## 1. Onde estão as coisas

| O quê | Onde | Estado |
|---|---|---|
| Programa certo | `gestao_armazem_catenaria.html` (esta pasta) | Funciona. Abra com duplo clique. |
| Programa online | https://ruisimoesdte.github.io/gestao-de-stocks-dt/gestao_armazem_catenaria.html | Igual ao ficheiro certo (última publicação: `a600ae7`). |
| Programa antigo | `gestao_materiais_catenaria.html` (esta pasta) | **Não usar.** Cópia antiga de hoje às 10h03, com letras estragadas. |
| Dados do PC | Navegador do PC (não é um ficheiro) | Só se vêem no navegador onde o programa é aberto. |
| Dados online | Navegador de cada pessoa que abre o site | Separados dos dados do PC. |

## 2. O que foi feito hoje

- **Página online:** estava com erro de sintaxe. Corrigido e publicado.
- **Service worker (`sw.js`):** a página antiga ficava guardada no navegador. Corrigido e publicado.
- **Guias AT:** pesquisa por material, número, origem ou destino. Publicada.
- **Guias AT de Vendas Novas:** acrescentada a GT 2979 e as guias de transferência 1320, 1844, 2462, 2827, 2829, 3203 e 3270. Ordenadas por data. Publicado.
- **Guias AT:** só aparecem na obra de Vendas Novas (publicado).
- **Modo escuro:** texto das caixas passou a ser claro (publicado).

## 3. Backups (não apagar)

Na pasta `dados_partilhados` do OneDrive (pasta partilhada):
- `backup_gestao_stocks_todas_obras_2026-10-27.json` — **backup de hoje às 16h04**, com as duas obras (Vendas Novas e Pampilhosa). Referência mais completa.
- `backup_gestao_stocks_SEM_pampilhosa_2026-10-27.json` — **ficheiro preparado, ainda não restaurado.** Tem só Vendas Novas, com os 15 movimentos da Pampilhosa passados para lá.

Na pasta do programa:
- `gestao_armazem_catenaria_backup_antes_restauro_11h51_20261027_153005.html` — versão anterior à restauração das 11h51.
- `gestao_armazem_catenaria_backup_antes_pesquisa_guias_20261027_162903.html` — antes da pesquisa nas Guias AT.
- `gestao_armazem_catenaria_backup_antes_guias_so_vn_contraste_20261027_164229.html` — antes da última alteração do site.

## 4. Pampilhosa

No backup de hoje às 16h04, a Pampilhosa tinha **15 movimentos**:
- 11 receções de transferências de Vendas Novas (guias 1320, 1844, 2462, 2827 e 2829);
- 4 receções da guia 2979 (17/08/2026).

Não tem encomendas, pedidos nem mapas.

**Decisão tomada (pelo Rui):** passar tudo para Vendas Novas e apagar a Pampilhosa.

**Efeito a ter em conta:** o material enviado para Pampilhosa deixa de aparecer em qualquer obra, porque sai de Vendas Novas e não entra em lado nenhum. É uma consequência da decisão, não um erro.

**Ainda não feito.** Só o Rui, no PC, pode fazer. Passos:
1. Fazer **⬇ Backup (JSON)** no PC.
2. Confirmar que o PC mostra os mesmos números do backup de 16h04 (Vendas Novas 2.927 movimentos; Pampilhosa 15).
3. Em **Definições → ⬆ Restaurar backup**, escolher `backup_gestao_stocks_SEM_pampilhosa_2026-10-27.json`.
4. Confirmar que Vendas Novas tem **2.942 movimentos** e que a Pampilhosa já não aparece.

## 5. Coisas a não fazer

- Não usar o programa antigo (`gestao_materiais_catenaria.html`).
- Não clicar em **Gravar**, **Restaurar** ou **Recarregar dados** no site online sem backup antes.
- Não limpar os "dados do site" nem o `localStorage` de nenhum endereço.
- Não fazer `git push --force` no repositório.

## 6. Segurança

Durante as conversas, foram coladas no chat uma palavra-passe e um token do GitHub. **Convém revogá-los** e criar novos.

## 7. Dúvidas em aberto

- O programa do PC usa alguma pasta partilhada para guardar dados? Não está confirmado; a versão antiga tinha código para isso, a versão certa não.
- O repositório do GitHub é público ou privado? A API devolveu 404, por isso não está confirmado.
- Quando a Pampilhosa for apagada, deve ficar algum registo de que existiu? Não foi decidido.
