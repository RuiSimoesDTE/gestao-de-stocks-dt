# Por fazer — Gestão de Materiais de Catenária

Atualizado em **18/09/2026** (criado a 28/08/2026). Lista do que ficou em aberto depois da
revisão dos desenhos normativos, da conferência dos cadernos de montagem, da auditoria aos dados,
das guias AT de setembro e das importações SAP de 10/09 e 17/09.

---

## 1. À espera de documentos ou de uma decisão do Rui

### 1.1 Designações das peças — 155 por identificar
Dos 987 códigos do Manual de Peças de Catenária da IP (GR.MN.CAT.003 v.01), **155 continuam
sem nome** (eram 396 antes da segunda leitura dos desenhos, a 28/08). O PDF que temos é só o anexo da correspondência de códigos: não traz descrições.

Tentativa já feita: li **566 desenhos** da biblioteca do OneDrive e extraí 409 designações
(estão no programa, na tabela `NOMES_PECAS_DESENHOS`). Só acrescentaram 2 nomes novos —
os restantes já eram conhecidos. Dos 987 códigos, o leitor só apanha 474; os outros 513 não
aparecem em formato legível, porque nem todos os desenhos usam a coluna "Cód. XXX".

**Precisa-se:** as páginas do manual com as designações **ou** autorização para melhorar o
leitor de tabelas dos desenhos (algumas horas, sem garantia).

### 1.2 Preços — ✅ feito a 17/09/2026
Preço unitário (preço líquido ÷ unidade de preço) do EXPORT SAP de 17/09 em **701 linhas de encomenda** e em **874 fichas** (a compra mais recente; as fichas antigas com o mesmo código SAP herdam o preço). O programa mostra preço e valor no Stock, nas Encomendas, na ficha e no painel (valor do stock ≈ 1,01 M€ — calculado sobre o stock do programa, que ainda tem as diferenças da secção 1.7c). Ficam **310 materiais com stock sem preço** (271 sem código SAP — vêm do Mapa de Stock antigo). O importador CSV aceita a coluna `preco`.

### 1.3 Encomendas órfãs — ✅ resolvido a 17/09/2026
Eram parte das 204 linhas da primeira importação SAP (sem número de item). Os 30 PCs estão completos nas linhas certas, por isso as 204 foram **arquivadas** em `encomendas_substituidas_20260917.json`. Movimentos órfãos: mvM3990 (82 meias pinças) repetia a entrada mv4514 da M403 — arquivado; mv3927 (9 un, doc SAP 5001822117) passou para a cantoneira 125F (M4251).

### 1.4 Peça 662 — ✅ resolvido a 17/09/2026
Confirmado pelo Rui: é a mesma peça. Fica só a M177 (código novo 05.100.13); os movimentos da M4041 passaram para a M177.

### 1.5 Movimentos incompletos
- **Sem data:** `mv4419`, `mv4420`, `mv4421` — entradas de cabo Bz 12mm², Bz 25mm² e Cu 95mm².
- **Com quantidade zero:** `mv4074`, `mv4075` — meia garra p/ FC e p/ cabo de suporte, 13/11/2025.

Não se inventam datas nem quantidades.

### 1.5b Cadernos × programa — conferência de 17/09/2026

Todos os 448 postes têm página nos cadernos (301_03 a 306_05_NOVO) e foram lidos. **364 iguais** (os 111 a desmontar todos certos). **84 com diferenças** — lista em `relatorio_cadernos_vs_programa_20260917.csv`:
- **55 postes com duas consolas — dados incompletos** (é onde tínhamos parado): fixações E-6180 TA-II/CA-II gravadas como TA/CA, tubos das consolas (E-6182 Ta/Tb) e medidas KL/K em falta ou copiados do tirante, antibalançantes misturados entre consolas.
- **11 postes com o E-6190 contado duas vezes** (gravado como fixação do tirante e nos outros equipamentos) — nos 5 novos (19-22A, 26-19A, 27-47, 64-09, 64-45B) as peças do suporte entram a dobrar nos Materiais Totais.
- **6 postes sem o feeder** (E-7171 CN2/CE2/CB2 + postalete EC-127): 64-03, 64-04, 64-05, 64-10, 64-16, 65-10A.
- **4 sem a alonga E-6162** (06-20, 06-29, 06-31, 64-39) e **4 sem o abaixamento C-3410** (15-07, 15-08, 20-07, 20-08).
- **31-02**: falta a consola inteira; **50-36A**: montagem especial (E-6162 IIIa6, C-9058 SPA, C-2908 IAA2, EC-234 SA, E-6187 B) em falta.
- 2 sem diferença real (EC-237 com "1").
Os Materiais Totais contam por omissão só os 207 postes novos; os 75 existentes com montagens novas estão na opção "existente" do filtro (189 linhas, 79 pendências).

