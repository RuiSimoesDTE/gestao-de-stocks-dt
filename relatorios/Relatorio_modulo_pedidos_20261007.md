# Relatório — módulo "Pedidos ao armazém" (07/10/2026)

Backup antes: `gestao_armazem_catenaria_backup_antes_pedidos_20261007.html/.json`. Os dados (SEED/JSON) não foram alterados: os pedidos ficam em cada obra (`pedidos`), no navegador e no Backup (JSON).

## O que foi feito
Nova área **📨 Pedidos** no menu Armazém (com um contador de pedidos em espera).
- **Novo pedido:** De, Para, e-mail do destinatário (opcional, fica guardado por nome), destino/entrega, precisa para, urgente, observações e linhas de material (pesquisa por código ou descrição, com o stock à vista). Número (PA-2026-0001...), data e hora automáticos. Sem aprovação.
- **Estados:** Pedido → Em preparação → Enviado → Recebido parcial → Recebido (ou Cancelado). Histórico de cada mudança.
- **Em espera:** painel com Em espera, Atrasados, Enviados por receber e Recebidos este mês; filtros por estado e pesquisa por número, pessoa ou material.
- **Receção:** quantidade enviada e recebida por linha, "Guardar receção" e "Receber tudo"; o estado passa sozinho a Recebido parcial ou Recebido.
- **Saída do stock (opcional):** botão "Registar saída do stock" (também oferecido ao marcar "Enviado"); respeita a regra de stock negativo; movimentos com `requisicao` = número do pedido.
- **Folha para imprimir:** cabeçalho DTE, número, data, hora, de/para, obra, destino, linhas com coluna "Qtd entregue" e assinaturas. Imprimir → Guardar como PDF.
- **E-mail:** Outlook Web, Outlook instalado ou copiar texto, com assunto e corpo preenchidos (nº, data, hora, de, para, linhas). Não envia sozinho.

## Testado (navegador, 07/10/2026)
Criar pedido, passar pelos 5 estados, saída de stock (stock desce 3 e 10 e não fica negativo), receção parcial e total, contador, link do Outlook Web, folha de impressão, gravação na obra. Sem erros na consola. 16 blocos JS sem erros. Dados de teste apagados.

## Por fazer / limites
- Os pedidos ficam no navegador de quem os cria. Para vários utilizadores verem os mesmos pedidos é preciso a parte de dados partilhados (online).
- Enviar o e-mail sozinho, com a folha em PDF anexada, precisa de um servidor.
- QR por código e leitura no telemóvel com baixa: etiquetas QR podem ser feitas já; a baixa pelo telemóvel precisa de https e dados partilhados.

# Etiquetas QR e baixa por leitura (07/10/2026)
Backup antes: `gestao_armazem_catenaria_backup_antes_etiquetas_20261007.html`.

## O que foi feito
- Nova área **🏷️ Etiquetas QR** (menu Armazém): escolher materiais (pesquisa, só com stock, selecionar todos os visíveis) e imprimir folhas A4 de **21 etiquetas** (3 × 7, 63 × 38 mm) com QR, código, descrição, unidade, SAP e id da ficha. Imprimir → Guardar como PDF também funciona.
- **Endereço que o QR abre:** campo editável (guardado na obra e no backup). O QR é `<endereço>?mat=<id da ficha>`. Aviso quando o endereço é `file://` ou `localhost` (só serve neste computador).
- **Janela de baixa** (abre ao ler o QR ou ao escrever o código): stock, quantidade (grande), para onde vai, quem leva, "⬆ Dar baixa". Regista uma saída (consumo real) com `baixaQR`, `doc: "Baixa por QR"`, nome e hora; respeita a regra de stock negativo; mostra as últimas saídas do material.
- **Leitura:** câmara normal do telemóvel (abre o endereço), botão "📷 Ler QR com a câmara" dentro do programa (navegadores com BarcodeDetector, como o Chrome no Android; precisa de https ou localhost), ou leitor USB / escrever o código e Enter.
- Biblioteca de QR: qrcode-generator 1.4.4 do cdnjs, com selo SRI (sha384-mZT2gIty7Z…), como já é o xlsx; o service worker guarda-a para funcionar sem rede depois da primeira vez.

