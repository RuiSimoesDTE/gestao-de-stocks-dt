# Briefing atual - Gestão de Materiais de Catenária DTE

Este ficheiro foi atualizado em **24/08/2026** para evitar que uma passagem antiga e desatualizada provoque perda de informação.

Antes de qualquer alteração, ler integralmente:

1. `CLAUDE.md`
2. `PASSAGEM_PARA_CLAUDE/LEIA_PRIMEIRO.md`
3. `PASSAGEM_PARA_CLAUDE/ESTADO_E_REGRAS.md`
4. `AGENTS.md`

## Estado do SEED_DATA em 24/08/2026

- 1.942 materiais;
- 2.267 movimentos;
- 875 linhas de pedidos de compra;
- 448 postes;
- 700 montagens/desenhos.

## Aplicação

- Ficheiro principal: `gestao_armazem_catenaria.html`.
- Cópia estruturada dos dados: `dados_armazem_catenaria.json`.
- Persistência no navegador: `localStorage`, chave `dte_armazem_multi_v1`.
- Obra principal: Vendas Novas / IC-0019.
- Segunda obra: Pampilhosa / IC-0018.
- Postes, cadernos e montagens são partilhados; stocks e movimentos são independentes.

## Regras essenciais

- Não inventar códigos, quantidades, datas, referências, fornecedores ou peças.
- Fazer backup antes de alterações de dados/lógica.
- Só criar entradas com PO, guia real ou confirmação explícita.
- Marcar ajustes com `ajuste: true`.
- Não contar roubo, ajustes ou transferências como consumo normal, salvo instrução explícita.
- Preservar datas reais.
- Não criar stock negativo silenciosamente.
- Manter o JSON coerente com o `SEED_DATA`.
- Manter UTF-8 e caminhos Windows.
- Informar o Rui sobre o que está a ser feito e todas as dúvidas encontradas.

## Última atualização SAP — 24/08/2026

PC `4500886473`, João S. Azevedo, Lda:

- SAP `5004614`: entrada 2 e saída 2 — Chaves em cruz CCF 5 rodas ANT;
- SAP `4019688`: entrada 2 e saída 2 — Chaves de portas CB6;
- código `LPL0001`: entrada 4 e saída 4 — Lâmpada LED standard E27 12 W 4000 K.

Todos os movimentos têm data de 24/08/2026 e saldo líquido zero. As saídas só entram nos consumos a partir de 24/08/2026 e não pertencem ao mapa fechado até 21/08/2026.

O detalhe completo, incluindo SAP, cadernos de montagem, guias, multiobra, SharePoint e o último movimento Farprotec/GT 2979, está em `PASSAGEM_PARA_CLAUDE/ESTADO_E_REGRAS.md`.
