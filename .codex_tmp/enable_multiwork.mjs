import fs from "node:fs/promises";
const path="gestao_armazem_catenaria.html";
let s=await fs.readFile(path,"utf8");

const oldPrefix="const CHAVE='dte_armazem_v118';\nlet DB=";
const newPrefix="const CHAVE='dte_armazem_v118';\nconst CHAVE_MULTI='dte_armazem_multi_v1';\nlet OBRAS=null;\nlet DB=";
if(!s.includes(oldPrefix))throw new Error("Prefixo do modelo não encontrado");
s=s.replace(oldPrefix,newPrefix);

function replaceBetween(startMarker,endMarker,replacement){
  const a=s.indexOf(startMarker),b=s.indexOf(endMarker,a);
  if(a<0||b<0)throw new Error(`Bloco não encontrado: ${startMarker}`);
  s=s.slice(0,a)+replacement+"\n"+s.slice(b);
}

const core=`function copia(v){return JSON.parse(JSON.stringify(v));}
function maxSeq(db){
  const nums=[];
  for(const col of [db.materiais||[],db.movimentos||[],db.encomendas||[]])for(const x of col)nums.push(Number(String(x.id||'').match(/\\d+/)?.[0]||0));
  return Math.max(Number(db.seq||1),...nums,1)+1;
}
function juntarPorId(atual,seed){
  const out=Array.isArray(atual)?atual:[],ids=new Set(out.map(x=>x.id));
  for(const x of (seed||[]))if(!ids.has(x.id)){out.push(copia(x));ids.add(x.id);}
  return out;
}
function normalizarLegado(flat){
  flat=flat&&flat.materiais?flat:copia(SEED_DATA);
  flat.materiais=juntarPorId(flat.materiais,SEED_DATA.materiais);
  flat.movimentos=juntarPorId(flat.movimentos,SEED_DATA.movimentos);
  flat.encomendas=juntarPorId(flat.encomendas,SEED_DATA.encomendas);
  flat.montagens=juntarPorId(flat.montagens,SEED_DATA.montagens);
  flat.postes=juntarPorId(flat.postes,SEED_DATA.postes);
  flat.armazens=flat.armazens&&flat.armazens.length?flat.armazens:['Armazém Catenária'];
  flat.param=flat.param||{neg:'avisar',user:''};flat.seq=maxSeq(flat);
  return flat;
}
function dadosObra(flat,nome,codigo,movimentos,encomendas){
  return {nome,codigo,arquivada:false,materiais:copia(flat.materiais||[]),armazens:copia(flat.armazens||['Armazém Catenária']),movimentos:copia(movimentos||[]),encomendas:copia(encomendas||[]),param:copia(flat.param||{neg:'avisar',user:''}),seq:maxSeq(flat)};
}
function criarEstruturaMulti(flat){
  flat=normalizarLegado(flat);
  return {versao:1,ativa:'vendas_novas',partilhado:{postes:copia(flat.postes||[]),montagens:copia(flat.montagens||[])},obras:{
    vendas_novas:dadosObra(flat,'Vendas Novas','IC-0019',flat.movimentos,flat.encomendas),
    pampilhosa:dadosObra(flat,'Pampilhosa','PAMPILHOSA',[],[])
  }};
}
function capturarObraAtiva(){
  if(!OBRAS||!OBRAS.obras[OBRAS.ativa])return;
  const o=OBRAS.obras[OBRAS.ativa];
  Object.assign(o,{materiais:DB.materiais,armazens:DB.armazens,movimentos:DB.movimentos,encomendas:DB.encomendas,param:DB.param,seq:DB.seq});
  OBRAS.partilhado.postes=DB.postes;OBRAS.partilhado.montagens=DB.montagens;
}
function ativarObra(id){
  const o=OBRAS.obras[id];if(!o)throw new Error('Obra inexistente');
  OBRAS.ativa=id;
  DB={materiais:o.materiais||[],montagens:OBRAS.partilhado.montagens||[],armazens:o.armazens||['Armazém Catenária'],movimentos:o.movimentos||[],encomendas:o.encomendas||[],postes:OBRAS.partilhado.postes||[],param:o.param||{neg:'avisar',user:''},seq:o.seq||1};
  _stk=null;window.DB=DB;window.OBRAS=OBRAS;window.SEED_DATA=SEED_DATA;window.persistir=guardar;
}
function carregar(){
  let multi=null,legado=null;
  try{const raw=localStorage.getItem(CHAVE_MULTI);if(raw)multi=JSON.parse(raw);}catch(e){console.error(e);}
  if(!multi){try{const raw=localStorage.getItem(CHAVE);if(raw)legado=JSON.parse(raw);}catch(e){console.error(e);}multi=criarEstruturaMulti(legado||SEED_DATA);}
  if(!multi.obras||!multi.partilhado)multi=criarEstruturaMulti(SEED_DATA);
  if(!multi.obras.pampilhosa){const base=multi.obras.vendas_novas||Object.values(multi.obras)[0];multi.obras.pampilhosa=dadosObra({...base,postes:multi.partilhado.postes,montagens:multi.partilhado.montagens},'Pampilhosa','PAMPILHOSA',[],[]);}
  OBRAS=multi;if(!OBRAS.obras[OBRAS.ativa])OBRAS.ativa=Object.keys(OBRAS.obras)[0];ativarObra(OBRAS.ativa);guardar();localStorage.removeItem(CHAVE);setTimeout(atualizarSeletorObras,0);
}
function guardar(){
  _stk=null;if(!OBRAS)return;
  capturarObraAtiva();
  try{localStorage.setItem(CHAVE_MULTI,JSON.stringify(OBRAS));}catch(e){toast('Erro a guardar — espaço do navegador esgotado','erro');}
}
function novoId(){return 'M'+(DB.seq++);}
function atualizarSeletorObras(){
  const sel=document.getElementById('obra-seletor');if(!sel||!OBRAS)return;
  sel.innerHTML=Object.entries(OBRAS.obras).filter(([,o])=>!o.arquivada).map(([id,o])=>'<option value="'+escapeHtml(id)+'">'+escapeHtml(o.nome)+(o.codigo?' — '+escapeHtml(o.codigo):'')+'</option>').join('');sel.value=OBRAS.ativa;
  document.title='Gestão de Armazém — '+OBRAS.obras[OBRAS.ativa].nome+' | DTE';
}
function mudarObra(id){
  if(!OBRAS||id===OBRAS.ativa)return;
  guardar();ativarObra(id);guardar();atualizarSeletorObras();preencherSelects();refrescarTudo();toast('Obra ativa: '+OBRAS.obras[id].nome,'ok');
}
function slugObra(nome){return nome.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');}
function criarObra(){
  const nome=prompt('Nome da nova obra:');if(!nome||!nome.trim())return;
  let id=slugObra(nome),n=2;const base=id||'obra';while(OBRAS.obras[id])id=base+'_'+n++;
  const codigo=prompt('Código SAP / referência da obra (opcional):','')||'';
  const catalogo=OBRAS.obras.vendas_novas?.materiais||DB.materiais;
  const flat={materiais:copia(catalogo),armazens:['Armazém Catenária'],param:{neg:'avisar',user:DB.param.user||''},seq:Math.max(...Object.values(OBRAS.obras).map(o=>Number(o.seq||1))),postes:OBRAS.partilhado.postes,montagens:OBRAS.partilhado.montagens};
  OBRAS.obras[id]=dadosObra(flat,nome.trim(),codigo.trim(),[],[]);guardar();mudarObra(id);
}

/* ================= DADOS INICIAIS (Mapa de Stock Catenária) ================= */
function seedInicial(silent){
  OBRAS=criarEstruturaMulti(SEED_DATA);ativarObra('vendas_novas');guardar();atualizarSeletorObras();
  if(!silent){preencherSelects();refrescarTudo();toast('Dados iniciais carregados em Vendas Novas','ok');}
}`;
replaceBetween("function carregar(){","function hoje()",core);

