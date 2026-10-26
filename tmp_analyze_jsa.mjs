import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const [dbPath, xlsxPath, inspectPath] = process.argv.slice(2);
const db = JSON.parse(await fs.readFile(dbPath, "utf8"));
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(xlsxPath));
const sheet = wb.worksheets.getItem("Sheet1");
const rows = sheet.getRange("A1:L442").values;
const sapRows = new Map();
for (let i = 1; i < rows.length; i++) {
  const sap = String(rows[i][0] ?? "").trim();
  if (!sapRows.has(sap)) sapRows.set(sap, []);
  sapRows.get(sap).push({ row: i + 1, desc: rows[i][1], pep: rows[i][5], stock: rows[i][6], consumo: rows[i][9] });
}

const mats = new Map(db.materiais.map(m => [String(m.id), m]));
const start = "2026-07-01", end = "2026-08-24";
const excluded = /ajuste|roubo|transfer/i;
const matched = [], unmatched = [], excludedMoves = [];
for (const mv of db.movimentos) {
  if (String(mv.tipo).toLowerCase() !== "saida" || mv.data < start || mv.data > end) continue;
  const m = mats.get(String(mv.mat));
  const supplier = String(m?.fornecedor ?? "");
  const isJsa = /azevedo/i.test(supplier) || /azevedo/i.test(String(mv.origem ?? "")) || /azevedo/i.test(String(mv.obs ?? ""));
  if (!isJsa) continue;
  const sap = String(m?.sap || m?.codigo_alt || "").trim();
  const rec = { id: mv.id, data: mv.data, qtd: Number(mv.qtd), sap, codigo: m?.codigo, desc: m?.desc, fornecedor: supplier, destino: mv.destino, obs: mv.obs, ajuste: !!mv.ajuste, rows: sapRows.get(sap) ?? [] };
  if (mv.ajuste || excluded.test(String(mv.destino ?? "")) || excluded.test(String(mv.obs ?? ""))) excludedMoves.push(rec);
  else if (rec.rows.length) matched.push(rec);
  else unmatched.push(rec);
}

let prior = null;
try {
  const lines = (await fs.readFile(inspectPath, "utf8")).split(/\r?\n/);
  const tableLine = lines.find(l => l.includes('"kind":"table"') && l.includes('"sheet":"Sheet1"') && l.includes('"address":"A1:L442"'));
  if (tableLine) prior = JSON.parse(tableLine).values;
} catch {}

const sums = {};
for (const r of matched) {
  sums[r.sap] ??= { sap:r.sap, desc:r.desc, total:0, moves:[], rows:r.rows };
  sums[r.sap].total += r.qtd;
  sums[r.sap].moves.push({id:r.id,data:r.data,qtd:r.qtd,destino:r.destino,obs:r.obs});
}
console.log(JSON.stringify({matchedSums:Object.values(sums), unmatched, excludedMoves, priorConsumptionRows: prior ? prior.map((r,i)=>({row:i+1,sap:r[0],desc:r[1],consumo:r[9]})).filter(x=>x.consumo!==null&&x.consumo!==undefined&&x.consumo!=="") : []}, null, 2));
