import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load("C:/Users/dst7973/Desktop/EXPORT_20260714_114521.xlsx"));
const sheet = workbook.worksheets.getItem("Sheet1");
const rows = sheet.getRange("A1:Y640").values.slice(1);
const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const norm=x=>String(x??"").trim();
const excelDate=n=>new Date(Date.UTC(1899,11,30)+Number(n)*86400000).toISOString().slice(0,10);

const existingKeys=new Set();
for(const e of db.encomendas){
  const item=String(e.obs||"").match(/Item\s+(\d+)/i)?.[1];
  if(item)existingKeys.add(`${norm(e.pedido)}|${item}`);
}
const exportRows=rows.filter(r=>norm(r[9])&&norm(r[1])).map(r=>({
  key:`${norm(r[9])}|${norm(r[1])}`,po:norm(r[9]),item:norm(r[1]),class:norm(r[2]),category:norm(r[3]),pep:norm(r[4]),date:excelDate(r[5]),supplier:norm(r[6]),material:norm(r[7]),desc:norm(r[8]),ordered:Number(r[11]||0),unit:norm(r[12]),outstanding:Number(r[16]||0),remainingInvoice:Number(r[18]||0),deleted:norm(r[22]),
}));
const missing=exportRows.filter(r=>!existingKeys.has(r.key));
const recent=missing.filter(r=>r.date>="2026-07-01").sort((a,b)=>a.date.localeCompare(b.date)||a.po.localeCompare(b.po)||Number(a.item)-Number(b.item));
const unique=x=>new Set(x);
console.log(JSON.stringify({exportLines:exportRows.length,exportPOs:unique(exportRows.map(r=>r.po)).size,existingLines:db.encomendas.length,existingPOs:unique(db.encomendas.map(e=>e.pedido)).size,matchedByPOItem:exportRows.length-missing.length,missingLines:missing.length,missingPOs:unique(missing.map(r=>r.po)).size,recentMissingLines:recent.length,recentMissingPOs:unique(recent.map(r=>r.po)).size},null,2));
const clean=s=>norm(s).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z0-9]+/g," ").trim();
for(const r of recent){
  const candidates=db.materiais.filter(m=>norm(m.sap)===r.material||norm(m.codigo)===r.material||String(m.codigo_alt||"").split(";").map(norm).includes(r.material));
  const exact=candidates.filter(m=>clean(m.desc)===clean(r.desc));
  console.log("RECENT",JSON.stringify({...r,exactMaterial:exact.map(m=>({id:m.id,codigo:m.codigo,sap:m.sap,desc:m.desc})),candidates:candidates.slice(0,8).map(m=>({id:m.id,codigo:m.codigo,sap:m.sap,desc:m.desc}))}));
}
