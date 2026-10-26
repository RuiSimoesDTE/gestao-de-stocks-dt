import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const norm = x => String(x ?? "").trim();
const dateValue = n => {
  if (!n) return "";
  if (n instanceof Date) return n.toISOString().slice(0, 10);
  if (typeof n === "number") return new Date(Date.UTC(1899, 11, 30) + n * 86400000).toISOString().slice(0, 10);
  return norm(n);
};
async function load(path) {
  const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
  const sh = wb.worksheets.getItemAt(0);
  return sh.getUsedRange(true).values.slice(1)
    .filter(r => norm(r[9]) && norm(r[1]))
    .map(r => ({
      key:`${norm(r[9])}|${norm(r[1])}`,
      po:norm(r[9]), item:norm(r[1]), date:dateValue(r[5]),
      supplier:norm(r[6]), sap:norm(r[7]), desc:norm(r[8]),
      ordered:Number(r[11]||0), unit:norm(r[12]),
      outstanding:Number(r[16]||0), remainingInvoice:Number(r[18]||0),
      deleted:norm(r[22]),
    }));
}

const oldRows = await load("C:/Users/dst7973/Desktop/EXPORT_20260714_114521.xlsx");
const newRows = await load("C:/Users/dst7973/Desktop/EXPORT_20260723_104844.xlsx");
const oldByKey = new Map(oldRows.map(r => [r.key, r]));
const added = newRows.filter(r => !oldByKey.has(r.key));
const changed = newRows.flatMap(r => {
  const o = oldByKey.get(r.key);
  if (!o) return [];
  const fields = ["ordered","outstanding","remainingInvoice","deleted"];
  const diffs = Object.fromEntries(fields.filter(k => o[k] !== r[k]).map(k => [k,{old:o[k],new:r[k]}]));
  return Object.keys(diffs).length ? [{...r,diffs}] : [];
});
const removed = oldRows.filter(r => !newRows.some(n => n.key === r.key));
console.log("DIFF_SUMMARY", JSON.stringify({
  oldLines:oldRows.length,newLines:newRows.length,
  addedLines:added.length,addedPOs:new Set(added.map(r=>r.po)).size,
  changedLines:changed.length,removedLines:removed.length,
},null,2));
for (const r of added) console.log("ADDED",JSON.stringify(r));
for (const r of changed) console.log("STATUS",JSON.stringify(r));
for (const r of removed) console.log("REMOVED",JSON.stringify(r));

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json","utf8"));
const codes = ["359","660","1105","16D8","512","16D4","480","291A","9U1","4002623"];
const mats = db.materiais.filter(m => codes.includes(norm(m.codigo)));
for (const m of mats) {
  const history = db.movimentos.filter(v => v.mat === m.id);
  const stock = history.reduce((s,v)=>s+(v.tipo==="entrada"?Number(v.qtd||0):v.tipo==="saida"?-Number(v.qtd||0):0),0);
  console.log("MAT",JSON.stringify({
    id:m.id,codigo:m.codigo,sap:m.sap,desc:m.desc,un:m.un,stock,
    last:history.slice().sort((a,b)=>norm(a.data).localeCompare(norm(b.data))).slice(-6)
      .map(v=>({data:v.data,tipo:v.tipo,qtd:v.qtd,doc:v.doc,dest:v.dest,obs:v.obs}))
  }));
}
