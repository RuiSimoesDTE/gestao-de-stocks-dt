# Relatório — saídas gravadas e mapa de 30/09 (06/10/2026)

## Gravado no programa (HTML + JSON, backup `..._backup_antes_saidas_20261006`)
| Movimento | Material | Qtd | Data | Destino |
|---|---|---|---|---|
| Saída | 9S fio de contacto 107 mm² (ficha M570, SAP 4026592) | 1720 m | 30/09/2026 | Consumo de obra IC-0019 — resto pendente de 17/09, **1720 m confirmados pelo Rui a 06/10**; vai na linha L275 do mapa de 30/09 |
| Entrada + saída | Extensão quíntupla c/ interruptor 5 saídas (PC 4500895273/10, Azevedo) | 2 un | 01/10/2026 | Consumo de obra IC-0019 |
| Entrada + saída | Lixa ferro Rhynometal grão 120 (PC 4500893077/10, Azevedo) | 20 un | 23/09/2026 | Consumo de obra IC-0019 |
| Entrada + saída | Cadeado Sady 50 mm (PC 4500893077/20, Azevedo) | 2 un | 23/09/2026 | Consumo de obra IC-0019 |

3 fichas novas (uma por linha, como a Azevedo faz), 3 linhas de encomenda (Concluída), 7 movimentos.
Stock final de M570 e das 3 fichas novas: 0. Sem stock negativo. JS: 15 blocos, 0 erros. Testado no navegador.
O JSON tem mais registos do que o SEED do HTML (48 movimentos e 8 fichas que o HTML injeta por código): é normal.

## Não gravado (continua à espera do Rui)
- Entradas B do EXPORT de 02/10: tubo PEAD 100 m, 749D ×2, 210A +2, cinta 566 +29.
- 465 chapa, pinça 560, transformador: números não batem, ficam como estão.

## Mapa de 30/09 — `mapas_mensais/IC-0019_Consumos_LINHAS_A_PREENCHER_20260930.csv`
35 linhas, separadas por grupo e com fornecedor:
- **Deste mês:** 9S 1720 m (L275, confirmado pelo Rui), estacas 300 (L319), extensão 2 (L320), aloquete 2 (L285), lixa 20 (L331). O 9U1 ficou sem consumo até o Rui dizer os metros. Nota: os mapas de maio a agosto já somam 2473 m de 9S, igual ao stock inicial do programa — confirmar no SAP que não fica a dobrar.
- **Atrasado (32):** consumo que o programa tem e nunca foi lançado (março a setembro). Maiores: 9U1 (SAP só tem 2059 de 3668 m), 442 (152), ligador de garra (400).
- 6 linhas com falta (o SAP tem menos stock do que o consumo): 16D9, 217A, 271, 551, 9U1, poste HE200A 10,00 m.
- 8 materiais que a folha de 30/09 não tem: bucha M6 (100), aperta cabos (46), spray zinco (37), ligador Wago (12), faca (5), fechadura (2), poste HEB240 (1), paquímetro (1).

## Fornecedores com entradas
- Setembro: João S. Azevedo (7 entradas, todas consumidas) e Caiado (1 entrada, 21 em stock).
- Outubro (até 06/10): João S. Azevedo (1 entrada, consumida).

## Dúvidas para o Rui
- (O 9S já está todo lançado — ver correção.) Os 15498 m de 9S que o SAP ainda tem (17218 − 1720) não estão no programa. Onde está esse fio?
- A extensão: o PC diz quíntupla, a linha do SAP diz tripla.
- Os 32 atrasados vão todos no mapa, ou só os que o Rui confirmar?

## Atualização 06/10/2026 — "segue" às entradas B do EXPORT de 02/10
Backup: `..._backup_antes_entradas_b_20261006`. Gravadas 4 entradas (e as encomendas acertadas, com migração `acerto-enc-export-20261006`):

| PC/item | Fornecedor | Material | Qtd | Data | Encomenda |
|---|---|---|---|---|---|
| 4500886226/10 | Inoxtubo | Tubo PEAD PE100 PN10 50 mm (4009077) | 100 m | 21/08 | 0 → 100 de 100 |
| 4500881481/30 | EIP | 749D Estrutura apoio do TT (4050046) | 2 un | 29/07 | 0 → 2 de 2 |
| 4500851945/260 | EIP | 210A Perfil U80x45x6 L=305 (4043692, M4071) | 2 un | 23/03 | 74 → 76 de 76 |
| 4500851945/510 | EIP | 566 Cinta p/ tubo guia (4037047) | 29 un | 23/03 | 0 → 29 de 29 |

Não mexidos (números não batem com o SAP): 465 chapa (+5), pinça 560 (+127), transformador (+1), portes Jobasi.
Sem stock negativo; 15 blocos JS sem erros; testado no navegador (movimentos 2470, 4 entradas, stocks 100 / 2 / 76 / 29).
Ficheiro do mapa entregue: `mapas_mensais/IC-0019_Consumos_30_09_2026_PREENCHIDO_20261006.xlsx` (as entradas não alteram os consumos).
