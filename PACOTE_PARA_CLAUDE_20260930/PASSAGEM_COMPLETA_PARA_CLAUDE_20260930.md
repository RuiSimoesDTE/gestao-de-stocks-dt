# Passagem completa para o Claude — 30/09/2026

## Instrução principal: não perder trabalho atual

Esta passagem substitui, para efeitos de continuidade, os resumos antigos de julho/agosto. Esses documentos continuam úteis para contexto histórico, mas os números e a interface neles descritos já estão desatualizados.

Os ficheiros atuais e autoritativos são, por esta ordem:

1. `gestao_armazem_catenaria.html` — aplicação atual, incluindo o menu lateral e a correção do envio de sugestões;
2. `backup_armazem_catenaria_2026-09-24_14h50.json` — backup multiobra mais recente guardado em ficheiro;
3. `dados_armazem_catenaria.json` — cópia estruturada dos dados de Vendas Novas;
4. `POR_FAZER.md` — decisões, correções e pendências atualizadas até 24/09/2026;
5. `CORRECAO_ENVIO_SUGESTOES_PARA_CLAUDE.md` — especificação da correção de email, já aplicada no HTML atual;
6. `AGENTS.md`, `CLAUDE.md` e `BRIEFING_ChatGPT.md` — regras de negócio e de segurança.

Não substituir o HTML atual por um backup antigo. Não reconstruir a aplicação a partir do briefing antigo. Antes de qualquer edição, criar uma cópia do HTML atual e comparar as alterações.

## Estado atual dos dados

Estado confirmado em `dados_armazem_catenaria.json` e no backup multiobra de 24/09:

| Conteúdo | Quantidade |
|---|---:|
| Materiais em Vendas Novas | 1.571 |
| Movimentos em Vendas Novas | 2.459 |
| Encomendas ativas | 701 |
| Materiais em Pampilhosa | 1.571 |
| Movimentos em Pampilhosa | 4 |
| Postes partilhados | 448 |
| Montagens/desenhos partilhados | 677 |
| Stock negativo conhecido | 0 |

Nota técnica importante: o literal `SEED_DATA` dentro do HTML não conta, isoladamente, toda a informação final. Existem migrações/correções determinísticas aplicadas depois do seed e existe persistência em `localStorage`, chave `dte_armazem_multi_v1`. Não substituir o seed apenas com base numa contagem parcial nem apagar o `localStorage` sem backup.

## Interface e menu atuais

Em 23/09/2026 o menu superior antigo foi substituído por um **menu lateral**. Esta alteração deve ser preservada.

Comportamento do menu:

- barra lateral fixa em ecrãs largos;
- pode ser encolhida/expandida pelo botão ☰;
- botão ☰ também aparece no cabeçalho;
- em ecrãs pequenos o menu abre sobre o conteúdo com fundo escurecido;
- fecha pelo fundo, pelo botão, depois de escolher uma área, ou com `Escape`;
- seleção da obra e botão **+ Nova obra** ficam dentro da barra lateral;
- mantém os temas Claro, Escuro e Auto;
- mantém Backup JSON e Restaurar no cabeçalho.

Estrutura exata do menu atual:

### Projeto

- Projeto;
- Materiais por Poste;
- Pendulagem;
- Materiais Totais;
- Códigos de Peças.

### Armazém

- Painel;
- Stock;
- Entradas;
- Saídas;
- Transferências;
- Guias AT.

### Gestão

- Encomendas;
- Movimentos;
- Consumos;
- Relatórios;
- Sugestões;
- Definições.

O backup imediatamente anterior ao menu lateral é `gestao_armazem_catenaria_backup_antes_menu_lateral.html`. Serve apenas para comparação; não deve voltar a ser usado como aplicação principal.

## Funcionalidades acrescentadas ou alteradas

### Códigos de peças

Foi criada a área **Códigos de Peças**, acessível no grupo Projeto. Centraliza pesquisa e consulta dos códigos internos/SAP e das designações consolidadas. Foram lidos desenhos normativos e acrescentadas centenas de designações; ainda existem códigos sem nome, conforme `POR_FAZER.md`.

### Preços e valorização

- Preço unitário passou a ser calculado a partir do preço líquido/unidade de preço do SAP.
- Foram preenchidas 701 linhas de encomenda e 874 fichas com o preço da compra mais recente.
- O Stock, Encomendas, ficha do material e Painel mostram preço/valor.
- Permanecem materiais com stock sem preço, sobretudo material sem SAP proveniente do mapa antigo.

