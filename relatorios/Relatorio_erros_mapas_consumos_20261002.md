# Erros nos mapas de consumos (maio a agosto) — 02/10/2026

Só leitura. Nada foi alterado no programa. Folhas lidas: 31_05, 31_06, 31_07, 31_08 e a de 30/09 (em branco).
Detalhe completo: `Detalhe_cruzamento_mapas_consumos_20261002.txt`.

## 1. Dentro das folhas
- Sem linhas repetidas, sem consumo negativo, sem consumo maior que o stock, sem coluna Stock errada.
- A coluna Consumo2 é o valor em euros do consumo (não é erro).
- O ficheiro `IC-0019 Consumos 31_06_2026.xlsx` devia chamar-se 30_06 (junho tem 30 dias).
- Cabeçalho "Stcock" (31_08) e "UM básica" (31_07) em vez de "Stock"/"UN".

## 2. De um mês para o seguinte (o SAP baixou mais do que o lançado)
- Jun→Jul: seccionador 1250A −2, prego aço −2 kg, medidor ultrassónico −1 (saíram do SAP sem consumo lançado).
- Jul→Ago: La Farga (PC 4500857392) desapareceu do SAP: 9G −21650 m, 9V −18200, 9S −17150, 9P −1100, 9C −620.
  O programa ainda tem esses fios como recebidos. Stock programa × SAP 30/09: 9V 1303 × 0; 9S 1720 × 0; 9G 750 × 375;
  9M 1000 × 194 (o SAP lançou 306 em junho e a linha 4500857392/70 foi eliminada).

## 3. Total lançado nos 4 mapas × consumo real do programa
- 37 materiais lançados a mais no SAP do que o programa tem de saídas (9S −1720, 9G −375, 9M −306, anilha 19F −150,
  eléctrodos −100, abraçadeira Algeroz −70, 560 −20, e um padrão de −15 em 17C, 17D, 406B, 501A, 501D, 517, 522, 536, 546).
- 41 materiais com mais consumo no programa do que o lançado. Os dois grandes: 9U1 cabo LXV 50 mm (programa 3668 m, lançado 65,
  SAP ainda tem 2059 m, programa 0) e 442 parafuso ponto (programa 161, lançado 9).
- 93 saídas de consumo no programa sem linha em nenhum mapa (sobretudo março a maio: cabo LXV-70 1028 m, buchas, marcadores,
  ferramentas, brocas, fitas), muitas a rever com Azevedo/Ferramaq/Equifermaq.
- 533B (programa, SAP 75112018, stock 6) e 533C (SAP 4026534, 9 lançados a 16/09) são o mesmo gancho com dois códigos.

## 4. Decisões que preciso do Rui
Ver mensagem da conversa.
