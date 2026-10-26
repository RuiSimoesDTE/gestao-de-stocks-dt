import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir="outputs/levantamento_assalto_20260729";
const outputPath=`${outputDir}/Listagem_Roubo_GNR_ATUALIZADA_20260729.xlsx`;
const previewListPath=`${outputDir}/previews/Lista_Simples.png`;
const previewTheftPath=`${outputDir}/previews/Listagem_do_roubo.png`;
await fs.mkdir(`${outputDir}/previews`,{recursive:true});

const rows=[
  ["Pêndulos","PEND-CU-12V","","Pêndulos de cobre – 12 vãos",50,"un","Quantidade indicada pelo programa; confirmar por contagem.","Por confirmar",null,""],
  ["Fios de pêndulos","9V","4032267","Cabo de bronze 12 mm²",300,"m","Correspondência mais provável; confirmar o tipo de fio.","Por confirmar",null,""],
  ["Fios de vara de terra","","","Fios de vara de terra",null,"","Designação ainda sem correspondência segura no catálogo.","Por confirmar",null,""],
  ["Rolos de fio de cobre","","","Rolos de fio de cobre",3,"rolos","O programa não identifica o tipo nem os metros de cada rolo.","Por confirmar",null,""],
  ["Ferramentas várias","","","Ferramentas diversas",null,"un","Identificar as ferramentas e quantidades durante a contagem.","Por confirmar",null,""],
  ["Tesouras de corte","TD1001","","Tesoura de corte com cabo de 24 polegadas",2,"un","Correspondência mais provável; confirmar o modelo e a quantidade.","Por confirmar",null,""],
  ["Máquina Hilti","2146841","","Martelo demolidor Hilti TE 500-AVR",1,"un","Roubo confirmado pelo responsável.","Sim",1,""],
  ["Máquina Makita","","","Rebarbadora Makita",null,"un","Confirmar modelo e quantidade levada.","Por confirmar",null,""],
  ["Máquina Hilti","2253057","","Martelo Perfurador a Bateria Hilti — TE 0000464738",1,"un","Roubo confirmado pelo responsável; equipamento consta da guia original.","Sim",1,""],
  ["Seccionadores","4037095","4037095","Seccionador completo",16,"un","Referência com maior stock; confirmar o modelo e a quantidade levada.","Por confirmar",null,""],
  ["Seccionadores","4046820","4046820","623E — Seccionador completo",1,"un","Segunda referência de seccionador completo existente; confirmar se corresponde.","Por confirmar",null,""],
];

const theftRows=[
  ["Pêndulos",50,"un","Por confirmar",null,"Quantidade indicada pelo programa."],
  ["Fios de pêndulos",300,"m","Por confirmar",null,"Confirmar o tipo de fio."],
  ["Fios de vara de terra",null,"","Por confirmar",null,"Quantidade e referência por confirmar."],
  ["Rolos de fio de cobre",3,"rolos","Por confirmar",null,"Confirmar tipo e metros de cada rolo."],
  ["Ferramentas várias",null,"un","Por confirmar",null,"Identificar ferramentas e quantidades."],
  ["Tesouras de corte",2,"un","Por confirmar",null,"Confirmar modelo e quantidade."],
  ["Martelo demolidor Hilti TE 500-AVR — cód. 2146841",1,"un","Sim",1,"Roubo confirmado pelo responsável."],
  ["Rebarbadora Makita",null,"un","Por confirmar",null,"Confirmar modelo e quantidade levada."],
  ["Martelo Perfurador a Bateria Hilti — cód. 2253057",1,"un","Sim",1,"Referência TE 0000464738; consta da guia original."],
  ["Seccionadores",null,"un","Por confirmar",null,"Confirmar modelo e quantidade efetivamente levada."],
];

const wb=Workbook.create();
const navy="#17365D",blue="#D9EAF7",orange="#FFF2CC",red="#FCE4D6",green="#E2F0D9",gray="#666666";

