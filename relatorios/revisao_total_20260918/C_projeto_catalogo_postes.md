# Revisão C — Projeto, catálogo de montagens e dados dos postes

Âmbito: código do Projeto/Materiais Totais em `gestao_armazem_catenaria.html` (linhas 1904–1950, 2948–3290, 4445–4954), catálogo `montagens` (677 montagens, 5028 linhas de peças) + `BOM_PROJETO_CONFIRMADO` (26 listas), e `postes` (448) de `dados_armazem_catenaria.json`. Nenhum ficheiro do projeto foi alterado. As provas foram obtidas a correr as próprias funções do programa (extraídas do HTML) em node contra o JSON.

Números de referência: 207 postes `novo`, 130 `existente`, 111 `desmontar`. No ecrã Materiais Totais (filtro por defeito "Novos") saem 318 linhas e **0 referências pendentes**.

Resumo: **9 altas, 11 médias, 8 baixas**.

---

## ALTA

### C1 — Os 5 pórticos não entram nos Materiais Totais
- **Gravidade:** alta
- **Onde:** `agregarMateriaisProjeto` (l. 1904) usa só `DB.postes`; pórticos só existem como folhas escritas no código (`mostrarPorticoNovo` l. 4445, `mostrarPortico642930` l. 4861, `mostrarPortico643132`).
- **O que está errado:** O ecrã diz "postes/pórticos considerados", mas nenhum material dos pórticos 26-23A_24A, 27-41_42, 64-13_14, 64-29_30 e 64-31_32 é somado: fixações e amarrações do funicular e dos transversais, isoladores sintéticos, suspensões, cabos BZ65/BZ50 com os metros indicados, conjunto de segurança e ligação à terra. Também não aparece nenhum aviso de falta.
- **Prova:** Os apoios 26-23A, 26-24A, 27-41, 27-42, 64-13, 64-14 e 64-32 não existem em `postes`. 64-29, 64-30 e 64-31 só existem como `-Exist` a desmontar. Nenhum poste usa E-6166, E-6167, E-6169, E-7092, E-7094 ou E-7095, que são os desenhos das folhas dos pórticos.
- **Correção sugerida:** Criar registos de poste (ou "pórtico") com os mesmos campos (refs + cabos em metros) para os 10 apoios. Em alternativa, somar as listas das folhas dos pórticos em `agregarMateriaisProjeto`. Até lá, pôr os pórticos na lista de pendências.

### C2 — O filtro por defeito "Novos" deixa de fora material novo montado em postes existentes
- **Gravidade:** alta
- **Onde:** `postesMateriaisTotaisProjeto` (l. ~1925), opção por defeito `novo` em `#mat-estado`.
- **O que está errado:** Há postes `existente` onde o caderno manda desmontar a consola antiga e montar uma nova, ou montar equipamento novo (E-6177, C-1602, EC-176, E-6189, C-160, EC-219, E-7171…). Esse material não entra no total por defeito.
- **Prova:** 75 postes `existente` geram peças. 39 têm consola completa e 11 destes têm "DESMONTAR - CONSOLA SIMPLES/DUPLA" (15-07, 15-08, 19-03A, 19-32, 19-34, 20-07, 20-08, 26-06, 26-07, 26-08, 64-28), portanto a consola é nova. Fica excluído, por exemplo: tubo 10A 93 m, 10C 62 m, 10E 79 m, 10F 59 m, 10G 51 m, isoladores 65 ×42, 67 ×34, pinças 501A ×24. Referências nos existentes: E-6177 41, C-1602 34, EC-176 33, E-6189 7, EC-219 2, E-7171 2.
- **Correção sugerida:** Confirmar com o Rui que material dos existentes é novo. Depois, marcar por consola/equipamento se é novo (`consola_existente`) e fazer o total "a comprar" = novos + trabalho novo em existentes.