## Testado
Lista e seleção, geração de etiquetas (QR com margem de 4 módulos), abertura da janela de baixa por `?mat=M473`, baixa (stock 1025,57 → 1023,07; conta como consumo), limpeza do endereço depois de abrir. Sem erros na consola. 17 blocos JS sem erros. Dados de teste apagados.
Não testado: leitura real de um QR impresso com um telemóvel (o navegador de teste não tem BarcodeDetector), impressão em papel.

## Limites
- A baixa grava nos dados do dispositivo onde é feita. Só chega aos outros quando houver dados partilhados (online ou pasta partilhada com sincronização).
- Os QR impressos apontam para o endereço definido na altura: definir o endereço final antes de imprimir em definitivo.

# Login por utilizador e pasta partilhada (07/10/2026)
Backup antes: `gestao_armazem_catenaria_backup_antes_sinc_login_20261007.html`. Em Definições: cartões "Utilizadores e acessos" e "Pasta partilhada".

## Registo e login
- Cada pessoa **regista-se uma vez** (nome, e-mail, palavra-passe com mínimo 6 caracteres); fica "por aprovar" até o administrador aprovar (Definições → Utilizadores). Depois **tem de entrar sempre** que abre o programa.
- **A palavra-passe vale 365 dias:** passado esse prazo (ou se o administrador a repuser) o ecrã de entrada obriga a definir uma nova (diferente da anterior); aviso na barra nos últimos 30 dias.
- **O administrador fica dispensado de login** no computador onde carregar em "Exigir login a todos" (ou "Dispensar login neste computador"); noutros computadores entra com a palavra-passe.
- Papéis guardados: administrador máximo, gestor, operador, consulta (de `access-config.json`). **Ainda não há restrições por papel** (só ficam registados).
- Quem entra dá o nome aos movimentos (DB.param.user).
- Palavras-passe guardadas só como hash SHA-256 com sal. **Isto identifica quem faz o quê; não é segurança forte** (o programa corre no navegador). A segurança a sério vem com o login da empresa, online.
- O login só passa a ser obrigatório depois de o administrador o ligar; as contas e o "login obrigatório" sincronizam pela pasta partilhada.

## Pasta partilhada (sincronização)
Cada utilizador grava `dte_estado_<nome>.json` na pasta e junta os ficheiros dos outros: movimentos, materiais, encomendas (recebido só sobe), pedidos (fica o de histórico mais recente), contas (a versão mais recente), apagados. Só acrescenta. Sincroniza ao abrir, a cada 3 minutos, depois de gravar (6 s) e no botão; indicador na barra. Só Edge/Chrome no computador; pede autorização à pasta de vez em quando.

## Testado (navegador, 07/10/2026)
Ligar login e admin dispensado; ecrã de login noutro computador; registo (hash, sem palavra-passe em claro); "por aprovar" e palavra-passe errada; aprovação e entrada; palavra-passe com 400 dias obriga a renovar (e não aceita a mesma); renovação vale 365 dias; reposição pelo administrador obriga a nova; sincronização com uma pasta de ensaio (movimento, pedido e conta de outro utilizador entram; segunda sincronização não duplica; pedido atualizado pelo outro vence); sem stock negativo; sem erros na consola; 19 blocos JS sem erros. Dados de teste apagados.
Não testado: o seletor de pasta real do Edge/Chrome (é uma janela do sistema) e uma pasta do OneDrive/SharePoint com duas pessoas.

## Limites
Não é tempo real; alterações a registos já existentes (por exemplo editar um movimento) não passam de um computador para outro; telemóvel fica de fora; sem restrições por papel.