const backup=`function exportarBackup(){
  guardar();const nome=OBRAS?.obras?.[OBRAS.ativa]?.nome||'todas_obras';
  descarregar('backup_gestao_stocks_todas_obras_'+hoje()+'.json',JSON.stringify(OBRAS,null,2),'application/json');
  toast('Backup geral de todas as obras exportado','ok');
}`;
replaceBetween("function exportarBackup(){","function importarBackup",backup);

const restore=`function importarBackup(input){
  const f=input.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{try{
    const obj=JSON.parse(e.target.result);let novo;
    if(obj.versao&&obj.obras&&obj.partilhado)novo=obj;
    else if(obj.materiais&&obj.movimentos)novo=criarEstruturaMulti(obj);
    else throw new Error('estrutura inválida');
    if(!confirm('Restaurar este backup substitui os dados de todas as obras. Continuar?'))return;
    OBRAS=novo;ativarObra(OBRAS.ativa||Object.keys(OBRAS.obras)[0]);guardar();atualizarSeletorObras();preencherSelects();refrescarTudo();toast('Backup restaurado','ok');
  }catch(err){console.error(err);toast('Ficheiro de backup inválido','erro');}};
  r.readAsText(f);input.value='';
}`;
replaceBetween("function importarBackup(input){","function apagarTudo",restore);

const erase=`function apagarTudo(){
  if(!confirm('APAGAR os dados de TODAS as obras, incluindo stocks e movimentos?'))return;
  if(!confirm('Tens a certeza? Faz um backup geral antes.'))return;
  localStorage.removeItem(CHAVE_MULTI);localStorage.removeItem(CHAVE);
  const vazio={materiais:[],montagens:[],armazens:['Armazém Catenária'],movimentos:[],encomendas:[],postes:[],param:{neg:'avisar',user:''},seq:1};
  OBRAS=criarEstruturaMulti(vazio);ativarObra('vendas_novas');guardar();atualizarSeletorObras();preencherSelects();refrescarTudo();toast('Dados de todas as obras apagados','ok');
}`;
replaceBetween("function apagarTudo(){","/* ================= ENCOMENDAS",erase);

s=s.replace("JSON.stringify(window.DB, null, 2)","JSON.stringify(window.OBRAS||window.DB, null, 2)");
s=s.replace("function autoMerge(){\n    if(!window.DB || !window.SEED_DATA) return;","function autoMerge(){\n    if(!window.DB || !window.SEED_DATA || (window.OBRAS && window.OBRAS.ativa!=='vendas_novas')) return;");

await fs.writeFile(path,s,"utf8");