### C3 — Peças sem código ("—") de listas diferentes juntam-se numa só linha com o nome errado
- **Gravidade:** alta
- **Onde:** chave de agregação `cod+'|'+novo` em `dadosResumoPecasPoste` (l. 3164) e `[cod,novo,un]` em `agregarMateriaisProjeto` (l. 1909). As linhas com `cod:'—'` e `ref` que não é código novo ficam todas com a chave `—|—`.
- **O que está errado:** Um transformador de medida de tensão, um isolador de pé de consola, cones, porcas e mangas aparecem somados numa única linha "Cone de sujeição do aço". Estas peças desaparecem da lista de compras.
- **Prova:** Materiais Totais (Novos): `— | — | 94 | Cone de sujeição do aço | 30 postes | fontes EC-286, EC-237 Ia, E-3214 I-B`. Os 94 somam: EC-286 (2 cones do aço + 2 cones + 2 porcas + 1 manga) × 9 postes = 63; EC-237 IA ("Ligação entre neutros" 1 + "Transformador de medida de tensão" 1) × 9 = 18; E-3214 I-B ("Isolador de pé de consola") × 13 = 13.
- **Correção sugerida:** Quando não há código, usar o nome (normalizado) na chave, ou dar-lhes códigos provisórios. Nunca juntar peças diferentes na mesma linha.

### C4 — Submontagens contadas como se fossem peças e nunca desdobradas
- **Gravidade:** alta
- **Onde:** `BOM_PROJETO_CONFIRMADO` 'E-3214 I-B' (l. 4483), 'EC-237 IA' (l. 4550), 'C-12136 IA', 'EC-278 I/II'. `dadosResumoPecasPoste` não expande `cod` que seja um desenho.
- **O que está errado:** Os Materiais Totais mostram linhas como "EC-388 Montagem do transformador de 50 kVA ×13", "EC-344 Montagem de seccionador ×13" e "EC-176 ×88". Não são peças que se possam encomendar. As peças reais destas montagens (transformador, seccionador, suportes EC-212/EC-120, disjuntor EC-326) nunca são somadas, e o programa diz 0 pendências.
- **Prova:** Linhas nos totais (Novos): C-1474 13, C-3393 13, C-7239 13, C-12136 22, E-3309 9, EC-120 9, EC-176 88, EC-212 13, EC-278 22, EC-326 13, EC-344 13, EC-388 13. Afeta 22 postes de transformador (06-29A, 11-22A, 19-20A, 27-06A, 31-21A/B, 31-22A, 34-01A, 34-17B, 34-25A, 39-23A, 45-23A, 50-37A, 57-23A, 61-10A, 65-10A, 68-14A, …). As 3 variantes EC-176 (LBB, AC, L) juntam-se numa linha com o nome da primeira. EC-176, C-12136, C-1474, C-3393, C-7239 e E-3309 já são referenciados à parte pelos postes, por isso estas linhas são "fantasma". EC-388, EC-344, EC-212, EC-326 e EC-120 não são referenciados à parte, por isso as suas peças faltam.
- **Correção sugerida:** Marcar as linhas de submontagem (`sub:true` + aplicação) e expandi-las recursivamente com `dadosBOMProjeto`, sem duplicar as que o poste já lista. Se a submontagem não tiver lista, enviá-la para as pendências.

### C5 — E-6184 X (braço de chamada) não existe no desenho atual; a lista usada é antiga e diz "LP5"
- **Gravidade:** alta (a confirmar com o Rui)
- **Onde:** catálogo `E-6184 X` (fonte Caide, sem designação); é usado pelo campo `brch`.
- **O que está errado:** Quase todos os postes novos pedem E-6184 X. O desenho normativo atual E-6184 rev. H (25-11-2022) tem só as montagens I a IX e diz no historial "Retiradas as Mont. X a XVII". A lista do programa vem do Caide e manda comprar a peça 643 "Braço de Chamada (Catenária LP5)", mas a obra é LP10.
- **Prova:** 211 aplicações em 181 postes novos → 211 × peça 643 (SAP 4032266), mais 343 e 291B. O PDF `03_E/E-6184-H_10002000918-05…pdf` tem colunas de quantidades IX, VIII, VII, VI, IV, III, II, I e nota H "Retiradas as Mont. X a XVII." As montagens I e II da tabela coincidem com o catálogo, portanto a leitura das colunas está correta.
- **Correção sugerida:** Perguntar ao Rui/projetista qual o desenho e a peça que substituem E-6184 X em LP10. Até lá, pôr a referência como pendente em vez de somar 643.

