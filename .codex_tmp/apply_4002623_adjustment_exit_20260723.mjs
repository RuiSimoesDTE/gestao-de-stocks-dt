import fs from "node:fs/promises";

const jsonPath = "dados_armazem_catenaria.json";
const htmlPath = "gestao_armazem_catenaria.html";
const marker = "Ajuste mínimo e saída da braçadeira 4002623 — 23/07/2026";

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
  throw new Error("Fim do SEED_DATA não encontrado.");
}

function stock(db, matId) {
  return db.movimentos.reduce((sum, mv) => {
    if (mv.mat !== matId) return sum;
    if (mv.tipo === "entrada") return sum + Number(mv.qtd || 0);
    if (mv.tipo === "saida") return sum - Number(mv.qtd || 0);
    return sum;
  }, 0);
}

const db = JSON.parse(await fs.readFile(jsonPath, "utf8"));
if (db.movimentos.some(m => String(m.obs || "").includes(marker))) {
  throw new Error("Movimentos já aplicados; cancelado para evitar duplicação.");
}
const mat = db.materiais.find(m => String(m.sap || "").trim() === "4002623");
if (!mat) throw new Error("Material SAP 4002623 não encontrado.");
const before = stock(db, mat.id);
if (before !== -2) throw new Error(`Stock inicial inesperado: ${before}; esperado -2.`);

let nextId = Math.max(0, ...db.movimentos.map(m => Number(String(m.id).match(/\d+/)?.[0] || 0))) + 1;
const common = { arm:"Armazém Catenária", armDst:null, pedido:"", doc:"", user:"", ref:null };
const adjustmentQty = 3;
const adjustment = {
  id:`mv${nextId++}`, data:"2026-07-23", tipo:"entrada", mat:mat.id, qtd:adjustmentQty, ...common,
  origem:"Ajuste de stock sem guia/PO", dest:"(ajuste)",
  obs:`${marker} | Reposição mínima para corrigir stock negativo; não é entrada documental`,
  ajuste:true,
};
const exit = {
  id:`mv${nextId++}`, data:"2026-07-23", tipo:"saida", mat:mat.id, qtd:1, ...common,
  origem:"", dest:"Obra IC-0019",
  obs:`${marker} | Saída real para consumos | Braçadeira para elétrodo 5/8 RCC16`,
};
db.movimentos.push(adjustment, exit);
db.seq = Math.max(Number(db.seq || 1), nextId);
const after = stock(db, mat.id);
if (after !== 0) throw new Error(`Stock final inesperado: ${after}; esperado 0.`);

const html = await fs.readFile(htmlPath, "utf8");
const prefix = "const SEED_DATA=";
const prefixAt = html.indexOf(prefix);
if (prefixAt < 0) throw new Error("SEED_DATA não encontrado no HTML.");
const objectStart = prefixAt + prefix.length;
const objectEnd = findJsonEnd(html, objectStart);

await fs.copyFile(jsonPath, `${jsonPath}.backup_antes_4002623_20260723`);
await fs.copyFile(htmlPath, `${htmlPath}.backup_antes_4002623_20260723`);
await fs.writeFile(jsonPath, JSON.stringify(db, null, 2) + "\n", "utf8");
await fs.writeFile(htmlPath, html.slice(0, objectStart) + JSON.stringify(db) + html.slice(objectEnd), "utf8");

console.log(JSON.stringify({
  material:{codigo:mat.codigo,sap:mat.sap,descricao:mat.desc},
  stockInicial:before,ajuste:adjustmentQty,saida:1,stockFinal:after,
  ids:[adjustment.id,exit.id],seq:db.seq,
}, null, 2));
