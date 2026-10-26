import fs from "node:fs/promises";

const jsonPath = "dados_armazem_catenaria.json";
const htmlPath = "gestao_armazem_catenaria.html";
const marker = "Correção união 4004766 e saída real 23/07/2026";

function findJsonEnd(text, start) {
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
  }
  throw new Error("Fim do SEED_DATA não encontrado");
}

function stock(db, matId) {
  return db.movimentos.reduce((total, mv) => {
    if (mv.mat !== matId) return total;
    if (mv.tipo === "entrada") return total + Number(mv.qtd || 0);
    if (mv.tipo === "saida") return total - Number(mv.qtd || 0);
    return total;
  }, 0);
}

const db = JSON.parse(await fs.readFile(jsonPath, "utf8"));
if (db.movimentos.some(m => String(m.obs || "").includes(marker))) {
  throw new Error("A correção e a saída já existem; cancelado para evitar duplicação.");
}

const mat = db.materiais.find(m => String(m.sap || "").trim() === "4004766");
if (!mat) throw new Error("Material SAP 4004766 não encontrado.");
const before = stock(db, mat.id);
if (before !== 0) throw new Error(`Stock inicial inesperado: ${before}; esperado 0.`);

let nextId = Math.max(0, ...db.movimentos.map(m => Number(String(m.id).match(/\d+/)?.[0] || 0))) + 1;
const common = { arm:"Armazém Catenária", armDst:null, pedido:"", doc:"", user:"", ref:null };
const correction = {
  id:`mv${nextId++}`, data:"2026-06-12", tipo:"entrada", mat:mat.id, qtd:1, ...common,
  origem:"Correção de ajuste SAP", dest:"(ajuste)",
  obs:`${marker} | Reposição de 1 unidade abatida em excesso no ajuste SAP de 12/06/2026`,
  ajuste:true,
};
const exit = {
  id:`mv${nextId++}`, data:"2026-07-23", tipo:"saida", mat:mat.id, qtd:1, ...common,
  origem:"", dest:"Obra IC-0019",
  obs:`${marker} | União para elétrodo terra UT 5/8 | Fornecedor original: Jobasi`,
};
db.movimentos.push(correction, exit);
db.seq = Math.max(Number(db.seq || 1), nextId);

const after = stock(db, mat.id);
if (after !== 0) throw new Error(`Stock final inesperado: ${after}; esperado 0.`);

const html = await fs.readFile(htmlPath, "utf8");
const prefix = "const SEED_DATA=";
const prefixAt = html.indexOf(prefix);
if (prefixAt < 0) throw new Error("SEED_DATA não encontrado no HTML.");
const objectStart = prefixAt + prefix.length;
const objectEnd = findJsonEnd(html, objectStart);

await fs.copyFile(jsonPath, `${jsonPath}.backup_antes_uniao_20260723`);
await fs.copyFile(htmlPath, `${htmlPath}.backup_antes_uniao_20260723`);
await fs.writeFile(jsonPath, JSON.stringify(db, null, 2) + "\n", "utf8");
await fs.writeFile(htmlPath, html.slice(0, objectStart) + JSON.stringify(db) + html.slice(objectEnd), "utf8");

console.log(JSON.stringify({
  material:{id:mat.id,codigo:mat.codigo,sap:mat.sap,desc:mat.desc},
  stockBefore:before, correctionId:correction.id, exitId:exit.id, stockAfter:after, seq:db.seq,
}, null, 2));