### C6 — E-6182 Tb/Sb (consola 40x49): esquadro/anilha errados e parafuso a mais; Ta sem pêndulo recebe esquadro
- **Gravidade:** alta
- **Onde:** catálogo `E-6182 TB` e `E-6182 SB` (Caide); `BOM_PROJETO_CONFIRMADO['E-6182 TA']` (l. 4686–4699).
- **O que está errado:** Pela nota do E-6182 rev. C, a pinça do cabo de suporte leva o esquadro 465 (02.401.01) quando a consola tem pêndulo e a anilha quadrada 280 (04.300.10) quando não tem. Leva também só 1 parafuso de ponto 442. A lista Tb dá sempre 280 e 442 ×2. A lista Sb tem 280 com quantidade 0 e não tem 465. A lista Ta dá sempre 465, mesmo sem pêndulo.
- **Prova:** Tabela do E-6182 rev. C reconstruída por coordenadas: colunas Sb/Sa/Mb/Ma/Tb/Ta; a ref.ª 13 (Tb) = "501B+501C+501D+17D+17C+442+296B+465+19F". Postes novos: 33 consolas Tb, todas com pêndulo → faltam 33 × 465, sobram 33 × 280 e 33 × 442. 3 consolas Sb com pêndulo → faltam 3 × 465. Ta sem pêndulo em 64-33 e 64-45 → deviam levar 280 e não 465.
- **Correção sugerida:** Transcrever E-6182 TB e SB a partir do desenho atual (como foi feito para TA). Em `dadosResumoPecasPoste`, escolher 465 ou 280 conforme o poste tenha pêndulo (`c.pend` ou E-6188 nos antibalançantes).

### C7 — E-6181 Sc: o parafuso 17I está ligado à cantoneira 171
- **Gravidade:** alta
- **Onde:** catálogo `E-6181 SC`, linha 1: `{mat:'M4214', cod:'171', nome:'Parafuso M10x60/26 C/Hu'}`.
- **O que está errado:** O desenho pede o parafuso M10x60/26 (cód. 17I, 04.201.05). O programa escreveu "171" (um "um" em vez de "I") e ligou a ficha M4214 "Cantoneira de travamento 60x60x6". Nos totais sai o código 171 / 02.100.01, que é uma cantoneira.
- **Prova:** E-6181 rev. C, coluna Sc: "Cod. 17I … Parafuso M10x60/26 c/Hu … 04.201.05" = 1. `codigoNovoPeca('171')` = 02.100.01; `'17I'` = 04.201.05. O material M419 (codigo 17I) existe. Afeta 8 aplicações Sc em 6 postes novos (06-33, 06-34, 27-13, 27-15, 45-16, 50-36A).
- **Correção sugerida:** Mudar a linha para `cod:'17I'`, `mat:'M419'`.

### C8 — Peças do E-6181 contadas duas vezes quando o caderno repete o tirante no campo da consola
- **Gravidade:** alta (só no grupo das consolas duplas, já conhecido como incompleto)
- **Onde:** `dadosResumoPecasPoste` l. 3114: `[c.tirFix,c.tirTubo,c.consFix,c.consTubo,…].forEach(add)`. `metrosTubosPoste` l. 3043 evita os metros a dobrar (`mesmoDesenho`), mas as peças não.
- **O que está errado:** O próprio comentário do código diz que, nestes casos, o caderno repete o mesmo elemento e que contá-lo outra vez seria comprar a dobrar. Isso é evitado no tubo, mas todas as outras peças do E-6181 (isolador, articulação, vara de regulação, manga, ponteira, parafusos…) saem ×2.
- **Prova:** 48 consolas de postes novos (46 "E-6181 Tc", 2 "E-6181 Sc"). Exemplo: 04-27 comprida dá 65 ×2, 513 ×2, 444 ×2, 546 ×2… Todas pertencem aos postes de consola dupla já conhecidos: 55 postes (52 novos + 3 existentes), só contagem.
- **Correção sugerida:** Em `dadosResumoPecasPoste`, não fazer `add(c.consTubo)` quando é igual a `c.tirTubo` (mesma regra de `metrosTubosPoste`). Fazer isto antes de refazer as 55 duplas, senão o erro volta.

