import fs from "node:fs/promises";

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const stock = new Map(db.materiais.map(m => [m.id, 0]));
for (const mv of db.movimentos) {
  const qty = Number(mv.qtd || 0);
  if (mv.tipo === "entrada") stock.set(mv.mat, (stock.get(mv.mat) || 0) + qty);
  if (mv.tipo === "saida") stock.set(mv.mat, (stock.get(mv.mat) || 0) - qty);
}
const text = m => `${m.codigo || ""} ${m.desc || ""} ${m.fornecedor || ""} ${m.ref || ""}`.toUpperCase();
const isHilti = m => /\bHILTI\b/.test(text(m));
const isMakita = m => /\bMAKITA\b/.test(text(m));
const isTool = m =>
  /M[ÁA]QUINA|FERRAMENTA/i.test(`${m.tipo || ""} ${m.cat || ""}`) ||
  /\b(ALICATE|MARTELO|MARRETA|CHAVE|BERBEQUIM|REBARBADORA|SERRA|TESOURA|TORNO|PAQU[IÍ]METRO|N[IÍ]VEL|BROCA|PONTEIRO|ESCORPO|TURQU[EÊ]S|MACETA|APARAFUSADORA|MULT[IÍ]METRO|EQUIPAMENTO|M[ÁA]QUINA)\b/i.test(m.desc || "");

const rows = db.materiais.filter(m => isHilti(m) || isMakita(m) || isTool(m)).map(m => ({
  grupo:isHilti(m) ? "Hilti" : isMakita(m) ? "Makita" : "Outras ferramentas",
  codigo:m.codigo, sap:m.sap || "", descricao:m.desc, unidade:m.un,
  fornecedor:m.fornecedor || "", tipo:m.tipo || "", stock:stock.get(m.id) || 0,
})).sort((a,b) => a.grupo.localeCompare(b.grupo) || a.descricao.localeCompare(b.descricao));

const summary = Object.fromEntries(["Hilti","Makita","Outras ferramentas"].map(g => {
  const x = rows.filter(r => r.grupo === g);
  return [g,{referencias:x.length,comStock:x.filter(r=>r.stock>0).length,stockTotal:x.reduce((s,r)=>s+r.stock,0)}];
}));
console.log(JSON.stringify({summary,rows}, null, 2));
