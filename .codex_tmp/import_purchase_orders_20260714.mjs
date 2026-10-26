import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const jsonPath="dados_armazem_catenaria.json", htmlPath="gestao_armazem_catenaria.html";
const importMarker="Importado EXPORT SAP 14/07/2026";
const targetKeys=new Set(["4500874634|20","4500875412|10","4500875905|10","4500875905|20","4500875905|30","4500875997|10","4500875997|20","4500876126|10","4500877298|10","4500877298|20","4500877501|10","4500877501|20","4500877501|30"]);
const physicalPOs=new Set(["4500875905","4500877298"]);
const existingMap={"4500874634|20":"M2972","4500875905|30":"M3110","4500875997|10":"M4049","4500875997|20":"M358","4500877501|30":"M2972"};
const newCodes={"4500875412|10":"EQL0086","4500875905|10":"5018036","4500875905|20":"4003679-EXT5","4500876126|10":"SERV-4500876126-10","4500877298|10":"5005185-CR22","4500877298|20":"5016731","4500877501|10":"4049802-FITA","4500877501|20":"4049802-FERR"};
const norm=x=>String(x??"").trim();
const excelDate=n=>new Date(Date.UTC(1899,11,30)+Number(n)*86400000).toISOString().slice(0,10);
const cleanSupplier=s=>norm(s).replace(/^\d+\s+/,"").trim();
const unit=u=>({UN:"un",KG:"kg",M:"m",VG:"vg",UA:"ua",ROL:"rol",L:"l"}[norm(u).toUpperCase()]||norm(u).toLowerCase()||"un");
function findJsonEnd(text,start){let d=0,q=false,e=false;for(let i=start;i<text.length;i++){const c=text[i];if(q){if(e)e=false;else if(c==="\\")e=true;else if(c==='"')q=false;continue;}if(c==='"')q=true;else if(c==="{")d++;else if(c==="}"&&--d===0)return i+1;}throw new Error("SEED_DATA incompleto");}

const originalJson=await fs.readFile(jsonPath,"utf8");
const db=JSON.parse(originalJson);
if(db.encomendas.some(e=>String(e.obs||"").includes(importMarker)))throw new Error("A importação de 14/07/2026 já existe; cancelado para evitar duplicação.");

const wb=await SpreadsheetFile.importXlsx(await FileBlob.load("C:/Users/dst7973/Desktop/EXPORT_20260714_114521.xlsx"));
const rows=wb.worksheets.getItem("Sheet1").getRange("A2:Y640").values.map(r=>({key:`${norm(r[9])}|${norm(r[1])}`,po:norm(r[9]),item:norm(r[1]),pep:norm(r[4]),date:excelDate(r[5]),supplier:cleanSupplier(r[6]),sap:norm(r[7]),desc:norm(r[8]),ordered:Number(r[11]||0),un:unit(r[12]),outstanding:Number(r[16]||0)})).filter(r=>targetKeys.has(r.key));
if(rows.length!==13||new Set(rows.map(r=>r.key)).size!==13)throw new Error(`Esperadas 13 linhas únicas; encontradas ${rows.length}`);

let seq=Math.max(Number(db.seq||1),...db.materiais.map(m=>Number(String(m.id).match(/\d+/)?.[0]||0)),...db.encomendas.map(e=>Number(String(e.id).match(/\d+/)?.[0]||0)),...db.movimentos.map(m=>Number(String(m.id).match(/\d+/)?.[0]||0)))+1;
const materialByKey=new Map();
for(const r of rows){
  let m;
  if(existingMap[r.key])m=db.materiais.find(x=>x.id===existingMap[r.key]);
  else{
    const code=newCodes[r.key];
    if(!code)throw new Error(`Sem regra de material para ${r.key}`);
    if(db.materiais.some(x=>String(x.codigo).toUpperCase()===code.toUpperCase()))throw new Error(`Código novo já existe: ${code}`);
    m={id:`M${seq++}`,codigo:code,desc:r.desc,un:r.un,cat:r.sap==="0"?"Serviço SAP":"Importado SAP",min:0,sap:r.sap==="0"?"":r.sap,ref:"",fornecedor:r.supplier,tipo:"Consumível"};
    db.materiais.push(m);
  }
  if(!m)throw new Error(`Material não resolvido: ${r.key}`);
  materialByKey.set(r.key,m);
}

for(const r of rows){
  const m=materialByKey.get(r.key),received=Math.max(0,r.ordered-r.outstanding);
  db.encomendas.push({id:`M${seq++}`,pedido:r.po,mat:m.id,qtdEnc:r.ordered,qtdRecebida:received,un:r.un,fornecedor:r.supplier,data:r.date,obs:`${importMarker} | PEP ${r.pep} | Item ${r.item}`});
}

const movements=[];
for(const r of rows.filter(r=>physicalPOs.has(r.po))){
  const m=materialByKey.get(r.key),q=Math.max(0,r.ordered-r.outstanding);
  if(!(q>0))throw new Error(`Pedido confirmado sem quantidade recebida: ${r.key}`);
  movements.push({id:`mv${seq++}`,data:"2026-07-14",tipo:"entrada",mat:m.id,qtd:q,arm:"Armazém Catenária",armDst:null,pedido:r.po,doc:"",origem:r.supplier,dest:"",obs:`${importMarker} | Entrega integral | Item ${r.item}`,user:"",ref:null});
  movements.push({id:`mv${seq++}`,data:"2026-07-14",tipo:"saida",mat:m.id,qtd:q,arm:"Armazém Catenária",armDst:null,pedido:r.po,doc:"",origem:"",dest:"Obra IC-0019",obs:`${importMarker} | Saída integral do pedido para obra | Item ${r.item}`,user:"",ref:null});
}
if(movements.length!==10)throw new Error(`Esperados 10 movimentos; criados ${movements.length}`);
db.movimentos.push(...movements);db.seq=seq;

const html=await fs.readFile(htmlPath,"utf8"),prefix="const SEED_DATA=",p=html.indexOf(prefix),start=p+prefix.length,end=findJsonEnd(html,start);
if(p<0)throw new Error("SEED_DATA não encontrado");
await fs.copyFile(jsonPath,`${jsonPath}.backup_antes_import_pedidos_20260714`);
await fs.copyFile(htmlPath,`${htmlPath}.backup_antes_import_pedidos_20260714`);
await fs.writeFile(jsonPath,JSON.stringify(db,null,2)+"\n","utf8");
await fs.writeFile(htmlPath,html.slice(0,start)+JSON.stringify(db)+html.slice(end),"utf8");
console.log(JSON.stringify({purchaseOrders:7,orderLines:13,newMaterials:8,stockEntries:5,stockExits:5,seq:db.seq,materials:[...materialByKey].map(([key,m])=>({key,id:m.id,codigo:m.codigo,desc:m.desc}))},null,2));
