# Relatório — PWA (02/10/2026)

## O que foi feito
- `manifest.webmanifest`: nome "Gestão de Materiais de Catenária — DTE", abre em janela própria, 3 ícones, 3 atalhos (Saídas, Stock, Guias AT).
- `icons/`: ícones gerados a partir do logótipo oficial da DTE (o mesmo "dte instalações especiais" do `logo_dte_dst.png`, em branco sobre azul, com a legenda CATENÁRIA). A faixa de padrões azuis ficou de fora por não se ler em tamanhos pequenos.
- `sw.js`: guarda a aplicação para abrir sem rede (página: rede primeiro, 4 s, depois cópia; ficheiros: cópia primeiro; PDFs só depois de abertos uma vez). Nunca mexe nos dados (localStorage).
- HTML: ligações no `<head>`, botão "Instalar app", indicador "Sem ligação", cartão "Aplicação instalável" em Definições, atalhos `?area=`, aviso de versão nova. 15 blocos JavaScript, 0 erros de sintaxe. Backup: `gestao_armazem_catenaria_backup_antes_pwa_20261002.html`.
- `servidor_local.ps1` + `ABRIR_COMO_APP.cmd`: servidor local (só neste PC, porta 8765) e abertura em janela de aplicação do Edge.
- `LEIA_ME_PWA.md` e `POR_FAZER.md` (secção 1.13) atualizados.
- Dados (HTML e JSON) **não foram alterados** por esta tarefa.

## Testes
| Teste | Resultado |
|---|---|
| Servidor PowerShell: página, manifesto, sw.js, ícones, PDF | 200, tipos corretos |
| Servidor: `..` codificado, `.git`, `node_modules`, POST | 403 / 404 / 404 / 405 |
| Edge 144 (perfil limpo): manifesto | válido (3 ícones, 3 atalhos, standalone) |
| Service worker | ativo e a controlar a página |
| Cartão em Definições | "Funciona sem ligação: sim", 12 ficheiros guardados, "Instalar: disponível" |
| Servidor desligado, página | abre, com 1571 materiais |
| PDF já visto sem rede | abre (200, application/pdf) |
| PDF nunca visto sem rede | erro 504 (não devolve a página da aplicação) |
| Módulo Pendulagem em iframe sem rede | abre |
| Navegador integrado da app Claude | não suporta service workers (falha até com um SW vazio); não é erro do `sw.js` |

## Não testado / avisos
- Instalação real (clique em "Instalar") e atalhos `?area=` numa janela instalada.
- Conteúdo exato das caches: o script de verificação bloqueou; só se confirmou "12 ficheiros guardados" e que a PWA funciona sem rede.
- O indicador "Sem ligação" depende de o PC estar sem rede; com a rede ligada e só o servidor local desligado não aparece (a página abre na mesma).
- Num comando de limpeza dos testes terminei processos do Edge. Se tinhas o Edge aberto, pode ter fechado: abre-o de novo (os dados guardados não se perdem).
- Dados do navegador: file:// e http://localhost são sítios diferentes. Backup (JSON) antes de mudar, Restaurar depois.

## Pedidos de hoje que ficaram por resolver
- **Gravar sempre numa pasta partilhada:** a PWA não faz isso. Cada computador tem os seus dados. Opções em `POR_FAZER.md` 1.13.
- **Login com o e-mail de cada pessoa:** precisa de https, Microsoft Entra ID (informática) e dados centrais. Anotado.
- **Código 627 para a Pampilhosa:** falta quantidade, data e guia.
