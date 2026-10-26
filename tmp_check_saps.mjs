import fs from "node:fs/promises";
const db = JSON.parse(await fs.readFile(process.argv[2], "utf8"));
for (const sap of process.argv.slice(3)) {
  const mats = db.materiais.filter(m => [m.sap,m.codigo_alt,m.codigo].map(String).includes(sap));
  console.log(JSON.stringify({sap, mats: mats.map(m => ({id:m.id,codigo:m.codigo,desc:m.desc,fornecedor:m.fornecedor,movimentos:db.movimentos.filter(x=>String(x.mat)===String(m.id))}))}, null, 2));
}
