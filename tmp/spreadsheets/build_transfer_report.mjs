import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/019ff4df-4ef4-7542-b5c3-5807d2c50759";
const workbook = Workbook.create();
const summary = workbook.worksheets.add("Resumo");
const detail = workbook.worksheets.add("Materiais");
const guides = workbook.worksheets.add("Guias");

const rows = [
  [new Date("2026-04-16T12:00:00Z"), "GT ATDT202601GT/1320", "Coimbra", "Cantoneira 725", 2, "und", "2100-051 Coruche", "3020-430 Coimbra", "GT ATDT202601GT1320_CANTONEIRAS.pdf", ""],
  [new Date("2026-04-16T12:00:00Z"), "GT ATDT202601GT/1320", "Coimbra", "Cantoneira 727", 1, "und", "2100-051 Coruche", "3020-430 Coimbra", "GT ATDT202601GT1320_CANTONEIRAS.pdf", ""],
  [new Date("2026-05-25T12:00:00Z"), "GT ATDT202601GT/1844", "Pampilhosa", "PONTEIRA PARA TUBO 19 X 26 PARA TIRANTE DA CONSOLA", 600, "und", "2100-051 Coruche", "3050-000 Pampilhosa Botão", "GT ATDT202601GT_1844 _materiais.pdf", ""],
  [new Date("2026-05-25T12:00:00Z"), "GT ATDT202601GT/1844", "Pampilhosa", "ARTICULAÇÃO DO TIRANTE DA CONSOLA", 230, "und", "2100-051 Coruche", "3050-000 Pampilhosa Botão", "GT ATDT202601GT_1844 _materiais.pdf", ""],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa", "Seccionador", 1, "und", "2100-051 Coruche", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf", "Destino Pampilhosa Botão confirmado pelo utilizador."],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa", "Caixa do Comando do Seccionador", 1, "und", "2100-051 Coruche", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf", "Destino Pampilhosa Botão confirmado pelo utilizador."],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa", "Estribos", 54, "und", "2100-051 Coruche", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf", "Destino Pampilhosa Botão confirmado pelo utilizador."],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa", "Desboniador", 1, "und", "2100-051 Coruche", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf", "Destino Pampilhosa Botão confirmado pelo utilizador."],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa", "Esquadro para consola feeder", 22, "und", "2100-051 Coruche", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf", "Destino Pampilhosa Botão confirmado pelo utilizador."],
  [new Date("2026-08-05T12:00:00Z"), "GT ATDT202601GT/2827", "Coimbra", "Suporte de fixação de braço de chamada p/ tubos 24x32 e 30x38 - 642", 18, "und", "2100-051 Coruche", "3020-430 Coimbra", "GT ATDT202601GT_2827.pdf", ""],
  [new Date("2026-08-05T12:00:00Z"), "GT ATDT202601GT/2829", "Coimbra", "Molde de soldadura fita de aço cobreado", 1, "und", "2100-051 Coruche", "3020-430 Coimbra", "GT ATDT202601GT_2829.pdf", ""],
];

const guideRows = [
  ["GT ATDT202601GT/1320", new Date("2026-04-16T12:00:00Z"), "Coimbra", "3020-430 Coimbra", 2, "GT ATDT202601GT1320_CANTONEIRAS.pdf", "Validada"],
  ["GT ATDT202601GT/1844", new Date("2026-05-25T12:00:00Z"), "Pampilhosa", "3050-000 Pampilhosa Botão", 2, "GT ATDT202601GT_1844 _materiais.pdf", "Validada"],
  ["GT ATDT202601GT/2462", new Date("2026-07-08T12:00:00Z"), "Pampilhosa", "3020-430 Pampilhosa Botão", 5, "GT ATDT202601GT_2462.pdf", "Destino confirmado pelo utilizador"],
  ["GT ATDT202601GT/2827", new Date("2026-08-05T12:00:00Z"), "Coimbra", "3020-430 Coimbra", 1, "GT ATDT202601GT_2827.pdf", "Validada"],
  ["GT ATDT202601GT/2829", new Date("2026-08-05T12:00:00Z"), "Coimbra", "3020-430 Coimbra", 1, "GT ATDT202601GT_2829.pdf", "Validada"],
];

summary.showGridLines = false;
summary.getRange("A1:F1").merge();
summary.getRange("A1").values = [["Transferências DAI Coruche → Coimbra e Pampilhosa"]];
summary.getRange("A2:F2").merge();
summary.getRange("A2").values = [["Consolidação das guias de transporte fornecidas | atualização: 12-08-2026"]];
summary.getRange("A4:C4").values = [["Destino", "N.º de guias", "Quantidade total (und)"]];
summary.getRange("A5:A6").values = [["Coimbra"], ["Pampilhosa"]];
summary.getRange("B5").formulas = [["=COUNTIF('Guias'!$C$2:$C$6,A5)"]];
summary.getRange("B5:B6").fillDown();
summary.getRange("C5").formulas = [["=SUMIF('Materiais'!$C$2:$C$12,A5,'Materiais'!$E$2:$E$12)"]];
summary.getRange("C5:C6").fillDown();
summary.getRange("A7:C7").values = [["Total", null, null]];
summary.getRange("B7").formulas = [["=SUM(B5:B6)"]];
summary.getRange("C7").formulas = [["=SUM(C5:C6)"]];
summary.getRange("A10:F10").merge();
summary.getRange("A10").values = [["Nota"]];
summary.getRange("A11:F12").merge();
summary.getRange("A11").values = [["A guia GT ATDT202601GT/2462 escreve “3020-430 Pampilhosa Botão”. O destino Pampilhosa Botão foi confirmado pelo utilizador."]];
summary.getRange("A14:F14").merge();
summary.getRange("A14").values = [["Âmbito: foram verificadas as 45 guias PDF fornecidas; 5 cumprem origem DAI/Coruche e destino Coimbra ou Pampilhosa."]];