**Feito em 17/09/2026:** lote 1 (E-6190 e feeder) e lote 2 (alonga, abaixamento, 31-02, 50-36A) — relatórios em `relatorios/`. Materiais Totais novos: 294 → 307 → 317 linhas, 0 pendências. **Falta o lote 3** (55 postes de duas consolas).

**Por confirmar com o Rui (lote 2):**
- **E-6182 TA — corrigido a 18/09:** a pinça está separada nas 9 peças do E-6182 rev. C. Falta o Rui confirmar: 1 ou 2 parafusos 442 por pinça; e, no TB (33 postes novos), esquadro 465 ou anilha 280.
- **50-36A:** o caderno diz antibalançante 40x49 EC-234 SA; no desenho, o Sa é de 24x32. Foram contados 3,79 m de 24x32 — falta confirmar.
- **Ficha 483 (M188) — corrigida a 18/09:** a descrição passou a "Manga interior p/ tubo 24x32" (SAP 4032237 + EC-234); a ficha repetida da importação SAP saiu.

### 1.6 Poste 50-36A sem medidas
**Resolvido em 17/09/2026 (lote 2)**, com a consola completa do caderno 305_03, página 74.

---

### 1.7 Importação SAP de 10/09/2026 — ficou por decidir

Registado: 22 entradas, 21 saídas (Azevedo), 23 linhas de encomenda novas. Não mexido, porque o programa e o SAP não batem e não se adivinha qual está certo:

- **Pinça de suspensão do CdTA** (PC 4500855444/140): o SAP dá 281 recebidas; o programa tem 81 entradas (na M106) e a encomenda diz 154.
- **Transformador de tensão** (PC 4500851872/10): o SAP dá 21 recebidos; a encomenda diz 20, mas a ficha M3153 não tem nenhuma entrada.
- **Corda nylon** (PC 4500875905/10): o SAP dá 1,65 kg recebidos; o programa tem 2.
- **Farprotec e Azevedo — ✅ saída total feita a 17/09** (10 fichas: capacetes, coletes, discos, folhas, facas, buchas, spray, brocas SDS, tesoura). Entram no mapa de consumos de setembro.
- **Por receber:** 13 caixas de coluna 250A (Potauco), 100 m de tubo PEAD (Inoxtubo). A broca HSS e os 21 PFIB chegaram (export de 17/09).

### 1.7b Importação SAP de 17/09/2026

Registado: broca HSS (Azevedo, entra e sai), 21 conj. PFIB (Caiado), 7 linhas de encomenda novas (M.Rocha PC 4500891725 e EIP PC 4500891582, por receber). Não mexido:
- **La Farga, PC 4500857392** (bronze 65 e 12, fio de contacto, bronze 10, cobre 95): o SAP passou a dar **tudo por receber**; no programa estava tudo recebido. Perceber no SAP o que aconteceu (estorno? outro PC?).
- **Cantoneira 60×60×6 L=405** (SAP 4032272, M.Rocha): o texto SAP vem cortado ("(Código…") e há várias fichas L=405 — ficou com ficha nova; confirmar o código interno.
- **Portes da Jobasi** (PC 4500877501/30): não é material.

### 1.7c Reconciliação de stock SAP × programa a 31/08/2026

`mapas_mensais/Reconciliacao_SAP_vs_Programa_31_08_2026.csv`. De 420 códigos: 145 iguais, 181 com mais no programa, 94 com menos, e 104 fichas com stock que o SAP não tem. Pelas compras (export de 17/09): **132 diferenças são só de entradas** (96 entradas a mais no programa — duplicados Mapa de Stock + SAP; 36 entradas em falta — ex.: garras 638/639 −5.600 cada, terminais 640 −3.940, manga termo −1.560, grifes 343 −542). As outras 143 envolvem material que não veio por compra (Pampilhosa, Sacyr, stock inicial) ou consumos anteriores a maio. **Próximo passo:** acertar primeiro as 132, código a código, com a lista aprovada pelo Rui.

### 1.8 Guias — saídas e devoluções por fechar

