# Gestão de Materiais de Catenária DTE - instruções para o Claude

## Primeiro passo obrigatório

Antes de alterar qualquer ficheiro, ler integralmente:

1. `PASSAGEM_PARA_CLAUDE/LEIA_PRIMEIRO.md`
2. `PASSAGEM_PARA_CLAUDE/ESTADO_E_REGRAS.md`
3. `gestao_armazem_catenaria.html` nas zonas que serão alteradas
4. `dados_armazem_catenaria.json` quando a tarefa envolver dados

Não assumir códigos, quantidades, datas, fornecedores, correspondências SAP ou peças de desenhos. Quando a documentação não for inequívoca, parar e perguntar ao Rui.

## Ficheiros principais

- `gestao_armazem_catenaria.html`: aplicação principal single-file.
- `dados_armazem_catenaria.json`: cópia legível do `SEED_DATA` atual.
- `AGENTS.md`: regras técnicas e de negócio resumidas.
- `PASSAGEM_PARA_CLAUDE/`: passagem de contexto e prompt inicial.
- `projeto_vendas_novas/`: documentos, índices e desenhos usados no Projeto.
- `guias_at/`: arquivo de guias AT que não são transferências entre obras.
- `guias_transferencia/`: guias de transferências entre obras.
- `mapas_mensais/`: reconciliação mensal com SAP.

## Regras inegociáveis

- Fazer backup do HTML e do JSON antes de alterações relevantes.
- Manter tudo em UTF-8 e em caminhos Windows.
- Nunca inventar dados técnicos ou SAP.
- Não criar entrada sem PO, guia ou confirmação explícita do utilizador.
- Ajustes devem ter `ajuste: true`.
- Preservar as datas reais dos documentos e movimentos.
- Não apagar ou substituir alterações anteriores sem comparar primeiro.
- Não permitir stock negativo silenciosamente; reportar faltas.
- Movimentos de roubo, ajustes e transferências não devem contaminar consumos reais, salvo instrução explícita do Rui.
- Depois de editar o HTML, validar a sintaxe de todos os blocos JavaScript e testar no navegador.
- Manter `dados_armazem_catenaria.json` coerente com o `SEED_DATA` quando forem alterados dados embebidos.

## Forma de trabalhar com o Rui

- Ir dizendo, em português simples, o que está a ser lido e alterado.
- Antes de movimentos de stock, apresentar material, código, quantidade, data, origem, destino e obra.
- Mostrar dúvidas e discrepâncias; não as esconder.
- Distinguir claramente pedido de compra, entrada física, saída, transferência e ajuste.
- Quando o Rui disser “segue” ou confirmar a lista, executar e depois apresentar o resultado verificável.

