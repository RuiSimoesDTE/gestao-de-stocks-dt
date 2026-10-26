import fs from "node:fs/promises";
import { SpreadsheetFile } from "@oai/artifact-tool";

const file = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/IC-0019_Consumos_01-07_a_21-08-2026_PREENCHIDO.xlsx";
const bytes = await fs.readFile(file);
const wb = await SpreadsheetFile.importXlsx(bytes);

const note = "GUIA DE TRANSPORTE: a bobine completa (1.539 m) foi levada para a frente de obra, mas não foi toda aplicada. Não lançar 1.539 m como consumo. Confirmar os metros efetivamente cortados/aplicados e o código/SAP do cabo antes de preencher o consumo.";

const audit = wb.worksheets.getItem("Auditoria Consumos");
const pending = wb.worksheets.getItem("Pendentes");

// A linha 2 contém a nota de controlo geral; a GT /2558 está na linha 68 da auditoria.
audit.getRange("L2").values = [["Nota de controlo: a quantidade transportada numa guia não é automaticamente consumo. Para a bobine da GT /2558, usar apenas os metros efetivamente aplicados após confirmação."]];
audit.getRange("L2").format = { fill: "#FFF2CC", font: { color: "#7F6000", bold: true }, wrapText: true, verticalAlignment: "top" };
audit.getRange("L68").values = [[note]];
audit.getRange("L68").format = { fill: "#FFF2CC", font: { color: "#7F6000", bold: true }, wrapText: true, verticalAlignment: "top" };
audit.getRange("L84").clear({ contents: true });
audit.getRange("L:L").format.columnWidth = 64;
audit.getRange("2:2").format.rowHeight = 42;
audit.getRange("68:68").format.rowHeight = 72;

pending.getRange("J2").values = [[note]];
pending.getRange("J2").format = { fill: "#FFF2CC", font: { color: "#7F6000", bold: true }, wrapText: true, verticalAlignment: "top" };
pending.getRange("J4").values = [[note]];
pending.getRange("J4").format = { fill: "#FFF2CC", font: { color: "#7F6000", bold: true }, wrapText: true, verticalAlignment: "top" };
pending.getRange("J:J").format.columnWidth = 64;
pending.getRange("2:2").format.rowHeight = 72;
pending.getRange("4:4").format.rowHeight = 72;

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(file);

const auditPreview = await wb.render({ sheetName: "Auditoria Consumos", range: "A1:L8", scale: 1.15, format: "png" });
await fs.writeFile("C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/preview_auditoria_cobre.png", new Uint8Array(await auditPreview.arrayBuffer()));
const pendingPreview = await wb.render({ sheetName: "Pendentes", range: "A1:J8", scale: 1.15, format: "png" });
await fs.writeFile("C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/preview_pendentes_cobre.png", new Uint8Array(await pendingPreview.arrayBuffer()));

const verification = await wb.inspect({ kind: "match", searchTerm: "Não lançar 1.539 m como consumo", options: { useRegex: false, maxResults: 10 }, summary: "Verificar anotação da bobine de cobre" });
await fs.writeFile("C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/verificacao_cobre.ndjson", verification.ndjson, "utf8");
console.log(verification.ndjson);