- **GT 3203** (Monte da Barca → Pampilhosa, 09/09/2026): **saídas registadas em 10/09** (20 linhas, tubos em metros), com 6 entradas fictícias autorizadas (contrapesos 564 ×18 e 565 ×7; perno M18 ×21, bobine de feeder, bobine CDTA 5.010 m e 2 bobines vazias, estas com ficha criada a partir da guia). A confirmar: se o CDTA é o cabo alumínio-aço **9U** (6.682 m em stock) e se as bobines vazias são as de madeira A18/A6 (M4480/M4481) — nesse caso trocam-se as fichas provisórias. A receção do lado da Pampilhosa (IC-0018) não foi registada, como nas transferências anteriores exceto a 2979.
- **GT 3188** (Lavre → Monte da Barca): 3 postes devolvidos — faltam os números.
- **GT 3196** (Vidigal → Monte da Barca): 2 postes + 2 conjuntos de contrapeso — faltam os números/tipos.
- **Poste HEA 180 c/10,4 m**: o 49-20 saiu com entrada fictícia autorizada; há mais 3 no projeto (27-43, 40-20, 51-02) e esse tipo nunca foi comprado. Confirmar no SAP ou no caderno.
- **GT 3202** (09/09, Monte da Barca → Pampilhosa): quase igual à 3203, 23 minutos antes — foi anulada na AT? Não está no programa. Diz que o perno é o **489 – 18I** (há 164 18I em stock): se for, a entrada fictícia de 21 pernos M18 da 3203 não era precisa.
- **GT 3246** (10/09, → Jobasi, Adaúfe): 92 ligadores bimetálicos — parece devolução dos 92 do PC 4500853867 (ficha 4037050). Se for, dar saída como devolução.
- **GT 3245** (10/09, → Ermesinde): 30 ferragens, 29 mangas 546/546A, 50 m cabo de suporte — que obra é Ermesinde? Sem saídas registadas.
- **GT 3270** (15/09, Coimbra → Monte da Barca): 4 cordas Y, 1 corda I, 1 arnês, parka, botas, multímetro — regresso de material da 2979? Só guia, sem entrada.
- **GT 3274** (16/09, → Vidigal) e **3193/3196**: só guia; material genérico ("isoladores", "ferragens").
- **Remessa da Pampilhosa em duplicado?** As mesmas 9 linhas entraram a 12/06 (sem guia) e a 15/06 (com a GT 2127, cujo PDF é outro transporte). Chegou uma vez ou duas? Se foi uma, anular as de 15/06 e acertar as garras 638/639 da 3203.
- **Tabela das guias com origem/destino trocados:** ~35 linhas antigas (do tempo do Codex) estão ao contrário do PDF. Corrigidas só as 5 do Entroncamento.
- **Guia CDTA / bobines vazias** (3203): ver acima.
- **GT 3328 e 3329 (18/09, arquivadas a 21/09, sem movimentos):** 3328 leva 1.400 m de bobine de fio de contacto do Monte da Barca para o Vidigal; 3329 traz de volta 1.300 m de **fio de contacto velho** (transporte a 20/09). A confirmar com o Rui: se a saída dos 1.400 m é consumo (e se é o 9S, ficha M570, que tem o resto por lançar no mapa — ver 1.10) e se o fio velho volta ao stock como sucata, em ficha própria.
- **GT 3550 (07/10, arquivada a 07/10, sem movimentos):** Monte da Barca → antigas instalações da estação de Agolada (Coruche), matrícula CF-75-QX, 10 consolas, 2 isoladores, 1 caixa de comando, 1 seccionador, 10 diversas ferragens. **O Rui mandou ficar só com a guia:** sem saídas nem entradas.
- **GT 3350 (23/09, arquivada a 24/09, sem movimentos):** Monte da Barca → Parque Empresarial do Entroncamento, 6 postes de catenária e 3 paletes de cobre (transporte 24/09, matrícula 81-XI-45). **O Rui mandou ficar só com a guia** (24/09): sem saídas nem entradas no stock.
- **GT 3383 (24/09, arquivada a 24/09, sem movimentos):** DST Seixal → Monte da Barca, **entrada** de 1.376 m de cabo Bz 65 mm² e 1.370 m de cabo Cu 107 mm² (matrícula 81-XI-45). A confirmar com o Rui se dá entrada no stock: o Bz 65 é a ficha 9G (M575); o Cu 107 não tem ficha no programa (há 9Q, condutor Cu 12 mm²).

