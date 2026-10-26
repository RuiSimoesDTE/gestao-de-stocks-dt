import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/dst7973/Desktop/IC-0019 Consumos 31_07_2026.xlsx";
const outputDir = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821";
const plan = JSON.parse(await fs.readFile("plano_consumos.json", "utf8"));
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const main = workbook.worksheets.getItem("Sheet1");

// Só as correspondências seguras são preenchidas na coluna Consumo.
for (const record of plan.records) {
  if (record.status === "OK para preencher" && record.linha_excel) {
    main.getRange(`J${record.linha_excel}`).values = [[record.quantidade]];
  }
}

const audit = workbook.worksheets.add("Auditoria Consumos");
audit.showGridLines = false;
audit.getRange("A1:M1").merge();
audit.getRange("A1").values = [["Consumos IC-0019 - 01/07/2026 a 21/08/2026"]];
audit.getRange("A1:M1").format = {
  fill: "#005596",
  font: { bold: true, color: "#FFFFFF", fontSize: 14 },
  horizontalAlignment: "center",
};
audit.getRange("A2:M2").merge();
audit.getRange("A2").values = [[
  `${plan.summary.prontos} correspondências preenchidas; ${plan.summary.consumo_superior_stock} superiores ao stock; ${plan.summary.sem_match} sem correspondência segura.`,
]];
audit.getRange("A2:M2").format = { fill: "#E8F1F8", font: { color: "#003B66" } };

const headers = [[
  "SAP no programa", "SAP no Excel", "Código", "Descrição", "Qtd. consumo",
  "Linha Excel", "Elemento PEP", "Stock Excel", "Método", "Origem do total",
  "Datas", "Estado", "Linhas SAP duplicadas não usadas",
]];
audit.getRange("A4:M4").values = headers;
const auditRows = plan.records.map((r) => [
  r.sap, r.sap_excel, r.codigo, r.descricao, r.quantidade,
  r.linha_excel, r.pep, r.estoque_excel, r.metodo, r.fontes,
  r.datas, r.status, r.linhas_duplicadas_sap,
]);
if (auditRows.length) audit.getRange(`A5:M${4 + auditRows.length}`).values = auditRows;
const auditTable = audit.tables.add(`A4:M${4 + auditRows.length}`, true, "AuditoriaConsumos");
auditTable.style = "TableStyleMedium2";
audit.freezePanes.freezeRows(4);
audit.getRange(`E5:H${4 + auditRows.length}`).format.numberFormat = "#,##0.###";
audit.getRange(`A4:M${4 + auditRows.length}`).format.wrapText = true;
audit.getRange("A:M").format.autofitColumns();
for (const [col, width] of Object.entries({ A: 16, B: 16, C: 16, D: 42, E: 15, F: 12, G: 18, H: 14, I: 16, J: 34, K: 24, L: 38, M: 20 })) {
  audit.getRange(`${col}:${col}`).format.columnWidth = width;
}

const pending = workbook.worksheets.add("Pendentes");
pending.showGridLines = false;
pending.getRange("A1:J1").merge();
pending.getRange("A1").values = [["Pendentes de confirmação - não preenchidos na folha principal"]];
pending.getRange("A1:J1").format = {
  fill: "#A33A2B",
  font: { bold: true, color: "#FFFFFF", fontSize: 13 },
  horizontalAlignment: "center",
};
pending.getRange("A3:J3").values = [[
  "SAP", "Código", "Descrição", "Qtd.", "Stock Excel", "Falta/Excesso",
  "Origem", "Data(s)", "Motivo", "Ação necessária",
]];
const pendingRecords = plan.records.filter((r) => r.status !== "OK para preencher");
const pendingRows = pendingRecords.map((r) => {
  const difference = r.estoque_excel == null ? null : r.quantidade - r.estoque_excel;
  let action = "Confirmar código SAP/linha correta";
  if (r.status.startsWith("Consumo superior")) action = "Confirmar ajuste/regularização antes de lançar";
  if (r.descricao.includes("GT ATDT202601GT/2558")) action = "Confirmar tipo/secção e SAP da bobine";
  return [r.sap, r.codigo, r.descricao, r.quantidade, r.estoque_excel, difference, r.fontes, r.datas, r.status, action];
});
if (pendingRows.length) pending.getRange(`A4:J${3 + pendingRows.length}`).values = pendingRows;
const pendingTable = pending.tables.add(`A3:J${3 + pendingRows.length}`, true, "PendentesConsumos");
pendingTable.style = "TableStyleMedium9";
pending.freezePanes.freezeRows(3);
pending.getRange(`D4:F${3 + pendingRows.length}`).format.numberFormat = "#,##0.###";
pending.getRange(`A3:J${3 + pendingRows.length}`).format.wrapText = true;
pending.getRange("A:J").format.autofitColumns();
for (const [col, width] of Object.entries({ A: 16, B: 16, C: 44, D: 12, E: 14, F: 14, G: 32, H: 22, I: 38, J: 38 })) {
  pending.getRange(`${col}:${col}`).format.columnWidth = width;
}

await fs.mkdir(outputDir, { recursive: true });
const outputPath = `${outputDir}/IC-0019_Consumos_01-07_a_21-08-2026_PREENCHIDO.xlsx`;
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const preview = await workbook.render({ sheetName: "Auditoria Consumos", range: "A1:M24", scale: 1.2, format: "png" });
await fs.writeFile(`${outputDir}/preview_auditoria.png`, new Uint8Array(await preview.arrayBuffer()));
const pendingPreview = await workbook.render({ sheetName: "Pendentes", range: `A1:J${Math.min(20, 3 + pendingRows.length)}`, scale: 1.2, format: "png" });
await fs.writeFile(`${outputDir}/preview_pendentes.png`, new Uint8Array(await pendingPreview.arrayBuffer()));

console.log(JSON.stringify({ outputPath, safe: plan.summary.prontos, pending: pendingRows.length }));
