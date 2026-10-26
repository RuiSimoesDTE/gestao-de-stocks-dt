# Aplicação instalável (PWA) — Gestão de Materiais de Catenária

Feito a 02/10/2026. O programa continua a ser um único ficheiro HTML; a PWA só acrescenta
ícone, janela própria e funcionamento sem ligação.

## Como abrir como aplicação
1. Duplo clique em **`ABRIR_COMO_APP.cmd`**. Liga o servidor local (`servidor_local.ps1`, só neste
   computador, porta 8765) e abre o programa numa janela do Edge sem barra de endereço.
2. Para **instalar** (ícone no ambiente de trabalho / menu Iniciar): botão **📲 Instalar app** no
   cabeçalho, ou Definições → "Aplicação instalável". Também serve o menu do Edge → Aplicações.
3. O servidor tem de estar ligado para abrir. Se o `ABRIR_COMO_APP.cmd` for usado, liga-se sozinho.

## Atenção: os dados NÃO passam sozinhos
Os dados ficam no navegador **e no endereço** onde o programa é aberto.
`file:///…gestao_armazem_catenaria.html` (duplo clique) e `http://localhost:8765/…` são **dois sítios
diferentes**, cada um com os seus dados.
- No sítio antigo: **Backup (JSON)**.
- No sítio novo: **Restaurar**.
- Nunca limpar os dados do navegador sem um backup confirmado. Definições → "Proteger os dados"
  pede ao navegador para não os apagar automaticamente.

## Sem ligação
Depois de aberto uma vez, o programa abre sem rede, ou com o servidor local desligado. Aparece
"● Sem ligação" no cabeçalho quando o PC está sem rede. Os PDFs (guias, cadernos) só abrem sem ligação
depois de terem sido abertos uma vez.

## Atualizações
O ficheiro `sw.js` guarda a cópia da aplicação. Quando o HTML é alterado, a página nova é
apanhada na abertura seguinte (rede primeiro). Para forçar limpeza total: subir `VERSAO` no `sw.js`.
Aparece o aviso "Há uma versão nova" com o botão Atualizar.

## Ficheiros
`manifest.webmanifest`, `sw.js`, `icons/` (logótipo oficial da DTE), `servidor_local.ps1`,
`ABRIR_COMO_APP.cmd`, `access-config.json`.

## O que a PWA NÃO faz
- **Não grava numa pasta partilhada.** Cada pessoa/computador tem os seus dados. Pôr a pasta numa
  partilha não junta os dados de ninguém.
- **Não tem login nem acessos por pessoa.** O cartão de utilizador em Definições é só informativo.
- Para vários utilizadores com dados comuns e login por e-mail da DTE é preciso: endereço https,
  login Microsoft 365 (Entra ID, registado pela informática) e dados centrais (Listas do
  SharePoint). Ver `POR_FAZER.md`, secção 3.

## Testado (Edge 144, perfil limpo, 02/10/2026)
Manifesto válido; service worker ativo e a controlar a página; botão de instalar disponível;
sem servidor a página abre com os 1571 materiais; PDF já visto abre sem rede; PDF nunca visto
devolve erro (não a página da aplicação); módulo Pendulagem abre em iframe sem rede.
Não testado: instalação real (clique no botão) e o atalho `?area=` em janela instalada.