### 1.9 Encomendas antigas duplicadas — ✅ resolvido a 17/09/2026 (ver 1.3). Ficam 47 encomendas por concluir, todas reais.

### 1.10 Mapas de consumos SAP

- **Julho** (`Desktop/Consumos_IC0019/IC-0019 Consumos 31_07_2026.xlsx`, 24/08): 74 linhas lançadas, cobre as saídas até 24/08 — inclui as 2 chaves CB6 do PC 4500886473, o filme 5003256 (12) e a fita 4049802 (2).
- **Agosto** (`mapas_mensais/IC-0019_Consumos_31_08_2026_LINHAS_A_PREENCHER.csv`, entregue a 17/09): 10 linhas, 72 unidades; o Rui preenche à mão.
- **Setembro — atenção:** NÃO lançar as 2 etiquetas 5003096 que saíram a 10/09 (já iam no mapa de julho). Lançar as 5 chaves 4019688 do PC 4500882423 (saída 10/09), os 11 postes para Lavre (07/09), as 3 espias para o Vidigal (08/09), os consumos de 07/09 e o restante Azevedo/Equifermaq de 10/09. A guia 3203 (Pampilhosa) é transferência e não entra.
- **Mapa lançado a 17/09** (`mapas_mensais/IC-0019_Consumos_31_08_2026_LANCADO_20260917.xlsx`, 61 linhas): o programa foi posto igual (37 saídas + entrada da bobine A12). **Por confirmar**, porque o SAP difere da folha em papel de 16/09: 537 lançado 42 (folha 9; os 33 a mais podem ser as 42 peças 540A, que não foram lançadas); 62 lançado 3 (folha 30); 9G lançado 1.421 m (folha 117 m — 1.304 m sem origem); 9S lançado 373 m (sem folha).
- **Fio de contacto 9S (SAP 4026592) — guardar para o próximo mapa (pedido do Rui a 17/09):** no mapa de 31/08 só se lançaram **373 m**, porque era todo o stock do SAP. O programa ainda tem **1.720 m** de 9S (ficha M570); o SAP ficou a 0. O resto dá-se no mapa seguinte, quando o SAP voltar a ter fio de contacto (o PC 4500857392 da La Farga, 17.150 m, aparece agora como não recebido). Histórico: stock inicial 2.473 m; o SAP já lançou 380 (maio) + 380 (junho) + 1.340 (julho) + 373 (agosto) = 2.473 m; o programa só tem 380 (09/06, Vidigal — corrigido de 970 por instrução) + 373 (17/09) = 753 m. **Confirmar com o Rui a quantidade a dar** (os 1.720 m ou outra).
- **Grifes 343 (SAP 4037051) — lançar no mapa de setembro 27:** as 18 que saíram em abril (nunca lançadas; o SAP ainda tem as 542) e as 9 das montagens N3 de 16/09. A entrada das 542 do PC 4500855444/30 foi registada a 17/09 e o acerto de +18 de 28/08 foi anulado; stock no programa 515.
- **Acertos com o SAP feitos a 17/09** (ajuste, não consumo): arame M2561 −50 (entrada de 17/03 em duplicado), cadeados M2621 −11, chaves Iseo M4004 −18, extensões Sady M3110 −15.

## 1.11 Revisão total de 18/09/2026 — o que ficou por fazer

Relatórios: `relatorios/Relatorio_revisao_total_20260918.html` (os 72 erros) e `relatorios/Relatorio_correcoes_revisao_20260918.html` (o que foi corrigido, cerca de 55). Os números # abaixo são os do relatório da revisão.