# Modo operador (telemóvel) e cabo BZ 10 (07/10/2026)
- **Modo operador:** ao abrir o programa por um QR (`?mat=...`) ou por `?modo=operador`, o telemóvel só mostra "Baixa de material": botão "📷 Ler QR do material", campo para escrever o código, e a janela de baixa (quantidade, para onde vai, quem leva). Sem menu nem mais nada. O destino da última baixa fica lembrado para tornar a baixa mais rápida. Para voltar ao programa completo: `?modo=normal`. Pré-visualização: abrir `http://localhost:8765/gestao_armazem_catenaria.html?modo=operador` e reduzir a janela, ou `...?mat=M473`.
- Como as baixas por QR vão ser muito mais frequentes que os pedidos: os dados crescem (hoje ~2,8 MB no navegador, limite à volta de 5 a 10 MB). Quando houver muitas baixas passar os dados para IndexedDB ou para o online.
- **Cabo BZ 10 mm² (9C) dos postes:** o desenho E-6188 (montagens I, II e III) diz só "qb" (quanto baste), sem metros nem fórmula; o caderno também não dá. **Não se pode calcular sem a medida de corte do montador.** Os 8 m de 9C dados ao 26-19 (E-6188 II) vieram de uma quantidade de 4 por pêndulo do catálogo, que o desenho não confirma. Poste a poste: 26-25A 1 pêndulo, 26-25 2, 26-23 1, 26-21 1, 26-18 2 = 7 pêndulos E-6188 I; total = 7 × metros por pêndulo.

# Correção do 9C e experimentar no telemóvel (07/10/2026)
- **9C (cabo BZ 10 mm²):** retirados os 8 m dados ao 26-19 (2 saídas e o ajuste de +8), porque o desenho E-6188 só diz "qb". Migração `cabo-9c-26-19-20261007`. Stock do 9C no programa volta a 0, sem movimentos de 9C dos postes. Backup `..._antes_corrigir_9c_20261007`. O resto das partes do 26-19 mantém-se. Os metros por pêndulo (7 pêndulos E-6188 I nos 5 postes) continuam por dar pelo montador.
- **Telemóvel:** `ABRIR_PARA_TELEMOVEL.cmd` (usa `servidor_rede.mjs`, porta 8766) abre no computador uma página com um QR; ao lê-lo com o telemóvel (mesma rede Wi-Fi) abre o ecrã do operador. Testado: página do QR, programa completo, ficheiros ocultos bloqueados (404), só GET. Não testado com um telemóvel real. Enquanto a janela estiver aberta, outros aparelhos da mesma rede podem abrir o programa (inclui os dados): fechar a janela no fim.

# Duas versões: Operador e Gestão (07/10/2026)
Backup antes: `gestao_armazem_catenaria_backup_antes_duas_versoes_20261007.html`.
- **Página de entrada `entrada.html`:** duas opções — **Operador** (ler QR, ver nome e stock, dar baixa) e **Gestão** (administrativos, engenheiros, gestores, armazém), cada uma com "Abrir" e "Instalar", e instruções para Android, iPhone e computador. A raiz dos servidores (`servidor_local.ps1`, `servidor_rede.mjs`) abre esta página.
- **Duas aplicações instaláveis:** `manifest-operador.webmanifest` ("Catenária — Operador", id próprio, tema verde, abre em `?modo=operador`) e `manifest.webmanifest` ("Catenária — Gestão (DTE)", abre em `?modo=normal`). No modo operador o programa troca o manifesto, o título e a cor da barra. `sw.js` (versão 2026-10-07-1) guarda `entrada.html` e o manifesto do operador.
- **Versão do operador:** só barra do operador + janela de baixa. Novo: **pesquisa pelo nome ou código** com o stock de cada material à vista (até 12 resultados, os com stock primeiro); ao tocar abre o nome completo, o stock e a baixa. Botão "📲 Instalar app do operador".
- Testado: página de entrada, manifestos, troca de manifesto no modo operador, pesquisa por nome (ex.: "tubo 19x26", "articulação tirante"), abertura da baixa, modo de gestão completo. 19 blocos JS sem erros.
- Nota: a versão do operador ainda não restringe por conta (qualquer pessoa com o endereço abre o modo operador). Com o login ligado, pede registo e aprovação como as outras.

