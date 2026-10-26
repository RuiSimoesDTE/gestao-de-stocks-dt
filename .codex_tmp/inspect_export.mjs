import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/dst7973/Desktop/EXPORT_20260714_114521.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");
const rows = sheet.getRange("A1:Y640").values;
console.log("HEADERS", JSON.stringify(rows[0]));

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const wanted = new Set(["123A","512","217A","515","514A","112A","18A","16D8","16D9","307","406B"]);
const norm = (x) => String(x ?? "").trim().toUpperCase();
const stock = new Map(db.materiais.map(m => [m.id, 0]));
for (const mv of db.movimentos) {
  const q = Number(mv.qtd || 0);
  if (mv.tipo === "entrada") stock.set(mv.mat, (stock.get(mv.mat) || 0) + q);
  if (mv.tipo === "saida") stock.set(mv.mat, (stock.get(mv.mat) || 0) - q);
}
for (const m of db.materiais.filter(m => wanted.has(norm(m.codigo)))) {
  console.log("MATERIAL", JSON.stringify({id:m.id,codigo:m.codigo,desc:m.desc,sap:m.sap,stock:stock.get(m.id)||0}));
}
for (const m of db.materiais.filter(m => /chavet|isolador sint/i.test(m.desc || ""))) {
  console.log("DESCRICAO", JSON.stringify({id:m.id,codigo:m.codigo,desc:m.desc,sap:m.sap,stock:stock.get(m.id)||0}));
}

const internal = new Map();
for (const mv of db.movimentos.filter(m => m.tipo === "entrada" && m.pedido)) {
  const mat = db.materiais.find(x => x.id === mv.mat);
  if (!mat?.sap) continue;
  const key = `${norm(mv.pedido)}|${norm(mat.sap)}`;
  internal.set(key, (internal.get(key) || 0) + Number(mv.qtd || 0));
}
const sap = new Map();
for (const r of rows.slice(1)) {
  const po=norm(r[9]), material=norm(r[7]);
  if (!po || !material || material === "0") continue;
  const ordered=Number(r[11]||0), outstanding=Number(r[16]||0);
  const received=Math.max(0, ordered-outstanding);
  const key=`${po}|${material}`;
  const cur=sap.get(key)||{po,material,desc:[],supplier:r[6],ordered:0,outstanding:0,received:0};
  cur.ordered+=ordered; cur.outstanding+=outstanding; cur.received+=received;
  if (r[8] && !cur.desc.includes(r[8])) cur.desc.push(r[8]);
  sap.set(key,cur);
}
const missing=[];
for (const [key,s] of sap) {
  const inDb=internal.get(key)||0;
  if (s.received > inDb + 1e-9) missing.push({...s,inDb,missing:s.received-inDb});
}
missing.sort((a,b)=>b.missing-a.missing);
console.log("MISSING_COUNT",missing.length);
for (const x of missing) console.log("MISSING",JSON.stringify(x));