**À espera do Rui (não mexer em stock sem confirmação):**
- #34 EIP PC 4500851945 entrou duas vezes (17/06 guia + 24/06 SAP), ≈1 414 un.; a 731A (M4064) ficaria em −2.
- #35 Senttro PC 4500864211 (maio + junho).
- #36 Sacyr: mapa de 25/05 e compras (5 materiais); a PC 4500872735 foi anulada?
- #37 Postes 50-16, 64-19 e 64-25 com duas saídas.
- #39 Manga termo GMW 22/6 em duas fichas. **Não fazer o acerto "−1 560" (1.7c) na ficha MTR0001.**
- #42 Válvula mv4083/4084 e autocolante mv4143/4144; 17 grupos iguais do Mapa de Stock.
- #46 26 entradas sem documento.
- #26 Fichas repetidas por aprovar: 24 com stock nas duas fichas, 8 com várias candidatas, 32 com o mesmo SAP para produtos diferentes; e os 3 acertos fictícios de 28/08 (465, 113A, 111A).
- #41 9 linhas diferentes do EXPORT de 17/09; os HEA 180 c/10,4 estão ligados à ficha do HEA 200.
- #47 5 fichas "#N/A" do Equifermaq.
- ~~#48 EC-219 IIIA~~ — **resolvido a 24/09**: o EC-219 rev. C não tem cabo de aço inox (o "Aço Inox" da tabela é a parafusaria da cinta dos tubos guia). A lista ficou com 21 linhas, com o tubo guia 10H ×2.
- ~~#53 E-6184 X~~ — **resolvido a 24/09** pela lista de material final da obra: a peça é o **643 "Braço de chamada normal (LP10 e LP12)"**, 248 un. previstas. Só a descrição estava errada (dizia LP5); a peça é a mesma. Fica por saber que montagem do E-6184 rev. H substitui a X, mas isso não muda material.
- ~~#54 Pinça: 442~~ — **resolvido a 24/09**: a transcrição da obra (E-6182_C.xlsx) dá **2** parafusos 442 e o esquadro **465 em todas as montagens** (retirada a troca pela anilha 280).
- ~~#64 SAP 4026519~~ — **resolvido a 24/09**: é a **articulação do tirante da consola** (assim vem na encomenda 4500854997, item 80). A ficha 513 ficou corrigida; a ponteira é a 516.
- ~~#65 Isolador do tirante~~ — **em parte resolvido a 24/09**: pela transcrição da obra, a montagem **Tc leva o 65 (cerâmico) e a Sc o 60 (sintético)** — depende do isolamento do poste. O catálogo foi corrigido. **Falta decidir** (ver abaixo) se na prática se montam sintéticos em todo o lado.
- 50-36A: antibalançante 24x32 ou 40x49?
- #50 O material novo dos existentes entra na compra?
- #17 Receções do lado da Pampilhosa?

**Decisão nova (24/09), vinda da pasta da obra:** a lista de material final (`03_DPROD/05_Preparacoes/02_Catenaria/3_Material/0_Lista de material final.xlsx`) compra **isoladores sintéticos**: 60 ×322, 61 ×280 e articulação 480 ×282, contra só 40 do 513 e 40 do 67, e 0 do 65 (há 142 ZM + 51 ZT em stock do cliente). Os cadernos, esses, dão montagens cerâmicas (Ta/Tb/Tc) na maioria dos postes. **Perguntar ao Rui se os postes estão a ser montados com isoladores sintéticos**; se sim, os Materiais Totais devem passar essas montagens de T para S (65→60, 67→61, 513→480). Cópia da lista da obra em `relatorios/lista_material_final_obra_20260924.json`.

