# Revisão B — Encomendas, SAP, relatórios e blocos de script posteriores

Ficheiro revisto: `C:\Users\dst7973\Desktop\gestao_de_stocks_dte\gestao_armazem_catenaria.html` (só leitura).
Dados usados nas provas: `dados_armazem_catenaria.json` (cópia do `SEED_DATA`), `mapas_mensais\IC-0019_Consumos_31_08_2026_FOLHA_SAP.xlsx`, `mapas_mensais\EXPORT_20260917_120609.xlsx` e `tmp\atualizar_sap_20260817.py`.
Scripts de prova (node) em `...\scratchpad\revisao\` (`folha.js`, `merge.js`, `preco.js`, `exp.js`, `xl.js`).

Resumo: **8 altas, 8 médias, 5 baixas** (21 achados).

---

## B1 — Ao reabrir o programa, desfazem-se entregas registadas, apagamentos e edições de fichas
**Gravidade:** alta
**Onde:** 1526–1531 (`juntarPorId`), 1555–1560 (`fundirSeedEmVendas`), 1580 (`carregar` chama-a sempre), 4227–4258 (auto-merge, mesmo efeito)

**O que está errado:** sempre que o programa é aberto, os dados embebidos são fundidos outra vez com os do navegador. (a) As 601 linhas de encomenda e as 374 fichas criadas pelas importações SAP (`sap2026…-enc-/mat-`) são **reescritas** com a versão embebida. Uma entrega registada no programa volta a zero, e o mesmo acontece a uma edição da ficha (mínimo, descrição, fornecedor). (b) Qualquer registo embebido que o utilizador apague (movimento, encomenda, material, montagem) **volta a aparecer**.

**Prova:**
```js
// 1529-1530
if(!porId.has(x.id)){ ...out.push(novo)... }                       // re-acrescenta apagados
else if(/^sap\d{8}-(?:mat|enc)-/.test(String(x.id||''))||/^gt2979-transferencia-/.test(...))
  Object.assign(porId.get(x.id),copia(x));                        // reescreve com o SEED
