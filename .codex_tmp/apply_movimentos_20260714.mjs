import fs from "node:fs/promises";

const jsonPath = "dados_armazem_catenaria.json";
const htmlPath = "gestao_armazem_catenaria.html";
const marker = "Registo confirmado 14/07/2026 — folha manual WhatsApp";

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

const originalJson = await fs.readFile(jsonPath, "utf8");
const db = JSON.parse(originalJson);
if (db.movimentos.some(m => String(m.obs || "").includes(marker))) {
  throw new Error("Estes movimentos já foram aplicados; operação cancelada para evitar duplicação.");
}

const byCode = new Map(db.materiais.map(m => [String(m.codigo).toUpperCase(), m]));
const requested = [
  ["123A",13],["512",46],["217A",43],["515",86],["514A",86],
  ["112A",6],["18A",12],["16D8",58],["291A",96],["16D9",52],
  ["60",8],["307",4],["406B",4],
];
for (const [code] of requested) if (!byCode.has(code)) throw new Error(`Material não encontrado: ${code}`);

let nextId = Math.max(0, ...db.movimentos.map(m => Number(String(m.id).match(/\d+/)?.[0] || 0))) + 1;
const common = { arm:"Armazém Catenária", armDst:null, pedido:"", doc:"", user:"", ref:null };
const newMoves = [
  {id:`mv${nextId++}`,data:"2026-06-30",tipo:"entrada",mat:byCode.get("217A").id,qtd:38,...common,origem:"Ajuste de reconciliação",dest:"(ajuste)",obs:`${marker} | Ajuste +38 para alinhar com mapa IC-0019 de 30/06/2026`,ajuste:true},
  {id:`mv${nextId++}`,data:"2026-06-30",tipo:"entrada",mat:byCode.get("515").id,qtd:257,...common,origem:"Ajuste de reconciliação",dest:"(ajuste)",obs:`${marker} | Ajuste +257; mapa indicava 278 e já existia saída de 19 em 01/07/2026`,ajuste:true},
];
for (const [code, qtd] of requested) {
  newMoves.push({id:`mv${nextId++}`,data:"2026-07-14",tipo:"saida",mat:byCode.get(code).id,qtd,...common,origem:"",dest:"Obra IC-0019",obs:`${marker} | Código ${code}`});
}
db.movimentos.push(...newMoves);
db.seq = Math.max(Number(db.seq || 1), nextId);

const expected = new Map([["123A",4],["512",499],["217A",1],["515",173],["514A",436],["112A",577],["18A",346],["16D8",833],["291A",679],["16D9",1],["60",64],["307",231],["406B",1222]]);
for (const [code, value] of expected) {
  const actual = stock(db, byCode.get(code).id);
  if (actual !== value) throw new Error(`Stock inesperado para ${code}: ${actual}; esperado ${value}`);
}

const html = await fs.readFile(htmlPath, "utf8");
const prefix = "const SEED_DATA=";
const prefixAt = html.indexOf(prefix);
if (prefixAt < 0) throw new Error("SEED_DATA não encontrado no HTML");
const objectStart = prefixAt + prefix.length;
const objectEnd = findJsonEnd(html, objectStart);

await fs.copyFile(jsonPath, `${jsonPath}.backup_antes_saida_20260714`);
await fs.copyFile(htmlPath, `${htmlPath}.backup_antes_saida_20260714`);
await fs.writeFile(jsonPath, JSON.stringify(db, null, 2) + "\n", "utf8");
await fs.writeFile(htmlPath, html.slice(0, objectStart) + JSON.stringify(db) + html.slice(objectEnd), "utf8");

console.log(JSON.stringify({added:newMoves.length, ids:[newMoves[0].id,newMoves.at(-1).id], seq:db.seq, stocks:Object.fromEntries([...expected].map(([code])=>[code,stock(db,byCode.get(code).id)]))}, null, 2));
