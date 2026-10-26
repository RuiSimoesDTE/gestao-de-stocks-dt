import fs from "node:fs/promises";
const [jsonPath, htmlPath] = process.argv.slice(2);
const data = JSON.parse(await fs.readFile(jsonPath, "utf8"));
const moves = [
  {id:"consumo20260824-l329-5003256",data:"2026-08-24",tipo:"saida",mat:"M2758",qtd:12,arm:"Armazém Catenária",armDst:null,pedido:"4500874743",doc:"Consumo de obra / linha 329 do mapa da Ana",origem:"Armazém Catenária",dest:"Consumo de obra IC-0019 - Vendas Novas",obs:"Saída autorizada pelo utilizador em 24/08/2026 | Linha 329 do ficheiro de consumos | SAP 5003256 | Filme Estirável Preto.",ajuste:false,user:"",ref:null},
  {id:"consumo20260824-l331-4049802-fita",data:"2026-08-24",tipo:"saida",mat:"M4814",qtd:1,arm:"Armazém Catenária",armDst:null,pedido:"4500877501",doc:"Consumo de obra / linha 331 do mapa da Ana",origem:"Armazém Catenária",dest:"Consumo de obra IC-0019 - Vendas Novas",obs:"Saída autorizada pelo utilizador em 24/08/2026 | Linha 331 do ficheiro de consumos | SAP 4049802 | Fita de aço inox.",ajuste:false,user:"",ref:null},
  {id:"consumo20260824-l331-4049802-ferramenta",data:"2026-08-24",tipo:"saida",mat:"M4815",qtd:1,arm:"Armazém Catenária",armDst:null,pedido:"4500877501",doc:"Consumo de obra / linha 331 do mapa da Ana",origem:"Armazém Catenária",dest:"Consumo de obra IC-0019 - Vendas Novas",obs:"Saída autorizada pelo utilizador em 24/08/2026 | Linha 331 do ficheiro de consumos | SAP 4049802 | Ferramenta para fita de aço inox.",ajuste:false,user:"",ref:null}
];
for (const m of moves) if (!data.movimentos.some(x => x.id === m.id)) data.movimentos.push(m);
await fs.writeFile(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");

let html = await fs.readFile(htmlPath, "utf8");
const match = html.match(/const SEED_DATA=(\{.*?\});;/s);
if (!match) throw new Error("SEED_DATA not found in HTML");
html = html.slice(0, match.index) + `const SEED_DATA=${JSON.stringify(data)};;` + html.slice(match.index + match[0].length);
await fs.writeFile(htmlPath, html, "utf8");
console.log(JSON.stringify({movements:data.movimentos.length, added:moves.map(x=>x.id)}));
