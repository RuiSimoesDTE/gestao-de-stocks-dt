import fs from "node:fs/promises";
const db=JSON.parse(await fs.readFile("dados_armazem_catenaria.json","utf8"));
const stock=new Map(db.materiais.map(m=>[m.id,0]));
for(const mv of db.movimentos){
  const q=Number(mv.qtd||0);
  if(mv.tipo==="entrada")stock.set(mv.mat,(stock.get(mv.mat)||0)+q);
  if(mv.tipo==="saida")stock.set(mv.mat,(stock.get(mv.mat)||0)-q);
}
for(const m of db.materiais.filter(m=>/seccionador/i.test(String(m.desc||""))).sort((a,b)=>(stock.get(b.id)||0)-(stock.get(a.id)||0))){
  console.log(JSON.stringify({id:m.id,codigo:m.codigo,sap:m.sap||"",desc:m.desc,un:m.un,fornecedor:m.fornecedor||"",stock:stock.get(m.id)||0}));
}
