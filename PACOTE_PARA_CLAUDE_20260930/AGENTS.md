# Gestão de Stocks DTE

## Contexto

Aplicação local de gestão do armazém de catenária da DTE. Antes de alterar dados ou lógica de negócio, consultar `BRIEFING_ChatGPT.md`.

## Ficheiros principais

- `gestao_armazem_catenaria.html`: aplicação single-file; dados iniciais embebidos em `SEED_DATA` e persistência no `localStorage` do navegador.
- `dados_armazem_catenaria.json`: cópia estruturada dos dados.
- `mapas_mensais/`: mapas Excel usados na reconciliação mensal com o SAP.

## Estrutura multiobra

- O armazenamento do navegador usa `dte_armazem_multi_v1`.
- `Vendas Novas` contém os dados históricos atuais.
- `Pampilhosa` começa sem movimentos nem encomendas; o catálogo de materiais é copiado apenas para manter compatibilidade com os BOMs.
- Stocks, materiais, movimentos, encomendas, armazéns, consumos, relatórios e parâmetros são independentes por obra.
- Postes e cadernos/códigos de montagem ficam em `partilhado` e são comuns a todas as obras.
- Backups novos contêm a estrutura completa de todas as obras. Backups antigos de uma única obra são migrados automaticamente.

## Ambiente Windows

- Abrir a aplicação através de `ABRIR_NO_WINDOWS.cmd` ou diretamente no Microsoft Edge/Google Chrome.
- Manter todos os ficheiros de texto em UTF-8.
- Não converter caminhos locais em caminhos macOS/Linux.
- O `localStorage` pertence ao navegador e ao endereço usado para abrir o HTML. Fazer backup JSON antes de limpar dados ou mudar de navegador.

## Regras essenciais

- Não contar como consumo real movimentos de ajuste, roubo ou destinos de ajuste SAP.
- Só criar entradas com PO/guia real; marcar ajustes com `ajuste: true`.
- Não permitir consumo superior ao stock disponível sem reportar a diferença.
- Preservar datas reais dos movimentos.
- Antes de alterações de stock, verificar o histórico e as discrepâncias documentadas no briefing.
