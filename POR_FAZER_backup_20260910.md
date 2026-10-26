# Por fazer — Gestão de Materiais de Catenária

Atualizado em **28/08/2026**. Lista do que ficou em aberto depois da revisão dos desenhos
normativos, da conferência dos cadernos de montagem e da auditoria aos dados.

---

## 1. À espera de documentos ou de uma decisão do Rui

### 1.1 Designações das peças — 396 por identificar
Dos 987 códigos do Manual de Peças de Catenária da IP (GR.MN.CAT.003 v.01), **591 têm nome**
e **396 não**. O PDF que temos é só o anexo da correspondência de códigos: não traz descrições.

Tentativa já feita: li **566 desenhos** da biblioteca do OneDrive e extraí 409 designações
(estão no programa, na tabela `NOMES_PECAS_DESENHOS`). Só acrescentaram 2 nomes novos —
os restantes já eram conhecidos. Dos 987 códigos, o leitor só apanha 474; os outros 513 não
aparecem em formato legível, porque nem todos os desenhos usam a coluna "Cód. XXX".

**Precisa-se:** as páginas do manual com as designações **ou** autorização para melhorar o
leitor de tabelas dos desenhos (algumas horas, sem garantia).

### 1.2 Preços — não existem
O campo `preco` existe e está **vazio** em 1.732 materiais, 875 encomendas e 2.270 movimentos.
A única fonte de valores é o mapa `mapas_mensais/IC-0019_Consumos_31_05_2026_PREENCHIDO.xlsx`,
coluna "Valor total", com **338 materiais** — mas é a valorização do stock a 31/05/2026 (custo
médio do SAP), não o preço de compra.

**Precisa-se:** exportação do SAP com valor unitário e valor de linha. O importador pode ser
preparado para as aceitar assim que houver ficheiro.

### 1.3 Encomendas órfãs — 43 linhas + 2 movimentos
Apontam para fichas de material que **nunca existiram** no programa (M2458, M2464, M374, …).
Procurado em todos os backups desde julho: aparecem só como referência, nunca como ficha.
Vieram de uma importação SAP antiga.

**Precisa-se:** abrir os 11 pedidos de compra no SAP e trazer código e designação de cada linha.
Lista pronta em **`encomendas_orfas_para_SAP.csv`**.
PCs: 4500848364, 4500848628, 4500851088, 4500851211, 4500851305, 4500851896, 4500851945,
4500854997, 4500855000, 4500855444, 4500864211.

### 1.4 Peça 662 registada duas vezes
`M177` — "Ligador paralelo p/ cabos de Alumínio 20-90 A"
`M4041` — "Ligador Paralelo de Alumínio"
Mesmo código (662) e mesmo código novo (05.100.13), descrições diferentes. Não foram juntas
porque a regra de fusão exige descrição igual.

**Precisa-se:** confirmar que são a mesma peça.

### 1.5 Movimentos incompletos
- **Sem data:** `mv4419`, `mv4420`, `mv4421` — entradas de cabo Bz 12mm², Bz 25mm² e Cu 95mm².
- **Com quantidade zero:** `mv4074`, `mv4075` — meia garra p/ FC e p/ cabo de suporte, 13/11/2025.

Não se inventam datas nem quantidades.

### 1.6 Poste 50-36A sem medidas
Tem `tirTubo: "E-6181 Sc (19x26)"` e mais nada — sem TL, TT, K, KL nem consolas. O tubo não
pode ser convertido em metros.

---

## 2. Pode ser feito, falta ordem

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

## Estado dos dados em 28/08/2026

| | |
|---|---|
| Materiais | 1.732 no ficheiro (1.739 no navegador, com as fichas criadas na abertura) |
| Movimentos | 2.270 no ficheiro (2.304 no navegador, com os 23 acertos e os AC) |
| Encomendas | 875 |
| Postes | 448 |
| Montagens | 702 |
| Pendências no projeto | **0** |
| Stock negativo | **0** |

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
