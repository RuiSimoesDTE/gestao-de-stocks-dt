import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = "outputs/levantamento_assalto_20260729";
const outputPath = `${outputDir}/Levantamento_Material_Assalto_20260729.xlsx`;
const previewDir = `${outputDir}/previews`;
await fs.mkdir(previewDir, {recursive:true});

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const stock = new Map(db.materiais.map(m => [m.id, 0]));
for (const mv of db.movimentos) {
  const qty = Number(mv.qtd || 0);
  if (mv.tipo === "entrada") stock.set(mv.mat, (stock.get(mv.mat) || 0) + qty);
  if (mv.tipo === "saida") stock.set(mv.mat, (stock.get(mv.mat) || 0) - qty);
}
const byId = new Map(db.materiais.map(m => [m.id,m]));
const findCode = code => db.materiais.find(m => String(m.codigo || "").trim().toUpperCase() === code.toUpperCase());
const findSap = sap => db.materiais.find(m => String(m.sap || "").trim() === sap);
const item = (category, mat, confidence, note) => ({
  category, code:String(mat?.codigo || ""), sap:String(mat?.sap || ""), desc:String(mat?.desc || ""),
  current:Number(stock.get(mat?.id) || 0), unit:String(mat?.un || ""), supplier:String(mat?.fornecedor || ""),
  confidence, note,
});

const requested = [];
function add(category, mat, confidence, note) {
  if (mat) requested.push(item(category,mat,confidence,note));
}
add("Pêndulos", findCode("PEND-CU-12V"), "Muito provável", "Pêndulos completos indicados no programa.");
add("Pêndulos", findCode("640"), "Relacionado", "Terminal para pêndulo; confirmar se também desapareceu.");
add("Pêndulos", findCode("298"), "Relacionado", "Anel para pêndulo fixo; confirmar por contagem.");
add("Pêndulos", findCode("293B"), "Relacionado", "Cavaleiro para pêndulo; confirmar por contagem.");
add("Fios de pêndulos", findCode("9V"), "Muito provável", "Cabo de bronze 12 mm² normalmente associado aos pêndulos; stock em metros.");

add("Fios/vara de terra", findCode("VaraTerra"), "Possível", "Vara de terra; não é fio. Incluída porque a designação dada é ambígua.");
add("Fios/vara de terra", findCode("9123100211"), "Possível", "Elétrodo de terra ET250; confirmar se era este material.");
add("Fios/vara de terra", findCode("9113100242"), "Possível", "União para elétrodo de terra, SAP 1105.");
add("Fios/vara de terra", findSap("4004766"), "Possível", "Outra referência de união para elétrodo; stock atual zero.");
add("Fios/vara de terra", findSap("4002623"), "Relacionado", "Braçadeira para elétrodo 5/8; não é fio.");

add("3 rolos de fio de cobre", findCode("9S"), "Possível", "Fio de contacto 107 mm²; o programa controla metros, não rolos.");
add("3 rolos de fio de cobre", findCode("9P"), "Possível", "Cabo de cobre flexível 95 mm²; stock em metros.");
add("3 rolos de fio de cobre", findCode("9G"), "Possível", "Cabo de bronze 65 mm²; stock em metros.");
add("3 rolos de fio de cobre", findCode("9V"), "Possível", "Cabo de bronze 12 mm²; poderá coincidir com o fio de pêndulos.");
add("3 rolos de fio de cobre", findCode("BOBINE-FC-1489"), "Possível", "Bobine identificada por 1.489 m / 1.417 kg; confirmar se corresponde aos rolos.");

add("Tesouras de corte", findCode("TD1001"), "Muito provável", "Tesoura com cabo de 24 polegadas.");
add("Tesouras de corte", findSap("4015731"), "Possível", "Tesoura corta-tubos 16–32; confirmar modelo.");
add("Tesouras de corte", findCode("TES-001"), "Possível", "Tesoura de cortar chapa Milwaukee.");

