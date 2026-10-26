import fs from "node:fs/promises";
import { SpreadsheetFile } from "@oai/artifact-tool";

const file = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/IC-0019_Consumos_01-07_a_21-08-2026_PREENCHIDO.xlsx";
const wb = await SpreadsheetFile.importXlsx(await fs.readFile(file));
const sheet = wb.worksheets.getItem("Sheet1");

const table = await wb.inspect({ kind: "table", range: "Sheet1!A1:L442", include: "values,formulas", tableMaxRows: 500, tableMaxCols: 12, maxChars: 200000 });
const lines = table.ndjson.split(/\r?\n/).filter(Boolean).map(x => JSON.parse(x));

// Extract rows from inspection records and locate the canonical PEP row per SAP.
const rows = [];
for (const rec of lines) {
  if (rec.kind !== "table" || !Array.isArray(rec.values)) continue;
  const start = Number((rec.address?.match(/A(\d+)/) || [])[1] || 1);
  rec.values.forEach((v, i) => rows.push({ row: start + i, v }));
}

const wanted = new Map([["5003472", 9], ["3002314", 6], ["3000599", 6]]);
const chosen = [];
for (const [sap, qty] of wanted) {
  const candidates = rows.filter(r => String(r.v?.[0] ?? "").trim() === sap);
  if (!candidates.length) throw new Error(`SAP ${sap} não encontrado em Sheet1`);
  const canonical = candidates.find(r => String(r.v?.[5] ?? "").trim() === "IC-0019-P-01") || candidates.find(r => String(r.v?.[5] ?? "").trim() === "IC-0019") || candidates[0];
  const stock = Number(canonical.v?.[6] ?? 0);
  if (stock < qty) throw new Error(`SAP ${sap}: stock Excel ${stock} inferior ao consumo ${qty}`);
  sheet.getRange(`J${canonical.row}`).values = [[qty]];
  chosen.push({ sap, qty, row: canonical.row, pep: canonical.v?.[5], stock });
  for (const other of candidates.filter(r => r.row !== canonical.row)) sheet.getRange(`J${other.row}`).clear({ contents: true });
}

const audit = wb.worksheets.getItem("Auditoria Consumos");
const used = await wb.inspect({ kind: "table", range: "Auditoria Consumos!A1:L200", include: "values,formulas", tableMaxRows: 220, tableMaxCols: 12, maxChars: 150000 });
let maxRow = 4;
for (const rec of used.ndjson.split(/\r?\n/).filter(Boolean).map(x => JSON.parse(x))) {
  const m = rec.address?.match(/:[A-Z]+(\d+)$/); if (m) maxRow = Math.max(maxRow, Number(m[1]));
}
const start = maxRow + 1;
const auditRows = chosen.map(x => [x.sap, x.sap, x.sap, "Material Farprotec expedido pela GT ATDT202601GT/2979", x.qty, x.row, x.pep, x.stock, "SAP", "Saída pela guia para IC-0018 — lançar nos consumos IC-0019 por confirmação do utilizador", "2026-08-17", "OK para preencher"]);
audit.getRange(`A${start}:L${start + auditRows.length - 1}`).values = auditRows;
audit.getRange(`A${start}:L${start + auditRows.length - 1}`).format = { fill: "#E2F0D9", font: { color: "#375623" }, wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: "#A9D18E" } };

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(file);

const verify = await wb.inspect({ kind: "table", range: "Sheet1!A1:L442", include: "values,formulas", tableMaxRows: 500, tableMaxCols: 12, maxChars: 200000 });
await fs.writeFile("C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/verificacao_final_farprotec.ndjson", verify.ndjson, "utf8");
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "Erros de fórmula após Farprotec" });
await fs.writeFile("C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/erros_final_farprotec.ndjson", errors.ndjson, "utf8");
console.log(JSON.stringify({ chosen, formulaErrors: errors.ndjson }, null, 2));