### C9 — E-6177 TLT: a lista antiga tem peças que o desenho atual não tem
- **Gravidade:** alta (quantidades de compra; a confirmar)
- **Onde:** catálogo `E-6177 TLT` (Caide): 662 ×2, 16B4 ×2, 9U1 ×1, 660A ×1.
- **O que está errado:** No E-6177 rev. I, a coluna TLT só tem 2 ligadores paralelos 662. O cabo LXV 50, os parafusos 16B4 e o terminal pertencem às colunas C/P/E.
- **Prova:** Tabela do E-6177-I reconstruída por coordenadas (colunas E, P, C, TLT, TE, TRL d/c/b/a, TL). As colunas TL e TRL a/b batem certo com o catálogo, portanto a leitura está correta. 20 aplicações TLT em postes novos → 40 × 16B4, 20 × 9U1 e 20 × 660A a mais.
- **Correção sugerida:** Confirmar e substituir por 662 ×2.

---

## MÉDIA

### C10 — Os totais dizem "só listas confirmadas", mas a maioria vem do desenho antigo (Caide) sem aviso
- **Onde:** `renderMateriais` l. 1936 ("O total usa apenas listas de peças documentalmente confirmadas"). O campo `antiga` é calculado em `agregarMateriaisProjeto` mas nunca é mostrado.
- **O que está errado:** A ficha do poste avisa "Fonte: desenho antigo — confirmar antes de utilizar". Os Materiais Totais misturam essas listas sem qualquer marca.
- **Prova:** Postes novos: 1058 aplicações (68 referências distintas) usam lista Caide não confirmada, por exemplo E-6184 X 211, E-6179 I 103, E-6187 a 91, E-6177 TRLA 52, E-6189 A 49, E-6183 F 46, C-160 CdTL 36, E-6182 Tb 33. 270 das 318 linhas do total têm contributo Caide.
- **Correção sugerida:** Mostrar uma coluna ou etiqueta "inclui desenho antigo" e corrigir o texto informativo.

### C11 — A procura da montagem pode apanhar outra variante (`endsWith`)
- **Onde:** `dadosBOMProjeto` l. 2964 e `detalheBOMProjeto` l. 4745: `startsWith(d+' ') && endsWith(a)`.
- **O que está errado:** "IA" também é o fim de "IIA", e "A" é o fim de "TA", "SA", "IIA". Se a aplicação não existir com o nome exato, o programa usa silenciosamente outra variante. O passo "canónico" (hífen) vem depois deste, por isso pode ser ultrapassado.
- **Prova:** "C-12136 IA" (13 postes novos) é resolvido para o catálogo "C-12136 IIA". Hoje o erro fica escondido porque existe `BOM_PROJETO_CONFIRMADO['C-12136 IA']`, mas a fonte da montagem fica errada.
- **Correção sugerida:** Tirar o fallback `endsWith` (ou exigir `=== d+' '+a` depois de normalizar hífens/espaços) e fazer o passo canónico primeiro. O que não for encontrado vai para as pendências.

### C12 — Espias (E-6189) sem comprimento; um único código genérico
- **Onde:** catálogo `E-6189 A` (14B ×1), `E-6189 B` (14C ×1). A linha do caderno "E-6189 A 9.15/Ø24/J1" só é usada para extrair a aplicação.
- **O que está errado:** A espia compra-se por comprimento (o manual tem 14B1…14B10). O programa soma "14B ×49" sem comprimento e sem código novo.
- **Prova:** Postes novos: 42 × 9,15 m, 6 × 10,25 m, 1 × 8,7 m (Ø24/J1) e 1 × 10,25 m Ø30/J2, tudo somado como "14B 49" + "14C 1". O C-1607 A tem o comprimento 7,45 m escrito à mão na lista confirmada; hoje está certo para os 4 postes, mas não vem do caderno.
- **Correção sugerida:** Ler comprimento/Ø/J da linha do caderno (como já se faz para o cabo XAV) e somar em metros por tipo de espia.