```
Simulação com as funções reais do HTML (`merge.js`):
- encomenda `sap20260812-enc-4500881481-10` (13 un, "Em encomenda") → "Registar entrega" → "Concluída" → reabrir → **"Em encomenda", recebido 0**, e a entrada de 13 un continua no stock. O botão "Registar entrega" volta a aparecer, o que abre a porta a uma **segunda entrada da mesma mercadoria**;
- movimento `mv611` apagado → reabrir → **volta a existir**;
- ficha `sap20260812-mat-4500883493-10` com mínimo 50 e descrição editada → reabrir → **mínimo 0 e descrição original**.

Efeito nos dados atuais: 37 encomendas SAP ainda por concluir estão expostas a (a). Todos os 2447 movimentos embebidos estão expostos a (b).

**Correção sugerida:** a fusão só deve acrescentar o que falta e nunca reescrever o que já existe. Os apagamentos devem ficar numa lista de IDs apagados, guardada no navegador e respeitada pela fusão. O `Object.assign` só se deve manter para campos que o utilizador não edita, se for mesmo necessário.

---

## B2 — Folha de Consumos: com a folha SAP real, a coluna "Material" é trocada pela descrição e nenhuma linha cruza por SAP
**Gravidade:** alta
**Onde:** 3416–3423 (`cruzarFolha`)

**O que está errado:** o programa procura a coluna do n.º SAP pela primeira coluna cujo título contenha "material". Mas a condição `idxSap===0` continua verdadeira depois de encontrar a coluna 0, e a coluna seguinte, "Texto breve material", substitui-a. O cruzamento passa então a comparar a **descrição** com os números SAP.

**Prova:**
```js
let idxSap=0, idxDesc=1, ...
if(h.includes('material')&&idxSap===0) idxSap=i;
```
Cabeçalho real de `IC-0019_Consumos_31_08_2026_FOLHA_SAP.xlsx`: `Material | Texto breve material | Lote | …` → resultado `idxSap=1, idxDesc=1`.
Simulação sobre agosto (`folha.js`, 433 linhas):

| | cruzadas por SAP | por código interno | "Material não no JSON" |
|---|---|---|---|
| código atual | **0** | 2 | **184 (falso)** |
| com a coluna certa | 13 | 1 | 0 |

**Correção sugerida:** aceitar como coluna SAP apenas o título exatamente igual a "material", ou parar na primeira que coincidir (`idxSap<0` como valor inicial).

---

## B3 — Consumos e relatórios contam ajustes, roubo e transferências para outra obra como consumo real
**Gravidade:** alta
**Onde:** 3460–3486 (`cruzarFolha`), 3743–3800 (`gerarRelatorio` em vigor), 3542–3548 (`marcarSaidasParaFolha`)

**O que está errado:** todas as saídas (`tipo==='saida'`) entram no consumo do período, sem exceção. Nenhum código do programa lê o campo `ajuste`, o campo `transferenciaObra` ou destinos como "(ajuste SAP)" ou "ROUBO". Isto viola a regra de que ajustes, roubo e transferências não contaminam os consumos.

**Prova:** `grep` a `ajuste` no código só encontra dados e comentários, e nenhum filtro. Nos dados atuais há **108 saídas (12 118 unidades)** que não são consumo e entram nos totais:
- 88 com destino "Obra IC-0019 (ajuste SAP)";
- 5 com `ajuste:true`;
- 3 de "ROUBO — Assalto ao armazém" (08/06);
- 11 com `transferenciaObra` para a IC-0018;
- mais acertos com destino "(ajuste)".

Por mês: junho 92, julho 5, agosto 2 (transferências de 05/08 para a Pampilhosa, M406 × 18 e M283 × 1) e setembro 5.

**Correção sugerida:** criar uma função única `eConsumoReal(mv)` que exclua `ajuste:true`, `transferenciaObra`, os destinos de ajuste SAP, o roubo e os `tipo:'transferencia'`, e usá-la na folha de consumos, no relatório e na marcação por etiqueta.

---

## B4 — O "Acerto de stock" do ecrã não marca o movimento como ajuste
**Gravidade:** alta
**Onde:** 2708–2714 (`aplicarAcerto`)

**O que está errado:** o acerto regista uma entrada ou saída normal, sem `ajuste:true`. Uma saída de acerto fica indistinguível de uma saída de obra: entra nos consumos (B3) e no mapa enviado ao SAP.

**Prova:**
```js
DB.movimentos.push({id:'mv'+novoId(),data,tipo:'saida',mat:m.id,qtd:Math.abs(dif),arm,armDst:null,
  pedido:'',doc:'',origem:'',dest:'Acerto',obs:obs_final,user:DB.param.user,ref:null});   // sem ajuste:true