### Saídas por parte do poste

Foi criada em **Saídas** a opção de saída por parte do poste. Aceita pesquisas como `06-29 consola`, `braço de chamada 15-07`, códigos de peças ou desenhos. Cada movimento guarda o poste e a parte. A ficha do poste apresenta o que já saiu e o que falta sair. Foi corrigido o tratamento de quantidades `qb`, passando a pedir os metros ao utilizador.

### Projeto, postes e BOMs

- Os 448 postes foram conferidos contra os cadernos.
- Foram concluídos os lotes 1 e 2 de correções documentadas em `POR_FAZER.md` e nos relatórios de setembro.
- Foram corrigidos suportes E-6190, feeders, alongas, abaixamentos, o poste 31-02 e a montagem especial 50-36A.
- A ficha 483 passou a “Manga interior p/ tubo 24x32”.
- O E-6182 passou a usar 2 parafusos 442 e esquadro 465 segundo a lista da obra.
- O código 643 foi corrigido para braço de chamada normal LP10/LP12.
- O SAP 4026519/código 513 foi corrigido para articulação do tirante; a ponteira é a 516.
- Foram consolidadas fichas repetidas e arquivadas encomendas antigas substituídas.
- Os três pórticos foram conferidos à parte; a integração plena nos Materiais Totais continua pendente.
- O lote 3, relativo sobretudo aos 55 postes de duas consolas, continua por concluir.

### Importações SAP e reconciliação

- Importação SAP de 10/09/2026: registadas entradas/saídas confirmadas e novas linhas de encomenda; divergências ficaram documentadas em `POR_FAZER.md`.
- Importação SAP de 17/09/2026: registadas a broca HSS, 21 conjuntos PFIB e novas encomendas; ficaram pendentes La Farga, a cantoneira 60×60×6 L=405 e portes Jobasi.
- Foram arquivadas 204 linhas de encomendas antigas substituídas em `encomendas_substituidas_20260917.json`.
- Foram corrigidos e anulados vários duplicados/acertos conforme os relatórios da revisão total de 18/09.
- A reconciliação SAP × programa a 31/08 continua com diferenças que não devem ser acertadas automaticamente.

### Guias e transferências

Foram acrescentadas e/ou arquivadas no programa, mantendo a distinção entre simples arquivo e movimento real, as guias de setembro, incluindo:

- 3185, 3187, 3188, 3193, 3196;
- transferência 3203 e documentação relacionada;
- 3245, 3246, transferência 3270 e 3274;
- 3328, 3329, 3350 e 3383;
- 3407, 3439, 3445 e 3448.

As quatro mais recentes presentes no HTML são:

- GT 3407 — 2 espias de 9,20 m, Monte da Barca → Vidigal;
- GT 3439 — aspirador e 4 cordas I/Farprotec, Monte da Barca → Coimbra;
- GT 3445 — 200 m de cabo de suporte, Vidigal → Monte da Barca;
- GT 3448 — bobine de fio de contacto e bobine de cabo de suporte, Monte da Barca → Vidigal.

Estarem visíveis na tabela de Guias AT não significa que criem automaticamente entradas/saídas. Aplicar sempre as regras documentais do projeto e pedir confirmação quando `POR_FAZER.md` indicar dúvida.

### Listas finais da obra — alterações de 24/09

- Foi importada/analisada a lista de material final da obra, guardada em `relatorios/lista_material_final_obra_20260924.json`.
- EC-219 IIIA foi corrigido: não leva cabo de aço inox; a referência “Aço Inox” refere-se à parafusaria da cinta dos tubos guia.
- E-6184 X/código 643 foi identificado como braço de chamada normal LP10/LP12.
- E-6182 ficou com 2 parafusos 442 e esquadro 465 em todas as montagens.
- Foi clarificada a diferença entre isoladores cerâmicos/sintéticos nos cadernos e na lista final, mas a decisão prática de montagem ainda deve ser confirmada pelo Rui antes de alterar Materiais Totais.

### Correção do envio de sugestões — 30/09

O formulário dependia apenas de `mailto:` e ficava preso em “A abrir o cliente de email…”. O HTML atual já contém a correção:

- botão principal **Abrir no Outlook Web**;
- botão **Abrir no Outlook instalado** para manter `mailto:`;
- botão **Copiar texto**;
- destinatário, assunto e corpo continuam pré-preenchidos;
- se o popup do Outlook Web for bloqueado, o programa tenta copiar o texto e explica a alternativa;
- nenhuma opção afirma que o email foi enviado: o utilizador confirma e carrega em Enviar no Outlook.

Backup anterior a esta alteração: `gestao_armazem_catenaria_backup_antes_sugestoes_email.html`.

## Alterações de dados e limpeza que não devem ser revertidas

- Fusão de fichas duplicadas documentada em `relatorio_fusao_fichas.json` e relatórios de setembro.
- Arquivo das 204 encomendas substituídas.
- Consolidação da peça 662 numa única ficha.
- Correções dos códigos 483, 513, 516, 643, 442 e 465 descritas acima.
- Registos SAP e consumos de setembro já incorporados, com exclusões para ajustes, roubos e transferências.
- Preservação de movimentos sem data/quantidade quando a documentação não permite inventar o valor.
- Não apagar as migrações determinísticas existentes no HTML.

## Pendências que continuam abertas

O detalhe integral está em `POR_FAZER.md`. As principais são:

- 155 designações de peças por identificar;
- três movimentos sem data e dois movimentos com quantidade zero;
- lote 3 dos 55 postes de duas consolas;
- integração dos pórticos nos Materiais Totais;
- montagens EC-344, EC-388 e EC-326;
- confirmação de isoladores sintéticos versus cerâmicos na montagem real;
- confirmação do antibalançante do poste 50-36A;
- divergências SAP × programa e entradas duplicadas indicadas na revisão total;
- decisões sobre várias guias que estão apenas arquivadas;
- acerto das 132 diferenças de entrada SAP apenas depois de lista aprovada pelo Rui;
- correção de origens/destinos trocados em guias antigas;
- publicação online, autenticação corporativa e base multiutilizador;
- GitHub privado ainda não configurado.

## Regras obrigatórias para qualquer continuação

- Não inventar códigos, quantidades, datas, referências, fornecedores ou correspondências SAP.
- Antes de alterar stock, verificar histórico, guia/PO e `POR_FAZER.md`.
- Só criar entrada física com documento ou confirmação explícita.
- Ajustes devem ter `ajuste: true`.
- Roubo, ajuste e transferência não contam como consumo normal.
- Não permitir stock negativo silenciosamente.
- Manter UTF-8 e caminhos Windows.
- Fazer backup do HTML e, quando houver dados, também do JSON.
- Validar todos os blocos JavaScript depois de editar o HTML.
- Testar no navegador as áreas alteradas.
- Nunca limpar `localStorage` sem backup confirmado pelo Rui.

## Histórico cronológico resumido dos backups

Os nomes dos backups existentes registam as etapas e devem ser usados para auditoria, não para substituir o estado atual:

- 28/08: linhas de caderno, cabos XAV, acertos, unificação/fusão de fichas, nomes de desenhos e limpeza de montagens vazias;
- 07–10/09: guias 3185/3187/3188/3193/3196/3203/3245/3246, saídas associadas, sentido das guias e importação SAP de 10/09;
- 16/09: transferência 3270 e guia 3274;
- 17/09: acertos SAP, importação SAP, arrumação de encomendas, pórticos, E-7095 N3, grifes, mapa de consumos e correções de postes em dois lotes;
- 18/09: E-6182/ficha 483, revisão total e saídas por parte do poste;
- 21/09: guias 3328/3329;
- 23/09: introdução do menu lateral;
- 24/09: guia 3350, correções 513/EC-219, listas finais da obra e guia 3383;
- 25–29/09: arquivo das guias 3407, 3439, 3445 e 3448;
- 30/09: correção das sugestões por Outlook Web/Outlook instalado/cópia.

## Procedimento recomendado ao Claude

1. Ler este ficheiro por completo.
2. Ler `POR_FAZER.md` por completo.
3. Ler `AGENTS.md`, `CLAUDE.md` e `BRIEFING_ChatGPT.md`.
4. Tratar o HTML atual e o backup multiobra mais recente como fontes atuais.
5. Antes de editar, criar novo backup com data/hora e nome descritivo.
6. Não mexer em dados ou lógica fora do pedido concreto.
7. No fim, apresentar ao Rui os ficheiros alterados, o teste realizado e qualquer dúvida encontrada.