### C13 — Códigos de peça que não são códigos (colados, com texto ou números SAP sem ficha)
- **Onde:** `BOM_PROJETO_CONFIRMADO` e catálogo.
- **O que está errado:** Linhas que não ligam a nenhum material nem código novo, por isso não se podem encomendar nem cruzar com o stock.
- **Prova:** `'172A/B'` (EC-278 I/II, 23 postes; 172A e 172B são peças diferentes e a ref diz 02.112.02). `'14B (7,45 m)'` (C-1607 A, 4). `'1 1/4"sm'` (C-12136 IIa, 9 postes; qtd 2,5 sai como "22,5" unidades, sem "m"). `'CAIXA BT'`. 31 linhas das listas confirmadas usam números SAP (75184160, 33144677, …) como código, sem ficha de material. 24 linhas do catálogo têm espaços no código (por exemplo E-6189 C/D "14 C"). Ver tabela T2.
- **Correção sugerida:** Usar sempre o código antigo do manual (ou o código novo) e ligar `mat`. Separar 172A/172B. Pôr os tubos em metros.

### C14 — Cotas da consola gravadas com as letras erradas (H,D,S,E guardados como F,A,C,B)
- **Onde:** `postes[].consolas.*.cotas`; são mostradas em `abrirFichaPoste` e `mostrarPosteProjetoCompleto` (l. 4829).
- **O que está errado:** Em muitas consolas, os valores de H, D, S e E ficaram nas chaves F, A, C e B, e os F, A, C, B reais perderam-se. A ficha mostra medidas trocadas.
- **Prova:** 04-26: dados `{F:5.5, A:-0.2, C:-0.2, B:1.4}`, mas a leitura do PDF escrita no próprio código dá "H = 5,5 · D = -0,2 · S = -0,2 · E = 1,4 · F = 0,025 · A = 1,6 · C = 1,082 · B = 0,38". 249 consolas só têm {F,A,C,B}; em 159 delas F > 2 m, o que só pode ser H mal rotulado. Não afeta quantidades.
- **Correção sugerida:** Voltar a extrair as cotas do caderno com as 8 colunas.

### C15 — Postes existentes sem isolamento: consola contada com o KL nominal
- **Onde:** `comprimentoConsola` (l. 3001) quando `p.isolamento` está vazio.
- **Prova:** Nenhum dos 130 postes existentes tem `isolamento`. 38 consolas E-6182 em 36 existentes ficam com o KL em vez de K3/K4 → +19,28 m de tubo (vista "Todos" ou "Existentes"). O aviso aparece nas pendências. Nos postes com isolamento, o K do caderno bate com KL−472/565 mm a menos de 8 mm, portanto a fórmula está certa.
- **Correção sugerida:** Preencher `isolamento` nos existentes (toda a obra é ZT) ou usar ZT por defeito, como já faz `isoladorDaZona`.

### C16 — Ficha do material 513 descreve a ponteira (516)
- **Onde:** `materiais` M453: `codigo:'513', desc:'PONTEIRA PARA TUBO 19 X 26…', ref:'05.300.09', sap:4026519` (7 movimentos). M967 `codigo:'516', desc:'#N/A'`.
- **O que está errado:** No E-6181, 513 = articulação do tirante (05.300.07) e 516 = ponteira (05.300.09). O stock/SAP da ponteira está na ficha 513, e o catálogo liga a "Articulação do tirante" a essa ficha em 14 listas (223 aplicações de E-6181 Tc).
- **Correção sugerida:** Confirmar no SAP qual peça é 4026519 e corrigir codigo/desc das fichas 513/516 (sem mexer nos movimentos antes de confirmar).

