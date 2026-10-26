import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/019ff4df-4ef4-7542-b5c3-5807d2c50759";
const outputPath = `${outputDir}/material_DAI_Coruche_Coimbra_Pampilhosa_um_separador.xlsx`;
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Relatório para imprimir");
sheet.showGridLines = false;

const allRows = [
  [new Date("2026-04-16T12:00:00Z"), "GT ATDT202601GT/1320", "Coimbra", "Cantoneira 725", 2, "und", "3020-430 Coimbra", "GT ATDT202601GT1320_CANTONEIRAS.pdf"],
  [new Date("2026-04-16T12:00:00Z"), "GT ATDT202601GT/1320", "Coimbra", "Cantoneira 727", 1, "und", "3020-430 Coimbra", "GT ATDT202601GT1320_CANTONEIRAS.pdf"],
  [new Date("2026-05-25T12:00:00Z"), "GT ATDT202601GT/1844", "Pampilhosa Botão", "PONTEIRA PARA TUBO 19 X 26 PARA TIRANTE DA CONSOLA", 600, "und", "3050-000 Pampilhosa Botão", "GT ATDT202601GT_1844 _materiais.pdf"],
  [new Date("2026-05-25T12:00:00Z"), "GT ATDT202601GT/1844", "Pampilhosa Botão", "ARTICULAÇÃO DO TIRANTE DA CONSOLA", 230, "und", "3050-000 Pampilhosa Botão", "GT ATDT202601GT_1844 _materiais.pdf"],
  [new Date("2026-07-01T12:00:00Z"), "GT ATDT202601GT/2342", "Salgueirinha", "Postes de Catenária", 10, "und", "2100-052 Salgueirinha", "GT ATDT202601GT2342.pdf"],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa Botão", "Seccionador", 1, "und", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf"],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa Botão", "Caixa do Comando do Seccionador", 1, "und", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf"],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa Botão", "Estribos", 54, "und", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf"],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa Botão", "Desboniador", 1, "und", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf"],
  [new Date("2026-07-08T12:00:00Z"), "GT ATDT202601GT/2462", "Pampilhosa Botão", "Esquadro para consola feeder", 22, "und", "3020-430 Pampilhosa Botão", "GT ATDT202601GT_2462.pdf"],
  [new Date("2026-07-27T12:00:00Z"), "GT ATDT202601GT/2743", "São Torcato", "Postes de Catenária", 9, "und", "2100-000 Coruche - Estação Ferroviária de São Torcato", "GT ATDT202601GT2743.pdf"],
  [new Date("2026-07-27T12:00:00Z"), "GT ATDT202601GT/2743", "São Torcato", "Espias", 2, "und", "2100-000 Coruche - Estação Ferroviária de São Torcato", "GT ATDT202601GT2743.pdf"],
  [new Date("2026-07-27T12:00:00Z"), "GT ATDT202601GT/2743", "São Torcato", "Postalete", 1, "und", "2100-000 Coruche - Estação Ferroviária de São Torcato", "GT ATDT202601GT2743.pdf"],
  [new Date("2026-08-03T12:00:00Z"), "GT ATDT202601GT/2812", "Entroncamento", "Cobre", 200, "kg", "2330-263 Entroncamento", "GT ATDT202601GT2812.pdf"],
  [new Date("2026-08-05T12:00:00Z"), "GT ATDT202601GT/2827", "Coimbra", "Suporte de fixação de braço de chamada p/ tubos 24x32 e 30x38 - 642", 18, "und", "3020-430 Coimbra", "GT ATDT202601GT_2827.pdf"],
  [new Date("2026-08-05T12:00:00Z"), "GT ATDT202601GT/2829", "Coimbra", "Molde de soldadura fita de aço cobreado", 1, "und", "3020-430 Coimbra", "GT ATDT202601GT_2829.pdf"],
];
const rows = allRows.filter((row) => row[2] === "Coimbra" || row[2] === "Pampilhosa Botão");

sheet.getRange("A1:H1").merge();
sheet.getRange("A1").values = [["Material da DAI Coruche para Coimbra e Pampilhosa Botão"]];
sheet.getRange("A2:H2").merge();
sheet.getRange("A2").values = [["Consolidação de 5 guias de transporte | folha única preparada para impressão"]];