summary.getRange("A1:F1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 16 }, verticalAlignment: "center" };
summary.getRange("A2:F2").format = { fill: "#D9EAF7", font: { color: "#334155", italic: true }, verticalAlignment: "center" };
summary.getRange("A4:C4").format = { fill: "#4472C4", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center" };
summary.getRange("A5:C7").format.borders = { preset: "inside", style: "thin", color: "#CBD5E1" };
summary.getRange("A7:C7").format = { fill: "#E2E8F0", font: { bold: true }, borders: { preset: "doubleBottom", style: "thin", color: "#64748B" } };
summary.getRange("B5:C7").format.numberFormat = "#,##0";
summary.getRange("A10:F10").format = { fill: "#F59E0B", font: { bold: true, color: "#FFFFFF" } };
summary.getRange("A11:F12").format = { fill: "#FFF7E6", font: { color: "#7C2D12" }, wrapText: true, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#F59E0B" } };
summary.getRange("A14:F14").format = { fill: "#F1F5F9", font: { italic: true, color: "#475569" }, wrapText: true };
summary.getRange("A1:F1").format.rowHeight = 30;
summary.getRange("A2:F2").format.rowHeight = 22;
summary.getRange("A11:F12").format.rowHeight = 28;
summary.getRange("A:A").format.columnWidth = 20;
summary.getRange("B:C").format.columnWidth = 18;
summary.getRange("D:F").format.columnWidth = 15;

detail.showGridLines = false;
detail.getRange("A1:J12").values = [["Data", "Guia", "Destino", "Material", "Quantidade", "Unidade", "Origem (guia)", "Destino (guia)", "Ficheiro de origem", "Observações"], ...rows];
detail.getRange("A1:J1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
detail.getRange("A2:A12").format.numberFormat = "dd-mm-yyyy";
detail.getRange("E2:E12").format.numberFormat = "#,##0";
detail.getRange("E2:F12").format.horizontalAlignment = "center";
detail.getRange("A1:J12").format.borders = { preset: "inside", style: "thin", color: "#D7DEE8" };
detail.getRange("A2:J12").format.verticalAlignment = "top";
detail.getRange("D2:D12").format.wrapText = true;
detail.getRange("J2:J12").format.wrapText = true;
detail.getRange("A:A").format.columnWidth = 12;
detail.getRange("B:B").format.columnWidth = 24;
detail.getRange("C:C").format.columnWidth = 14;
detail.getRange("D:D").format.columnWidth = 48;
detail.getRange("E:F").format.columnWidth = 12;
detail.getRange("G:H").format.columnWidth = 28;
detail.getRange("I:I").format.columnWidth = 38;
detail.getRange("J:J").format.columnWidth = 52;
detail.getRange("A1:J12").format.autofitRows();
detail.freezePanes.freezeRows(1);
const detailTable = detail.tables.add("A1:J12", true, "MateriaisTransferidos");
detailTable.style = "TableStyleMedium2";

guides.showGridLines = false;
guides.getRange("A1:G6").values = [["Guia", "Data", "Destino classificado", "Local de descarga (guia)", "Linhas de material", "Ficheiro", "Estado"], ...guideRows];
guides.getRange("A1:G1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
guides.getRange("B2:B6").format.numberFormat = "dd-mm-yyyy";
guides.getRange("E2:E6").format.numberFormat = "#,##0";
guides.getRange("A:A").format.columnWidth = 24;
guides.getRange("B:B").format.columnWidth = 12;
guides.getRange("C:C").format.columnWidth = 20;
guides.getRange("D:D").format.columnWidth = 30;
guides.getRange("E:E").format.columnWidth = 16;
guides.getRange("F:F").format.columnWidth = 42;
guides.getRange("G:G").format.columnWidth = 32;
guides.getRange("A1:G6").format.borders = { preset: "inside", style: "thin", color: "#D7DEE8" };
guides.freezePanes.freezeRows(1);
const guideTable = guides.tables.add("A1:G6", true, "GuiasSelecionadas");
guideTable.style = "TableStyleMedium2";
guides.getRange("G2:G6").conditionalFormats.add("containsText", { text: "confirmado", format: { fill: "#DCFCE7", font: { color: "#166534", bold: true } } });

await fs.mkdir(outputDir, { recursive: true });
for (const sheetName of ["Resumo", "Materiais", "Guias"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1.4, format: "png" });
  await fs.writeFile(`${outputDir}/preview_${sheetName}.png`, new Uint8Array(await preview.arrayBuffer()));
}
const inspection = await workbook.inspect({ kind: "table", range: "Resumo!A1:F14", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 10, maxChars: 5000 });
await fs.writeFile(`${outputDir}/inspection.ndjson`, inspection.ndjson, "utf8");
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
await fs.writeFile(`${outputDir}/errors.ndjson`, errors.ndjson, "utf8");
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/materiais_DAI_Coruche_para_Coimbra_Pampilhosa.xlsx`);
console.log(`Saved workbook with ${rows.length} material lines and ${guideRows.length} guides.`);