### C17 — Isolador do tirante E-6181 Tc: duas fontes do programa dizem coisas diferentes
- **Onde:** Lista confirmada 'E-6181 TC' → 65 (Isolador 5T ZT, igual ao desenho rev. C). A lista do catálogo 'E-6181 TC' tem 60 com a nota "Isolador sintético p/ tirante (substituiu 65 conforme uso real)".
- **Prova:** 229 × 65 nos totais novos. A nota do catálogo diz que na prática se monta o 60.
- **Correção sugerida:** Perguntar ao Rui qual isolador se compra e retirar a nota que não se aplica.

### C18 — A ficha do poste mostra peças diferentes das que entram no total
- **Onde:** `detalheBOMProjeto` (l. 4733) em comparação com `dadosBOMProjeto` (l. 2948).
- **O que está errado:** A ficha não faz a troca de isolador ZM→ZT, a troca do EC-233, a regra do postalete E-7171/EC-127 nem o corte "-I/-II" do E-6180, e não prefere a cópia com peças. A linha "Abaixamento do CS" chama `C-3410` com aplicação "—".
- **Prova:** 23 aplicações em postes novos mostram isoladores ZM (70/68) na ficha (C-1474 IIIB 12, E-7171 CN2 3, C-1604 I 2, …), mas o total usa 67/65 ZT. `detalheBOMProjeto('C-3410','—')` → "Aplicação não encontrada", enquanto o total usa 'C-3410 40X49' (4 consolas).
- **Correção sugerida:** Fazer a ficha usar `dadosBOMProjeto` e aplicar as mesmas trocas numa função comum.

### C19 — Exportação CSV dos totais com números mal formatados
- **Onde:** `exportarMateriaisTotaisProjeto` l. 1946 (`x.qtd` em bruto).
- **Prova:** 10A sai "537.9699999999998" (vírgula flutuante sem arredondar e ponto decimal num CSV com ";" para Excel PT).
- **Correção sugerida:** Arredondar e escrever com vírgula decimal (`toLocaleString('pt-PT',{useGrouping:false})`).

### C20 — Unidades dos cabos não aparecem (metros ou unidades?)
- **Onde:** `ehTuboMaterial` só marca tubos com "m"; os cabos das listas saem sem unidade.
- **Prova:** Totais novos: 9P 1047, 9U2 131, 9U1 71, 9Q 92, 9S 19, 9G 5 (todos "sem un"). As listas usam 1,5 / 5 / 20 para cabo.
- **Correção sugerida:** Marcar os cabos (código 9x) como metros, ou mostrar a unidade da ficha.

---

## BAIXA

### C21 — Projeto mostra valores inventados por defeito
`mostrarPosteProjetoCompleto` (l. 4809–4812) mostra "CF = 0" quando o poste não tem CF (241 postes) e "NIV = -0,85" quando falta. Mostra "X/K = Por transcrever" porque procura `p.x`/`p.k`, que não existem, embora o texto da furação traga "X=1.05 K=0.45". No braço de apoio, bracoL/bracoS aparecem rotulados "KL =" e "K =" (l. 4827). **Correção:** mostrar "—" quando falta; ler X/K de `furacao`; rotular L/S.

### C22 — Pendências com "ruído" na vista "Todos"
Os códigos DESMxx (54) e RENUM01 (75) aparecem como "Desenho/aplicação não localizado". **Correção:** filtrá-los como já se faz para FUR/PENDULAGEM.

### C23 — Troca ZM→ZT falha em silêncio para 69 e 72
`isoladorDaZona` (l. 3098) só troca se existir ficha do equivalente ZT. Não há ficha 66 nem 71, por isso 03.102.02/04 ficariam ZM sem aviso. Hoje nenhuma lista usada as tem. **Correção:** avisar nas pendências.

### C24 — Troca do EC-233 com o nome errado
Em `dadosResumoPecasPoste` (l. ~3150), o 522 é escrito "Aperta tubo com olhal (24x32)", mas 522 = 05.301.07 = tubo 30x38 (E-6182). O código está certo, o nome não (1 poste, 50-36A).

### C25 — Código novo de 17D/17C diferente entre desenho e manual
O E-6182 rev. C (ref.ª 12/13) dá 04.212.40 / 04.212.30; `CODIGOS_NOVOS_IP` dá 04.201.07 / 04.201.06. O programa mostra o do manual. Confirmar qual vale.