# Gravar na pasta partilhada ao fechar (07/10/2026)
Backup antes: `gestao_armazem_catenaria_backup_antes_gravar_sair_20261007.html`.
- **Grava sozinho** no ficheiro da pasta partilhada 6 s depois de cada alteração (já existia), e agora **também ao sair do separador**.
- **Ao fechar com alterações por gravar:** grava logo na pasta e o navegador pede confirmação. Se está tudo gravado na pasta, **não pede nada** (o aviso antigo, que só olhava ao backup manual, deixa de aparecer nesse caso).
- **Botão "💾 Gravar e sair"** no cabeçalho (aparece quando a pasta está ligada): grava já, mostra "Gravado às HH:MM. Já podes fechar" e tenta fechar a janela.
- **Aviso simples quando a pasta não está ligada:** faixa em baixo "Os dados só ficam gravados neste computador" com o botão "Ligar pasta partilhada" (dá para esconder).
- Testado (pasta de ensaio): marca de alterações, gravação imediata, ficheiro com o valor novo, "Gravar e sair", faixa aparece sem pasta e desaparece com pasta. Não testado: a janela real do navegador ao fechar e a pasta real do OneDrive.
- Limites: o texto do pedido ao fechar é do navegador (não se pode personalizar) e o navegador pode não deixar a gravação terminar se a janela fechar de repente; por isso o botão "Gravar e sair" é o caminho mais seguro.

# Mapa mensal automático (Consumos) e menu (07/10/2026)
Backup antes: `gestao_armazem_catenaria_backup_antes_mapa_auto_20261007.html`.
- **Área Consumos → cartão "Mapa mensal automático":**
  1. **Mapas já dados (guardados):** enviar o Excel preenchido e lançado; fica guardado no programa (descarregável de novo). Carga inicial feita com os 5 enviados (31_05, 31_06, 31_07, 31_08 e 30_09 preenchido): 109, 62, 74, 61 e 36 linhas.
  2. **Folha nova do SAP em branco → "Preparar o mapa":** consumo real do programa até à data da folha (sem ajustes, transferências, roubos, empréstimos nem IC-0018) menos o já lançado nos mapas guardados, limitado ao stock SAP de cada linha. Linhas com diferença ≥ 100 ficam por marcar. Mostra **"O que o programa fez"** (descrição, também em .txt), uma tabela com fornecedor, stock, consumo editável e notas (VER / falta de stock), e os materiais sem linha na folha.
  3. **"Descarregar Excel preenchido":** o original com a coluna Consumo preenchida (Stock e valor recalculados). **"Marcar como dado"** guarda o mapa e passa a contar como lançado no mês seguinte.
- Testado com a folha de 30/09 em branco e os 4 mapas anteriores: 34 linhas (31 marcadas, 442, 9U1 e ligador de garra por decidir), Excel gerado e relido (31 linhas, 248 unidades, Stock recalculado). A diferença para o que fiz à mão: o 9S entrou à mão e as estacas são de 06/10, posteriores à data da folha. 20 blocos JS sem erros. Bibliotecas: SheetJS e JSZip do cdnjs (SRI).
- **Menu:** Etiquetas QR com ícone de QR (▦); "Pedidos ao armazém"; **Movimentos escondido** do menu (a área continua no programa, só não aparece).
- Os mapas guardados vão no Backup (JSON) e juntam-se na sincronização da pasta partilhada.

# Pré-visualização do telemóvel e alertas (07/10/2026)
Backups antes: `..._antes_preview_20261007.html`, `..._antes_alertas_20261007.html`.
- **Ver como o operador vê:** em Etiquetas QR, botão "👁 Ver" por material e "📱 Ver como o operador vê" (ecrã inicial) abrem uma moldura de telemóvel com o ecrã do operador. Não grava nada (a baixa responde "Pré-visualização: nada foi gravado"). Corrigido: a pré-visualização (`?preview=1`) já não grava dados, o que causava o aviso vermelho de "dados alterados noutro separador".
- **Alertas (sino 🔔 no cabeçalho):** cada baixa por QR, cada pedido novo e cada mudança de estado de pedido, e cada sugestão registam um alerta (quem, quando, o quê). Os alertas juntam-se na sincronização da pasta partilhada; ao chegarem novos aparece o contador no sino, um aviso no ecrã e, se autorizado, um aviso do Windows. Lista com filtro (baixas, pedidos, sugestões), "marcar todos como lidos". Com o login ligado, o sino só aparece a administrador e gestor.
- Testado: alertas de baixa, pedido, mudança de estado e sugestão; contador; lista; alerta de outro utilizador a chegar pela sincronização (aviso "🔔 1 alerta novo"); pré-visualização sem gravar nem aviso vermelho. 21 blocos JS sem erros. Dados de teste apagados.
- **Limites:** os alertas só chegam a outro computador pela pasta partilhada (computadores). Uma baixa feita no telemóvel só gera o alerta no telemóvel até haver dados centrais online. E-mail automático para o administrador precisa de um servidor.