```
Caso: stock de 50 e contagem real de 45 → saída de 5 com destino "Acerto", contada como consumo. Os acertos embebidos (linhas 1044–1066, 1079) têm `ajuste:true` e os que se fazem pelo ecrã não têm.

**Correção sugerida:** acrescentar `ajuste:true` nos dois `push` (e, se se quiser, `origem/dest:'Acerto de stock (ajuste)'`).

---

## B5 — Entradas acima do encomendado: 28 linhas de PO recebidas a mais, 25 delas exatamente em dobro
**Gravidade:** alta (dados atuais com stock inflacionado; **confirmar com o Rui antes de corrigir**)
**Onde (causa no código):** 2585–2595 (`confirmarEntrega`), 2883–2891 (`confirmarRecebimentos`), 2220–2222 (`confirmarImportSap`)

**O que está errado:** o programa aceita receber mais do que foi encomendado e não avisa. A importação CSV de entradas também não atualiza o "recebido" da encomenda. Assim, a mesma mercadoria pode entrar duas vezes: uma pela guia e outra pela entrada SAP ou por "Receber por pedido".

**Prova:**
- `confirmarEntrega`/`confirmarRecebimentos` somam `qtd` a `qtdRecebida` sem comparar com `qtdEnc - qtdRecebida`;
- `confirmarImportSap` cria a entrada com `pedido` mas não toca na encomenda, que continua "Em encomenda" e pode voltar a ser recebida.

Dados atuais: somando as entradas com PO por (PO, material), há **28 casos acima do encomendado**, 25 exatamente o dobro, com 2 753 unidades a mais (≈ 27 200 € ao preço da ficha):
- **PO 4500851945 (EIP), 23 linhas:** entrada em 17/06 com a guia "GT3 GT326/475" e **outra vez** em 24/06 com "Entrada SAP entre 18/06 e 24/06". Por exemplo, M4079 com 419 encomendados e 838 recebidos, e M4057 com 56 encomendados e 112 recebidos. São 1 243 un a mais (≈ 7 025 €);
- **PO 4500843871 (Telade), M3030:** `mv3031` e `mv3033` idênticos (mesma data 23/02, mesmo doc 5001798477, 10 + 10 para 10 encomendados);
- **PO 4500851885, M2625:** entrada SAP de 29/05 (doc 5001847578) e guia RPS 80324093 de 27/04 (3 + 3 para 3);
- **PO 4500848628, M2697:** 1 + 1 para 1;
- **PO 4500849110, m3981 (manga termo 1000 mm):** 1 560 entrados para 69 encomendados, provável confusão de unidades;
- **PO 4500834570, M3988:** 17 entrados para 12 encomendados ("data estimada").

**Correção sugerida:** na receção, bloquear ou pedir confirmação explícita quando `qtd > em falta`. Na importação de entradas, ligar ao item da PO, atualizar `qtdRecebida` e recusar documentos (PO + doc + material) já registados. Rever os 28 casos com o Rui antes de mexer em stock.

---

## B6 — As importações criam fichas duplicadas para n.ºs SAP que já têm ficha
**Gravidade:** alta
**Onde:** 2186 e 2214–2218 (`processarCSVSap`/`confirmarImportSap`), 2620–2625 (`confirmarImportEnc`), 1637 (`matByCodigo`); e o importador externo `tmp\atualizar_sap_20260817.py` linhas 74–92

**O que está errado:**
- **No HTML**, os dois importadores CSV procuram a ficha **só pelo campo `codigo`** e nunca pelo campo `sap`. Num ficheiro SAP a coluna "Material" é o n.º SAP, e todas as fichas cujo código interno é diferente do n.º SAP são dadas como "novas" e duplicadas. Além disso, `confirmarImportSap` decide "existe / não existe" na pré-visualização: duas linhas do mesmo material novo criam **duas** fichas.
- **Importação de 17/08 (caso conhecido):** o script Python cria sempre uma ficha nova por linha de PO (`sap20260817-mat-{po}-{item}`), sem procurar se já existe ficha com aquele n.º SAP.

**Prova:**
```js
function matByCodigo(c){return DB.materiais.find(m=>m.codigo.toLowerCase()===String(c).toLowerCase().trim());}  // nunca m.sap
const detalhe=res.rows.map(r=>{const m=matByCodigo(r.codigo); ...});   // decidido antes de criar
csvPendente.detalhe.forEach(d=>{let m=d.m; if(!m){... DB.materiais.push(m);} ...});            // 2 linhas → 2 fichas
```
- 172 fichas têm n.º SAP diferente do código (ex.: M158 código 125B, SAP 75143054). Um CSV SAP criaria uma segunda ficha para cada uma delas.
- Simulação: 2 linhas com o mesmo código novo resultaram em 2 fichas criadas.
- Dados atuais: das 374 fichas criadas por importações SAP, **322 têm um n.º SAP que já existia noutra ficha** (306 são da importação de 17/08). Em **59** a descrição também é igual, o que as torna duplicados verdadeiros. Exemplos:
  - SAP 4038626: ficha M2518 "9Q – Condutor CU 12 mm²" com **300 m** de stock e ficha `sap20260817-mat-4500864792-20` com 0;
  - SAP 4026296: tubo 19x26 M473 (10A) com **1 047** e 3 fichas de importação com 0;
  - SAP 4004400: M2961 com 341,7 e `…-4500864211-70` com 0.

  A encomenda aponta para a ficha duplicada, por isso uma entrega registada vai para a ficha errada e o stock fica partido em duas.
- Nota: o SAP usa o mesmo n.º para variantes diferentes (luvas tam. 8/9/10 = 3000021; ver também B13). Por isso, a correspondência deve ser por **SAP + descrição**, com confirmação quando houver várias candidatas.

**Correção sugerida:** procurar primeiro por `sap` e depois por `codigo`. Se houver várias fichas candidatas, mostrar a lista e pedir escolha, sem criar sozinho. Recalcular "existe" dentro do ciclo de confirmação. Rever as 59 duplicações com o Rui e fundir as fichas.

---

## B7 — Importação CSV lê mal quantidades com separador de milhares (1.200,000 → 1,2)
**Gravidade:** alta (só quando se usa a importação CSV)
**Onde:** 2161 (`qtd`), 2167 (`rec`)

**O que está errado:** a quantidade é convertida trocando só a primeira vírgula por ponto. O ponto dos milhares fica e o `parseFloat` para aí: 1 200 unidades entram como 1,2. A função `num()` da linha 2155 faz a conversão certa, mas só é usada para o preço.

**Prova:**
```js
const qtd=parseFloat((c[iQtd]||'').replace(/\s/g,'').replace(',','.'));
```
Node: `"1.200,000"` → **1.2**, `"1.000"` → **1**, `"12,5"` → 12.5. O EXPORT SAP usa 3 casas decimais (ex.: `60.000`, `21650`).

**Correção sugerida:** usar `num()` também para `qtd` e `rec`, e mostrar na pré-visualização as quantidades lidas para o utilizador confirmar.

---

## B8 — Pesquisa por código e acerto de stock por n.º SAP escolhem a ficha duplicada com stock 0
**Gravidade:** alta
**Onde:** 2683–2684 (`ajAtualizar`), 2700–2701 (`aplicarAcerto`), 2729–2733 (`procurarMatPorCodigo`)

**O que está errado:** quando se escreve um n.º SAP, o programa procura primeiro uma ficha com esse `codigo`, e as fichas importadas têm `codigo = n.º SAP`. Cai assim na ficha importada, com stock 0, e não na ficha verdadeira. Não avisa que há várias fichas com o mesmo SAP.

**Prova:** simulação com a mesma ordem de procura:
- `4026296` → escolhe `sap20260817-mat-4500872735-20` (stock 0); M473 (10A, **1 047**) é ignorada;
- `4026299` → escolhe `…-4500869173-10` (0) em vez de M432 (10E, **735**);
- `4038626` → escolhe `…-4500864792-20` (0) em vez de M2518 (9Q, **300**);
- `4019688` → 9 fichas com o mesmo SAP; escolhe M4004.

Caso: o Rui conta 1 000 m de tubo 19x26 e faz o acerto pelo n.º SAP → o programa mostra "stock atual 0" e regista **uma entrada de +1 000** na ficha duplicada. O stock total do tubo passa a 2 047.

**Correção sugerida:** quando o texto corresponder a mais do que uma ficha (por código ou por SAP), listar as candidatas com o stock de cada uma e obrigar a escolher. Resolver também as duplicações do B6.

---

## B9 — Importações CSV: sem proteção contra importar duas vezes e com a data de hoje em vez da data do documento
**Gravidade:** média
**Onde:** 2209–2229 (`confirmarImportSap`), 2616–2636 (`confirmarImportEnc`)

**O que está errado:** importar o mesmo ficheiro duas vezes duplica todas as entradas e todas as encomendas, sem qualquer aviso. As entradas ficam com `data:hoje()` e as encomendas com `data:hoje()`, e não com a data do documento. As encomendas ficam também sem o n.º do item da PO, que é a chave usada no resto do programa ("Item N" nas observações).

**Prova:** `DB.movimentos.push({id:'mv'+novoId(),data:hoje(),…})` e `DB.encomendas.push(enc)`, sem verificar `pedido`+item/material já existentes. Nenhuma das duas funções lê coluna de data ou de item.

**Correção sugerida:** ler "Data do documento" e "Item". Recusar ou atualizar as linhas cujo (PO, item) já exista. Numa entrada, recusar PO + doc + material repetidos.

---

## B10 — Período por defeito errado (um dia desfasado) na Folha de Consumos e nos Relatórios, no horário de verão
**Gravidade:** média
**Onde:** 3610–3619 (folha), 3866–3873 (relatório), 1633 (`hoje()`), 3376–3378

**O que está errado:** as datas são calculadas à meia-noite local e convertidas para UTC com `toISOString()`. Em Portugal, no horário de verão, isso recua um dia. O período "mês passado" sugerido vai de **31/07 a 30/08** em vez de 01/08 a 31/08. `hoje()` também dá a data de ontem entre as 00:00 e a 01:00.

**Prova:** node com `TZ=Europe/Lisbon` e data 18/09/2026: `folha default: 2026-07-31 a 2026-08-30`; em janeiro dá 2025-12-01 a 2025-12-31 (certo). `hoje()` às 00:30 de 18/09 dá `2026-09-17`.
Efeito nos dados atuais: nenhum movimento em 31/07 nem em 31/08. Para julho, o período sugerido (30/06–30/07) apanharia 2 entradas de 30/06.

**Correção sugerida:** formatar com a data local (`getFullYear/getMonth/getDate`) em vez de `toISOString()`.

---

## B11 — Os históricos de Entradas e Saídas não se atualizam depois de registar movimentos nem ao mudar de obra
**Gravidade:** média
**Onde:** 3711–3720 e 3928–3938 (ligação a `window.mostrarView`), 3723–3725

**O que está errado:** o código só redesenha os históricos se existir uma função `mostrarView`, que não existe em lado nenhum do programa. Os históricos ficam com os dados do momento em que a página abriu. Depois de uma entrada nova, ou ao passar para a Pampilhosa, continuam a mostrar a lista antiga, até se carregar em "Filtrar".

**Prova:** `grep mostrarView` só encontra os dois `const origShow=window.mostrarView; if(typeof origShow==='function')…`. Não há nenhuma definição, e a navegação usa `data-v` (linha 1751). `refrescarTudo()` (3358) não chama `renderHistEntradas/renderHistSaidas`.

**Correção sugerida:** chamar `renderHistEntradas()` e `renderHistSaidas()` dentro de `refrescarTudo()` e no fim de `mudarObra()`.

---

## B12 — `gerarRelatorio` definido duas vezes; o relatório em vigor arredonda quantidades decimais e soma unidades diferentes
**Gravidade:** média
**Onde:** 2742–2842 (1.ª versão, morta), 3731–3836 (2.ª versão, em vigor), 3861–3862

**O que está errado:**
- a segunda definição substitui a primeira. `_calcRelatorio`, `exportarRelatorioExcel` e `imprimirRelatorio` usam campos (`rel-de`, `rel-ate`, `rel-arm`, `rel-forn`) que já não existem na página, e os filtros por armazém e por fornecedor desapareceram;
- a versão em vigor mostra as quantidades com `toFixed(0)`: 17,42 m de tubo aparece como 17 e 0,1 como 0;
- os totais "un" somam metros, unidades e kg.

**Prova:** duas declarações `function gerarRelatorio()` (2762 e 3731). `v.qt.toFixed(0)`, `(stockAtual[mid]||0).toFixed(0)`, `eQ.toFixed(0)`. Dados: 12 movimentos com quantidade decimal (ex.: M529 17.42, M68 0.1, M151 100.5).

**Correção sugerida:** apagar a versão morta ou reaproveitar os filtros dela. Usar `fmt()` (3 casas decimais) em vez de `toFixed(0)` e não somar quantidades de unidades diferentes.

---

## B13 — Discrepâncias entre o programa e o EXPORT SAP de 17/09 nas quantidades recebidas, e um item de PO ligado à ficha errada
**Gravidade:** média (dúvidas a esclarecer com o Rui, não corrigir sem confirmação)
**Onde:** dados das encomendas (importador externo e acertos 1377/1399)

**O que está errado:** comparei o recebido de cada linha (`Qtd.pedido − a ser fornecida`) com o `qtdRecebida` do programa (`preco.js`). Há 9 linhas diferentes:

| PO-item | Material | Programa (enc/rec) | SAP (enc/rec) |
|---|---|---|---|
| 4500857392-10/20/30/40/60 | cabos de bronze / fio de contacto / cobre flex | 21650/21650, 17150/17150, 620/620, 18200/18200, 1100/1100 | **mesmas qtd / 0 recebido** |
| 4500855444-140 | Pinça de suspensão do CdTA | 281/**154** | 281/281 |
| 4500851872-10 | Transformador de tensão | 21/**20** | 21/21 |
| 4500875905-10 | Corda nylon | 2/2 | 2/1,65 |
| 4500877501-30 | Portes | 1/1 | 2/2 |

Além disso, a **PO 4500838598 item 40 "Poste HEA 180 c/10,4 mt"** (4 un, recebidas) está ligada à ficha **M243 "Poste HEA 200 c/10,4 mt"**. O SAP usa o mesmo n.º 4046103 para os dois postes (itens 40 e 90). A ficha própria do HEA 180 c/10,4 (`M-POSTE-HEA180-104`) foi criada em 07/09 com uma **entrada fictícia**, "nunca tinha ficha nem entrada", e não tem nenhuma encomenda ligada. O mesmo acontece em M2791 (lava-mãos, itens 10 e 40 com preços 22,68 € e 8,86 €) e M3027 (protetor 100 ml e 1 l na mesma ficha).

**Correção sugerida:** o Rui deve confirmar as 9 linhas e os postes HEA 180 c/10,4 da PO 4500838598 item 40. O importador deve ligar por (SAP + descrição), como no B6.

---

## B14 — A gravação automática a cada 30 s apaga o trabalho feito noutro separador
**Gravidade:** média
**Onde:** 3976–3995 (auto-save por `setInterval`, `visibilitychange` e `beforeunload`), 1595–1599 (`guardar`)

**O que está errado:** cada separador aberto grava a sua cópia completa de todas as obras a cada 30 segundos e ao perder o foco, sem ler o que já está gravado. Com o programa aberto em dois separadores ou janelas, o que está desatualizado **reescreve** as entradas e saídas registadas no outro. Elas desaparecem na próxima abertura, sem aviso.

**Prova:** `setInterval(()=>{ … window.persistir(); },30000)` → `guardar()` → `localStorage.setItem(CHAVE_MULTI,JSON.stringify(OBRAS))`. Não existe nenhum `addEventListener('storage',…)` nem verificação de versão.
Caso: separador A regista uma saída às 10:00. O separador B, aberto desde as 9:00, grava às 10:00:30 e a saída de A perde-se.

**Correção sugerida:** guardar um carimbo de versão, ouvir o evento `storage` e avisar ou bloquear o separador desatualizado. Em alternativa, gravar só quando houve alterações nesse separador.

---

## B15 — A importação de encomendas por CSV sobrescreve o preço da ficha pela ordem do ficheiro, com a data de hoje
**Gravidade:** média
**Onde:** 2628

**O que está errado:** a regra é "na ficha fica o preço da compra mais recente". Aqui fica o preço da **última linha do ficheiro**, seja qual for a data da PO, e `precoData` recebe a data de hoje em vez da data da PO.

**Prova:** `if(temPreco(row.preco)){enc.preco=row.preco;m.preco=row.preco;m.precoPC=row.pedido;m.precoData=hoje();}`. Um CSV com a PO de março depois da de agosto deixa na ficha o preço de março, datado de hoje.
Dados atuais: 700/700 preços das encomendas coincidem com o EXPORT de 17/09 (ver "verificado OK"). O problema só aparece em importações futuras pelo ecrã.

**Correção sugerida:** atualizar a ficha só se a data da PO for ≥ `m.precoData` e usar a data do documento.

---

## B16 — O botão laranja "Recarregar" apaga os dados de todas as obras e a cópia de segurança só leva a obra ativa
**Gravidade:** média
**Onde:** 4137–4162

**O que está errado:** o botão apaga todas as chaves `dte_armazem*` do navegador, ou seja, todas as obras. A "cópia de segurança" que descarrega antes é só `window.DB`, a obra que está aberta. Tudo o que foi registado à mão na Pampilhosa, ou noutra obra criada, não está nos dados embebidos e **perde-se**, sem ficar na cópia. O mesmo vale para as alterações de Vendas Novas quando o botão é usado com outra obra ativa.

**Prova:** `const dataStr=JSON.stringify(window.DB, null, 2);` (e não `window.OBRAS`), seguido de `toRemove.forEach(k=>localStorage.removeItem(k))`. Na reabertura, `carregar()` → `criarEstruturaMulti(SEED_DATA)` cria a Pampilhosa com movimentos `[]` e acrescenta só as 4 receções da GT 2979 (1583–1592).

**Correção sugerida:** descarregar `window.OBRAS` (como faz `exportarBackup`, 2470) e explicar no aviso que se apagam todas as obras.

---

## B17 — Exportações CSV dos históricos, relatório e folha de consumos ficam partidas com aspas e acentos
**Gravidade:** baixa
**Onde:** 3603 (`exportarFolhaConsumos`), 3692 e 3704 (históricos), 3843–3859 (relatório)

**O que está errado:** as aspas dentro das descrições não são duplicadas: `replace(/"/g,'\"')` troca uma aspa por ela própria. No relatório nem sequer há `replace`. Uma descrição com aspas parte a linha em colunas erradas no Excel. Estes quatro ficheiros também não levam BOM UTF-8, ao contrário dos outros exportadores, e o Excel mostra "CÃ³digo" e "SAÃDAS".

**Prova:** na folha SAP real de agosto, **33 linhas** têm aspas (ex.: `542-PACA REG "TIPO 1" P/ESPIA AMARRACAO`, `CERRA CABOS 5/16" 8MM`). Há 27 fichas com aspas na descrição.

**Correção sugerida:** usar o `csvCampo()` já existente (2446) e prefixar `'\ufeff'`.

---

## B18 — Botão "Marcar saídas com etiqueta": etiqueta com apóstrofo parte o botão, e marca todas as saídas do período
**Gravidade:** baixa
**Onde:** 3532, 3539–3548

**O que está errado:** a etiqueta é metida sem escape dentro de `onclick="marcarSaidasParaFolha('…')"`. Uma etiqueta como `Agosto'26` gera um erro de JavaScript e o botão não faz nada. A marcação apanha também saídas de materiais que não constam da folha, ajustes e roubo (ver B3).

**Prova:** `` `<button … onclick="marcarSaidasParaFolha('${etiqueta}','${dataIni}','${dataFim}')">` ``. Ainda nenhuma saída tem `folha` nos dados (0), por isso não há efeito atual.

**Correção sugerida:** ligar o clique por `addEventListener` com a etiqueta numa variável e marcar só as saídas que entraram no cruzamento.

---

## B19 — Tabelas desenhadas sem escape de HTML (folha, históricos, relatório)
**Gravidade:** baixa (robustez)
**Onde:** 3449, 3577–3588, 3648, 3679, 3777, 3791, 3805, 3831

**O que está errado:** a descrição, o destino, as observações e a etiqueta são inseridos diretamente em `innerHTML`. Um "<" numa descrição ou observação corta a célula ou esconde texto. O resto do programa usa `escapeHtml`.

**Prova:** por exemplo `` tr.innerHTML=`…<td>${m.desc||''}</td>…` ``. Nos dados, `sap20260910-mat-4500885797-10` "Suporte cranª 14 >30" e 29 movimentos com "->" / "→" nas observações. Hoje só aparecem ">", que o navegador tolera, mas um "<" já estragaria a linha.

**Correção sugerida:** envolver estes campos em `escapeHtml()`.

---

## B20 — Contratos-quadro 4600… com quantidade 0 aparecem para sempre como "Em encomenda"
**Gravidade:** baixa
**Onde:** 2497–2502 (`estadoEncomenda`), 2509, 2544, 2849

**O que está errado:** com encomendado 0 e recebido 0, o estado dá "Em encomenda". Estas linhas somam no indicador vermelho, mostram o botão "Registar entrega" e aparecem em "Receber por pedido", com falta 0.

**Prova:** `M3942`, `M3943`, `M3944` (PO 4600042879) e `M3978` (PO 4600042111), todas com `qtdEnc:0`, `qtdRecebida:0` e o campo guardado `estado:"Concluída"`, que o programa ignora.

**Correção sugerida:** tratar `qtdEnc<=0` como "Contrato / sem quantidade" (ou "Concluída") e excluí-lo dos indicadores e da receção.

---

## B21 — Anexar PDF a uma entrada: se a entrada for recusada, o PDF vai para a entrada anterior (latente)
**Gravidade:** baixa (latente: o campo `ent-pdf` não existe hoje na página)
**Onde:** 3998–4028

**O que está errado:** o anexo é colado ao **último movimento de entrada da lista** depois de `orig()`, mesmo que `registarEntrada` tenha recusado (quantidade inválida, sem material). O PDF em base64 também iria para o `localStorage`, que já ronda 2,8 M caracteres.

**Prova:** `orig(); const lastEnt=[...DB.movimentos].reverse().find(m=>m.tipo==='entrada'); lastEnt.anexo=…`. Hoje não há nenhum `id="ent-pdf"` no HTML, por isso o ramo nunca corre.

**Correção sugerida:** retirar este bloco ou fazer `registarEntrada` devolver o movimento criado e só anexar a esse.

---

## Outras observações de dados (fora do código, para o Rui)
- As fichas `m3907` e `m3981` não têm o campo `un` (têm `unidade`/`categoria`), por isso a unidade aparece em branco na ficha, nas encomendas e no CSV de stock.
- `mv4419`, `mv4420` e `mv4421` são entradas fictícias com `data:""`, sem `ajuste:true`: 1 003 + 402 + 1 200 m de cabo. Ficam fora de todos os filtros por datas.
- `mv4074` e `mv4075` são entradas SAP com quantidade 0.
- Continua a existir 1 linha de serviço UM "UA" como encomenda e ficha (`M4827`/`M4818`, transporte Laso, 14/07). O script de 17/08 não filtra "UA".

## O que verifiquei e está OK
- **Preços:** as 700 linhas de encomenda com correspondência no EXPORT de 17/09 têm `preco` = Preço líquido ÷ Unidade preço, incluindo as 64 linhas com unidade de preço > 1 (ex.: 1215,45/100, 72,9/21). `temPreco`, `fmtEur` e `valorStock` estão corretos: preço 0 mostra "0,00 €" e stock negativo não entra no valor.
- **Cobertura do EXPORT:** as 721 linhas do EXPORT de 17/09 existem todas no programa, exceto as UA, que são ignoradas como devem. Não há (PO, item) repetidos nas encomendas e todas as encomendas apontam para uma ficha existente.
- A lógica de `estadoEncomenda` está certa, salvo o caso qtdEnc = 0 (B19). Não há nenhuma encomenda com recebido > encomendado no campo `qtdRecebida`.
- **GT 2979 / PO 4500883493:** entrada e saída de 5/4/6/6 un na IC-0019 e receção na Pampilhosa, coerentes com as encomendas (itens 10/20/40/50). O item 30 (Cordas I) só tem entrada, como documentado.
- IDs únicos em materiais, movimentos e encomendas, e sem colisão entre coleções. `novoId`/`maxSeq` não geram repetidos (o `seq` atual é 20260817, feio mas seguro).
- Todas as funções chamadas por `onclick`/`oninput` existem. `saveDB` e `atualizar` não existem, mas só são chamadas protegidas por `typeof`.
- As chaves de `CODIGOS_NOVOS_IP` (987) e `NOMES_PECAS_DESENHOS` (715) estão todas em maiúsculas, coerentes com as pesquisas em maiúsculas de `nomesPecasConhecidos`, `codigosUsadosNoProjeto` e `codigoNovoPeca`. A cache `_NOMES_PECAS` é limpa depois de as tabelas serem definidas (4471).
- Funções repetidas `fmt`, `norm`, `canon`, `linha` e `cmp`: são locais (dentro de IIFE ou de funções) e não colidem. A única colisão global é `gerarRelatorio` (B12).
- `escapeHtml` não escapa o apóstrofo, mas nenhum id de material ou encomenda usado em `onclick="…('id')"` tem apóstrofo (0 casos).
- Vistas de Projeto e pórticos (`detalheBOMProjeto`, `detalheBOMPortico`, `mostrarPosteProjetoCompleto`, `mostrarPorticoNovo`, desenhos clicáveis), por leitura de código: acessos a nulos protegidos com `?.` ou `||`, textos com `escapeHtml`, e o MutationObserver sem ciclo, porque só observa `childList`. Não testei no navegador.
- Não há movimentos `tipo:'transferencia'` nos dados, por isso o ramo `obraDst` de `rebuildStock` não afeta o stock atual.
