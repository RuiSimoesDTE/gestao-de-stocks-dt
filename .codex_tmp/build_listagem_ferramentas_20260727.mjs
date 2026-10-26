import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = "outputs/listagem_ferramentas_20260727";
const outputPath = `${outputDir}/Listagem_Ferramentas_Vendas_Novas_20260727.xlsx`;
const previewDir = `${outputDir}/previews`;
await fs.mkdir(previewDir, { recursive: true });

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const stock = new Map(db.materiais.map(m => [m.id, 0]));
for (const mv of db.movimentos) {
  const qty = Number(mv.qtd || 0);
  if (mv.tipo === "entrada") stock.set(mv.mat, (stock.get(mv.mat) || 0) + qty);
  if (mv.tipo === "saida") stock.set(mv.mat, (stock.get(mv.mat) || 0) - qty);
}
const text = m => `${m.codigo || ""} ${m.desc || ""} ${m.fornecedor || ""} ${m.ref || ""}`.toUpperCase();
const isHilti = m => /\bHILTI\b/.test(text(m));
const isMakita = m => /\bMAKITA\b/.test(text(m));
const isTool = m =>
  /M[ÁA]QUINA|FERRAMENTA/i.test(`${m.tipo || ""} ${m.cat || ""}`) ||
  /\b(ALICATE|MARTELO|MARRETA|CHAVE|BERBEQUIM|REBARBADORA|SERRA|TESOURA|TORNO|PAQU[IÍ]METRO|N[IÍ]VEL|BROCA|PONTEIRO|ESCORPO|TURQU[EÊ]S|MACETA|APARAFUSADORA|MULT[IÍ]METRO|EQUIPAMENTO|M[ÁA]QUINA)\b/i.test(m.desc || "");

const allRows = db.materiais
  .filter(m => isHilti(m) || isMakita(m) || isTool(m))
  .map(m => ({
    grupo:isHilti(m) ? "Hilti" : isMakita(m) ? "Makita" : "Outras ferramentas",
    codigo:String(m.codigo || ""), sap:String(m.sap || ""), descricao:String(m.desc || ""),
    unidade:String(m.un || ""), fornecedor:String(m.fornecedor || ""),
    stock:Number(stock.get(m.id) || 0),
  }))
  .sort((a,b) => a.grupo.localeCompare(b.grupo) || a.descricao.localeCompare(b.descricao));

const groups = [
  {name:"Hilti", rows:allRows.filter(r => r.grupo === "Hilti")},
  {name:"Makita", rows:allRows.filter(r => r.grupo === "Makita")},
  {name:"Outras Ferramentas", rows:allRows.filter(r => r.grupo === "Outras ferramentas")},
  {name:"Listagem Completa", rows:allRows},
];
const wb = Workbook.create();
const navy = "#17365D", blue = "#D9EAF7", light = "#F4F7FA", green = "#E2F0D9", red = "#FCE4D6", gray = "#666666";