# Pasta partilhada oficial, gravação automática e proteção (07/10/2026)
- **Pasta partilhada:** `...\Obras_dte_IC - 00_Obras\Gestao de Materiais de Catenaria` (73 MB). O HTML passou a `gestao_materiais_catenaria.html` e todas as ligações foram atualizadas. É a versão **oficial**; a pasta de trabalho `Desktop\gestao_de_stocks_dte` continua a ser onde o Claude trabalha e **publica** com `publicar_na_partilhada.ps1`.
- **Gravar e ler sem escolher pasta:** o servidor local (`servidor_local.ps1`) tem agora `/_sinc/lista`, `/_sinc/quem` e `/_sinc/gravar/<nome>` (só `dte_estado_<...>.json`, só em `dados_partilhados`, só com cabeçalho do próprio programa e origem local; 403 caso contrário). O programa liga-se sozinho a esta pasta ao abrir (modo "automático"), junta os ficheiros dos outros e grava o seu ficheiro, com o nome do utilizador do Windows (ou o do login). Sem janelas de escolher pasta, sem autorizações, em qualquer navegador. A escolha manual de pasta fica como alternativa quando o programa é aberto sem este servidor.
- **Estado inicial:** `dados_partilhados/dte_estado_dst7973.json` = backup de 07/10 15h35 (sem os 3 movimentos de 9C corrigidos), com Pampilhosa, transferências e saídas dos postes. Quando o Rui abrir, o programa grava o estado mais recente por cima. A sincronização junta agora também a lista de transferências entre obras.
- **Proteção:** tudo o que é técnico fica **escondido e só de leitura**; à vista ficam só `ABRIR_COMO_APP.cmd`, `LEIA_ME_PRIMEIRO.md` e `dados_partilhados` (com `NAO_APAGAR_NEM_MUDAR.txt`). Atenção: os atributos (escondido/só de leitura) são deste computador; a proteção real entre pessoas faz-se nas **permissões de partilha** do OneDrive/SharePoint (ver mensagem). Atalho no ambiente de trabalho: "Gestão de Materiais de Catenária".
- Testado: arranque do servidor a partir da pasta com espaços e vírgula; recusas de segurança; gravação e listagem; modo automático no navegador (liga sozinho, junta movimentos/Pampilhosa/transferências/alertas de outro utilizador, grava o ficheiro do utilizador; sem faixa nem janela de pasta). 21 blocos JS sem erros.

