import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const jsonPath = "dados_armazem_catenaria.json";
const htmlPath = "gestao_armazem_catenaria.html";
const exportPath = "C:/Users/dst7973/Desktop/EXPORT_20260723_104844.xlsx";
const importMarker = "Importado EXPORT SAP 23/07/2026";
const targetKeys = new Set([
  "4500877856|10",
  "4500878307|10",
  "4500878381|10","4500878381|20","4500878381|30",
  "4500879064|10","4500879064|20","4500879064|30","4500879064|40","4500879064|50","4500879064|60",
  "4500879073|10","4500879073|20","4500879073|30",
]);
const existingMap = {
  "4500878307|10":"M4485",
  "4500878381|10":"M4004",
  "4500878381|20":"M4004",
  "4500879064|30":"M4004",
  "4500879064|40":"M4004",
  "4500879073|10":"M4009",
  "4500879073|20":"M4010",
  "4500879073|30":"M4028",
};
const norm = x => String(x ?? "").trim();
const excelDate = n => new Date(Date.UTC(1899, 11, 30) + Number(n) * 86400000).toISOString().slice(0, 10);
const cleanSupplier = s => norm(s).replace(/^\d+\s+/, "").trim();
const unit = u => ({UN:"un",KG:"kg",M:"m",VG:"vg",UA:"ua",ROL:"rol",L:"l"}[norm(u).toUpperCase()] || norm(u).toLowerCase() || "un");
function findJsonEnd(text, start) {
  let depth=0, inString=false, escaped=false;
  for (let i=start;i<text.length;i++) {
    const c=text[i];
    if (inString) {
      if (escaped) escaped=false;
      else if (c==="\\") escaped=true;
      else if (c==='"') inString=false;
      continue;
    }
    if (c==='"') inString=true;
    else if (c==="{") depth++;
    else if (c==="}" && --depth===0) return i+1;
  }
  throw new Error("SEED_DATA incompleto.");
}

const db = JSON.parse(await fs.readFile(jsonPath, "utf8"));
if (db.encomendas.some(e => String(e.obs || "").includes(importMarker))) {
  throw new Error("Importação já existente; cancelado para evitar duplicação.");
}
const existingOrderKeys = new Set(db.encomendas.map(e => {
  const item = String(e.obs || "").match(/Item\s+(\d+)/i)?.[1];
  return item ? `${norm(e.pedido)}|${item}` : "";
}));
for (const key of targetKeys) if (existingOrderKeys.has(key)) throw new Error(`Linha já existente: ${key}`);

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(exportPath));
const rows = wb.worksheets.getItemAt(0).getUsedRange(true).values.slice(1).map(r => ({
  key:`${norm(r[9])}|${norm(r[1])}`, po:norm(r[9]), item:norm(r[1]), pep:norm(r[4]),
  date:excelDate(r[5]), supplier:cleanSupplier(r[6]), sap:norm(r[7]), desc:norm(r[8]),
  ordered:Number(r[11] || 0), un:unit(r[12]), outstanding:Number(r[16] || 0),
})).filter(r => targetKeys.has(r.key));
if (rows.length !== 14 || new Set(rows.map(r => r.key)).size !== 14) {
  throw new Error(`Esperadas 14 linhas únicas; encontradas ${rows.length}.`);
}

let seq = Math.max(
  Number(db.seq || 1),
  ...db.materiais.map(m => Number(String(m.id).match(/\d+/)?.[0] || 0)),
  ...db.encomendas.map(e => Number(String(e.id).match(/\d+/)?.[0] || 0)),
  ...db.movimentos.map(m => Number(String(m.id).match(/\d+/)?.[0] || 0)),
) + 1;
const materialByKey = new Map();
const newMaterials = [];
for (const r of rows) {
  let mat;
  if (existingMap[r.key]) {
    mat = db.materiais.find(m => m.id === existingMap[r.key]);
  } else {
    mat = db.materiais.find(m => norm(m.sap) === r.sap && norm(m.desc).toUpperCase() === r.desc.toUpperCase());
    if (!mat) {
      if (db.materiais.some(m => norm(m.codigo).toUpperCase() === r.sap.toUpperCase())) {
        throw new Error(`Código SAP já usado por outro material: ${r.sap}`);
      }
      mat = {
        id:`M${seq++}`, codigo:r.sap, desc:r.desc, un:r.un, cat:"Importado SAP", min:0,
        sap:r.sap, ref:"", fornecedor:r.supplier, tipo:"Consumível",
      };
      db.materiais.push(mat);
      newMaterials.push(mat);
    }
  }
  if (!mat) throw new Error(`Material não resolvido: ${r.key}`);
  materialByKey.set(r.key, mat);
}

const newOrders = rows.map(r => {
  const received = Math.max(0, r.ordered - r.outstanding);
  return {
    id:`M${seq++}`, pedido:r.po, mat:materialByKey.get(r.key).id,
    qtdEnc:r.ordered, qtdRecebida:received, un:r.un, fornecedor:r.supplier, data:r.date,
    obs:`${importMarker} | PEP ${r.pep} | Item ${r.item} | Descrição SAP: ${r.desc}`,
  };
});
db.encomendas.push(...newOrders);
db.seq = seq;

const html = await fs.readFile(htmlPath, "utf8");
const prefix = "const SEED_DATA=";
const prefixAt = html.indexOf(prefix);
if (prefixAt < 0) throw new Error("SEED_DATA não encontrado.");
const objectStart = prefixAt + prefix.length;
const objectEnd = findJsonEnd(html, objectStart);

await fs.copyFile(jsonPath, `${jsonPath}.backup_antes_import_pedidos_20260723`);
await fs.copyFile(htmlPath, `${htmlPath}.backup_antes_import_pedidos_20260723`);
await fs.writeFile(jsonPath, JSON.stringify(db, null, 2) + "\n", "utf8");
await fs.writeFile(htmlPath, html.slice(0, objectStart) + JSON.stringify(db) + html.slice(objectEnd), "utf8");

console.log(JSON.stringify({
  purchaseOrders:new Set(rows.map(r => r.po)).size,
  orderLines:newOrders.length,
  newMaterials:newMaterials.map(m => ({id:m.id,codigo:m.codigo,desc:m.desc})),
  physicalStockMovements:0,
  fullySupplied:newOrders.filter(e => e.qtdRecebida === e.qtdEnc).length,
  pending:newOrders.filter(e => e.qtdRecebida < e.qtdEnc).length,
  seq:db.seq,
}, null, 2));
