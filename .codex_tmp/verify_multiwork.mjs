import fs from "node:fs";
const html=fs.readFileSync("gestao_armazem_catenaria.html","utf8");
const seedPrefix="const SEED_DATA=",seedStart=html.indexOf(seedPrefix)+seedPrefix.length;
let depth=0,inString=false,escaped=false,seedEnd=-1;
for(let i=seedStart;i<html.length;i++){const c=html[i];if(inString){if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c==='"')inString=false;continue;}if(c==='"')inString=true;else if(c==="{")depth++;else if(c==="}"&&--depth===0){seedEnd=i+1;break;}}
const SEED_DATA=JSON.parse(html.slice(seedStart,seedEnd));
const a=html.indexOf("function copia(v)"),b=html.indexOf("function hoje()",a),core=html.slice(a,b);
const store=new Map(),localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const factory=new Function("SEED_DATA","localStorage","window","setTimeout","document","toast","escapeHtml",`let OBRAS=null;let DB={};let _stk=null;const CHAVE='dte_armazem_v118',CHAVE_MULTI='dte_armazem_multi_v1';${core};return {carregar,guardar,ativarObra,capturarObraAtiva,get OBRAS(){return OBRAS},get DB(){return DB}};`);
const api=factory(SEED_DATA,localStorage,{},()=>{}, {getElementById:()=>null},()=>{},x=>String(x));
api.carregar();
const initialVnMoves=api.OBRAS.obras.vendas_novas.movimentos.length;
api.ativarObra("pampilhosa");api.DB.movimentos.push({id:"test-isolamento",tipo:"entrada",mat:api.DB.materiais[0]?.id,qtd:1,arm:"Armazém Catenária"});api.guardar();
api.ativarObra("vendas_novas");
const checks={active:api.OBRAS.ativa,works:Object.keys(api.OBRAS.obras),vendas:{materials:api.OBRAS.obras.vendas_novas.materiais.length,movements:api.OBRAS.obras.vendas_novas.movimentos.length,orders:api.OBRAS.obras.vendas_novas.encomendas.length},pampilhosa:{materials:api.OBRAS.obras.pampilhosa.materiais.length,movements:api.OBRAS.obras.pampilhosa.movimentos.length,orders:api.OBRAS.obras.pampilhosa.encomendas.length},shared:{posts:api.OBRAS.partilhado.postes.length,assemblies:api.OBRAS.partilhado.montagens.length},isolated:api.OBRAS.obras.vendas_novas.movimentos.length===initialVnMoves&&!api.OBRAS.obras.vendas_novas.movimentos.some(x=>x.id==="test-isolamento"),storageChars:store.get("dte_armazem_multi_v1").length};
console.log(JSON.stringify(checks,null,2));
if(checks.works.length!==2||checks.pampilhosa.orders!==0||checks.pampilhosa.movements!==1||!checks.isolated||checks.vendas.movements!==SEED_DATA.movimentos.length||checks.vendas.orders!==SEED_DATA.encomendas.length||checks.shared.posts!==SEED_DATA.postes.length||checks.shared.assemblies!==SEED_DATA.montagens.length)process.exit(1);