for (const m of db.materiais.filter(m => /hilti|TE 500|TE-YX|C 4-22|B 22-/i.test(`${m.codigo || ""} ${m.desc || ""} ${m.fornecedor || ""}`))) {
  add("Máquinas e acessórios Hilti", m, /Martelo Demolidor TE 500/i.test(m.desc || "") ? "Muito provável" : "Relacionado",
    /Martelo Demolidor TE 500/i.test(m.desc || "") ? "Máquina indicada como provavelmente roubada." : "Acessório/equipamento Hilti para confirmar por contagem.");
}

const tools = db.materiais
  .filter(m => /M[ÁA]QUINA|FERRAMENTA/i.test(`${m.tipo || ""} ${m.cat || ""}`))
  .map(m => item("Ferramentas várias",m,"Por confirmar","Confirmar fisicamente se falta e preencher a quantidade."))
  .filter(r => r.current > 0)
  .sort((a,b) => a.desc.localeCompare(b.desc));

const wb = Workbook.create();
const navy="#17365D", blue="#D9EAF7", pale="#F4F7FA", orange="#FFF2CC", red="#FCE4D6", green="#E2F0D9", gray="#666666";
const requestedSheet = wb.worksheets.add("Material pedido");
const toolsSheet = wb.worksheets.add("Ferramentas várias");
const summary = wb.worksheets.add("Resumo");

function setupListSheet(sheet, title, rows, tableName) {
  sheet.showGridLines = false;
  const headers=["Categoria","Código interno","Código SAP","Descrição","Stock no programa","Unidade","Fornecedor","Identificação","Observações","Falta confirmada?","Quantidade em falta","Notas da contagem"];
  sheet.getRange("A1:L1").merge();
  sheet.getRange("A1").values=[[title]];
  sheet.getRange("A1:L1").format={fill:navy,font:{bold:true,color:"#FFFFFF",size:16},verticalAlignment:"center"};
  sheet.getRange("A1:L1").format.rowHeight=32;
  sheet.getRange("A2:L2").merge();
  sheet.getRange("A2").values=[["Levantamento para conferência — data indicada do assalto: 24/07/2026 — este ficheiro NÃO regista saídas de stock"]];
  sheet.getRange("A2:L2").format={fill:blue,font:{italic:true,color:gray},wrapText:true};
  sheet.getRange("A2:L2").format.rowHeight=28;
  sheet.getRange("A4:L4").values=[headers];
  sheet.getRange("A4:L4").format={fill:navy,font:{bold:true,color:"#FFFFFF"},wrapText:true,verticalAlignment:"center"};
  sheet.getRange("A4:L4").format.rowHeight=32;
  const matrix=rows.map(r=>[r.category,r.code,r.sap,r.desc,r.current,r.unit,r.supplier,r.confidence,r.note,"Por confirmar",null,""]);
  if(matrix.length){
    const end=4+matrix.length;
    sheet.getRange(`A5:L${end}`).values=matrix;
    sheet.getRange(`E5:E${end}`).format.numberFormat="#,##0";
    sheet.getRange(`K5:K${end}`).format.numberFormat="#,##0";
    sheet.getRange(`J5:J${end}`).dataValidation={rule:{type:"list",values:["Por confirmar","Sim","Não"]}};
    sheet.getRange(`J5:J${end}`).conditionalFormats.add("containsText",{text:"Sim",format:{fill:red,font:{color:"#9C0006",bold:true}}});
    sheet.getRange(`J5:J${end}`).conditionalFormats.add("containsText",{text:"Não",format:{fill:green,font:{color:"#375623"}}});
    sheet.getRange(`J5:J${end}`).conditionalFormats.add("containsText",{text:"Por confirmar",format:{fill:orange,font:{color:"#7F6000"}}});
    sheet.getRange(`K5:K${end}`).dataValidation={rule:{type:"whole",operator:"greaterThanOrEqual",formula1:0}};
    const table=sheet.tables.add(`A4:L${end}`,true,tableName);
    table.style="TableStyleMedium2";
    sheet.freezePanes.freezeRows(4);
  }
  const widths=[22,18,15,48,17,10,34,17,52,20,20,38];
  widths.forEach((width,i)=>sheet.getRangeByIndexes(0,i,Math.max(rows.length+4,4),1).format.columnWidth=width);
  sheet.getRange(`A1:L${Math.max(rows.length+4,4)}`).format.font.name="Aptos";
  sheet.getRange(`D5:D${Math.max(rows.length+4,5)}`).format.wrapText=true;
  sheet.getRange(`I5:I${Math.max(rows.length+4,5)}`).format.wrapText=true;
}
setupListSheet(requestedSheet,"Levantamento do material referido",requested,"TblMaterialPedido");
setupListSheet(toolsSheet,"Ferramentas existentes para conferência",tools,"TblFerramentasVarias");