### C26 — E-6169 SFI-A/STI-A com cabo em "1 unidade"
A lista confirmada tem 9H ×1, 9G ×1 e 9F ×1. O cabo deve ser qb/metros. Só aparece nas folhas dos pórticos.

### C27 — Folhas dos pórticos com referências não encontradas
EC-223 Nb (64-29_30 e 64-31_32) "não existe no catálogo". E-7171 CN (64-13_14) "aplicação não encontrada" (o catálogo tem CN2). EC-216 e C-160 no vão aparecem sem peças.

### C28 — Defeitos estruturais no catálogo sem uso atual
Ver tabela T1 (duplicados, quantidade 0, E-6183 H com 536A em vez de 536B, E-6181 MA2 em duplicado, etc.).

---

## Tabelas

### T1 — Catálogo (json.montagens): contagens
| Verificação | Resultado |
|---|---|
| Linhas com `mat` inexistente | 0 |
| Linhas sem `cod` e sem `mat` | 0 |
| `cod` sem material com esse codigo (liga por `mat` a ficha com código SAP) | 58 (514A→4027093, 531B→4036938, 531C→4026445, 511→4026517); uso relevante: E-6161 IA 131, C-3393 IIA 14 |
| `mat.codigo` ≠ `cod` | 72 (os mesmos 4 códigos acima) + E-6181 SC 171/M4214 (C7) |
| Nome contraditório com a ficha | 2 reais: E-6181 SC #1 (C7); 513 "Articulação" ↔ ficha "Ponteira" em 14 listas (C16). Os restantes 66 são "Ferro U" vs "Perfil U" (mesma peça) |
| Quantidade 0 | 6: E-6152 I (10A), E-6152 II (10G), C-1474-III (734B), TRANSVERSAL GAIA (557A), E-6182 SA (280), E-6182 SB (280; 3 usos) |
| Linhas qb | 14 (tubos das consolas/tirantes, cabo 9C/9G); os tubos são substituídos pelos metros do caderno |
| Códigos colados/compostos | 11: C-884 II-e "67/70" e "C884-n", EC-255 "EC 255-1/2", C-12136 IIA/IIB "1 1/4"sm"/"1 1/2"sm"; nenhum com várias peças coladas como o caso '501A+501C…' já corrigido |
| Códigos com espaço | 24 (E-6189 C/D "14 C", C-715 IIC "C-715 18", EC 290/241/265/275/306…) |
| Desenho usado como peça (catálogo) | 12 (C-715 IIC, EC-138 E-3595, E-3306 C-1068, EC-279, EC-281); nenhum usado por postes novos |
| Montagens duplicadas (código canónico) | 3: C-3393 IID ×2 (listas diferentes 19/20 linhas), E-6181-MA2 vs E-6181 Ma2 (diferentes), E-7555-F vs E-7555 F (ambas vazias); uso 0 |
| Montagens vazias | 40; a única usada (EC-237-IA, 9 postes) tem lista confirmada |
| E-6183 H (Caide) | 536A; desenho rev. D coluna H = 536B (uso 0) |

### T2 — BOM_PROJETO_CONFIRMADO: diferenças com o Caide e linhas problemáticas
| Lista | Diferença com o catálogo Caide / problema |
|---|---|
| E-6182 TA | confirmado 465 e 442 ×1; Caide 280 e 442 ×2 (confirmado = desenho; ver C6 para sem pêndulo) |
| E-6183 E | confirmado 442 ×2 + 10C qb; Caide 442 ×1 (confirmado = desenho rev. D) |
| E-6181 TC | confirmado 65; Caide 60 "conforme uso real" (C17) |
| E-6188 I | 9C qb vs 2 |
| C-1607 A | confirmado tem porcas/parafusos M20/M22/M30 sem código e '14B (7,45 m)'; Caide tem 16F4 ×4, 16G, 16H, 14B |
| EC-219 IA | confirmado 9 linhas "—" (com código novo na ref) e "Tubo guia"→10H 5 m; Caide 10H, 111A, 1113A ×2, 115A, 16F6 ×4, 16D24 |
| E-3214 I-B | 9 submontagens como peça + 1 "—" (C3/C4) |
| EC-237 IA | 7 submontagens + 2 "—" (C3/C4) |
| EC-286 | 4 linhas "—" (C3) |
| C-12136 IA | EC-326 como peça; 10 códigos SAP sem ficha |
| EC-278 I/II | '172A/B'; EC-281/EC-265 como peça |
| E-6179 IIA, E-6166 I, E-6161 IA | referências divergentes já assinaladas pelo autor no nome ("confirmar") |

