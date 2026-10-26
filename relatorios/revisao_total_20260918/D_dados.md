# Revisão D — Coerência dos dados

Revisão só de leitura, feita a 18/09/2026 sobre `dados_armazem_catenaria.json`: 1764 materiais, 2447 movimentos, 701 encomendas, 448 postes e 677 montagens. Nenhum ficheiro do projeto foi alterado.

- **Como foi calculado o stock:** a regra é a mesma de `rebuildStock()`/`stockMaterial()`: entrada soma, saída subtrai e `qtd` em falta conta como 0. Não há nenhum movimento do tipo `transferencia`, porque as transferências entre obras estão gravadas como `saida`.
- **Scripts e ficheiros CSV:** estão em `...\scratchpad\revisao\`. Os ficheiros `D_dados_*.csv` trazem as listas completas.
- **Problemas já conhecidos:** o que já está em `POR_FAZER.md` não é apresentado aqui como novo. Quando interessa, aparece com a indicação "(conhecido, POR_FAZER x.y)".

Resumo: **7 altas, 11 médias, 6 baixas** (24 constatações).

---

## ALTA

### D1 — EIP, PC 4500851945: 30 materiais entraram duas vezes
- **O que está errado:** a mesma remessa da EIP entrou duas vezes. Primeiro entrou pela guia GT326/475, a 17/06. Depois voltou a entrar como "Entrada SAP entre 18/06 e 24/06", a 24/06, com os mesmos materiais e as mesmas quantidades. O SAP só dá como recebida uma das vezes.
- **Prova:**
  - Primeira série: `mv4455`–`mv4484`, 17/06/2026, doc `GT3 GT326/475`, 30 linhas, 1.416 unidades.
  - Segunda série: `mv4515`–`mv4544`, 24/06/2026, sem doc, com os mesmos 30 materiais e as mesmas quantidades (1.416).
  - Em todas as 30 linhas de encomenda, `qtdRecebida` é igual a uma só das séries. Exemplos:
    - 81 Brinco curto (M4079): encomendado 419, recebido 419, entradas 838 (`mv4475` e `mv4535`), stock atual 778.
    - 465 Esquadro (M4085): encomendado 280, recebido 275, entradas 550, stock 550.
    - 86A (M4081): recebido 120, entradas 240.
  - O stock atual destas 30 fichas tem 1.414 unidades a mais, cerca de 8.325 € ao preço das fichas.
  - A ficha M4064 (731A) já tem stock 0. Anular a entrada repetida (`mv4522`, 2 un.) deixa-a em −2, o que quer dizer que já houve 2 saídas sobre stock que não existia.
- **Correção sugerida:** o Rui confirma no SAP ou na guia que só houve uma entrega. Depois anula-se a série `mv4515`–`mv4544`, ou a série da guia com o nº de documento copiado para a outra. Para o M4064 é preciso ver de onde vieram as 2 peças.

### D2 — Senttro, PC 4500864211: parafusos, porcas e anilhas entrados em duplicado e com quantidades partidas
- **O que está errado:** a importação SAP de maio e a de junho registaram a mesma compra duas vezes. Em maio entraram ainda números partidos (3,7 / 1,1) em fichas contadas à unidade. O stock destas 3 fichas está cerca de 350 unidades acima do que o SAP recebeu.
- **Prova:** recebido no SAP, somado por código SAP, contra as entradas no programa:

  | Código SAP | Ficha | Recebido | Entradas | Movimentos | Stock |
  |---|---|---|---|---|---|
  | 4004400 | M2961 | 228 | 341,7 | `mv2962` 3,7 + `mv2963` 110 (14/05) + `mv4204` 228 (11/06) | 341,7 |
  | 4023516 | M2539 | 114 | 237,7 | `mv2540` 3,7 + `mv2541` 110 + `mv4202` 10 + `mv4205` 114 | 237,7 |
  | 4027442 | M2870 | 112 | 223,1 | `mv2871` 1,1 + `mv2874` 110 + `mv4208` 112 | 223,1 |

  - O `mv4202` (10 anilhas) pertence ao SAP 4032360, ficha `sap20260817-mat-4500864211-40`. Essa ficha tem 10 recebidas e 0 entradas.
  - As linhas A4 do SAP (itens 150 a 180) entraram nas fichas A2.
  - Há ainda quantidades partidas noutras fichas contadas à unidade: `mv4206` 2,5, `mv4210` 0,5 e `mv4211` 0,5.
- **Correção sugerida:**
  - Anular as entradas de maio `mv2540`, `mv2541`, `mv2871`, `mv2874`, `mv2962` e `mv2963`, depois de o Rui confirmar.
  - Passar o `mv4202` para a ficha do SAP 4032360.
  - Pedir ao Rui a unidade real das linhas partidas, que podem ser kg ou caixas.

### D3 — Material Sacyr contado duas vezes: mapa Sacyr de 25/05 mais as compras à Sacyr
- **O que está errado:** a 25/05 entrou o "mapa de material Sacyr" (`mv1717`–`mv1725`). Depois as compras à Sacyr Neopul voltaram a dar entrada das mesmas quantidades. Pelo menos 5 materiais estão contados duas vezes.
- **Prova:**

  | Material | Entrada do mapa Sacyr (25/05) | Entrada pela compra |
  |---|---|---|
  | Tubo 30x38 (10E), M432 | `mv1724` 48 | `mv4720` 48, PO 4500869173, 03/06 |
  | Tubo 40x49 (10G) | `mv1718` 36 na M449 | `sap20260812-mov-4500880013-10` 36 na ficha `sap20260812-mat-4500880013-10` ("Tubo de aço 40x9"), PO 4500880013, 23/07 |
  | 510 Suporte, M302 | `mv1723` 4 | `mv4768` 4, PO 4500869173 |
  | 442 Parafuso de ponto | `mv1725` 144 na M563 | `sap20260812-mov-4500875997-10` 144 na M4049, PO 4500875997 |
  | 511 Peça de amarração, M358 | `mv1722` 4 | `sap20260812-mov-4500875997-20` 4 |

  - Pelo contrário, o 10C (24), o 10A (36) e o 10F (17,5) do mapa correspondem ao PO 4500872979, que está "Concluída" e não tem entrada própria. Aí o stock só entrou uma vez, mas a encomenda aponta para fichas SAP sem movimentos.
  - O PO **4500872735** (Sacyr Somague) repete exatamente as 3 linhas do 4500872979 (24 / 36 / 17,5) e continua "Em encomenda" com 0 recebido. O "por receber" dos tubos está por isso inflacionado.
- **Correção sugerida:**
  - O Rui confirma que o mapa Sacyr e os PO são o mesmo material. Se forem, anulam-se as entradas do mapa (ou as do PO) nos 5 casos e a ficha "40x9" junta-se à M449.
  - Confirmar no SAP se o PO 4500872735 foi anulado.

### D4 — Três postes saíram duas vezes
- **O que está errado:** o mesmo poste tem duas saídas. O stock desses perfis fica mais baixo do que devia (ou uma das saídas é de outro poste).
- **Prova:**
  - **50-16** (M230, HEA 200 c/9,2 m): `mv4628` a 12/03/2026 ("Saída Lavre 12/03 | Poste nº: 50-16") e `saida-gt3187-50-16` a 07/09/2026 (GT ATDT202601GT/3187, Lavre).
  - **64-19** (M247): `mv1653` a 12/03/2026 e `mv3897` a 02/06/2026 (3 un. para "64-10, 64-19, 64-23").
  - **64-25** (M231): `mv3899` a 02/06/2026 (2 un. para "64-17, 64-25") e `mv4631` a 02/07/2026 ("64-25 (conforme plano)").
- **Correção sugerida:** verificar na GT 3187 e nas folhas de saída qual das saídas é a verdadeira e anular a outra, ou corrigir o nº do poste.

### D5 — A mesma peça em várias fichas, com stock repartido, e acertos fictícios de 28/08 feitos com stock noutra ficha
- **O que está errado:**
  - Muitas peças de catenária têm duas fichas: a do catálogo antigo (código da peça, com o código IP 75xxxxxx no campo SAP) e a da importação SAP (com o nº SAP). O stock fica dividido entre as duas.
  - Em 3 casos criou-se a 28/08 uma **entrada fictícia** para tapar um negativo numa ficha, quando a mesma peça tinha stock na outra.
- **Prova:**
  - 115 códigos de peça têm mais de uma ficha (234 fichas no total). Em **24** há stock em mais do que uma ficha. Lista em `D_dados_fichas_mesmo_codigo_peca.csv`.
  - Acertos que não eram precisos:
    - **465**: `acerto-stock-M556-20260828` +8 na M556, quando a M4085 ("465 Chapa… Esquadro") tinha 550.
    - **113A**: `acerto-stock-M353-20260828` +10 na M353, quando a M4056 tinha 40.
    - **111A**: `acerto-stock-M413-20260828` +2 na M413, quando a M4065 tinha 60.
  - Stock repartido, por exemplo:

    | Peça | Fichas |
    |---|---|
    | 442 | M563 115 + M4049 1.944 |
    | 640 | M588 300 + M4028 1.000 |
    | 81 | M203 10 + M4079 778 |
    | 217A | M330 1 + M4075 100 |
    | 622 (aparelho tensor) | M207 20 + M4484 30 |
    | Cantoneira 90x90x9 L=425 | M263 18 + M4251 7 (125F) |
    | TBI 70 F12 | M604 500 + m3911 3.650 |
    | Tubo 40x49 | M449 312 + `sap20260812-mat-4500880013-10` 36 |

  - **Causa de fundo:** 72 fichas têm no campo `sap` um código IP de 8 dígitos (75xxxxxx) em vez do nº SAP. Por isso o importador SAP não as encontra e cria uma ficha nova. Mais 28 fichas têm no `sap` outros formatos (1000, 1105, 33144xxx, #N/A, MTR0001…).
- **Correção sugerida:** juntar as fichas código a código, com lista aprovada pelo Rui, como se fez com a 483 / SAP 4032237. Anular os 3 acertos de 28/08 quando as fichas forem juntas. Pôr o nº SAP real no campo `sap` e passar o código IP para `ref`.

### D6 — Tubo 30x38 da Fergrupo registado como 20 quando foram 120 m
- **O que está errado:** os tubos contam-se em metros, mas esta entrada ficou com 20 (número de varas). A ficha 10E fica com 100 m a menos.
- **Prova:** `mv4510` (24/06/2026, M432, qtd 20). A obs diz "Tubo 30x38 (6m cada = 120m totais)". Todas as outras entradas e saídas da M432 estão em metros: `mv4687` 660, `mv4720` 48 e as saídas de tubo por metro.
- **Correção sugerida:** passar `mv4510` para 120, depois de o Rui confirmar que eram 20 varas de 6 m.

### D7 — Manga termo GMW 22/6: 1.560 un. em duas fichas e PO errado
- **O que está errado:** as 1.560 mangas estão na ficha do Mapa de Stock (M151) e também na ficha SAP 4027876 (m3981). A entrada SAP ficou com o PO errado. O programa tem 3.087,5 un., quando o SAP recebeu 1.629 (69 + 1.560).
- **Prova:**
  - M151 ("Manga Termo GMW 22/6", sem SAP): `mv1163` 1.560 (12/03, Mapa) e `mv771` 69. Stock 1.527,5.
  - m3981 ("MANGA TERMO.GMW22/6 - 1000MM", SAP 4027876): `mv2835` 1.560, com pedido 4500849110, 22/04. Mas esse PO só tem 69 (`sap20260817-enc-4500849110-20`). Stock 1.560.
  - As 1.560 são do PO 4500858970, item 20, que aponta para outra ficha (`sap20260817-mat-4500858970-20`, código MTR0001) sem movimentos.
- **Atenção:** a POR_FAZER 1.7c fala em "manga termo −1.560". Se se "acertar" dando mais 1.560 à ficha MTR0001, o material fica contado três vezes.
- **Correção sugerida:** juntar M151, m3981 e a ficha MTR0001 numa só. Anular uma das duas entradas de 1.560 e corrigir o pedido do `mv2835` para 4500858970.

---

## MÉDIA

### D8 — Ajustes sem `ajuste:true`: 103 movimentos (e o programa nunca lê essa marca)
- **O que está errado:** estes movimentos são claramente ajustes, pela obs, pela origem ou pelo destino, mas não têm a marca de ajuste. A regra manda marcá-los.
- **Prova:** lista completa em `D_dados_ajustes_sem_flag.csv`.
  - 88 saídas "Ajuste −N (consumo SAP TMv 221 não detalhado) para alinhar com IC-0019 31/05/2026", destino "Obra IC-0019 (ajuste SAP)", todas a 12/06/2026 (`mv4248`…), com 8.087 unidades.
  - 5 entradas "Ajuste de stock - lista de equipamentos" (`mv3868`, `mv3870`–`mv3873`).
  - `mv4222` (+1.024 m de 9G) e `mv4223` (+973 m de 9S), "Ajuste de stock inicial".
  - `mv4224` (−283 m de 9U1).
  - `mv4396`, `mv4405`, `mv4851` e `mv4861`.
  - As 3 fictícias sem data `mv4419`–`mv4421`, cuja data em falta é já conhecida (POR_FAZER 1.5), têm `ficticia:true` mas não têm `ajuste:true`.
- **Nota:** procurei em todo o HTML. O programa nunca lê `ajuste`, nem `transferenciaObra`, nem `ficticia`. O cruzamento da folha de consumos (linhas 3455–3485) soma **todas** as saídas, incluindo ajustes, a transferência GT 3203 e os acertos de 17/09. A marca hoje não protege nada. Isto fica sinalizado para quem revê o código.
- **Correção sugerida:** acrescentar `ajuste:true` aos 103 movimentos e pôr o programa a excluí-los dos consumos.

### D9 — Saídas para a Pampilhosa sem marca de transferência entre obras
- **O que está errado:** 26 saídas para a IC-0018 não têm `transferenciaObra:true`. Não se distinguem de consumo real.
- **Prova:**
  - 41 saídas têm destino ou obs Pampilhosa/IC-0018/Coimbra. Só 11 têm a marca (`trfobra-saida-GT-*`).
  - Sem marca:
    - as 20 da GT 3203 (`gt3203-saida-*`, 09/09);
    - `mv4783`–`mv4785` e `mv4787` (06/07, doc "Saída para Pampilhosa 06/07");
    - `mv4846` e `mv4847` (14/07, sem doc nem guia).
  - As 4 `gt2979-transferencia-*` ficam de fora, porque o Rui mandou tratá-las como consumo.
- **Correção sugerida:** pôr `transferenciaObra:true` nas 26 e pedir ao Rui as guias do 06/07 e do 14/07.

### D10 — As encomendas apontam para fichas diferentes das entradas
- **O que está errado:** em muitas compras, a linha de encomenda aponta para uma ficha criada pela importação SAP, sem movimentos, enquanto a entrada física está na ficha do catálogo.
  - Na ficha da encomenda aparece "recebido" com stock 0.
  - Na ficha com stock não aparece a encomenda.
  - A conferência "recebido × entradas" não bate sem cruzar pelo código SAP.
- **Prova:**
  - 688 grupos PO+ficha. Só 301 batem pela própria ficha. Outros 222 só batem se se procurar a entrada noutra ficha com o mesmo SAP. Os restantes **165 não batem de todo**: 64 com entradas a mais, 32 com entradas a menos, 67 recebidos sem nenhuma entrada, mais 6 serviços. Lista completa em `D_dados_encomendas_vs_entradas.csv`.
  - 183 códigos SAP têm a encomenda na ficha `sap2026…` e o stock na ficha de catálogo. Exemplos:
    - 10C: `sap20260817-enc-4500851088-30` → `sap20260817-mat-4500851088-30`, enquanto a entrada `mv3162` (696 m) está na M566.
    - Ligador WAGO 4004143: entradas na M19, encomenda na `sap20260817-mat-4500840023-70`.
  - Dos 67 recebidos sem entrada, uma parte já é conhecida:
    - La Farga 4500857392 (1.7b);
    - grifes 4500855444/30 (1.10);
    - transformador M3153 (1.7);
    - garras e terminais MPL 4500879073 (1.7c).
  - Há também 11 entradas com um PO que existe, mas que não tem linha para essa ficha nem para o mesmo SAP, porque a encomenda está noutra ficha da mesma peça:
    - `mv3982` (622, M207, SAP IP 75173011), com a encomenda na M4484;
    - `entrada-sap-4500855444-30-grifes` (M521, SAP 4026487), com a encomenda na M2783 (SAP 4037051);
    - `mv3927` (M4251);
    - `mv3910` (M601);
    - `mv2606`, `mv2714`, `mv2817`, `mv2819`, `mv2821`, `mv2939` e `mv2956`.
- **Correção sugerida:** depois de juntar as fichas (D5), reapontar as encomendas para a ficha com stock. Rever as 165 diferenças que restarem pelo CSV.

### D11 — Azevedo: 2 PC recebidos no SAP sem entrada nem saída no programa
- **O que está errado:** a regra é que material Azevedo entra e sai todo. Estes dois pedidos estão "Concluída" e recebidos, mas não têm nenhum movimento.
- **Prova:**
  - PC **4500879064**: M4869 (cabo aço 3 mm, 10 m, ficha M4863), M4870 (nível Kapro, M4864), M4871/M4872 (2 chaves Iseo, M4004), M4873 (8 cerra-cabos, M4865), M4874 (esticador, M4866).
  - PC **4500878381**: M4878/M4879 (6 chaves Iseo) e M4880 (3 etiquetas, M4867).
  - As fichas M4863–M4866 têm 0 movimentos.
  - As chaves Iseo tiveram o acerto de −18 a 17/09 (`acerto-sap-20260917-M4004`), por isso é preciso ver se estes 8 já lá estão incluídos.
- **Correção sugerida:** registar a entrada e a saída total das linhas que não estejam cobertas pelo acerto de 17/09, com a confirmação do Rui.

### D12 — Saídas registadas antes de haver entrada (stock negativo durante semanas)
- **O que está errado:** no fim o stock nunca é negativo, mas **50 combinações ficha/armazém ficaram negativas em algum dia**.
  - 21 foram tapadas pelos acertos de 28/08.
  - 2 são as entradas sem data dos cabos 9P e 9V (conhecido, POR_FAZER 1.5).
  - **27** voltaram a positivo só com entradas de data posterior. Nestas, a data da saída ou a da entrada está errada.
- **Prova:** lista completa em `D_dados_negativos_no_tempo.csv`. Exemplos:
  - M530 (363 aperta-cabos): `mv1191` sai 50 a 09/03, e a primeira entrada é `mv4719` a 07/04.
  - M608 (1606): −24 de 12/03 a 20/04.
  - M555 (16D8): −18.
  - M565, M288 e M589: −12 a 22/04, só repostos a 07/05.
  - 8 perfis de poste saem a 12/03 e só entram entre 31/03 e 09/04, por exemplo M230 −5, M233 −3 e M237 −3.
  - 40 das 50 têm a primeira saída antes de qualquer entrada.
- **Correção sugerida:** acertar as datas das entradas do Mapa de Stock pela guia real (ou as das saídas), para que o histórico por data fique certo.

### D13 — Movimentos exatamente iguais (possíveis duplicados)
- **O que está errado:** há movimentos iguais em todos os campos menos o id: 20 grupos, 21 movimentos a mais.
- **Prova:** lista completa em `D_dados_movimentos_identicos.csv`.
  - **Com prova forte:**
    - `mv3031` = `mv3033`: M3030 marcador, 10 + 10, o mesmo doc SAP 5001798477 e o mesmo PO 4500843871, que só recebeu 10.
    - `mv4083` = `mv4084`: válvula M4012, doc 5001760449.
    - `mv4143` = `mv4144`: autocolante M4023, doc 5001753611.
  - **Vindos do Mapa de Stock:** 17 grupos sem doc. Por exemplo, `mv1602` = `mv1614` = `mv1617` (18K ×2, 28/04), `mv1555` = `mv1558`, e 8 pares do 522 a 22/04 com o mesmo destino de poste (`mv1335`/`mv1355` para o 49-21, …). Estes só se decidem com a folha em papel.
  - Com critério mais largo (mesmo material, quantidade, data, doc e tipo) há 97 grupos, mas a maioria são saídas por poste legítimas.
- **Correção sugerida:** anular as 3 entradas SAP repetidas, depois de confirmar o documento. Os 17 grupos do Mapa conferem-se com a folha em papel.

### D14 — Serviços SAP com stock no armazém
- **O que está errado:** portes, transporte e taxas são serviços e não deviam ter stock. Estão a contar 25 "unidades" e 351 € no valor do stock.
- **Prova:**

  | Ficha | Serviço | Stock | Entradas |
  |---|---|---|---|
  | M2972 | "Transporte", vg, 9001520 | 12 | 12 entradas de 1, `mv2973`…`mv4779` |
  | M2643 | Canon logístico | 4 | `mv2644` |
  | M2848 | Meio Ambiente | 4 | `mv2849` |
  | M3096 | Rastreabilidade | 4 | `mv3097` |
  | M3122 | Portes | 1 | `mv3123` |

  - A encomenda M4827 (serviço UA, ficha M4818) está sem `estado`.
- **Correção sugerida:** dar saída ou anular estas entradas. O importador também deve ignorar as unidades vg e ua.

### D15 — Tubos com unidade "un" quando se contam em metros
- **O que está errado:** as fichas dos tubos dizem "un", mas as quantidades são metros (1.086, 696, 17,42…). O ecrã e os relatórios mostram "un".
- **Prova:**
  - Fichas de catálogo: M432 10E, M449 10G, M473 10A, M492 10H, M529 10F e M566 10C.
  - Fichas SAP: `sap20260817-mat-4500872735-10/20/30`, `sap20260817-mat-4500851088-20…70`, `sap20260812-mat-4500880013-10` e `sap20260817-mat-4500869173-10`.
  - As linhas de encomenda destes tubos também estão em "un".
  - A M3171 e a M3173 (tubo c/ costura) já estão em "m".
- **Correção sugerida:** passar `un` para "m" nestas fichas e nas linhas de encomenda. As quantidades já estão em metros, por isso não mudam.

### D16 — JSON, SEED e navegador diferentes na montagem EC-219 IIIA (mo-cad-573)
- **O que está errado:** a mesma montagem tem três versões diferentes.
  - O `SEED_DATA` tem uma linha "EC 219 IIIB – Cabo de aço inox S=37,92;8,75 (L=12)" (M4419).
  - O JSON tem essa linha trocada por uma **segunda** linha 10H com qtd 2, o que dá 4 tubos guia.
  - A correção que corre ao abrir (linhas 1150–1180 do HTML) converte a linha e junta as repetidas, ficando só uma linha 10H com qtd 2. Com isso **apaga a linha do cabo M4419**.
- **Prova:** tirando isto, o JSON é igual ao `SEED_DATA` mais os registos acrescentados nas linhas 1020–1084, id a id e campo a campo, em todas as coleções (só muda a ordem de algumas linhas).
- **Correção sugerida:** o revisor técnico decide se o cabo M4419 faz parte da EC-219 IIIA. Depois grava-se a mesma versão no SEED e no JSON.

### D17 — Entradas sem PO, guia nem documento e sem marca de ajuste (fora do Mapa de Stock)
- **O que está errado:** há 355 entradas sem pedido, sem doc e sem guia. 329 são "Importado do Mapa de Stock", o stock inicial. As **26** restantes não têm documento nenhum.
- **Prova:**
  - 9 "vindo Pampilhosa", `mv4436`–`mv4444` (cabo Cu 95, Bz 65, pernos, varas, terminais, grifes): não há guia registada.
  - Fergrupo: `mv4508`, `mv4509` e `mv4510`.
  - Bobine Sacyr: `mv3903` (515 m de 9G).
  - Regresso da reparação na Ferramaq: `mv4422`.
  - Desbobinador: `mv4786`.
  - Mais os ajustes já contados em D8: 5 da lista de equipamentos, `mv4222`, `mv4223`, `mv4396` e as 3 fictícias.
- **Correção sugerida:** pedir as guias da Pampilhosa e da Fergrupo. Se não existirem, marcar como `ajuste:true` com a confirmação do Rui.

### D18 — Fichas com descrição "#N/A" e fichas com campos fora do formato
- **O que está errado:** 6 fichas não têm descrição nem unidade (erro de fórmula do Excel), mas têm stock. Outras 3 fichas têm o id e os campos fora do formato.
- **Prova:**
  - M656, M658, M660, M664, M687 e M967 têm desc, un e sap "#N/A", com 73 un. em stock.
  - A M967 (código 516) é usada como "Ponteira para tubo 19x26" na saída `mv4502`.
  - m3907, m3911 e m3981 têm o id com "m" minúsculo, o campo `unidade` em vez de `un` (m3907 e m3981 ficam **sem un**) e `tipo:"material"` em minúsculas. O stock delas é 300, 3.650 e 1.560.
- **Correção sugerida:** pôr a descrição e a unidade certas a partir do código ou da referência (com o Rui) e normalizar os campos das três fichas "m…".

---

## BAIXA

### D19 — Fichas repetidas com o mesmo código e a mesma descrição
- **O que está errado:** a importação SAP criou uma ficha por linha de compra. Há **33 grupos** com o mesmo código e a mesma descrição. A limpeza automática (linhas 1268–1312) não os junta, porque o código SAP é partilhado com outros produtos (por exemplo 4019688, 9001520, 4019846).
- **Prova:**
  - "CHAVES UNIVERSAIS UL050" em 5 fichas `sap…` (mais a M105).
  - "Cód. 10C – Tubo de aço 24x32" em 2 fichas.
  - "SERVICO TRANSP/FRETES" em 6 fichas.
  - Ao todo: 242 grupos com o mesmo nº SAP (581 fichas), 65 com o mesmo código (212 fichas) e 151 com a mesma descrição normalizada (333 fichas). Em 16, 13 e 13 destes grupos, respetivamente, há movimentos em mais do que uma ficha, a maioria por o SAP usar um código genérico (Azevedo).
- **Correção sugerida:** juntar só depois de D5, a partir da lista.

### D20 — Montagens: um código repetido, uma peça sem ficha e quantidades 0
- **O que está errado:** estes pontos fazem o total de peças por poste sair errado ou ambíguo.
- **Prova:**
  - "C-3393 IID" existe duas vezes (`mo-cad-51` e `mo-cad-102`), com listas de peças diferentes: a 51 tem a cavilha 406B e a 102 não.
  - Em `mo-l2-ec234-sa`, a linha 10 (483 "Manga interior para tubo 24x32") não tem `mat`. Devia apontar para a M188, a ficha acabada de corrigir.
  - 6 linhas têm qtd 0: `mo-cad-19` 10A, `mo-cad-32` 10G, `mo-cad-592` 734B, `mo-cad-594` 557A, `mo-cad-629` 280 e `mo-cad-630` 280.
  - Há 59 linhas repetidas (a mesma peça duas vezes na mesma montagem). Ficam para o revisor técnico.
  - Os ids e códigos dos postes são únicos. Todos os `mat` das listas de peças existem.
- **Correção sugerida:** o revisor técnico escolhe a C-3393 IID certa. Ligar a linha 483 à M188.

### D21 — Encomendas com quantidade 0 ou sem estado
- **O que está errado:** 4 linhas estão "Concluída" com 0 encomendado e 0 recebido. Uma linha não tem estado.
- **Prova:**
  - M3942, M3943 e M3944 (PC 4600042879) e M3978 (PC 4600042111), com PEP IC-0019-P-01. Os PC 46… parecem contratos-quadro.
  - M4827 (UA) sem `estado`.
  - Fora isto, nenhuma linha tem recebido maior que encomendado e todos os estados batem com as quantidades.
- **Correção sugerida:** confirmar os PC 46… com o Rui e retirar as linhas se forem só contratos.

### D22 — Fichas com código de 7 dígitos sem nº SAP
- **O que está errado:** 21 fichas têm um código de 7 dígitos que parece um nº SAP, mas o campo `sap` está vazio. São referências de fornecedor (Hilti, Ferramaq) e podem ser confundidas com SAP na importação.
- **Prova:** M30 (2811121), M42 (2243401), M99, M101, M107–M112, M291, M1687–M1691, etc. A M113 tem o código 2308014, mas o SAP é 4006080.
  - Nas outras 705 fichas com código de 7 dígitos, o código é o próprio SAP. Isso é normal para fichas criadas pela importação.
- **Correção sugerida:** passar estas referências para `codigo_alt`.

### D23 — Movimentos sem data e com quantidade 0 (conhecido, POR_FAZER 1.5)
- **O que está errado:** mantém-se o que já está registado. Ao ver o stock por data, os cabos 9P e 9V ficam negativos (−1.200 e −1.003 a 08/06), porque as entradas de regularização não têm data.
- **Prova:** `mv4419`, `mv4420` e `mv4421` sem data. `mv4074` e `mv4075` com qtd 0.
- **Correção sugerida:** a que está na POR_FAZER.

### D24 — Pares Mapa de Stock + SAP com a mesma quantidade (conhecido, POR_FAZER 1.7c)
- **O que está errado:** serve de apoio às "96 entradas a mais" da reconciliação.
- **Prova:** encontrei **100 pares** na mesma ficha: uma entrada do Mapa de Stock e uma entrada SAP com a mesma quantidade, 11.106 unidades ao todo. Em 92 o stock atual ainda cobre a entrada repetida.
  - Exemplo: arame M2561, `mv768` + `mv2562` de 50. Este par já foi acertado a 17/09.
  - Lista em `D_dados_pares_mapa_stock_e_SAP.csv`.
- **Correção sugerida:** usar esta lista no acerto código a código previsto em 1.7c.

---

## O que foi verificado e está OK

- **Stock no fim:** nenhuma ficha e nenhum armazém com stock negativo (0 em 1764 fichas × 2 armazéns).
- **Materiais dos movimentos:** todos os `mat` existem (0 em falta).
- **Tipos, armazéns e datas:**
  - todos os tipos são `entrada` ou `saida`;
  - todos os armazéns estão em `armazens`;
  - não há datas futuras nem datas anteriores a 2025. As de 2025 são do "Import SAP histórico".
- **Transferências:** não há `tipo:'transferencia'`, logo não há transferências sem destino nem com origem igual ao destino.
- **Ids e quantidades:** não há ids repetidos em nenhuma coleção. Não há quantidades em texto, negativas ou impossíveis de ler, fora as 2 com 0 já conhecidas.
- **Encomendas:**
  - todos os materiais existem;
  - não há PO+item repetido nem recebido maior que encomendado;
  - os estados batem com as quantidades, fora a M4827 sem estado;
  - as unidades da encomenda são iguais às da ficha;
  - todas as entradas com PO têm o PO nas encomendas. Há 11 exceções parciais, em que o PO existe mas não tem linha para essa ficha nem para o mesmo SAP. Estão em D10.
- **Preços:**
  - `preco`, `precoPC` e `precoData` estão sempre os três presentes ou os três ausentes;
  - não há preços 0 ou negativos;
  - o preço da ficha é igual ao da linha de encomenda do `precoPC` em todas as 873 fichas com preço;
  - 310 fichas com stock não têm preço (já está em POR_FAZER 1.2).
- **Stock mínimo:** nenhuma ficha tem `min` maior que 0, por isso não há alertas de mínimo a verificar.
- **Azevedo e Farprotec:** nenhuma ficha com material destes fornecedores tem stock.
- **Postes:** 448 ids e 448 códigos únicos.
- **Montagens:**
  - 677 ids únicos;
  - todos os `mat` das listas de peças existem, fora 1 linha sem `mat` (D20);
  - as montagens referidas pelos postes existem no catálogo, desde que se aceite a diferença de escrita (por exemplo "E-6183 E" nos postes e "E-6183-E" no catálogo, espaços a mais em 04-28, 26-19 e 64-01). O programa já trata isto com `norm`/`canon` (linhas 2961–2965).
- **SEED contra JSON:** as contagens são iguais (1764, 2447, 701, 448, 677). Os registos são iguais campo a campo, fora a mo-cad-573 (D16).
- **Limpeza automática do catálogo:** simulei a "Limpeza do catálogo" (linhas 1268–1312) sobre os dados. Não junta nenhuma ficha, por isso não altera os dados ao abrir.
