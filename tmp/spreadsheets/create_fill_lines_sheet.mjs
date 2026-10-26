import fs from "node:fs/promises";
import { SpreadsheetFile } from "@oai/artifact-tool";

const file = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/IC-0019_Consumos_01-07_a_21-08-2026_PREENCHIDO.xlsx";
const wb = await SpreadsheetFile.importXlsx(await fs.readFile(file));
try { wb.worksheets.getItem("Linhas para preencher").delete(); } catch {}

const inspected = await wb.inspect({ kind: "table", range: "Sheet1!A1:L442", include: "values,formulas", tableMaxRows: 500, tableMaxCols: 12, maxChars: 300000 });
const records = inspected.ndjson.split(/\r?\n/).filter(Boolean).map(x => JSON.parse(x));
const rows = [];
for (const rec of records) {
  if (rec.kind !== "table" || !Array.isArray(rec.values)) continue;
  const start = Number((rec.address?.match(/A(\d+)/) || [])[1] || 1);
  rec.values.forEach((v, i) => rows.push({ row: start + i, v }));
}

const filled = rows.filter(r => r.row > 1 && Number(r.v?.[9]) > 0).map(r => [
  r.row,
  String(r.v?.[0] ?? ""),
  String(r.v?.[1] ?? ""),
  String(r.v?.[5] ?? ""),
  Number(r.v?.[9]),
  "Preenchido na coluna J da Sheet1"
]);

const ws = wb.worksheets.add("Linhas para preencher");
ws.showGridLines = false;
ws.getRange("A1:F1").merge();
ws.getRange("A1").values = [["LINHAS DE CONSUMO — IC-0019 | 01/07/2026 a 21/08/2026"]];
ws.getRange("A2:F2").merge();
ws.getRange("A2").values = [["Lista simples das linhas preenchidas na folha SAP. A bobine de cobre fica por confirmar."]];
ws.getRange("A4:F4").values = [["Linha na Sheet1", "SAP", "Descrição", "Elemento PEP", "Consumo", "Observação"]];
if (filled.length) ws.getRange(`A5:F${4 + filled.length}`).values = filled;
const copperRow = 5 + filled.length;
ws.getRange(`A${copperRow}:F${copperRow}`).values = [["A confirmar", "A confirmar", "Bobine de cobre — GT ATDT202601GT/2558", "IC-0019-P-01", "", "Preencher apenas os metros efetivamente cortados/aplicados; não usar os 1.539 m transportados."]];

ws.getRange("A1:F1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 15 }, verticalAlignment: "center" };
ws.getRange("A2:F2").format = { fill: "#D9EAF7", font: { color: "#334155", italic: true }, wrapText: true };
ws.getRange("A4:F4").format = { fill: "#4472C4", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
if (filled.length) ws.getRange(`A5:F${4 + filled.length}`).format = { borders: { preset: "inside", style: "thin", color: "#D7DEE8" }, verticalAlignment: "top", wrapText: true };
ws.getRange(`A${copperRow}:F${copperRow}`).format = { fill: "#FFF2CC", font: { bold: true, color: "#7F6000" }, borders: { preset: "outside", style: "thin", color: "#BF9000" }, wrapText: true, verticalAlignment: "top" };
ws.getRange(`A${copperRow}:F${copperRow}`).format.rowHeight = 58;
ws.getRange("A:A").format.columnWidth = 16;
ws.getRange("B:B").format.columnWidth = 16;
ws.getRange("C:C").format.columnWidth = 54;
ws.getRange("D:D").format.columnWidth = 18;
ws.getRange("E:E").format.columnWidth = 14;
ws.getRange("F:F").format.columnWidth = 64;
ws.freezePanes.freezeRows(4);
ws.getRange(`A4:F${copperRow}`).format.autofitRows();

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(file);
const preview = await wb.render({ sheetName: "Linhas para preencher", range: `A1:F${Math.min(copperRow, 25)}`, scale: 1.2, format: "png" });
await fs.writeFile("C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/preview_linhas_para_preencher.png", new Uint8Array(await preview.arrayBuffer()));
console.log(JSON.stringify({ filled: filled.length, copperRow }, null, 2));
