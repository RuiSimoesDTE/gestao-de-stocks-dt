# Correção do envio de sugestões

## Problema observado

Na área **Stocks → Ver mais → Sugestões**, o utilizador preenche o assunto e a descrição e carrega em **Preparar email**, mas a aplicação fica apenas com a indicação:

> A abrir o cliente de email para rui.simoes@dte.pt...

O Outlook não abre e a mensagem não pode ser enviada.

## Diagnóstico já confirmado

- O formulário aceita os dados e a validação de assunto/descrição funciona.
- O clique no botão executa a função `enviarSugestao()`.
- Não foram encontrados erros de sintaxe nem erros JavaScript na consola.
- A função atual usa exclusivamente um URL `mailto:` através de `window.location.href`.
- O Windows tem o Outlook novo e o Outlook clássico instalados, mas a passagem do `mailto:` do navegador para o cliente de correio falha.
- Portanto, o problema não está nos dados do formulário: está na dependência do protocolo `mailto:`.

Código atual em `gestao_armazem_catenaria.html`:

```js
function enviarSugestao(){
  const d=dadosSugestao();if(!validarSugestao(d))return;
  const assunto='[Gestão de Stocks DTE] ['+d.categoria+'] '+d.assunto;
  document.getElementById('sug-estado').textContent='A abrir o cliente de email para '+EMAIL_SUGESTOES+'...';
  window.location.href='mailto:'+EMAIL_SUGESTOES+'?subject='+encodeURIComponent(assunto)+'&body='+encodeURIComponent(textoSugestao(d));
}
```

## Correção pedida

Alterar apenas a área de sugestões, sem mexer em `SEED_DATA`, stocks, movimentos, encomendas ou `dados_armazem_catenaria.json`.

1. Manter a validação atual dos campos obrigatórios.
2. Deixar de depender exclusivamente do `mailto:`.
3. Disponibilizar uma opção principal **Abrir no Outlook Web**, criando uma nova mensagem já preenchida com:
   - destinatário: `rui.simoes@dte.pt`;
   - assunto produzido atualmente;
   - corpo produzido por `textoSugestao(d)`.
4. Manter uma opção separada **Abrir no Outlook instalado** que utilize `mailto:` para quem tiver essa associação funcional.
5. Manter **Copiar texto** como alternativa segura.
6. Atualizar o texto explicativo e o estado apresentado ao utilizador, sem afirmar que o email foi enviado. A aplicação apenas prepara a mensagem; o utilizador deve confirmar e carregar em **Enviar** no Outlook.
7. Se o navegador bloquear a nova janela do Outlook Web, mostrar uma mensagem clara e copiar automaticamente o conteúdo para a área de transferência, ou orientar o utilizador a usar **Copiar texto**.
8. Usar `window.open(..., '_blank', 'noopener')` diretamente no clique do utilizador para reduzir bloqueios de pop-up.

O URL de composição deve ser construído com os valores codificados por `encodeURIComponent`, por exemplo a partir deste formato:

```text
https://outlook.office.com/mail/deeplink/compose?to=DESTINATARIO&subject=ASSUNTO&body=CORPO
```

Não incluir nome, contacto, assunto ou descrição em qualquer serviço intermédio. Os dados só devem ser usados no URL oficial do Outlook ou copiados localmente.

## Comportamento esperado

- **Abrir no Outlook Web** abre uma nova mensagem no Outlook Web com destinatário, assunto e corpo preenchidos.
- **Abrir no Outlook instalado** tenta abrir o cliente configurado no Windows.
- **Copiar texto** continua a copiar o conteúdo completo.
- Nenhuma opção deve indicar “mensagem enviada”, porque o envio final continua a depender do utilizador.
- O formulário deve continuar a bloquear assunto ou descrição vazios.

## Validação obrigatória

Antes de concluir:

1. Criar um backup do HTML principal.
2. Validar a sintaxe de todos os blocos JavaScript do HTML.
3. Testar no navegador os três caminhos: Outlook Web, cliente instalado e copiar texto.
4. Confirmar que o Outlook Web recebe corretamente caracteres portugueses, quebras de linha e textos longos.
5. Confirmar que não houve qualquer alteração ao `SEED_DATA` nem ao JSON de dados.