function writeToolSheet(sheet, title, rows, includeGroup=false) {
  const headers = includeGroup
    ? ["Grupo","Código interno","Código SAP","Descrição","Unidade","Fornecedor","Stock atual","Estado"]
    : ["Código interno","Código SAP","Descrição","Unidade","Fornecedor","Stock atual","Estado"];
  const cols = headers.length;
  const lastCol = String.fromCharCode(64 + cols);
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${lastCol}1`).format = {fill:navy,font:{bold:true,color:"#FFFFFF",size:16},verticalAlignment:"center"};
  sheet.getRange(`A1:${lastCol}1`).format.rowHeight = 30;
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[`Obra de Vendas Novas · stock calculado pelos movimentos registados · 27/07/2026`]];
  sheet.getRange(`A2:${lastCol}2`).format = {fill:blue,font:{italic:true,color:gray},verticalAlignment:"center"};
  sheet.getRange(`A2:${lastCol}2`).format.rowHeight = 22;
  sheet.getRange(`A4:${lastCol}4`).values = [headers];
  sheet.getRange(`A4:${lastCol}4`).format = {fill:navy,font:{bold:true,color:"#FFFFFF"},verticalAlignment:"center",wrapText:true};
  sheet.getRange(`A4:${lastCol}4`).format.rowHeight = 28;

  if (rows.length) {
    const values = rows.map(r => includeGroup
      ? [r.grupo,r.codigo,r.sap,r.descricao,r.unidade,r.fornecedor,r.stock,null]
      : [r.codigo,r.sap,r.descricao,r.unidade,r.fornecedor,r.stock,null]);
    const endRow = 4 + rows.length;
    sheet.getRange(`A5:${lastCol}${endRow}`).values = values;
    const stockCol = includeGroup ? "G" : "F";
    const statusCol = includeGroup ? "H" : "G";
    sheet.getRange(`${statusCol}5`).formulas = [[`=IF(${stockCol}5>0,"Em stock","Sem stock")`]];
    sheet.getRange(`${statusCol}5:${statusCol}${endRow}`).fillDown();
    sheet.getRange(`${stockCol}5:${stockCol}${endRow}`).format.numberFormat = "#,##0";
    sheet.getRange(`${stockCol}5:${stockCol}${endRow}`).format.horizontalAlignment = "right";
    sheet.getRange(`${statusCol}5:${statusCol}${endRow}`).conditionalFormats.add("containsText", {text:"Em stock",format:{fill:green,font:{color:"#375623"}}});
    sheet.getRange(`${statusCol}5:${statusCol}${endRow}`).conditionalFormats.add("containsText", {text:"Sem stock",format:{fill:red,font:{color:"#9C0006"}}});
    const table = sheet.tables.add(`A4:${lastCol}${endRow}`, true, `Tbl${sheet.name.replace(/[^A-Za-z0-9]/g,"")}`);
    table.style = "TableStyleMedium2";
    sheet.freezePanes.freezeRows(4);
  }
  const widths = includeGroup
    ? [18,18,15,48,10,38,12,14]
    : [18,15,48,10,38,12,14];
  widths.forEach((width, i) => sheet.getRangeByIndexes(0,i,Math.max(rows.length+4,4),1).format.columnWidth = width);
  sheet.getRange(`A1:${lastCol}${Math.max(rows.length+4,4)}`).format.font.name = "Aptos";
}

const summary = wb.worksheets.add("Resumo");
summary.showGridLines = false;
summary.getRange("A1:D1").merge();
summary.getRange("A1").values = [["Inventário de Ferramentas"]];
summary.getRange("A1:D1").format = {fill:navy,font:{bold:true,color:"#FFFFFF",size:18},verticalAlignment:"center"};
summary.getRange("A1:D1").format.rowHeight = 34;
summary.getRange("A2:D2").merge();
summary.getRange("A2").values = [["Obra de Vendas Novas · atualizado em 27/07/2026"]];
summary.getRange("A2:D2").format = {fill:blue,font:{italic:true,color:gray}};
summary.getRange("A4:D4").values = [["Grupo","Referências","Com stock","Unidades em stock"]];
summary.getRange("A4:D4").format = {fill:navy,font:{bold:true,color:"#FFFFFF"},wrapText:true};

for (const g of groups.slice(0,3)) wb.worksheets.add(g.name);
wb.worksheets.add("Listagem Completa");
const summaryRows = groups.slice(0,3).map((g, idx) => {
  const excelRow = 5 + idx;
  const end = 4 + g.rows.length;
  const stockCol = g.name === "Outras Ferramentas" ? "F" : "F";
  return [g.name, `=COUNTA('${g.name}'!A5:A${end})`, `=COUNTIF('${g.name}'!${stockCol}5:${stockCol}${end},">0")`, `=SUM('${g.name}'!${stockCol}5:${stockCol}${end})`];
});
summary.getRange("A5:D7").values = summaryRows.map(r => [r[0],null,null,null]);
summary.getRange("B5:D7").formulas = summaryRows.map(r => r.slice(1));
summary.getRange("A8").values = [["Total"]];
summary.getRange("B8:D8").formulas = [["=SUM(B5:B7)","=SUM(C5:C7)","=SUM(D5:D7)"]];
summary.getRange("A8:D8").format = {fill:blue,font:{bold:true},borders:{preset:"doubleBottom",style:"medium",color:navy}};
summary.getRange("B5:D8").format.numberFormat = "#,##0";
summary.getRange("A4:D8").format.borders = {preset:"inside",style:"thin",color:"#D9E1F2"};
summary.getRange("A10:D10").merge();
summary.getRange("A10").values = [["Nota: as linhas sem stock permanecem na listagem para controlo do catálogo. O stock é calculado a partir das entradas e saídas registadas no programa."]];
summary.getRange("A10:D10").format = {fill:light,font:{italic:true,color:gray},wrapText:true};
summary.getRange("A10:D10").format.rowHeight = 40;
["A","B","C","D"].forEach((c,i) => summary.getRange(`${c}:${c}`).format.columnWidth = [28,16,16,20][i]);
summary.freezePanes.freezeRows(4);

for (const g of groups) {
  const sheet = wb.worksheets.getItem(g.name);
  writeToolSheet(sheet, g.name === "Listagem Completa" ? "Listagem completa de ferramentas" : `Ferramentas ${g.name}`, g.rows, g.name === "Listagem Completa");
}

console.log((await wb.inspect({kind:"table",sheetId:"Resumo",range:"A1:D10",include:"values,formulas",tableMaxRows:12,tableMaxCols:6,maxChars:5000})).ndjson);
console.log((await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"formula error scan"})).ndjson);

for (const name of ["Resumo","Hilti","Makita","Outras Ferramentas","Listagem Completa"]) {
  const preview = await wb.render({sheetName:name,autoCrop:"all",scale:1,format:"png"});
  await fs.writeFile(`${previewDir}/${name.replace(/ /g,"_")}.png`, new Uint8Array(await preview.arrayBuffer()));
}
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(JSON.stringify({outputPath,rows:allRows.length,groups:Object.fromEntries(groups.slice(0,3).map(g=>[g.name,g.rows.length]))},null,2));
