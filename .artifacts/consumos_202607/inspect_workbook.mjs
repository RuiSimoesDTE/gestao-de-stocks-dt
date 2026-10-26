import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const inputPath = "C:/Users/dst7973/Desktop/IC-0019 Consumos 31_07_2026.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 12,
  tableMaxCols: 16,
  tableMaxCellChars: 120,
});
console.log(overview.ndjson);

const sheets = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 4000 });
console.log("---SHEETS---");
console.log(sheets.ndjson);

const sheet = workbook.worksheets.getItem("Sheet1");
await fs.writeFile("workbook_values.json", JSON.stringify(sheet.getRange("A1:L442").values));
const preview = await workbook.render({ sheetName: "Sheet1", range: "A1:L40", scale: 1.2, format: "png" });
await fs.writeFile("workbook_preview.png", new Uint8Array(await preview.arrayBuffer()));
