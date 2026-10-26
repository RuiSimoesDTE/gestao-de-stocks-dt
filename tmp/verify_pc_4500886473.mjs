import fs from "node:fs/promises";
import vm from "node:vm";

const root = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte";
const json = JSON.parse(await fs.readFile(`${root}/dados_armazem_catenaria.json`, "utf8"));
const backup = JSON.parse(await fs.readFile(`${root}/backup_armazem_catenaria_2026-08-24_PC4500886473.json`, "utf8"));
const html = await fs.readFile(`${root}/gestao_armazem_catenaria.html`, "utf8");
const marker = "const SEED_DATA="; const pos=html.indexOf(marker)+marker.length;
let depth=0, string=false, escape=false, end=-1;
for(let i=pos;i<html.length;i++){const c=html[i];if(string){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')string=false;continue;}if(c==='"')string=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end=i+1;break;}}
const seed=JSON.parse(html.slice(pos,end));
const targets=[json,seed,backup.obras.vendas_novas];
for(const [i,data] of targets.entries()){
  const mats=data.materiais.filter(x=>String(x.id).includes('4500886473'));
  const encs=data.encomendas.filter(x=>x.pedido==='4500886473');
  const mvs=data.movimentos.filter(x=>x.pedido==='4500886473');
  if(mats.length!==3||encs.length!==3||mvs.length!==6)throw new Error(`Estrutura ${i}: contagens incorretas ${mats.length}/${encs.length}/${mvs.length}`);
  for(const mat of mats){const related=mvs.filter(x=>x.mat===mat.id);const balance=related.reduce((s,x)=>s+(x.tipo==='entrada'?x.qtd:-x.qtd),0);if(balance!==0)throw new Error(`Saldo não zero ${mat.id}: ${balance}`);}
  if(mvs.some(x=>x.data!=='2026-08-24'||x.ajuste!==false))throw new Error(`Estrutura ${i}: data/ajuste inválido`);
}
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i],{filename:`script-${i+1}.js`});
console.log(JSON.stringify({ok:true,scripts:scripts.length,pc:{materiais:3,encomendas:3,movimentos:6,saldos:[0,0,0]},htmlJsonCountsMatch:seed.materiais.length===json.materiais.length&&seed.movimentos.length===json.movimentos.length&&seed.encomendas.length===json.encomendas.length},null,2));
