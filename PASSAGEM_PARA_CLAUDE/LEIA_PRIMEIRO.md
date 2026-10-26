# Leia primeiro - passagem completa para o Claude

## Objetivo

Continuar a desenvolver e manter a aplicação local **Gestão de Materiais de Catenária**, sem perder dados, decisões, regras de negócio ou o trabalho de leitura dos cadernos de montagem.

Responsável/utilizador principal: **Rui Simões**, DTE Instalações Especiais, Departamento de Catenária.

## Como abrir

- Abrir `gestao_armazem_catenaria.html` no Microsoft Edge ou Google Chrome.
- Em alternativa executar `ABRIR_NO_WINDOWS.cmd`.
- O projeto foi adaptado para Windows. Não converter caminhos para macOS/Linux.

## Limitação crítica do armazenamento

O HTML contém dados iniciais em `SEED_DATA`, mas o navegador persiste alterações em `localStorage`, chave `dte_armazem_multi_v1`.

Consequências:

- O ficheiro HTML e o JSON não garantem, sozinhos, que incluem a última alteração feita manualmente no navegador.
- Antes de limpar dados, trocar de navegador, mudar o caminho do HTML ou migrar para outra plataforma, usar o botão de backup da aplicação.
- A aplicação faz fusão automática de vários registos determinísticos do `SEED_DATA` com o `localStorage`.
- Não apagar `localStorage` sem backup confirmado pelo Rui.

## Estado dos ficheiros em 17/08/2026

- Materiais no `SEED_DATA`: **1.937**
- Movimentos no `SEED_DATA`: **2.243**
- Linhas de pedidos de compra: **872**
- Postes: **448**
- Montagens/desenhos indexados: **700**
- HTML principal: `gestao_armazem_catenaria.html`
- JSON coerente com o último `SEED_DATA`: `dados_armazem_catenaria.json`
- Backup imediatamente anterior à atualização SAP de 17/08: `gestao_armazem_catenaria_backup_antes_SAP_20260817.html`

## O que enviar ao Claude se não tiver acesso à pasta inteira

Enviar, pela seguinte ordem:

1. `CLAUDE.md`
2. Esta pasta `PASSAGEM_PARA_CLAUDE`
3. `gestao_armazem_catenaria.html`
4. `dados_armazem_catenaria.json`
5. O backup JSON mais recente descarregado pelo próprio programa
6. Apenas os PDFs/Excel relevantes para a tarefa seguinte

O ZIP preparado inclui o programa, os dados, regras, guias, mapas e documentos locais do projeto.
