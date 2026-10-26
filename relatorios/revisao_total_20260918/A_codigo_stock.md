# Revisão A — Código de stock (núcleo)

Ficheiro revisto: `C:\Users\dst7973\Desktop\gestao_de_stocks_dte\gestao_armazem_catenaria.html`
Zonas: linhas 1011–1640 (modelo, blocos de correção do SEED, migrações, carregar/guardar, obras), 1640–2502 (helpers, stock, montagens, entradas, saídas, transferências, movimentos, definições, exportações) e o arranque (3374–3381, 4128–4172 botão “Recarregar”, 4224–4321 auto-merge). Algumas funções vizinhas (2585 `confirmarEntrega`, 2691 `aplicarAcerto`, 2741 relatório) foram lidas só para confirmar efeitos.

Método: o SEED embebido (linha 1016 + bloco 1017–1091) foi carregado em node e comparado com `dados_armazem_catenaria.json`. O primeiro bloco de script (1012–3382) e o auto-merge foram executados em node com um DOM e um `localStorage` simulados, reproduzindo arranques sucessivos (“fechar e voltar a abrir”). Scripts de prova em `...\scratchpad\revisao\` (`sim2.js`, `cen1.js`, `cen2.js`, `cen3.js`, `t14.js`–`t24.js`). Nenhum ficheiro do projeto foi alterado.

Resumo: **8 altas, 10 médias, 5 baixas**.

---

## ALTA

### A1 — Tudo o que se apaga e veio do ficheiro volta a aparecer ao reabrir o programa
- **Gravidade:** alta
- **Onde:** `juntarPorId` 1526–1533, `normalizarLegado` 1534–1544, `fundirSeedEmVendas` 1555–1561 (chamado em `carregar` 1581), `pamp.materiais=juntarPorId(...)` 1582; auto-merge 4224–4321 (`DB.movimentos.push(...missing)` 4258). Afeta `apagarMovimento` 2398, `apagarMaterial` 2003, `apagarMontagem` 2099, `apagarEncomenda` 2567, `apagarTudo` 2488.
- **O que está errado:** em cada arranque o programa volta a juntar o SEED e acrescenta todos os registos cujo id não está no navegador. Não fica registado o que foi apagado de propósito. Por isso um movimento, material, encomenda ou código de montagem apagado volta ao abrir de novo o programa, e o stock muda outra vez. “Apagar dados de todas as obras” também deixa de valer depois de recarregar.
- **Prova:**
  ```js
  // 1528-1529
  for(const x of (seed||[])){
    if(!porId.has(x.id)){const novo=copia(x);out.push(novo);porId.set(x.id,novo);}
  ```
  Simulação (`cen1.js`):
  - Apagar a entrada `mv611` (material M2): stock 2 → −8 (sem aviso, ver A9). Depois de reabrir, o stock volta a **2** e o movimento **voltou**.
  - Apagar o material `M-XAV-2X25`: desaparece. Depois de reabrir, **volta a existir**.
  - `apagarTudo()`: 0 movimentos. Depois de reabrir, **2447 movimentos e 1764 materiais**.
  - Efeito nos dados atuais: todos os registos do SEED podem ressuscitar assim (2447 movimentos, 1764 materiais, 701 encomendas, 677 montagens, 448 postes).
- **Correção sugerida:** guardar uma lista de ids apagados (“lápides”) por obra em `OBRAS` e fazer com que `juntarPorId` e o auto-merge não voltem a acrescentar esses ids. Em `apagarTudo`, marcar que o SEED não deve voltar a ser fundido.

### A2 — Ao abrir, as receções e as edições de fichas e encomendas SAP são substituídas pelo ficheiro
- **Gravidade:** alta
- **Onde:** 1530 (`Object.assign(porId.get(x.id),copia(x))` para ids `sapAAAAMMDD-mat-`, `sapAAAAMMDD-enc-` e `gt2979-transferencia-`). Afeta `confirmarEntrega` 2585–2598 e a receção por pedido 2880–2893, que aumentam `qtdRecebida`.
- **O que está errado:** em cada arranque, as fichas de material e as linhas de encomenda importadas do SAP são reescritas com os valores do SEED. Uma entrega registada no programa volta a aparecer como “Em encomenda”, embora a entrada de stock continue lá, e alguém pode registá-la outra vez. Alterações ao stock mínimo, à descrição, ao fornecedor ou à unidade destas fichas também se perdem.
- **Prova:**
  ```js
  // 1530
  else if(/^sap\d{8}-(?:mat|enc)-/.test(String(x.id||''))||/^gt2979-transferencia-/.test(String(x.id||'')))Object.assign(porId.get(x.id),copia(x));
  ```
  Simulação (`cen1.js`):
  - Entrega de 1 unidade na encomenda `sap20260812-enc-4500881481-10`: recebido 0 → 1. Depois de reabrir, recebido **0** e estado “Em encomenda”, mas o movimento de entrada existe (1). Resultado: dupla receção possível.
  - Stock mínimo da ficha `sap20260812-mat-4500883493-10` alterado para 25. Depois de reabrir, volta a **0**.
  - Dados atuais: 374 fichas `sap…-mat-` e 601 linhas `sap…-enc-`. Destas, **37 linhas ainda estão pendentes** e são as que vão ser recebidas.
- **Correção sugerida:** só atualizar a partir do SEED os campos que vêm do SAP (preço, quantidade encomendada) e, mesmo esses, apenas quando o SEED for mais recente. Não reescrever `qtdRecebida`, `estado`, `min` nem `mat`. Em alternativa, usar um bloco de migração com marca “já aplicado”.

### A3 — Saída ou transferência de uma montagem com tubo “qb” grava quantidade vazia e não desconta nada
- **Gravidade:** alta
- **Onde:** `expandirBom` 2239–2242; verificação 2291 e 2355; gravação 2297 e 2362; também `renderMontagens` 2027 e `renderBomPreview`.
- **O que está errado:** as linhas “qb” não têm `qtd`, por isso `b.qtd*n` dá `NaN`. `NaN < stock` é falso, logo não há aviso de falta. O movimento é gravado com quantidade `NaN`, que no JSON fica `null`, e o stock do tubo não se mexe. Uma linha sem material gera um movimento sem material. Linhas com quantidade 0 geram movimentos de 0. No ecrã aparece “NaN”.
- **Prova:**
  ```js
  // 2241
  return mo.bom.map(b=>({mat:b.mat,qtd:b.qtd*n}));
  ```
  Simulação (`cen2.js`): saída de 2 × `E-6181 TC`. O movimento do tubo M473 (10A, 19x26) fica com `qtd: null`. Stock M473 antes 1047, depois **1047**. Continua `null` depois de reabrir.
  Saída de 1 × `EC-234 SA`: a janela de confirmação mostra “? (disp. 0, pedido 1)” e, se aceite, grava um movimento com `mat` vazio.
  Dados atuais:
  - **14 montagens com linha qb**: E-6181 TC/MC/SC, E-6182 TA/TB/MA/MB/SA/SB, E-7095 N3, C-3410 40X49, C-3410 30X38, C-9058 SPA, EC-234 SA.
  - **1 linha sem material**: EC-234 SA, peça 483.
  - **6 linhas com qtd 0**: E-6152 I, E-6152 II, C-1474-III, TRANSVERSAL GAIA, E-6182 SA, E-6182 SB.
- **Correção sugerida:** em `expandirBom`, separar as linhas qb, sem material ou com qtd ≤ 0 e bloquear a saída. Pedir ao utilizador os metros reais de cada tubo qb, ou pelo menos mostrar a lista do que não foi descontado. Em `fmt`, mostrar “qb” em vez de NaN.

### A4 — Material repetido na lista de peças deixa o stock ficar negativo sem aviso
- **Gravidade:** alta
- **Onde:** 2291 (saídas) e 2355 (transferências).
- **O que está errado:** a falta de stock é verificada linha a linha, contra o stock completo. Quando a mesma peça aparece em duas linhas da montagem, cada linha “cabe” sozinha mas a soma não. A saída passa sem aviso, mesmo com a opção “bloquear”.
- **Prova:**
  ```js
  const insuf=itens.filter(it=>stockMaterial(it.mat,arm)<it.qtd);
  ```
  Simulação (`cen3.js`): M581 (540A) com stock 1 e restantes peças com stock suficiente. Saída de 1 × `C-160 SC`, que tem duas linhas 540A de 1. **Nenhum aviso** e o stock fica em **−1**.
  Dados atuais: **22 montagens** com material repetido, por exemplo C-160 SC (M581), C-160 SCRL (M157, M581), C-3393 IC (M473 três vezes), E-3214 (M457, M210, M586, M473) e C-3680 B (M561).
- **Correção sugerida:** somar as quantidades por material antes de verificar (`Map` mat → soma) e verificar o total.

### A5 — Importação CSV lê mal quantidades com separador de milhares (“1.003” passa a 1,003)
- **Gravidade:** alta
- **Onde:** `parseCSV` 2161 (`qtd`) e 2167 (`rec`). É usado na importação SAP de entradas (2177–2236) e na de encomendas (≈2600–2630).
- **O que está errado:** a quantidade só troca a vírgula pelo ponto. O ponto de milhares português fica, e `parseFloat` corta nele. Assim 1003 m de cabo entram como 1,003 m e “1.234,5” entra como 1,234. O preço usa outra função (`num`) que trata os milhares bem, por isso o erro só aparece nas quantidades.
- **Prova:**
  ```js
  const qtd=parseFloat((c[iQtd]||'').replace(/\s/g,'').replace(',','.'));
  ```
  `t14.js`: linha `1.003;1.003;1.234,50` → qtd **1.003**, recebida **1.003**, preço 1234.5 (correto). Linha `1.234,5` → qtd **1.234**.
- **Correção sugerida:** usar a função `num` (já existente em 2156) para `qtd` e `rec`.

### A6 — As marcas de ajuste, roubo, transferência e empréstimo não são usadas pelo código; o acerto de stock nem sequer as grava
- **Gravidade:** alta
- **Onde:** `aplicarAcerto` 2691–2715 (movimentos 2709–2713 sem `ajuste:true`); `guardarMaterial` 1995–1997 (“Stock inicial” sem `ajuste:true`); relatório `_calcRelatorio` 2741–2756 soma todas as saídas. Nenhuma linha de código após 1100 lê `ajuste`, `transferenciaObra`, `emprestimo` ou `ficticia`.
- **O que está errado:** a regra diz que ajustes, roubos e transferências não contam como consumo. O programa não distingue nada: o relatório por datas conta tudo como saída normal. Os acertos feitos pelo próprio programa, no separador de acerto e no stock inicial de ficha nova, ficam sem `ajuste:true`, contra a regra.
- **Prova:**
  ```js
  // 2709-2710 (acerto positivo)
  DB.movimentos.push({id:'mv'+novoId(),data,tipo:'entrada',mat:m.id,qtd:dif,arm,armDst:null,
    pedido:'',doc:'',origem:'Acerto',dest:'',obs:obs_final,user:DB.param.user,ref:null});   // sem ajuste:true
  // 2752
  const sais=DB.movimentos.filter(mv=>mv.tipo==='saida'&&inRange(mv)&&fornOK(mv));
  ```
  Saídas atuais que o relatório conta como consumo:

  | Tipo de saída | Movimentos | Quantidade |
  |---|---|---|
  | `ajuste:true` | 5 | 112 |
  | “ajuste SAP” sem marca | 89 | 8370 |
  | roubo de 08/06/2026 (mv4416–4418) | 3 | 2705 |
  | transferências para IC-0018 | 41 | 7469 |
  | empréstimo do AC n.º 64 | 1 | 1 |
- **Correção sugerida:**
  - Pôr `ajuste:true` em `aplicarAcerto` e no stock inicial.
  - Criar uma função única `eConsumoReal(mv)` que exclua `ajuste`, `transferenciaObra`, `emprestimo`, roubo e destinos de ajuste SAP, e usá-la em relatórios e consumos.
  - Marcar os dados antigos (ver A18).

### A7 — O backup de segurança do botão “🔄 Recarregar” só guarda a obra ativa; ao restaurá-lo, mistura obras
- **Gravidade:** alta
- **Onde:** 4142–4147 (`JSON.stringify(window.DB)`), `importarBackup` 2481 (`criarEstruturaMulti(obj)`).
- **O que está errado:** antes de apagar tudo, o botão descarrega só os dados da obra aberta (`DB`), não os de todas as obras (`OBRAS`). Se esse ficheiro for restaurado, a outra obra fica vazia. Se a obra aberta era a Pampilhosa, os movimentos da Pampilhosa passam para Vendas Novas.
- **Prova:** `t17.js`, com a Pampilhosa aberta:
  - O backup tem 4 movimentos (só da Pampilhosa).
  - Depois de restaurar: Vendas Novas fica com 2451 movimentos, incluindo as **4 receções da GT 2979**, que anulam a saída para Coimbra. A Pampilhosa fica com **0**.
- **Correção sugerida:** o botão deve chamar `guardar()` e descarregar `OBRAS`, como faz `exportarBackup` em 2469.

### A8 — Abrir e gravar um código de montagem estraga a lista de peças
- **Gravidade:** alta
- **Onde:** `abrirModalMontagem` 2047–2063 (`mo.bom.forEach(b=>addBomRow(b.mat,b.qtd))`), `addBomRow` 2065–2072 (`value="${qtd!=null?qtd:1}"`, `if(matSel)`), `guardarMontagem` 2083–2088 (`bom.push({mat,qtd:q})`).
- **O que está errado:** ao gravar, sem ninguém dar por isso:
  - uma linha **qb** passa a quantidade **1**;
  - as linhas perdem o código da peça (`cod`) e o nome do desenho (`nome`);
  - linhas com quantidade 0 desaparecem;
  - a linha sem material passa a apontar para o primeiro material da lista, M900001 “Cavilha do suporte dos braços” (código vazio).
- **Prova:** leitura direta do código. `addBomRow(undefined, undefined)` escreve `value="1"` e não escolhe material, por isso o `<select>` fica na 1.ª opção. Em `opcoesMateriais` a ordenação por código põe M900001 (código `''`) em primeiro lugar (`t13.js`).
  Dados atuais: 14 montagens qb, 638 montagens com `cod`/`nome` nas linhas, 1 linha sem material e 6 linhas a 0.
- **Correção sugerida:** manter os campos da linha original (guardar o índice e fazer `Object.assign` com a linha antiga). Na linha, aceitar “qb” como texto. Não gravar linhas sem material escolhido.

---

## MÉDIA

### A9 — Apagar um movimento de entrada pode deixar o stock negativo sem aviso
- **Gravidade:** média
- **Onde:** `apagarMovimento` 2398–2402.
- **O que está errado:** o programa não verifica o stock ao apagar uma entrada, nem com a opção “bloquear” ativa.
- **Prova:** `cen1.js`: apagar `mv611` (entrada de 10 × M2, com stock 2) deixa o stock em **−8**. Só aparece o aviso genérico “O stock será recalculado”.
- **Correção sugerida:** para entradas e transferências, calcular o stock resultante no armazém. Se ficar negativo, mostrar a falta e respeitar `DB.param.neg`.

### A10 — Duas obras geram os mesmos ids: códigos de montagem partilhados ficam com id repetido
- **Gravidade:** média
- **Onde:** `novoId` 1600, `dadosObra` 1545–1547, `maxSeq` 1521–1525, `fundirSeedEmVendas` 1560 (só recalcula `seq` de Vendas Novas), `criarObra` 1619–1627. Os ids das montagens não entram em `maxSeq`.
- **O que está errado:** cada obra tem o seu contador `seq`, mas as montagens são comuns a todas. Vendas Novas e Pampilhosa criam ids iguais (`M4500872632`). Ao editar ou apagar a montagem de uma obra, o programa apanha a da outra, e `apagarMontagem` apaga as duas.
- **Prova:** `t18.js`:
  - Depois do arranque, seq VN = 4500872632 e seq Pampilhosa = 4500872631.
  - Criar uma montagem em VN e depois, na Pampilhosa, 1 entrada e 1 montagem dá `[["M4500872632","TESTE-VN"],["M4500872632","TESTE-PAMP"]]`.
  - `montById` do id da Pampilhosa devolve **TESTE-VN**.
- **Correção sugerida:** ids com prefixo da obra ou contador global em `OBRAS` (máximo de todas as obras e das montagens).

### A11 — A limpeza de fichas repetidas, com duas obras, deixa listas de peças a apontar para fichas apagadas
- **Gravidade:** média (hoje não há duplicados no SEED; acontece logo que surjam fichas iguais, por exemplo numa importação SAP)
- **Onde:** migração 1268–1312, em particular 1294–1296 (reaponta a BOM partilhada uma vez por obra, cada obra com o seu “vencedor”).
- **O que está errado:** em cada obra fica a ficha com mais movimentos. Em Vendas Novas ganha uma, na Pampilhosa (sem movimentos) ganha a outra. A lista de peças comum é reapontada primeiro para a de VN e depois para a da Pampilhosa, que em VN foi apagada. Em VN a peça aparece “(removido)” e as saídas dessa montagem deixam de descontar stock.
- **Prova:** `t16.js`: foi criada uma cópia `X-DUP` da ficha M303 e dados 3 movimentos em VN. Resultado: as BOM de C-3393 IIIBB, EC-258 I e EC-258 II apontam para **M303**, que VN **já não tem**, e a montagem mostra “(removido)”. Como o SEED devolve a M303 a cada arranque (A1), repete-se sempre.
- **Correção sugerida:** escolher o vencedor uma só vez para todas as obras (id comum), ou só reapontar a BOM com a escolha de Vendas Novas.

### A12 — 212 fichas com código repetido não podem ser editadas, e a procura por código apanha sempre a primeira
- **Gravidade:** média
- **Onde:** `guardarMaterial` 1985–1986; `matByCodigo` 1637 (usado na importação CSV).
- **O que está errado:** o SAP usa o mesmo código para vários tamanhos (luvas, calças, fatos). Ao gravar qualquer uma destas fichas, mesmo só para mudar o stock mínimo, o programa responde “Já existe um material com esse código” e não grava. Na importação CSV, todas as entradas desse código vão para a primeira ficha (por exemplo, o tamanho 10 em vez do 8).
- **Prova:** `t24.js`: editar M2814 (Luvas Glova Tam 10, código 3000076) mostra “Já existe um material com esse código” e `min` fica 0. `matByCodigo('3000076')` devolve sempre a mesma ficha. Dados atuais: **65 códigos repetidos em 212 fichas**.
- **Correção sugerida:** só bloquear quando o código e a descrição forem iguais. Na importação, desempatar pela descrição e mostrar a ambiguidade.

### A13 — A migração do EC-219 apaga a linha “Cabo de aço inox L=12” do EC-219 IIIA, e SEED, JSON e programa têm três versões diferentes
- **Gravidade:** média (a confirmar com o Rui)
- **Onde:** migração 1150–1180 (1168 converte qualquer linha `cod==='EC 219 IIIB'` em tubo e 1170–1171 deixa só uma linha 10H).
- **O que está errado:** no SEED, o EC-219 IIIA já tem o tubo guia 10H com quantidade 2 e tem ainda uma linha `{mat:'M4419', cod:'EC 219 IIIB', nome:'Cabo de aço inox S=37,92;8,75(L=12)', qtd:1}`. A migração transforma essa linha em tubo e depois apaga-a por repetida. As três versões são:
  - **SEED:** tubo + cabo;
  - **JSON:** tubo duas vezes, ou seja 4 tubos;
  - **programa depois de abrir:** um só tubo e sem cabo.

  A ficha M4419 diz “Tubo guia” e a linha diz “Cabo de aço inox”, o que também é contraditório.
- **Prova:** primeiro arranque com os dados atuais: `Correção EC-219: 2 acertos no tubo guia dos contrapesos.` (`t8.js`). O JSON difere do SEED só nesta montagem (`mo-cad-573`: linha 21 é `10H` em vez de `EC 219 IIIB`).
- **Correção sugerida:** o Rui deve confirmar no desenho EC-219 se o cabo pertence ao IIIA. Depois, alinhar SEED, JSON e migração, que deve procurar a linha pelo nome/material e não só pelo código.

### A14 — Tubos: ficha em “un”, stock em metros e listas de peças misturam metros com peças
- **Gravidade:** média (a confirmar com o Rui)
- **Onde:** dados das fichas M473 (10A), M566 (10C), M432 (10E), M529 (10F), M449 (10G) e M492 (10H), todas com `un:'un'`; BOM consumidas por `expandirBom` 2241.
- **O que está errado:** a regra diz que os tubos contam em metros. As fichas dizem “un” e, nas listas de peças, umas linhas estão em metros e outras em peças. Por exemplo, “Tubo 19x26 (L=844)” com quantidade 1 desconta 1 m em vez de 0,844 m, e o “Tubo guia” do EC-219 com quantidade 1 desconta 1 m sem se saber o comprimento.
- **Prova:** `t21.js`:
  - Em metros: C-3393 IC 1,5 / 1,2 / 1,5; C-8591 I 6,76; E-7095 N3 0,842 “— metros”; E-7171 CB2 0,22.
  - Em peças: E-7095 E3 “Tubo 19x26 (L=844)” = 1; E-7095 N2 “L=830” = 1; E-3214 “c/ curva (L=Variável)” = 2; EC-219 IA/IB/IIA/IIB 10H = 1.
  - Stock M529 (10F) = 167,42, valor que só faz sentido em metros.
- **Correção sugerida:** o Rui deve confirmar que estas fichas são em metros e mudar `un` para 'm'. Rever as linhas de tubo em que “1” significa uma peça de comprimento L e converter para metros (L/1000), ou para qb quando L for variável.

### A15 — A data “de hoje” está em hora UTC: entre a meia-noite e a 1 h (hora de verão) fica o dia anterior
- **Gravidade:** média
- **Onde:** `hoje` 1633; datas por omissão dos formulários 3375; `rel-de` 3378; importação CSV 2224 (`data:hoje()`); nomes de backup 4147.
- **O que está errado:** `toISOString()` dá a data em UTC. Um movimento registado às 00:30 de 1 de outubro fica com a data de 30 de setembro e cai no mapa mensal errado.
- **Prova:** node com TZ Europe/Lisbon: `new Date(2026,8,19,0,30)` dá `hoje() = 2026-09-18`.
- **Correção sugerida:** `const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');`

### A16 — Importação CSV SAP: sem proteção contra repetição, cria fichas duplicadas, perde a data do documento e não procura pelo n.º SAP
- **Gravidade:** média
- **Onde:** `processarCSVSap` 2177–2207, `confirmarImportSap` 2209–2236, `matByCodigo` 1637.
- **O que está errado:**
  1. Importar o mesmo ficheiro duas vezes duplica todas as entradas.
  2. Se um código novo aparece em duas linhas, criam-se duas fichas com o mesmo código, porque a procura é feita antes de criar.
  3. Todas as entradas ficam com a data do dia da importação, não a do documento.
  4. A procura é só pelo campo `codigo`, não pelo campo `sap`, por isso fichas existentes com n.º SAP diferente do código são tratadas como “novo material”.
- **Prova:** `t15.js`: CSV com `NOVO-999;5` e `NOVO-999;3` cria **2 fichas** (M4500872632 com 5, M4500872634 com 3). Importado outra vez, o total passa de 8 para **16**; data `2026-09-18` em todas. Dados atuais: 366 fichas com `sap` diferente do código, 172 das quais não são encontráveis pelo n.º SAP.
- **Correção sugerida:** chave anti-duplicado (documento + material + quantidade); criar a ficha nova uma única vez por código dentro da importação; ler a coluna de data; procurar também por `sap` e `ref`, como já faz `aplicarAcerto` 2701.

### A17 — Transferências para a Pampilhosa registadas só do lado de Vendas Novas e com marcas diferentes
- **Gravidade:** média (a confirmar com o Rui)
- **Onde:** dados. A obra Pampilhosa só recebe `rececoesPamp` (1583–1591).
- **O que está errado:** Vendas Novas tem 41 saídas para IC-0018/Pampilhosa, mas a Pampilhosa só tem as 4 receções da GT 2979. O stock da Pampilhosa não reflete o que chegou. Além disso, só 11 destas saídas têm `transferenciaObra:true`. A GT 3203 (20 linhas) e a “Saída para Pampilhosa 06/07” (4 + 2) não têm a marca.
- **Prova:** `t22.js`: `saida|GT…/3203||…|Obra IC-0018 - Pampilhosa: 20`, `saida|Saída para Pampilhosa 06/07|||Pampilhosa: 4`, `saida||||Pampilhosa: 2`. `trfObra` só aparece nas GT 1320, 1844, 2462, 2827 e 2829.
- **Correção sugerida:** o Rui deve decidir se as receções devem existir na Pampilhosa (como na GT 2979) e marcar todas estas saídas com `transferenciaObra:true`.

### A18 — Entradas de regularização sem data e sem `ajuste:true`, e ajustes antigos sem marca
- **Gravidade:** média
- **Onde:** dados (SEED/JSON).
- **O que está errado:** mv4419, mv4420 e mv4421 (“Entrada fictícia — regularização”, 1003 m + 402 m + 1200 m de cabo) têm `data:''` e não têm `ajuste:true`. Outros ajustes também não têm a marca: mv3868–3873, mv4222–4224 e as 88 saídas “Obra IC-0019 (ajuste SAP)”. No total há **104** movimentos com cara de ajuste sem `ajuste:true`. Sem data, estas entradas ficam fora de qualquer filtro por datas e contam no stock desde “sempre”.
- **Prova:** `t5.js` / `t6.js` (listagem por origem/destino).
- **Correção sugerida:** migração com marca que ponha `ajuste:true` e uma data documentada, a indicar pelo Rui.

---

## BAIXA

### A19 — Migrações reescrevem em cada arranque alterações manuais das montagens que corrigem
- **Gravidade:** baixa
- **Onde:** 1119–1148 (E-6182), 1150–1180 (EC-219), 1212–1236 (E-6181), 1314–1347 (linhas do caderno voltam sempre).
- **O que está errado:** estas correções não têm marca “já aplicada”. Se o Rui mudar à mão, por exemplo, os metros do tubo do E-6181 TC ou a quantidade do tubo guia do EC-219, ou apagar uma linha do caderno, o valor volta ao da migração na abertura seguinte.
- **Prova:** 1222–1223 força `qtdTexto='qb'` sempre que o código é 10X; 1175–1176 força `t.qtd=q`. Os arranques 2 e 3 não mudam nada (as migrações são idempotentes), mas qualquer edição posterior é revertida.
- **Correção sugerida:** gravar em `OBRAS` uma lista de migrações aplicadas e correr cada uma só uma vez.

### A20 — Exportação CSV de stock e movimentos com ponto decimal
- **Gravidade:** baixa
- **Onde:** `exportarStockCSV` 2447–2457, `exportarMovimentosCSV` 2458–2468.
- **O que está errado:** as quantidades saem como `1527.5`. Num Excel português (separador `;`, decimal `,`) não são lidas como número: ficam como texto ou podem virar datas.
- **Prova:** 12 materiais têm stock decimal, por exemplo 253019 = 2.67, 9124050502 = 1527.5, OXY1 = 21.2 e 10F = 167.42 (`t19.js`).
- **Correção sugerida:** exportar com `String(v).replace('.',',')` ou com `toLocaleString('pt-PT',{useGrouping:false})`.

### A21 — O programa não abre se faltar uma linha da encomenda 4500883493 no SEED
- **Gravidade:** baixa (robustez)
- **Onde:** `carregar` 1583–1591 (`mat:enc.mat` sem verificar `enc`).
- **O que está errado:** se uma futura importação retirar ou renomear o item 10, 20, 40 ou 50 da PC 4500883493, `enc` fica `undefined` e o arranque rebenta. Sem `DB` carregado, nada funciona.
- **Prova:** hoje as 4 linhas existem (`t7.js`); o risco está na linha 1586.
- **Correção sugerida:** `.filter(Boolean)` e aviso na consola quando faltar a linha.

### A22 — “Recarregar dados do Mapa” apaga também a Pampilhosa sem o dizer
- **Gravidade:** baixa
- **Onde:** botão da linha 888 → `seedInicial` 1629–1632 (`criarEstruturaMulti(SEED_DATA)`).
- **O que está errado:** a pergunta fala só em “dados iniciais do Mapa de Stock”, mas todas as obras são recriadas e a Pampilhosa fica vazia. As migrações só voltam a correr quando o programa for reaberto.
- **Correção sugerida:** avisar que afeta todas as obras e obrigar a um backup geral antes.

### A23 — Dados de qualidade duvidosa no catálogo que afetam ecrãs e listas
- **Gravidade:** baixa
- **Onde:** dados.
- **O que está errado:**
  - M900001 tem código vazio: aparece em 1.º lugar em todas as listas e é o material que o A8 mete nas linhas sem material.
  - 6 fichas têm `un:'#N/A'` e descrição `#N/A`: M656, M658, M660, M664, M687 e M967. A M967 é usada na BOM do E-6181 TC.
  - 2 fichas não têm unidade: m3907 e m3981.
- **Prova:** `t4.js` / `t5.js`.
- **Correção sugerida:** o Rui deve confirmar os códigos e as unidades.

---

## Verificado e sem problemas
- `rebuildStock`/`stockMaterial`: sinais corretos para `entrada`, `saida` e `transferencia` entre armazéns. Nos dados só existem os tipos `entrada` (1393) e `saida` (1054); não há `saída`, `devolucao` nem `ajuste` como tipo.
- As 2447 quantidades são números e nenhuma é texto (sem risco de “5”+“3”=“53”). Só mv4074 e mv4075 têm `qtd:0`, ambas importações SAP históricas.
- Não há movimentos órfãos, ids repetidos (materiais, movimentos, encomendas, montagens, postes) nem stock negativo nos dados atuais, por armazém ou no total.
- Arranques sucessivos: depois do 1.º, as migrações não voltam a alterar nada (idempotentes). Os registos que as migrações de 17 e 18/09 retiram (M4041, mvM3990, as 204 encomendas antigas, a ficha repetida da 483) já não estão no SEED, por isso não ressuscitam.
- As migrações de encomendas de 10/09 e 17/09 põem `qtdRecebida` igual a `qtdEnc` e batem com as entradas registadas.
- O bloco de correções 1017–1091 só acrescenta registos em falta. As 22 entradas “acerto-stock-…” e a entrada fictícia do poste HEA180 10,4 têm `ajuste:true`.
- `dados_armazem_catenaria.json` bate com SEED + bloco 1017–1091 em todos os registos, exceto `mo-cad-573` (ver A13); a ordem dos registos difere, sem efeito.
- Escape de HTML na zona revista: os textos passam por `escapeHtml`, os ids usados em `onclick` não têm aspas nem `<`, e os nomes de armazém e de obra são escapados para JS.
- `guardar()` invalida a cache de stock; `ativarObra` e `capturarObraAtiva` mantêm `DB` e `OBRAS` ligados às mesmas listas.
- Tamanho gravado no navegador: cerca de 2,81 milhões de caracteres. Cabe no limite habitual de cerca de 5 M, mas cada obra nova copia mais cerca de 416 mil (o catálogo), e uma falha de gravação só mostra um toast.
