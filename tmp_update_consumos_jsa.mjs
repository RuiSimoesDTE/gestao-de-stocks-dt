import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const [sourcePath, inspectPath, outputPath, previewPath] = process.argv.slice(2);
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const sheet = wb.worksheets.getItem("Sheet1");
const beforePreview = await wb.render({ sheetName: "Sheet1", range: "A304:L332", scale: 1.5, format: "png" });
await fs.mkdir(path.dirname(previewPath), { recursive: true });
await fs.writeFile(previewPath.replace(/\.png$/i, "_antes.png"), new Uint8Array(await beforePreview.arrayBuffer()));

// Recover the consumption values already verified in the prior prepared workbook.
const lines = (await fs.readFile(inspectPath, "utf8")).split(/\r?\n/);
const tableLine = lines.find(l => l.includes('"kind":"table"') && l.includes('"sheet":"Sheet1"') && l.includes('"address":"A1:L442"'));
if (!tableLine) throw new Error("Previous verified Sheet1 table not found in inspection record");
const prior = JSON.parse(tableLine).values;
for (let row = 2; row <= Math.min(prior.length, 442); row++) {
  const consumo = prior[row - 1][9];
  if (typeof consumo === "number") sheet.getRange(`J${row}`).values = [[consumo]];
}

// User-authorized addition: PC 4500886473, 2 keys, dated 2026-08-24.
sheet.getRange("J310").values = [[2]];
sheet.getRange("J329").values = [[12]];
sheet.getRange("J331").values = [[2]];
sheet.getRange("J335").values = [[6]];
sheet.getRange("J340").values = [[1]];
sheet.getRange("J379").values = [[1]];
sheet.getRange("J398").values = [[3]];

const preview = await wb.render({ sheetName: "Sheet1", range: "A304:L332", scale: 1.5, format: "png" });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);

const check = await wb.inspect({ kind: "table", sheetId: "Sheet1", range: "A304:L332", include: "values,formulas", tableMaxRows: 40, tableMaxCols: 12, maxChars: 12000 });
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "formula error scan" });
console.log(check.ndjson);
console.log(errors.ndjson);