### T3 — Verificação contra os PDF normativos (tabela reconstruída por coordenadas)
| Desenho / montagem | Postes novos | Resultado |
|---|---|---|
| E-6184 rev. H — X | 181 (211 apl.) | Montagem X retirada do desenho (C5); I e II coincidem com o catálogo |
| E-6183 rev. D — E / F | 142 / 45 | E confirmado = desenho; F Caide = desenho (só 10F ×1 em vez de qb, substituído pelos metros) |
| E-6181 rev. C — Tc / Sc | 176 / 6 | Tc confirmado = desenho; Sc: 171 em vez de 17I (C7) |
| E-6182 rev. C — Ta / Tb / Sb | 98 / 33 / 3 | Ta = desenho (exceto sem pêndulo); Tb e Sb errados (C6) |
| E-6188 rev. E — I | 179 | confirmado = desenho |
| E-6177 rev. I — TL / TRLA / TRLB / TLT | 144 / 52 / 1 / 20 | TL, TRLA, TRLB certos; TLT errado (C9) |

---

## Verificado e sem erro
- Postes: nenhum código ou id duplicado; estados só novo/existente/desmontar (207/130/111).
- Nenhum TL<TT nem KL<K. Não falta TL/TT/KL/K onde há tubo. TL−TT entre 850 e 860 mm em todos os tirantes simples.
- Dimensões dos tubos coerentes em todas as consolas simples: E-6181 = 19x26; E-6182 Ta = 30x38, Tb/Sb = 40x49; C-9058 SPA = 40x49; E-6183 E = 24x32 e F = 34x42 (tipo do antibalançante).
- Fórmulas de corte: o K do caderno bate com KL−472 (Ta ZT), KL−565 (Tb ZT) e KL−580 (Sb sintético) a menos de 8 mm; C-9058 sintético KL−538 dá 3,31 = K. As regras de metros (TT, K3/K4, L, E-6213 L−50, E-6185, EC-234, braço de apoio S, tubo guia 5 m) estão coerentes com os comentários e com os dados.
- Troca de isolador ZM→ZT: nos totais novos não fica nenhum 03.102.xx; os 6 postes sintéticos recebem 60/61/62 e nenhum 65/67.
- Nenhuma mistura de tubo em unidades com tubo em metros no mesmo poste; o tubo não é contado a dobrar com o caderno.
- 0 referências pendentes nos postes novos (todas as refs têm lista), exceto o que está descrito em C1/C4.
- Resolução de montagens: das 96 referências distintas dos postes novos, só 5 usam caminhos alternativos (4 canónicos por hífen, corretos; 1 `endsWith`, C11).
- A linha 'E-6182 TA' com a pinça (501A+501C+501D+17D+17C+442+296B+465+19F) está bem separada em 9 linhas e coincide com a ref.ª 12 do desenho.
- A procura das 26 chaves de `BOM_PROJETO_CONFIRMADO` funciona (não há chaves inalcançáveis pelo formato do caderno).
- E-6187 e E-6179: os PDF atuais não têm a tabela em texto (vetorial/digitalizada); não foi possível confirmar as quantidades e não se reporta nada.

Scripts de prova (descartáveis): `…\scratchpad\revisao\harness.js`, `a_refs.js`, `b_pend.js`, `c_catalog.js` (+ `c_catalog.out.txt`), `d_nomes.js`, `e_postes.js` (+ `e_postes.out.txt`), `pdfxy.mjs` (+ `pdf_61xx.txt`).
