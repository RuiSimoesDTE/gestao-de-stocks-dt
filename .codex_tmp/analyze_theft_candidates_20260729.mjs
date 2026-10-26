import fs from "node:fs/promises";

const db = JSON.parse(await fs.readFile("dados_armazem_catenaria.json", "utf8"));
const stock = new Map(db.materiais.map(m => [m.id, 0]));
for (const mv of db.movimentos) {
  const qty = Number(mv.qtd || 0);
  if (mv.tipo === "entrada") stock.set(mv.mat, (stock.get(mv.mat) || 0) + qty);
  if (mv.tipo === "saida") stock.set(mv.mat, (stock.get(mv.mat) || 0) - qty);
}

const groups = [
  ["Pêndulos", /p[eê]ndulo|pendulo/i],
  ["Fios/cabos de pêndulo", /(fio|cabo).*(p[eê]ndulo|pendulo)|(p[eê]ndulo|pendulo).*(fio|cabo)/i],
  ["Fios/cabos de vara ou terra", /(fio|cabo).*(vara|terra)|(vara|terra).*(fio|cabo)/i],
  ["Fio/cabo de cobre", /(fio|cabo).*(cobre|cu)|(?:cobre|cu).*(fio|cabo)/i],
  ["Cabos de bronze", /cabo.*(bronze|\bBz\b)|(?:bronze|\bBz\b).*cabo/i],
  ["Varas e elétrodos de terra", /vara de terra|el[eé]trodo.*terra|terra.*el[eé]trodo/i],
  ["Bobines e rolos", /bobine|rolo/i],
  ["Tesouras de corte", /tesoura|corta[\s-]*(cabo|fio|tubo)|corte.*(cabo|fio)/i],
  ["Hilti", /hilti|TE 500|TE-YX|C 4-22|B 22-/i],
];
for (const [name, regex] of groups) {
  const rows = db.materiais
    .filter(m => regex.test(`${m.codigo || ""} ${m.desc || ""} ${m.fornecedor || ""} ${m.ref || ""}`))
    .map(m => ({
      id:m.id,codigo:m.codigo,sap:m.sap || "",desc:m.desc,un:m.un,
      fornecedor:m.fornecedor || "",tipo:m.tipo || "",stock:stock.get(m.id) || 0,
    }))
    .sort((a,b) => b.stock-a.stock || String(a.desc).localeCompare(String(b.desc)));
  console.log(`GROUP ${name}`);
  for (const row of rows) console.log(JSON.stringify(row));
}

const tools = db.materiais
  .filter(m => /M[ÁA]QUINA|FERRAMENTA/i.test(`${m.tipo || ""} ${m.cat || ""}`))
  .map(m => ({codigo:m.codigo,sap:m.sap || "",desc:m.desc,fornecedor:m.fornecedor || "",stock:stock.get(m.id) || 0}))
  .filter(m => m.stock > 0)
  .sort((a,b) => String(a.desc).localeCompare(String(b.desc)));
console.log("GROUP Ferramentas com stock positivo");
for (const row of tools) console.log(JSON.stringify(row));
