import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const exportPath = "C:/Users/dst7973/Desktop/EXPORT_20260723_104844.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(exportPath));
console.log((await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 5000,
  tableMaxRows: 5,
  tableMaxCols: 25,
})).ndjson);

const sheet = workbook.worksheets.getItemAt(0);
const used = sheet.getUsedRange(true);
const rows = used.values;
const headers = rows[0].map(v => String(v ?? "").trim());
const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const norm = x => String(x ?? "").trim();
const clean = s => norm(s).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]+/g, " ").trim();
const excelDate = n => {
  if (!n) return "";
  if (n instanceof Date) return n.toISOString().slice(0, 10);
  if (typeof n === "number") return new Date(Date.UTC(1899, 11, 30) + n * 86400000).toISOString().slice(0, 10);
  const m = norm(n).match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : norm(n);
};

console.log("HEADERS", JSON.stringify(headers));
const existingByKey = new Map();
for (const e of db.encomendas) {
  const item = norm(e.obs).match(/Item\s+(\d+)/i)?.[1];
  if (item) existingByKey.set(`${norm(e.pedido)}|${item}`, e);
}

const exportRows = rows.slice(1).filter(r => norm(r[9]) && norm(r[1])).map(r => ({
  key: `${norm(r[9])}|${norm(r[1])}`,
  po: norm(r[9]),
  item: norm(r[1]),
  class: norm(r[2]),
  category: norm(r[3]),
  pep: norm(r[4]),
  date: excelDate(r[5]),
  supplier: norm(r[6]),
  material: norm(r[7]),
  desc: norm(r[8]),
  ordered: Number(r[11] || 0),
  unit: norm(r[12]),
  outstanding: Number(r[16] || 0),
  remainingInvoice: Number(r[18] || 0),
  deleted: norm(r[22]),
}));

const missing = exportRows.filter(r => !existingByKey.has(r.key));
const changed = exportRows.flatMap(r => {
  const e = existingByKey.get(r.key);
  if (!e) return [];
  const receivedSap = r.ordered - r.outstanding;
  const delta = receivedSap - Number(e.qtdRecebida || 0);
  const qtyChanged = Number(e.qtd || 0) !== r.ordered;
  return delta !== 0 || qtyChanged ? [{...r, appOrdered:Number(e.qtd||0), appReceived:Number(e.qtdRecebida||0), receivedSap, receiptDelta:delta}] : [];
});
const uniq = xs => new Set(xs).size;
console.log("SUMMARY", JSON.stringify({
  sheet: sheet.name, usedAddress: used.address,
  exportLines: exportRows.length,
  exportPOs: uniq(exportRows.map(r => r.po)),
  existingLines: db.encomendas.length,
  missingLines: missing.length,
  missingPOs: uniq(missing.map(r => r.po)),
  changedMatchedLines: changed.length,
}, null, 2));

for (const r of missing.sort((a,b)=>a.date.localeCompare(b.date)||a.po.localeCompare(b.po)||Number(a.item)-Number(b.item))) {
  const candidates = db.materiais.filter(m =>
    norm(m.sap) === r.material ||
    norm(m.codigo) === r.material ||
    String(m.codigo_alt || "").split(";").map(norm).includes(r.material) ||
    clean(m.desc) === clean(r.desc)
  );
  console.log("MISSING", JSON.stringify({...r, candidates:candidates.slice(0,8).map(m=>({id:m.id,codigo:m.codigo,sap:m.sap,desc:m.desc}))}));
}
for (const r of changed.sort((a,b)=>a.date.localeCompare(b.date)||a.po.localeCompare(b.po)||Number(a.item)-Number(b.item))) {
  console.log("CHANGED", JSON.stringify(r));
}

const targetCodes = new Set(["359","660","1105","16D8","512","16D4","480","291A"]);
const targetMaterials = db.materiais.filter(m =>
  targetCodes.has(norm(m.codigo).toUpperCase()) ||
  /LXV\s*50|CABO.*TERRA.*50|ABRACAD.*ELECTRODO|BRA.CADEIRA.*ELECTRODO|CHAVETA.*5X50/i.test(norm(m.desc))
);
const stockByMat = new Map(db.materiais.map(m => [m.id, 0]));
for (const mv of db.movimentos) {
  const qtd = Number(mv.qtd || 0);
  if (mv.tipo === "entrada") stockByMat.set(mv.mat, (stockByMat.get(mv.mat) || 0) + qtd);
  if (mv.tipo === "saida") stockByMat.set(mv.mat, (stockByMat.get(mv.mat) || 0) - qtd);
}
for (const m of targetMaterials) {
  console.log("MATERIAL", JSON.stringify({id:m.id,codigo:m.codigo,sap:m.sap,desc:m.desc,un:m.un,stock:stockByMat.get(m.id)||0,fornecedor:m.fornecedor}));
}
