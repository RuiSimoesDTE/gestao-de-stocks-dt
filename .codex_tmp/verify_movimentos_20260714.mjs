import fs from "node:fs/promises";
const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const html = await fs.readFile("gestao_armazem_catenaria.html", "utf8");
const prefix = "const SEED_DATA=";
const start = html.indexOf(prefix) + prefix.length;
let depth=0,inString=false,escaped=false,end=-1;
for(let i=start;i<html.length;i++){
  const c=html[i];
  if(inString){if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c==='"')inString=false;continue;}
  if(c==='"')inString=true;else if(c==="{")depth++;else if(c==="}"&&--depth===0){end=i+1;break;}
}
const seed=JSON.parse(html.slice(start,end));
const ids=db.movimentos.map(m=>m.id);
const added=db.movimentos.filter(m=>String(m.obs||"").includes("Registo confirmado 14/07/2026 — folha manual WhatsApp"));
const result={jsonMovimentos:db.movimentos.length,htmlMovimentos:seed.movimentos.length,added:added.length,uniqueIds:new Set(ids).size===ids.length,sameSeed:JSON.stringify(db)===JSON.stringify(seed),backups:[await fs.stat("dados_armazem_catenaria.json.backup_antes_saida_20260714").then(()=>true),await fs.stat("gestao_armazem_catenaria.html.backup_antes_saida_20260714").then(()=>true)]};
console.log(JSON.stringify(result,null,2));
if(!result.uniqueIds||!result.sameSeed||result.added!==15||result.backups.includes(false))process.exit(1);