const theftSheet=wb.worksheets.add("Listagem do roubo");
theftSheet.showGridLines=false;
theftSheet.getRange("A1:F1").merge();
theftSheet.getRange("A1").values=[["Listagem do material referido no assalto"]];
theftSheet.getRange("A1:F1").format={fill:navy,font:{bold:true,color:"#FFFFFF",size:17},verticalAlignment:"center"};
theftSheet.getRange("A1:F1").format.rowHeight=34;
theftSheet.getRange("A2:F2").merge();
theftSheet.getRange("A2").values=[["Data indicada: 24/07/2026 · Apenas levantamento · Nenhuma saída de stock registada"]];
theftSheet.getRange("A2:F2").format={fill:blue,font:{italic:true,color:gray}};
theftSheet.getRange("A4:F4").values=[["Material referido","Quantidade indicada","Unidade","Falta confirmada?","Quantidade confirmada","Observações"]];
theftSheet.getRange("A4:F4").format={fill:navy,font:{bold:true,color:"#FFFFFF"},wrapText:true,verticalAlignment:"center"};
theftSheet.getRange("A4:F4").format.rowHeight=38;
theftSheet.getRange("A5:F14").values=theftRows;
theftSheet.getRange("B5:B14").format.numberFormat="#,##0";
theftSheet.getRange("E5:E14").format.numberFormat="#,##0";
theftSheet.getRange("D5:D14").dataValidation={rule:{type:"list",values:["Por confirmar","Sim","Não"]}};
theftSheet.getRange("D5:D14").conditionalFormats.add("containsText",{text:"Por confirmar",format:{fill:orange,font:{color:"#7F6000"}}});
theftSheet.getRange("D5:D14").conditionalFormats.add("containsText",{text:"Sim",format:{fill:red,font:{color:"#9C0006",bold:true}}});
theftSheet.getRange("D5:D14").conditionalFormats.add("containsText",{text:"Não",format:{fill:green,font:{color:"#375623"}}});
theftSheet.getRange("E5:E14").dataValidation={rule:{type:"whole",operator:"greaterThanOrEqual",formula1:0}};
theftSheet.tables.add("A4:F14",true,"TblListagemRoubo").style="TableStyleMedium2";
theftSheet.freezePanes.freezeRows(4);
[31,21,12,20,23,58].forEach((width,i)=>theftSheet.getRangeByIndexes(0,i,16,1).format.columnWidth=width);
theftSheet.getRange("A1:F16").format.font.name="Aptos";
theftSheet.getRange("F5:F14").format.wrapText=true;
theftSheet.getRange("A16:F16").merge();
theftSheet.getRange("A16").values=[["Preencher depois da conferência física. Este separador não altera o stock."]];
theftSheet.getRange("A16:F16").format={fill:"#F4F7FA",font:{italic:true,color:gray}};

const sheet=wb.worksheets.add("Lista");
sheet.showGridLines=false;
sheet.getRange("A1:J1").merge();
sheet.getRange("A1").values=[["Material referido — levantamento do assalto"]];
sheet.getRange("A1:J1").format={fill:navy,font:{bold:true,color:"#FFFFFF",size:17},verticalAlignment:"center"};
sheet.getRange("A1:J1").format.rowHeight=34;
sheet.getRange("A2:J2").merge();
sheet.getRange("A2").values=[["Data indicada: 24/07/2026 · Apenas listagem para conferência · Nenhuma saída de stock registada"]];
sheet.getRange("A2:J2").format={fill:blue,font:{italic:true,color:gray}};
sheet.getRange("A4:J4").values=[["Material referido","Código interno","Código SAP","Descrição provável","Quantidade no programa/indicada","Unidade","Observações","Falta confirmada?","Quantidade realmente em falta","Notas"]];
sheet.getRange("A4:J4").format={fill:navy,font:{bold:true,color:"#FFFFFF"},wrapText:true,verticalAlignment:"center"};
sheet.getRange("A4:J4").format.rowHeight=42;
sheet.getRange("A5:J15").values=rows;
sheet.getRange("E5:E15").format.numberFormat="#,##0";
sheet.getRange("I5:I15").format.numberFormat="#,##0";
sheet.getRange("H5:H15").dataValidation={rule:{type:"list",values:["Por confirmar","Sim","Não"]}};
sheet.getRange("H5:H15").conditionalFormats.add("containsText",{text:"Por confirmar",format:{fill:orange,font:{color:"#7F6000"}}});
sheet.getRange("H5:H15").conditionalFormats.add("containsText",{text:"Sim",format:{fill:red,font:{color:"#9C0006",bold:true}}});
sheet.getRange("H5:H15").conditionalFormats.add("containsText",{text:"Não",format:{fill:green,font:{color:"#375623"}}});
sheet.getRange("I5:I15").dataValidation={rule:{type:"whole",operator:"greaterThanOrEqual",formula1:0}};
sheet.tables.add("A4:J15",true,"TblListaSimplesAssalto").style="TableStyleMedium2";
sheet.freezePanes.freezeRows(4);
[24,18,15,45,24,12,55,20,26,35].forEach((width,i)=>sheet.getRangeByIndexes(0,i,17,1).format.columnWidth=width);
sheet.getRange("A1:J17").format.font.name="Aptos";
sheet.getRange("D5:D15").format.wrapText=true;
sheet.getRange("G5:G15").format.wrapText=true;
sheet.getRange("A17:J17").merge();
sheet.getRange("A17").values=[["Preencher apenas depois da contagem física. Este documento não altera o programa de gestão de stocks."]];
sheet.getRange("A17:J17").format={fill:"#F4F7FA",font:{italic:true,color:gray}};

console.log((await wb.inspect({kind:"table",sheetId:"Listagem do roubo",range:"A1:F16",include:"values,formulas",tableMaxRows:18,tableMaxCols:8,maxChars:8000})).ndjson);
console.log((await wb.inspect({kind:"table",sheetId:"Lista",range:"A1:J17",include:"values,formulas",tableMaxRows:20,tableMaxCols:12,maxChars:8000})).ndjson);
console.log((await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"formula error scan"})).ndjson);
const previewTheft=await wb.render({sheetName:"Listagem do roubo",autoCrop:"all",scale:1,format:"png"});
await fs.writeFile(previewTheftPath,new Uint8Array(await previewTheft.arrayBuffer()));
const previewList=await wb.render({sheetName:"Lista",autoCrop:"all",scale:1,format:"png"});
await fs.writeFile(previewListPath,new Uint8Array(await previewList.arrayBuffer()));
const out=await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(JSON.stringify({outputPath,rows:rows.length,theftRows:theftRows.length},null,2));