# Desenho do Manual de Peças ao ler o QR (07/10/2026)
Backup antes: `gestao_armazem_catenaria_backup_antes_desenho_manual_20261007.html`.
- Ao ler o QR (ou abrir a baixa) de uma peça, o ecrã do operador mostra, por baixo do nome e do stock, a **página do Manual de Peças de Catenária da IP (GR.MN.CAT.003 v02)** com o desenho dessa peça: "📐 Manual de Peças IP — código 05.300.07 · página 186 — toca para ampliar". Toque → ecrã inteiro com ➖/➕ e deslizar. Se a peça tem mais de uma página, aparecem as outras. Se não está no manual (ferramentas, consumíveis): "Esta peça não está no Manual de Peças da IP."
- **Como se liga:** código da ficha (ex. 513) → código novo IP (tabela CODIGOS_NOVOS_IP do programa, ex. 05.300.07) → página do manual (índice gerado do PDF) → imagem. Cobertura: 688 códigos IP com página; cerca de 400 fichas ligam (todas as peças de catenária; as ferramentas e consumíveis não estão no manual).
- **Ficheiros:** `manual_pecas/` com 225 páginas em JPEG (16 MB, 1000 px de largura) e `indice.json`; gerados do PDF `GR.MN.CAT.003_v02_ManualDePecasDeCatenaria(Versão Autalizada).pdf` (OneDrive, 01_Catenaria/07_Documentacao_Tecnica/01_NORMATIVOS_IP/04_IT_Catenaria). Publicado também na pasta partilhada; `publicar_na_partilhada.ps1` copia-o. O service worker guarda as páginas já vistas (funcionam sem rede depois da primeira vez).
- Cada página do manual pode ter 2 peças (aparece a página inteira). 
- Testado: 513 (página 186, imagem 1000×1415 carregada), peça sem manual (tesoura), ampliação e fecho, em ecrã de telemóvel simulado. 21 blocos JS sem erros. Não testado: telemóvel real.
- Se o manual mudar de versão: regenerar com o script de indexação/render (manual_indice.mjs + manual_render.mjs, na pasta de scratch da sessão) e voltar a publicar.

## Arranque pela pasta partilhada (07/10/2026, fim do dia)

- Problema: duplo clique em `ABRIR_COMO_APP.cmd` na pasta partilhada → "não encontra o localhost" (o Edge abria antes de o servidor estar pronto; espera de apenas 2 s).
- Correção: novo `iniciar_servidor.ps1` liga o servidor e espera até 30 s que a porta 8765 responda; o `.cmd` mostra mensagem se não conseguir.
- `ABRIR_COMO_APP.cmd` sem argumentos abre `entrada.html` (escolha Operador / Gestão + instalar); com `direto` abre logo o programa como aplicação.
- Atalho do ambiente de trabalho "Gestão de Materiais de Catenária" aponta para o `.cmd` com `direto` e usa o logo DTE (`icons/dte.ico`).
- `publicar_na_partilhada.ps1` passou a copiar `iniciar_servidor.ps1`. Publicado e protegido.
- Testado: servidor ligado a partir da pasta partilhada (porta de teste) devolve entrada.html e o programa (200). Rui confirmou que ficou corrigido.
- Por fazer: atalho no telemóvel (instalação pela página de entrada), metros de BZ 10 mm², limpeza de backups (aguarda OK).

## Confirmar a peça + desenho na ficha do PC (07/10/2026 18:30)
- Ao abrir uma peça (QR, código escrito ou pesquisa) o operador vê primeiro nome, stock e desenho do Manual de Peças e tem de carregar em "✔ Confirmo — é esta peça" (ou "✖ Não é esta"); só depois aparecem quantidade/destino/quem leva.
- Na ficha do material no PC (versão de gestão) aparece o mesmo desenho e o botão "📲 Ver como o operador", que abre o mesmo ecrã.
- `manual_pecas/indice.js` como alternativa quando o programa é aberto como ficheiro. Versão 07/10/2026 18:30, sw VERSAO 2026-10-07-3.

## 08/10/2026 — o que o Mário mexeu e o login
- Encontrado nos dados partilhados (pelos ficheiros dte_estado_dst7973/dst2500/dst4944): pedido PA-2026-0001 ("Consola poste xx", de MN, 07/10 17:31–17:33), a saída de 2 un do M191 que ele gerou (mvM4500872646) e 4 alertas. Nenhuma outra diferença nos movimentos entre os 3 ficheiros.
- Por ordem do Rui, nada disto fica gravado: migração `remover-pedido-mario-20261008` apaga os registos e guarda-os como "apagados" (movimentos, pedidos, alertas); a sincronização passou a respeitar apagados de pedidos e alertas, para não voltarem. Stock do M191 volta ao valor anterior.
- Login: não estava obrigatório (OBRAS.loginObrigatorio desligado — só liga com o botão "Exigir login a todos" em Definições → Utilizadores, que pede nome/e-mail/palavra-passe do administrador). Por isso o Mário entrou à vontade. Ainda por ligar (precisa da palavra-passe do Rui).
- Versão 08/10/2026 09:00, sw VERSAO 2026-10-08-1. Publicado.
