import fs from "node:fs/promises";

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const html = await fs.readFile("gestao_armazem_catenaria.html", "utf8");
const prefix = "const SEED_DATA=";
const start = html.indexOf(prefix) + prefix.length;
let depth=0, inString=false, escaped=false, end=-1;
for (let i=start;i<html.length;i++) {
  const c=html[i];
  if (inString) {
    if (escaped) escaped=false;
    else if (c==="\\") escaped=true;
    else if (c==='"') inString=false;
    continue;
  }
  if (c==='"') inString=true;
  else if (c==="{") depth++;
  else if (c==="}" && --depth===0) { end=i+1; break; }
}
const seed = JSON.parse(html.slice(start,end));
const marker = "Importado EXPORT SAP 23/07/2026";
const orders = db.encomendas.filter(e => String(e.obs || "").includes(marker));
const moves = db.movimentos.filter(e => String(e.obs || "").includes(marker));
const keys = orders.map(e => `${e.pedido}|${String(e.obs).match(/Item\s+(\d+)/)?.[1]}`);
const result = {
  importedLines:orders.length,
  uniqueLines:new Set(keys).size,
  purchaseOrders:new Set(orders.map(e=>e.pedido)).size,
  fullySupplied:orders.filter(e=>Number(e.qtdRecebida)===Number(e.qtdEnc)).length,
  pending:orders.filter(e=>Number(e.qtdRecebida)<Number(e.qtdEnc)).length,
  physicalMoves:moves.length,
  sameSeed:JSON.stringify(db)===JSON.stringify(seed),
  uniqueMaterialIds:new Set(db.materiais.map(x=>x.id)).size===db.materiais.length,
  uniqueOrderIds:new Set(db.encomendas.map(x=>x.id)).size===db.encomendas.length,
  uniqueMoveIds:new Set(db.movimentos.map(x=>x.id)).size===db.movimentos.length,
};
console.log(JSON.stringify(result,null,2));
if (
  result.importedLines!==14 || result.uniqueLines!==14 || result.purchaseOrders!==5 ||
  result.fullySupplied!==11 || result.pending!==3 || result.physicalMoves!==0 ||
  !result.sameSeed || !result.uniqueMaterialIds || !result.uniqueOrderIds || !result.uniqueMoveIds
) process.exit(1);
