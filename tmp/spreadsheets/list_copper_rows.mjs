import fs from "node:fs/promises";
const path = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/IC-0019_Consumos_01-07_a_21-08-2026_PREENCHIDO.xlsx.inspect.ndjson";
const lines = (await fs.readFile(path, "utf8")).split(/\r?\n/).filter(Boolean);
const rec = lines.map(x => JSON.parse(x)).find(x => x.kind === "table" && x.sheet === "Sheet1" && x.address === "A1:L442");
const out = rec.values.map((v,i)=>({row:i+1,sap:v[0],desc:v[1],pep:v[5],stock:v[6],un:v[7],consumo:v[9]})).filter(x => /cobre|cabo/i.test(String(x.desc ?? "")));
console.log(JSON.stringify(out, null, 2));
