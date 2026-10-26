import fs from "node:fs/promises";
const jsonPath="dados_armazem_catenaria.json",htmlPath="gestao_armazem_catenaria.html",marker="Saída confirmada 14/07/2026 — Pampilhosa — códigos 542 e 501D";
function endJson(s,start){let d=0,q=false,e=false;for(let i=start;i<s.length;i++){const c=s[i];if(q){if(e)e=false;else if(c==="\\")e=true;else if(c==='"')q=false;continue;}if(c==='"')q=true;else if(c==="{")d++;else if(c==="}"&&--d===0)return i+1;}throw new Error("SEED_DATA incompleto");}
const original=await fs.readFile(jsonPath,"utf8"),db=JSON.parse(original);
if(db.movimentos.some(m=>String(m.obs||"").includes(marker)))throw new Error("Saídas já registadas; cancelado para evitar duplicação.");
const find=code=>db.materiais.find(m=>String(m.codigo).trim().toUpperCase()===code);
const m542=find("542"),m501=find("501D");if(!m542||!m501)throw new Error("Material não encontrado");
const stock=id=>db.movimentos.reduce((a,m)=>m.mat!==id?a:a+(m.tipo==="entrada"?Number(m.qtd||0):m.tipo==="saida"?-Number(m.qtd||0):0),0);
if(stock(m542.id)<10||stock(m501.id)<40)throw new Error("Stock insuficiente");
let seq=Math.max(Number(db.seq||1),...db.movimentos.map(m=>Number(String(m.id).match(/\d+/)?.[0]||0)))+1;
const base={data:"2026-07-14",tipo:"saida",arm:"Armazém Catenária",armDst:null,pedido:"",doc:"",origem:"",dest:"Pampilhosa",user:"",ref:null};
db.movimentos.push({id:`mv${seq++}`,...base,mat:m542.id,qtd:10,obs:`${marker} | Código 542 | 10 un`},{id:`mv${seq++}`,...base,mat:m501.id,qtd:40,obs:`${marker} | Código 501D | 40 un`});db.seq=seq;
if(stock(m542.id)!==99||stock(m501.id)!==497)throw new Error(`Stock final inesperado: 542=${stock(m542.id)}, 501D=${stock(m501.id)}`);
const html=await fs.readFile(htmlPath,"utf8"),prefix="const SEED_DATA=",p=html.indexOf(prefix),start=p+prefix.length,end=endJson(html,start);if(p<0)throw new Error("SEED_DATA não encontrado");
await fs.copyFile(jsonPath,`${jsonPath}.backup_antes_pampilhosa_20260714`);await fs.copyFile(htmlPath,`${htmlPath}.backup_antes_pampilhosa_20260714`);
await fs.writeFile(jsonPath,JSON.stringify(db,null,2)+"\n","utf8");await fs.writeFile(htmlPath,html.slice(0,start)+JSON.stringify(db)+html.slice(end),"utf8");
console.log(JSON.stringify({movimentos:2,ids:[`mv${seq-2}`,`mv${seq-1}`],stockFinal:{"542":99,"501D":497}},null,2));
