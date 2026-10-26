# Estado técnico e regras de negócio

## Estrutura funcional

A aplicação é um único HTML com CSS, interface, JavaScript e `SEED_DATA` embebidos.

Estrutura lógica principal:

- `materiais`: catálogo interno e SAP;
- `movimentos`: entradas, saídas e transferências;
- `encomendas`: linhas de pedidos de compra;
- `postes`: leitura do caderno de montagem por poste/pórtico;
- `montagens`: desenhos e listas de peças/BOM;
- `armazens`, `param` e `seq`.

## Multiobra

- Chave do navegador: `dte_armazem_multi_v1`.
- Obra principal: **Vendas Novas / IC-0019**.
- Segunda obra: **Pampilhosa / IC-0018**, incluindo movimentos com destino Coimbra quando assim documentados.
- Stock, movimentos, encomendas e relatórios são independentes por obra.
- Postes, cadernos de montagem e códigos/desenhos são partilhados.

## Organização visual atual

Na Obra de Vendas Novas, a área Comercial aparece antes de Stocks.

Comercial:

- Projeto;
- Materiais por Poste;
- Materiais Totais.

Stocks:

- Armazém;
- Entradas;
- Saídas;
- Transferências;
- Guias AT;
- Encomendas.

Título atual: **Gestão de Materiais de Catenária**. O logótipo DTE/DST está em `logo_dte_dst.png`.

## Projeto e cadernos de montagem

O objetivo não é apenas listar o número do desenho. Para cada poste/pórtico, a apresentação deve ser compreensível por uma pessoa experiente em catenária e por alguém novo.

Ordem acordada:

1. Estruturas e fundações;
2. Tirante;
3. Consola;
4. Antibalançante e braço de chamada;
5. Outros equipamentos;
6. PDF original visível.

Para cada elemento mostrar, quando documentalmente disponível:

- elemento;
- desenho;
- referência/aplicação;
- medidas/parâmetros;
- submontagens;
- peças e quantidades confirmadas no desenho.

Os números dos desenhos devem ser clicáveis para abrir o desenho correspondente. Não assumir que todas as quantidades são 1. Uma quantidade só é apresentada como confirmada quando foi retirada inequivocamente do caderno/desenho/referência.

Postes/pórticos piloto trabalhados:

- `04-26`: poste simples, EC-232, Montagem A;
- `05-15`: duas consolas/montagens, estrutura visual semelhante ao 04-26;
- `64-29_30`: pórtico;
- foi também pedido localizar e ler `64-31_32` e os restantes pórticos.

Os documentos do projeto estão em `projeto_vendas_novas/`. Existem ainda desenhos normativos nas pastas OneDrive originais; não mover nem apagar os originais. Só copiar para o programa quando autorizado.

## SAP

Não existe ainda ligação direta ao SAP. O processo atual usa exportações Excel `EXPORT_YYYYMMDD_HHMMSS.xlsx`.

Dois tipos de exportação precisam de ser distinguidos:

- pedidos de compra, com documento 4500..., item, fornecedor, material, quantidade e “a ser fornecida”;
- movimentos/entradas SAP, nomeadamente TMv 101.

Um pedido de compra não é automaticamente uma entrada física. A quantidade recebida pode ser inferida de `qtd. pedida - a ser fornecida`, mas o movimento físico deve ser sustentado por documentação/confirmação.

### João S. Azevedo / PC 4500886473 — 24/08/2026

O Rui confirmou a entrada e a saída total, ambas em 24/08/2026:

- SAP `5004614`: 2 × Chaves em cruz CCF 5 rodas ANT;
- SAP `4019688`: 2 × Chaves de portas CB6;
- código `LPL0001`: 4 × Lâmpada LED standard E27 12 W 4000 K.

O saldo líquido dos três materiais é zero. As saídas devem ser incluídas nos consumos apenas a partir de 24/08/2026; não pertencem ao mapa fechado até 21/08/2026.

Última atualização, `EXPORT_20260817_141131.xlsx`:

- 541 linhas de PC novas foram acrescentadas;
- 126 linhas existentes foram atualizadas;
- total atual: 872 linhas de encomendas.

### Farprotec / PC 4500883493 / GT 2979

Confirmação do Rui:

- item 10: 5 arnês sem cinto de dois pontos;
- item 20: 4 arnês com cinto de dois pontos;
- item 40: 6 Cordas Y/Patacho, SAP 3002314;
- item 50: 6 mosquetões, SAP 3000599;
- item 30: 4 Cordas I/Amortecedor, SAP 3002314, não pertence à saída da guia 2979.

Registo acordado:

1. entrada/consumo de obra na IC-0019, associada ao PC e à Farprotec;
2. saída da IC-0019 com destino IC-0018 - Coimbra;
3. receção correspondente na IC-0018;
4. guia `GT ATDT202601GT/2979` apresentada no separador Transferências entre obras.

PDF local: `guias_transferencia/GT_ATDT202601GT_2979.pdf`.

### Guia AT 2997 - materiais provisórios

Em 19/08/2026 foi registada a GT ATDT202601GT/2997, da Estação Ferroviária de Vidigal para o Estaleiro DAI - Monte da Barca, Coruche:

- 2 × AT;
- 15 × Isoladores;
- 2 × Ferros U.

A guia não identifica códigos, tipos ou medidas. Foram criados materiais provisórios ligados à guia, sem correspondência SAP inventada. Devem ser substituídos/consolidados quando existir confirmação documental dos códigos e especificações.

## Guias

- Transferência entre obras: separador **Transferências** e pasta `guias_transferencia/`.
- Outros transportes/remessas: separador **Guias AT** e pasta `guias_at/`.
- Uma viagem em duas etapas não deve duplicar material se as duas guias documentarem a mesma unidade.
- Manter origem, destino, data, número da guia, material e quantidade.

## Consumos e stock

Não contar como consumo normal:

- `ajuste: true`;
- destinos de ajuste SAP;
- roubo/assalto;
- transferências, exceto quando o Rui mandar explicitamente registar a saída como consumo da obra.

Não criar stock fictício sem ordem explícita. Quando autorizado, identificar claramente como ajuste e não como compra real.

Não permitir saída acima do disponível sem apresentar a falta. O utilizador já pediu no passado ajustes específicos para regularizar consumos, mas cada caso deve ser confirmado novamente.

## Partilha e alojamento

Existe uma cópia numa pasta SharePoint/OneDrive da empresa:

`C:\Users\dst7973\OneDrive - Domingos da Silva Teixeira, S.A\Obras_dte_IC - 00_Obras\Programa_Catenaria`

A pasta ser partilhada não torna o `localStorage` partilhado. Cada navegador continua com uma base diferente. A migração futura deverá usar SharePoint Lists, uma API/backend ou outra base central. Não fingir que apenas copiar o HTML resolve a colaboração multiutilizador.

## Próximos desenvolvimentos discutidos

- sincronização SAP, começando por importação Excel robusta e evitando duplicados;
- futura ligação read-only ao SAP via API/serviço aprovado pela informática;
- utilizadores/códigos e permissões personalizadas;
- dados partilhados entre várias pessoas;
- terminar a leitura inequívoca de todos os desenhos, submontagens e quantidades;
- consolidar todos os pórticos e desenhos em falta.