summary.showGridLines=false;
summary.getRange("A1:E1").merge();
summary.getRange("A1").values=[["Resumo do levantamento do assalto"]];
summary.getRange("A1:E1").format={fill:navy,font:{bold:true,color:"#FFFFFF",size:18}};
summary.getRange("A2:E2").merge();
summary.getRange("A2").values=[["Data de referência: 24/07/2026 · Nenhuma saída foi registada"]];
summary.getRange("A2:E2").format={fill:blue,font:{italic:true,color:gray}};
summary.getRange("A4:E4").values=[["Folha","Linhas para conferir","Confirmadas em falta","Confirmadas presentes","Ainda por confirmar"]];
summary.getRange("A4:E4").format={fill:navy,font:{bold:true,color:"#FFFFFF"},wrapText:true};
summary.getRange("A5:A6").values=[["Material pedido"],["Ferramentas várias"]];
const requestedEnd=4+requested.length, toolsEnd=4+tools.length;
summary.getRange("B5:E6").formulas=[
  [`=COUNTA('Material pedido'!A5:A${requestedEnd})`,`=COUNTIF('Material pedido'!J5:J${requestedEnd},"Sim")`,`=COUNTIF('Material pedido'!J5:J${requestedEnd},"Não")`,`=COUNTIF('Material pedido'!J5:J${requestedEnd},"Por confirmar")`],
  [`=COUNTA('Ferramentas várias'!A5:A${toolsEnd})`,`=COUNTIF('Ferramentas várias'!J5:J${toolsEnd},"Sim")`,`=COUNTIF('Ferramentas várias'!J5:J${toolsEnd},"Não")`,`=COUNTIF('Ferramentas várias'!J5:J${toolsEnd},"Por confirmar")`],
];
summary.getRange("A7").values=[["Total"]];
summary.getRange("B7:E7").formulas=[["=SUM(B5:B6)","=SUM(C5:C6)","=SUM(D5:D6)","=SUM(E5:E6)"]];
summary.getRange("A7:E7").format={fill:blue,font:{bold:true},borders:{preset:"doubleBottom",style:"medium",color:navy}};
summary.getRange("B5:E7").format.numberFormat="#,##0";
summary.getRange("A9:E9").merge();
summary.getRange("A9").values=[["Como usar: nas duas folhas de detalhe, escolher Sim/Não em “Falta confirmada?”, preencher “Quantidade em falta” e acrescentar notas da contagem. As designações incertas foram mantidas de propósito."]];
summary.getRange("A9:E9").format={fill:pale,font:{italic:true,color:gray},wrapText:true};
summary.getRange("A9:E9").format.rowHeight=48;
[30,20,22,22,24].forEach((width,i)=>summary.getRangeByIndexes(0,i,10,1).format.columnWidth=width);
summary.freezePanes.freezeRows(4);

console.log((await wb.inspect({kind:"table",sheetId:"Resumo",range:"A1:E9",include:"values,formulas",tableMaxRows:12,tableMaxCols:8,maxChars:5000})).ndjson);
console.log((await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"formula error scan"})).ndjson);
for(const name of ["Resumo","Material pedido","Ferramentas várias"]){
  const preview=await wb.render({sheetName:name,autoCrop:"all",scale:1,format:"png"});
  await fs.writeFile(`${previewDir}/${name.replace(/ /g,"_")}.png`,new Uint8Array(await preview.arrayBuffer()));
}
const out=await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(JSON.stringify({outputPath,requestedRows:requested.length,toolRows:tools.length,total:requested.length+tools.length},null,2));
