import fs from "node:fs/promises";

const jsonPath = "dados_armazem_catenaria.json";
const htmlPath = "gestao_armazem_catenaria.html";
const marker = "Restantes saídas da folha manual — 23/07/2026";
const requested = [["9U1",5],["359",1],["662",1],["291A",58],["16D8",58],["512",58],["16D4",58],["480",58]];

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
  throw new Error("Saídas já aplicadas; cancelado para evitar duplicação.");
}
const byCode = new Map(db.materiais.map(m => [String(m.codigo || "").trim().toUpperCase(), m]));
for (const [code, qty] of requested) {
  const mat = byCode.get(code);
  if (!mat) throw new Error(`Código não encontrado: ${code}`);
  const available = stock(db, mat.id);
  if (available < qty) throw new Error(`Stock insuficiente para ${code}: ${available}; pedido ${qty}.`);
}

let nextId = Math.max(0, ...db.movimentos.map(m => Number(String(m.id).match(/\d+/)?.[0] || 0))) + 1;
const common = { arm:"Armazém Catenária", armDst:null, pedido:"", doc:"", user:"", ref:null };
const moves = requested.map(([code, qtd]) => {
  const mat = byCode.get(code);
  return {
    id:`mv${nextId++}`, data:"2026-07-23", tipo:"saida", mat:mat.id, qtd, ...common,
    origem:"", dest:"Obra IC-0019", obs:`${marker} | Código ${code} | ${mat.desc}`,
  };
});
db.movimentos.push(...moves);
db.seq = Math.max(Number(db.seq || 1), nextId);
const stocks = Object.fromEntries(requested.map(([code]) => [code, stock(db, byCode.get(code).id)]));

const html = await fs.readFile(htmlPath, "utf8");
const prefix = "const SEED_DATA=";
const prefixAt = html.indexOf(prefix);
if (prefixAt < 0) throw new Error("SEED_DATA não encontrado no HTML.");
const objectStart = prefixAt + prefix.length;
const objectEnd = findJsonEnd(html, objectStart);

await fs.copyFile(jsonPath, `${jsonPath}.backup_antes_restantes_saidas_20260723`);
await fs.copyFile(htmlPath, `${htmlPath}.backup_antes_restantes_saidas_20260723`);
await fs.writeFile(jsonPath, JSON.stringify(db, null, 2) + "\n", "utf8");
await fs.writeFile(htmlPath, html.slice(0, objectStart) + JSON.stringify(db) + html.slice(objectEnd), "utf8");

console.log(JSON.stringify({added:moves.length,ids:moves.map(m=>m.id),stocks,seq:db.seq}, null, 2));
