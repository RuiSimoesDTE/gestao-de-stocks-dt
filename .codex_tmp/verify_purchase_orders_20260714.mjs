import fs from "node:fs/promises";
const db=JSON.parse(await fs.readFile("dados_armazem_catenaria.json","utf8"));
const html=await fs.readFile("gestao_armazem_catenaria.html","utf8"),prefix="const SEED_DATA=",start=html.indexOf(prefix)+prefix.length;
let d=0,q=false,e=false,end=-1;for(let i=start;i<html.length;i++){const c=html[i];if(q){if(e)e=false;else if(c==="\\")e=true;else if(c==='"')q=false;continue;}if(c==='"')q=true;else if(c==="{")d++;else if(c==="}"&&--d===0){end=i+1;break;}}
const seed=JSON.parse(html.slice(start,end)),mark="Importado EXPORT SAP 14/07/2026";
const orders=db.encomendas.filter(x=>String(x.obs||"").includes(mark)),moves=db.movimentos.filter(x=>String(x.obs||"").includes(mark));
const orderKeys=orders.map(x=>`${x.pedido}|${String(x.obs).match(/Item\s+(\d+)/)?.[1]}`);
const suppliers=[...new Set(orders.map(x=>x.fornecedor))].sort();
const po5905=moves.filter(x=>x.pedido==="4500875905"),po7298=moves.filter(x=>x.pedido==="4500877298");
const result={materials:db.materiais.length,ordersTotal:db.encomendas.length,movementsTotal:db.movimentos.length,importedOrders:orders.length,uniqueOrderItems:new Set(orderKeys).size,importedMoves:moves.length,entries:moves.filter(x=>x.tipo==="entrada").length,exits:moves.filter(x=>x.tipo==="saida").length,po5905Moves:po5905.length,po7298Moves:po7298.length,suppliers,sameSeed:JSON.stringify(db)===JSON.stringify(seed),uniqueMaterialIds:new Set(db.materiais.map(x=>x.id)).size===db.materiais.length,uniqueOrderIds:new Set(db.encomendas.map(x=>x.id)).size===db.encomendas.length,uniqueMoveIds:new Set(db.movimentos.map(x=>x.id)).size===db.movimentos.length};
console.log(JSON.stringify(result,null,2));
if(result.importedOrders!==13||result.uniqueOrderItems!==13||result.importedMoves!==10||result.entries!==5||result.exits!==5||result.po5905Moves!==6||result.po7298Moves!==4||!result.sameSeed||!result.uniqueMaterialIds||!result.uniqueOrderIds||!result.uniqueMoveIds)process.exit(1);
