# Relatório — postes 26 e guias 3550/3551 (07/10/2026) — versão corrigida pelos cadernos

Backups: `..._backup_antes_guia_3550_20261007.html`, `..._antes_postes_26_20261007.html/.json`, `..._antes_corrigir_postes_26_20261007.html/.json`.

## Guias arquivadas (só a guia, sem movimentos)
- **GT 3550** (07/10): Monte da Barca → antigas instalações da estação de Agolada (Coruche), CF-75-QX. 10 consolas, 2 isoladores, 1 caixa de comando, 1 seccionador, 10 diversas ferragens.
- **GT 3551** (07/10): mesmo percurso, CF-75-QX. 6 m de tubo 19/26.

## Conferência com o caderno 42517.PE.09.IFT.00.303_03 (km 21 a 30)
| Poste | Página | Resultado |
|---|---|---|
| 26-21 | 13 | dados certos (uma consola) |
| 26-23 | 17 | dados certos (uma consola) |
| 26-25A | 26 | dados certos (uma consola + espia E-6189) |
| 26-19A | 10 | dados certos (sem consola, espia E-6189) |
| 26-25 | 22 | **dados errados:** duas consolas (comprida e curta); o tirante estava com os metros da curta, faltavam as consolas e a fixação E-6180 TA/CA |
| 26-18 | 7 | **dados errados:** curta (montagem C) só tem o antibalançante E-6185 B; o E-6183 E, antivento, BR/CH e pêndulo são só da comprida (estavam nas duas, a dobrar); faltavam consolas e a fixação |
| 26-19 | 8 | **dados errados:** duas consolas, cada uma com tirante, consola (Ta 30x38 / Tb 40x49) e antibalançante E; só havia BR/CH e antivento; fixação E-6135 III e IIA |

Corrigidos os dados dos 3 postes (SEED, JSON e migração `postes-26-cadernos-20261007` para quem já tem dados no navegador). O sufixo "-II" do E-6180 (TA-II, CA-II) é a forma como todos os cadernos escrevem o E-6180 TA/CA do catálogo.

## Saídas dos postes (07/10/2026, Armazém Catenária, destino "Poste X")
As saídas feitas de manhã com os dados antigos foram retiradas (281 movimentos) e refeitas: **444 saídas** em 84 materiais, 29 partes (tirante, consola e antibalançante com BR/CH dos 6 postes, e espia E-6189 em 26-19A e 26-25A). Contam como consumo real. Sem duplicados por poste/parte.

## Ajustes de stock (15 entradas com `ajuste: true`)
| Material | Ajuste | SAP (folha 30/09) |
|---|---|---|
| 513 articulação do tirante | +9 | L4, 39 un |
| 465 esquadro de suspensão | +9 | L189, 259 un |
| 9C cabo bronze 10 mm² | +8 m | L270, 625 m |
| 408A estribo de amarração | +2 | L165, 52 un |
| 511 peça de amarração da espia | +2 | L200/L201, 60 un |
| 86A brinco | +2 | L267, 120 un |
| 217A perfil U | +1 | L115 (1 un, mas já consumida no mapa de 30/09) |
| 65 isolador 5 t ZT | +9 | sem linha — "segue" do Rui |
| 67 isolador pé de consola ZT | +9 | sem linha — "segue" do Rui |
| 536A gancho p/ tubo 24x32 | +7 | sem linha — "segue" do Rui |
| 727 perfil U fixação de dois tirantes | +1 | sem linha — "segue" do Rui |
| 300A freios | +1 | sem linha — "segue" do Rui |
| 558B coronha | +1 | sem linha — "segue" do Rui |
| 719 tampão | +1 | sem linha — "segue" do Rui |
| 14B espia Ø24 | +2 | sem linha — "segue" do Rui |

## Verificações
Ensaio antes de gravar (459 movimentos, nenhum material negativo); SEED e JSON com os mesmos 459; JS 15 blocos sem erros; no programa as partes aparecem como "Saiu", sem duplicados, sem stock negativo, migração aplicada e consola sem erros.

## Por tratar
- **Cabo BZ 10 mm²** (26-25A, 26-25, 26-23, 26-21, 26-18): faltam os metros de cada poste (não vêm no caderno).
- **514A:** a ficha existe (M474) mas o programa não a liga ao poste; liguei-a à mão (3 un).
- Ajustes sem linha no SAP (isoladores ZT, 536A, 727, 300A, 558B, 719, 14B) por explicar; o 217A só tem 1 un no SAP e já foi consumida no mapa.
- Outros equipamentos dos postes (suspensão fixa, conjunto de segurança, ligações, seccionador, transformador) continuam por sair.