sheet.getRange("A4:C4").values = [["Destino", "N.º de guias", "Total (und)"]];
sheet.getRange("A5:B6").values = [
  ["Coimbra", 3],
  ["Pampilhosa Botão", 2],
];
for (let row = 5; row <= 6; row++) {
  sheet.getRange(`C${row}`).formulas = [[`=SUMIFS($E$14:$E$24,$C$14:$C$24,A${row},$F$14:$F$24,"und")`]];
}
sheet.getRange("A7:C7").values = [["Total", null, null]];
sheet.getRange("B7").formulas = [["=SUM(B5:B6)"]];
sheet.getRange("C7").formulas = [["=SUM(C5:C6)"]];

sheet.getRange("A12:H12").merge();
sheet.getRange("A12").values = [["Detalhe dos materiais"]];
sheet.getRange("A13:H24").values = [["Data", "Guia", "Destino", "Material", "Quantidade", "Unidade", "Local de descarga indicado na guia", "Ficheiro de origem"], ...rows];

sheet.getRange("A1:H1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 17 }, verticalAlignment: "center" };
sheet.getRange("A2:H2").format = { fill: "#D9EAF7", font: { color: "#334155", italic: true }, verticalAlignment: "center", wrapText: true };
sheet.getRange("A4:C4").format = { fill: "#4472C4", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
sheet.getRange("A5:C7").format.borders = { preset: "inside", style: "thin", color: "#CBD5E1" };
sheet.getRange("A7:C7").format = { fill: "#E2E8F0", font: { bold: true }, borders: { preset: "doubleBottom", style: "thin", color: "#64748B" } };
sheet.getRange("B5:C7").format.numberFormat = "#,##0";
sheet.getRange("A12:H12").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 12 } };
sheet.getRange("A13:H13").format = { fill: "#4472C4", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
sheet.getRange("A14:H24").format.borders = { preset: "inside", style: "thin", color: "#D7DEE8" };
sheet.getRange("A14:H24").format.verticalAlignment = "top";
sheet.getRange("A14:A24").format.numberFormat = "dd-mm-yyyy";
sheet.getRange("E14:E24").format.numberFormat = "#,##0";
sheet.getRange("E14:F24").format.horizontalAlignment = "center";
sheet.getRange("D14:D24").format.wrapText = true;
sheet.getRange("G14:H24").format.wrapText = true;
sheet.getRange("A1:H1").format.rowHeight = 30;
sheet.getRange("A2:H2").format.rowHeight = 28;
sheet.getRange("A13:H13").format.rowHeight = 30;
sheet.getRange("A:A").format.columnWidth = 18;
sheet.getRange("B:B").format.columnWidth = 23;
sheet.getRange("C:C").format.columnWidth = 18;
sheet.getRange("D:D").format.columnWidth = 43;
sheet.getRange("E:E").format.columnWidth = 12;
sheet.getRange("F:F").format.columnWidth = 10;
sheet.getRange("G:G").format.columnWidth = 37;
sheet.getRange("H:H").format.columnWidth = 37;
sheet.getRange("A14:H24").format.autofitRows();
sheet.freezePanes.freezeRows(13);

const table = sheet.tables.add("A13:H24", true, "MateriaisDAICoruche");
table.style = "TableStyleMedium2";

await fs.mkdir(outputDir, { recursive: true });
const preview = await workbook.render({ sheetName: "Relatório para imprimir", autoCrop: "all", scale: 1.2, format: "png" });
await fs.writeFile(`${outputDir}/preview_relatorio_um_separador.png`, new Uint8Array(await preview.arrayBuffer()));
const inspection = await workbook.inspect({ kind: "table", range: "'Relatório para imprimir'!A1:H24", include: "values,formulas", tableMaxRows: 30, tableMaxCols: 10, maxChars: 9000 });
await fs.writeFile(`${outputDir}/inspection_relatorio_um_separador.ndjson`, inspection.ndjson, "utf8");
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
await fs.writeFile(`${outputDir}/errors_relatorio_um_separador.ndjson`, errors.ndjson, "utf8");
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);
