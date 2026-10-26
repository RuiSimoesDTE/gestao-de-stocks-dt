import fs from "node:fs/promises";
const rows = JSON.parse(await fs.readFile("tmp/spreadsheets/export_20260824_review/rows.json", "utf8"));
const backup = JSON.parse(await fs.readFile("backup_armazem_catenaria_2026-08-21_14h43.json", "utf8"));
const obra = backup.obras?.vendas_novas ?? backup;
const existing = new Map((obra.encomendas ?? []).map(e => [`${e.pedido}-${String((e.id.match(/-(\d+)$/)||[])[1] ?? e.item ?? "")}`, e]));
const headers = rows[0];
const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
const result=[];
for (let i=1;i<rows.length;i++) {
  const r=rows[i];
  const pedido=String(r[9]??"").trim(); const item=String(r[1]??"").trim(); if(!pedido||!item) continue;
  const ordered=Number(r[11]??0); const remaining=Number(r[16]??0); const received=Math.max(0,ordered-remaining);
  const key=`${pedido}-${item}`; const old=existing.get(key);
  result.push({row:i+1,key,pedido,item,pep:String(r[4]??""),dateSerial:r[5],supplier:String(r[6]??""),material:String(r[7]??""),desc:String(r[8]??""),ordered,remaining,received,oldReceived:Number(old?.qtdRecebida??0),oldOrdered:Number(old?.qtdEnc??0),new:!old,deltaReceived:received-Number(old?.qtdRecebida??0),changed:!!old&&(received!==Number(old.qtdRecebida??0)||ordered!==Number(old.qtdEnc??0))});
}
const summary={exportRows:result.length,existingOrders:existing.size,newRows:result.filter(x=>x.new).length,changedRows:result.filter(x=>x.changed).length,positiveReceiptDeltas:result.filter(x=>x.deltaReceived>0).length,totalPositiveReceiptDelta:result.filter(x=>x.deltaReceived>0).reduce((s,x)=>s+x.deltaReceived,0)};
console.log(JSON.stringify(summary,null,2));
console.log(JSON.stringify({newRows:result.filter(x=>x.new),changed:result.filter(x=>x.changed),positiveDeltas:result.filter(x=>x.deltaReceived>0)},null,2));
