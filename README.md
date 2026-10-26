# Gestão de Stocks DTE — Windows e Codex

Este é o pacote completo do sistema de gestão de armazém de catenária.

## Conteúdo

### Ficheiros principais (raiz)
- `BRIEFING_ChatGPT.md` — **LÊ ISTO PRIMEIRO** — contexto e regras de negócio
- `gestao_armazem_catenaria.html` — Aplicação HTML v118 (abrir no browser)
- `dados_armazem_catenaria.json` — Dados brutos em JSON estruturado
- `Postes_MRocha_vs_Obra.xlsx` — Análise entradas M.Rocha vs saídas

### Pasta `mapas_mensais/`
Ficheiros de reconciliação SAP mensal:
- `IC-0019_Consumos_30_06_2026_FOLHA_PREENCHER.xlsx` — Folha atual para preencher (Junho 2026)
- `Relacao_IC0019_Consumos_Junho2026.xlsx` — Match + FORA + Resumo (Junho)
- `FORA_Maio_vs_Folha_Junho.xlsx` — Cruzamento entre meses (materiais que apareceram)
- `IC-0019_Consumos_31_05_2026_PREENCHIDO.xlsx` — Referência mês passado
- `Relacao_IC0019_Consumos_FINAL.xlsx` — Referência mês passado (Match + FORA)

## Como abrir no Windows

1. Fazer duplo clique em `ABRIR_NO_WINDOWS.cmd`.
2. A aplicação abre no navegador predefinido (recomendado: Microsoft Edge ou Google Chrome).
3. Os dados ficam guardados no `localStorage` desse navegador. Usar o botão de backup regularmente.

> Ao mudar de computador ou navegador, exportar primeiro um backup JSON e importá-lo no novo ambiente.

## Como usar no Codex

1. Abrir esta pasta como workspace no Codex.
2. Pedir a tarefa diretamente; o ficheiro `AGENTS.md` fornece automaticamente o contexto base do projeto.
3. Para alterações de stock ou reconciliações SAP, o Codex deve consultar também `BRIEFING_ChatGPT.md`.

## Como usar no ChatGPT Enterprise

1. **Nova conversa** no ChatGPT Enterprise
2. **Anexa** todos estes ficheiros
3. **Cola** o conteúdo do BRIEFING_ChatGPT.md como primeira mensagem
4. **Descreve** o próximo passo que queres fazer

## Estado atual (v118 — Julho 2026)

### Obras

- **Vendas Novas** — contém todo o histórico atual.
- **Pampilhosa** — independente, criada sem movimentos, encomendas ou stock.
- Os separadores de obra, acima do menu principal, permitem entrar em cada obra ou criar outra.
- Postes e cadernos de montagem são partilhados; os restantes dados pertencem à obra ativa.

- 1.348 materiais
- ~2.500 movimentos
- 280 encomendas SAP
- 448 postes com dados técnicos completos
- 700 códigos de montagem (BOMs)

## Próximos passos possíveis

- Adicionar novas entradas/saídas
- Cruzar mais um mês de consumos SAP
- Investigar POs antigos em falta (LXV 1x70, etc.)
- Desenvolver relatórios adicionais
- Corrigir stocks negativos com guias antigas
