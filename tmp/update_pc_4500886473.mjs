import fs from "node:fs/promises";

const root = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte";
const htmlPath = `${root}/gestao_armazem_catenaria.html`;
const jsonPath = `${root}/dados_armazem_catenaria.json`;
const priorBackupPath = `${root}/backup_armazem_catenaria_2026-08-21_14h43.json`;
const newBackupPath = `${root}/backup_armazem_catenaria_2026-08-24_PC4500886473.json`;

const date = "2026-08-24";
const supplier = "220117781  Joao S. Azevedo, Lda";
const pedido = "4500886473";
const lines = [
  { item: "10", sap: "5004614", desc: "CHAVES EM CRUZ CCF 5 RODES ANT", qty: 2 },
  { item: "20", sap: "4019688", desc: "CHAVES DE PORTAS CB6", qty: 2 },
  { item: "30", sap: "LPL0001", desc: "LAMPADA LED STANDARD E27 12W 4000K", qty: 4 },
];

const materials = lines.map(x => ({
  id: `sap20260824-mat-${pedido}-${x.item}`,
  codigo: x.sap,
  desc: x.desc,
  un: "un",
  cat: "Importado SAP",
  min: 0,
  sap: x.sap,
  ref: "",
  fornecedor: supplier,
  tipo: "Consumível",
}));

const orders = lines.map(x => ({
  id: `sap20260824-enc-${pedido}-${x.item}`,
  pedido,
  mat: `sap20260824-mat-${pedido}-${x.item}`,
  qtdEnc: x.qty,
  qtdRecebida: x.qty,
  un: "un",
  fornecedor: supplier,
  data: date,
  estado: "Concluída",
  obs: `Importado EXPORT SAP 24/08/2026 | PEP IC-0019 | Item ${x.item} | Descrição SAP: ${x.desc}`,
}));

const movements = lines.flatMap(x => {
  const mat = `sap20260824-mat-${pedido}-${x.item}`;
  return [
    {
      id: `sap20260824-entrada-${pedido}-${x.item}`,
      data: date,
      tipo: "entrada",
      mat,
      qtd: x.qty,
      arm: "Armazém Catenária",
      armDst: null,
      pedido,
      doc: `Receção SAP / PC ${pedido}`,
      origem: supplier,
      dest: "Obra IC-0019 - Vendas Novas",
      obs: `Entrada total confirmada pelo utilizador em 24/08/2026 | Item ${x.item} | ${x.desc}.`,
      ajuste: false,
      user: "",
      ref: null,
    },
    {
      id: `sap20260824-saida-${pedido}-${x.item}`,
      data: date,
      tipo: "saida",
      mat,
      qtd: x.qty,
      arm: "Armazém Catenária",
      armDst: null,
      pedido,
      doc: `Consumo de obra / PC ${pedido}`,
      origem: "Armazém Catenária",
      dest: "Consumo de obra IC-0019 - Vendas Novas",
      obs: `Saída total autorizada pelo utilizador em 24/08/2026 | Item ${x.item} | ${x.desc}. Incluir nos consumos apenas a partir de 24/08/2026; não incluir no mapa fechado até 21/08/2026.`,
      ajuste: false,
      user: "",
      ref: null,
    },
  ];
});

function addUnique(target, key, records) {
  if (!Array.isArray(target[key])) target[key] = [];
  const ids = new Set(target[key].map(x => x.id));
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Registo já existente: ${record.id}`);
    target[key].push(record);
    ids.add(record.id);
  }
}

function applyToFlat(flat) {
  addUnique(flat, "materiais", materials);
  addUnique(flat, "encomendas", orders);
  addUnique(flat, "movimentos", movements);
}

function findJsonEnd(text, start) {
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error("Fim do SEED_DATA não encontrado");
}

const flat = JSON.parse(await fs.readFile(jsonPath, "utf8"));
applyToFlat(flat);
await fs.writeFile(jsonPath, JSON.stringify(flat, null, 2) + "\n", "utf8");

let html = await fs.readFile(htmlPath, "utf8");
const marker = "const SEED_DATA=";
const markerPos = html.indexOf(marker);
if (markerPos < 0) throw new Error("SEED_DATA não encontrado no HTML");
const jsonStart = markerPos + marker.length;
const jsonEnd = findJsonEnd(html, jsonStart);
const htmlSeed = JSON.parse(html.slice(jsonStart, jsonEnd));
applyToFlat(htmlSeed);
html = html.slice(0, jsonStart) + JSON.stringify(htmlSeed) + html.slice(jsonEnd);
await fs.writeFile(htmlPath, html, "utf8");

const backup = JSON.parse(await fs.readFile(priorBackupPath, "utf8"));
const vendas = backup.obras?.vendas_novas ?? backup;
applyToFlat(vendas);
backup.exportadoEm = "2026-08-24T11:03:18+01:00";
backup.notaAtualizacao = "PC 4500886473: entradas e saídas totais JS Azevedo em 24/08/2026; consumos apenas a partir de 24/08/2026.";
await fs.writeFile(newBackupPath, JSON.stringify(backup, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  html: { materiais: htmlSeed.materiais.length, movimentos: htmlSeed.movimentos.length, encomendas: htmlSeed.encomendas.length },
  json: { materiais: flat.materiais.length, movimentos: flat.movimentos.length, encomendas: flat.encomendas.length },
  backup: { materiais: vendas.materiais.length, movimentos: vendas.movimentos.length, encomendas: vendas.encomendas.length },
  added: { materiais: materials.length, movimentos: movements.length, encomendas: orders.length },
  balances: lines.map(x => ({ sap: x.sap, entrada: x.qty, saida: x.qty, saldo: 0 })),
  newBackupPath,
}, null, 2));