**Trabalho próprio a fazer:**
- 39 pendências de submontagens: EC-344 e EC-388 (montagem a ver no caderno) e EC-326 (transcrever a lista).
- Pórticos nos Materiais Totais (por agora só há um aviso).
- Cotas das consolas com as letras trocadas (junto com o lote 3).
- 27 saídas registadas antes da entrada.
- Códigos que não são códigos ("172A/B", "14B (7,45 m)", "1 1/4"sm", números SAP sem ficha).
- Tubos contados como "1 peça de comprimento L"; código novo do 17D/17C.

## 1.12 Trabalho feito no Codex a 24/09 e portado a 02/10/2026

O Codex trabalhou numa cópia própria (`Documents\Codex\2026-09-24\...\chatgpt site\dist\index.html`, versão das 15h53) e o que lá se fez não tinha vindo para o programa principal. **Portado a 02/10** (backup `gestao_armazem_catenaria_backup_antes_portar_codex_20261002.html`):
- **Menu lateral em acordeão:** Projeto, Armazém e Gestão são clicáveis, abrem e fecham cada um à parte, podem ficar os três abertos, o estado fica guardado. (Acrescentado: ao ir para uma área de um grupo fechado, o grupo abre-se sozinho; com o menu encolhido mostram-se todos os ícones.)
- **Ficha do poste:** perfis (HE220B), maciços (1Ft) e tipos de isolamento já não aparecem como "desenho não encontrado".
- **Definições → Utilizadores e acessos:** cartão com o utilizador inicial Rui Simões (administrador máximo) e `access-config.json` com os perfis (administrador máximo, gestor, operador, consulta). **Ainda é só a preparação:** não há login real — precisa do serviço central.
- Não portado de propósito: ferramentas "WebMCP" (só servem ao navegador do ChatGPT) e a versão antiga da correção do email (a atual é a nova, com Outlook Web).

**Pendências novas apontadas pelo Codex** (as outras já estavam nesta lista):
- Montagens antigas **E-6184 X e XI** (224 postes; a XI em 4): existem na revisão histórica E, não na atual H.
- **E-6188:** comparar as variantes antigas (LP4/LP5) com as atuais (I/II/III) — as peças ainda não foram comparadas.
- **EC-135** aparece como anulado: descobrir o desenho que o substitui.
- **C-1604:** só há uma cópia em "Não enviado"; falta fonte oficial.
- Confirmar os desenhos aplicáveis às montagens antigas **antes** de permitir saídas de stock desses postes.
- Rever as restantes famílias com versão antiga e atual.

**Pedidos feitos ao Codex e ainda sem solução:**
- **Pasta partilhada com gravação central:** guardar os dados numa pasta partilhada, com alerta "alguém está a mexer" e "última gravação às X horas", para a atualização servir a todos. (Hoje cada pessoa tem a sua cópia no navegador. O botão de backup e o aviso de dois separadores já existem, mas só dentro do mesmo computador.)
- **Níveis de utilizador** a sério (só existe o cartão).
- **SAP Logon 64:** ligação direta não é possível só com o ficheiro; o caminho é por exportações (EXPORT_*.xlsx) ou serviço intermédio.

**Dados que só existem no navegador do Rui (backup de 01/10/2026, 15h34):** a obra da Pampilhosa tem **11 receções** das transferências GT 1320, 1844, 2462, 2827 e 2829 (`trfobra-entrada-...`) e uma lista `transferencias_obras`. Isto **não está** no HTML nem no `dados_armazem_catenaria.json`. O programa preserva-os, mas se o navegador for limpo ou se mudar de origem (ex.: instalar a PWA noutro endereço), perdem-se — fazer **Backup (JSON)** antes e **Restaurar** depois. O backup de 24/09 às 14h50 (o que o Codex indicou como "o mais recente") não os tem.

### 1.13 PWA — feita a 02/10/2026 (ver `LEIA_ME_PWA.md`)
- Manifesto, service worker, ícones com o logótipo oficial da DTE, `servidor_local.ps1` e `ABRIR_COMO_APP.cmd`. Testado no Edge: abre sem rede, não sequestra PDFs nem iframes.
- Falta testar a instalação real (clique em Instalar) e os atalhos `?area=` já instalada.
- **A PWA não grava em pasta partilhada nem tem login.** Pedidos do Rui a 02/10: gravar sempre numa pasta partilhada, e login com o e-mail de cada pessoa (acessos definidos depois). Ambos precisam da solução central (secção 3: https + Entra ID + Listas do SharePoint). Passo intermédio possível: botão "Guardar na pasta" (File System Access API), para uma pessoa de cada vez.
- **Material 627 enviado para a Pampilhosa (IC-0018):** falta quantidade, data e guia. Stock atual do 627 = 1 (M460). Registar como saída com `transferenciaObra:true`.

### 1.14 Saídas e mapa de 30/09 — **LANÇADO a 06/10/2026** (36 linhas, 2822 un; cópia em `mapas_mensais/IC-0019_Consumos_30_09_2026_LANCADO_20261006.xlsx`) (ver `relatorios/Relatorio_saidas_e_mapa_30_09_20261006.md`)
- Gravado: saída 9S 1720 m (M570, 30/09) (resto pendente de 17/09, **1720 m confirmados pelo Rui a 06/10**; entra na linha L275 do mapa de 30/09; nota: os mapas de maio a agosto já somam 2473 m, convém confirmar no SAP que não fica a dobrar) e 3 linhas Azevedo do EXPORT de 02/10 (entrada + saída). Regra nova do Rui no IC-0019: Azevedo, Ferramaq e Equifermaq têm saída direta.
- Entradas B do EXPORT de 02/10 **gravadas a 06/10** (tubo PEAD 100 m, 749D ×2, 210A +2, cinta 566 +29). 465 chapa, pinça 560 e transformador continuam por explicar.
- **Mapa de 30/09 dado pelo Rui (06/10).** Ficaram de fora, por ordem dele ("deixa esses"): **9U1 cabo LXV 50 mm** (o programa tem 3668 m de saída e o mapa só lançou 65; falta decidir quantos metros) e o **poste 27-42** (HE260A de 10,8 m?, não está nos postes). Também sem saída: cadeado 60 Equifermaq (6 un), arame, serra cabos e corda (são stock de armazém).
- Ainda por explicar: os 15498 m de 9S que o SAP tem (17218 − 1720) e o programa não, os consumos atrasados que a folha não tem (bucha M6, aperta cabos, spray zinco, Wago, faca, fechadura, poste HEB240, paquímetro), 15498 m de 9S no SAP que o programa não tem, 9U1 (3668 m no programa), 9M, fusão 533B/533C, e que fornecedores entram na regra de saída direta.
- Melhoria pedida: colar a folha do SAP em "Folha de consumos" e o programa preencher a coluna Consumo do mês (limitada ao stock SAP) e agrupar por fornecedor.

### 1.15 Postes 26 e guias 3550/3551 — 07/10/2026 (ver `relatorios/Relatorio_postes_26_e_guias_3550_3551_20261007.md`)
- Guias 3550 (consolas, isoladores, caixa de comando, seccionador, ferragens) e 3551 (6 m de tubo 19/26) arquivadas só como guia (Monte da Barca → Agolada, CF-75-QX), sem movimentos.
- **Conferido com o caderno 303:** 26-21, 26-23, 26-25A e 26-19A certos; **26-25, 26-18 e 26-19 (duas consolas) estavam errados e foram corrigidos** (tirante, consola e antibalançante de cada consola; fixações E-6180 TA/CA e E-6135 III/IIA). Migração `postes-26-cadernos-20261007`.
- **Saídas por parte gravadas:** 444 saídas (tirante, consola, antibalançante dos 6 postes; espia E-6189 em 26-19A e 26-25A) + 15 ajustes de stock (7 com linha no SAP e 8 sem linha, autorizados pelo Rui).
- **Por fazer:** cabo BZ 10 mm² (o desenho E-6188 diz só "qb"; falta o montador dizer os metros por pêndulo, 7 pêndulos nos 5 postes; os 8 m dados ao 26-19 foram retirados a 07/10); ligar a ficha M474 ao 514A; explicar os ajustes sem linha no SAP; outras partes dos postes (suspensão, segurança, seccionador, transformador); **os restantes ~53 postes de duas consolas podem ter o mesmo erro de dados — conferir com os cadernos (lote 3).**

### 1.16 Pedidos ao armazém — 07/10/2026 (ver `relatorios/Relatorio_modulo_pedidos_20261007.md`)
- Feito: área **Pedidos** (requisição interna, sem aprovação): nº/data/hora automáticos, de/para, estados, em espera, receção, saída de stock opcional, folha para imprimir e e-mail pré-preenchido.
- **Desenho do Manual de Peças da IP no ecrã do operador: feito a 07/10/2026** (manual_pecas/). Falta testar com telemóvel real; fichas sem código IP não têm desenho.
- **Alertas (sino) para baixas, pedidos e sugestões e pré-visualização do telemóvel: feitos a 07/10/2026.** Falta e-mail automático (servidor) e alertas das baixas do telemóvel (dados centrais).
- **Mapa mensal automático (Consumos): feito a 07/10/2026** com os 5 mapas dados já carregados; falta experimentar com a próxima folha do SAP (31/10).
- **Duas versões (Operador e Gestão) com página de entrada, instaláveis, feitas a 07/10/2026** (`entrada.html`).
- **Etiquetas QR e baixa por leitura: feitas a 07/10/2026** (área Etiquetas QR; ver o relatório). Falta: testar com um QR impresso e um telemóvel; definir o endereço https final antes de imprimir em definitivo; baixas e pedidos partilhados entre dispositivos (dados partilhados); envio automático do e-mail com PDF (precisa de servidor).
- **Pasta partilhada oficial (Gestao de Materiais de Catenaria), gravação automática pelo servidor local e proteção dos ficheiros: feitas a 07/10/2026.** Falta: permissões de partilha no OneDrive/SharePoint (só leitura para a equipa, edição só em dados_partilhados); atualizar sempre com publicar_na_partilhada.ps1.
- **Pasta partilhada com sincronização e registo/login por utilizador: feitos a 07/10/2026** (Definições). Falta: testar com a pasta real do OneDrive/SharePoint e duas pessoas; restrições por papel (hoje só ficam registados); login a sério quando o programa estiver online (Entra ID).

## 2. Pode ser feito, falta ordem

- **Saída por parte do poste + pesquisa — ✅ feito a 18/09/2026.** Em Saídas → "Parte de poste". Escreve-se "06-29 consola" ou "braço de chamada 15-07" (marca a parte sozinho); ou um código de peça ou desenho ("501A", "E-6184 X"), que mostra em que postes e partes entra. Cada movimento guarda o poste e a parte, e a ficha do poste mostra "Saiu a …" / "por sair". Confirmado que a soma das partes = o total do poste.
- **Erro das saídas por montagem com "qb" — ✅ corrigido a 18/09/2026** (o programa pergunta os metros).

- **Pórticos nos Materiais Totais** — os 3 pórticos (64-13_14, 64-29_30, 64-31_32) não entram na conta dos Materiais Totais (só postes). Lista feita à parte a 17/09/2026: `Materiais_Porticos_64-13_14_64-29_30_64-31_32.csv` (86 linhas, 0 pendências), com montagens confirmadas no caderno 306_05_NOVO pág. 37/63/67. Nessa conferência corrigiu-se a ficha do 64-31_32 (amarrações TS e TI são STI-a / STIM-a, não STII-a / STIIM-a) e acrescentaram-se os vãos (EC-216 no 64-29/30; C-1602 Sh no 64-31/32).
- **Montagens em falta no catálogo** — E-7171 **CN** (rev. C; o catálogo só tem CN2 da revisão antiga) e EC-223 **Nb** (não existe). Lidas dos desenhos a 17/09 e usadas na lista dos pórticos; falta gravá-las no catálogo para as fichas mostrarem as peças.

- **Preparar o importador para aceitar preços** — para o ficheiro do SAP entrar sem trabalho manual.
- **Melhorar o leitor de tabelas dos desenhos** — para tentar apanhar os 513 códigos em falta.
- **Apagar duas montagens vazias** (`E-6181 Sa`, `E-6181 Sc`) — já não fazem mal; é arrumação.

---

## 3. Pôr o programa online

Pasta **`GestaoCatenaria/`**: projeto ASP.NET Core com servidor, base SQLite com histórico de
versões, página com o estado injetado, service worker e ícones (instalável como app).

**Falta:**
- README com os passos de publicação e `.gitignore`;
- **nunca foi compilado** — não há .NET nem Visual Studio nesta máquina;
- **decisão da informática**: registar a aplicação para o login com a conta `@dte.pt` e dizer
  onde é que a página corre. Sem isso não há multiutilizador.

O caminho recomendado continua a ser o de dentro da empresa (SharePoint/Entra ID). Detalhe em
`PASSAGEM_PARA_CLAUDE/`.

---

## 4. GitHub

Pedido do Rui a 17/09/2026. A pasta **ainda não é repositório git** (o git está instalado; o
`gh` não). Ocupa 930 MB, dos quais 365 MB são 131 backups. Falta: conta GitHub e repositório
**privado** (há dados SAP, fornecedores, matrículas e nomes), `.gitignore` (backups, ZIPs de 70 MB,
`.codex_tmp/`, `tmp/`, `outputs/`) e o primeiro envio.

---

## Estado dos dados em 18/09/2026

| | |
|---|---|
| Materiais | 1.571 (193 fichas repetidas juntas a 18/09) |
| Movimentos | 2.459 |
| Encomendas | 701 (+204 arquivadas) |
| Postes | 448 |
| Montagens | 677 |
| Stock negativo | **0** |
| Pendências nos Materiais Totais (207 postes novos) | **39** (submontagens EC-344/EC-388/EC-326 — antes estavam escondidas) |

## Relatórios gerados

| Ficheiro | O que tem |
|---|---|
| `encomendas_orfas_para_SAP.csv` | as 45 linhas a identificar no SAP |
| `relatorio_cadernos_vs_programa.json` | conferência dos 334 postes contra os cadernos |
| `relatorio_materiais_duplicados_20260826.csv` | duplicados do catálogo, com movimentos por ficha |
| `relatorio_fusao_fichas.json` | as 206 fusões feitas, ficha a ficha |
| `nomes_pecas_desenhos.json` | 409 designações colhidas dos desenhos normativos |
| `linhas_caderno_acrescentadas.json` | as 33 linhas em falta acrescentadas aos postes |
| `precos_sap_20260531.json` | 338 valores unitários do mapa de maio |

- [x] Arranque pela pasta partilhada corrigido (iniciar_servidor.ps1, atalho com logo DTE) — 07/10/2026.
