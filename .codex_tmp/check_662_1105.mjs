import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const relevant = db.materiais.filter(m =>
  ["662", "1105"].includes(String(m.codigo || "").trim()) ||
  /uni[aã]o.*(vara|electrodo)|(?:vara|electrodo).*uni[aã]o/i.test(String(m.desc || ""))
);
for (const m of relevant) {
  const moves = db.movimentos.filter(v => v.mat === m.id).sort((a,b)=>String(a.data).localeCompare(String(b.data)));
  const stock = moves.reduce((s,v)=>s+(v.tipo==="entrada"?Number(v.qtd||0):v.tipo==="saida"?-Number(v.qtd||0):0),0);
  console.log("MATERIAL", JSON.stringify({id:m.id,codigo:m.codigo,sap:m.sap,desc:m.desc,un:m.un,fornecedor:m.fornecedor,stock,moves:moves.slice(-15)}));
}
for (const e of db.encomendas.filter(e =>
  /jobasi/i.test(String(e.fornecedor || "")) &&
  (/uni[aã]o|vara|electrodo/i.test(String(e.desc || "")) || ["662","1105"].includes(String(e.codigo || "").trim()))
)) console.log("ORDER", JSON.stringify(e));

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load("C:/Users/dst7973/Desktop/EXPORT_20260723_104844.xlsx"));
const rows = wb.worksheets.getItemAt(0).getUsedRange(true).values.slice(1);
for (const r of rows.filter(r =>
  /jobasi/i.test(String(r[6] || "")) &&
  (/uni[aã]o|vara|electrodo/i.test(String(r[8] || "")) || ["662","1105"].includes(String(r[7] || "").trim()))
)) console.log("SAP", JSON.stringify({
  item:r[1],date:r[5],supplier:r[6],sap:r[7],desc:r[8],po:r[9],
  ordered:r[11],unit:r[12],outstanding:r[16],remainingInvoice:r[18],deleted:r[22],
}));
