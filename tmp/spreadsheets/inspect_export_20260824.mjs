import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = "C:/Users/dst7973/Desktop/EXPORT_20260824_110318.xlsx";
const outDir = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/tmp/spreadsheets/export_20260824_review";
await fs.mkdir(outDir, { recursive: true });
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const overview = await wb.inspect({ kind: "workbook,sheet,table", maxChars: 12000, tableMaxRows: 12, tableMaxCols: 20, tableMaxCellChars: 100 });
await fs.writeFile(`${outDir}/overview.ndjson`, overview.ndjson, "utf8");
const pc = await wb.inspect({ kind: "match", searchTerm: "4500886473", options: { useRegex: false, maxResults: 200 }, summary: "PC 4500886473" });
await fs.writeFile(`${outDir}/pc_matches.ndjson`, pc.ndjson, "utf8");
const sheets = (await wb.inspect({ kind: "sheet", include: "id,name", maxChars: 5000 })).ndjson;
await fs.writeFile(`${outDir}/sheets.ndjson`, sheets, "utf8");
const first = wb.worksheets.getItemAt(0);
await fs.writeFile(`${outDir}/rows.json`, JSON.stringify(first.getRange("A1:Y697").values, null, 2), "utf8");
const preview = await wb.render({ sheetName: first.name, range: "A1:Q30", scale: 1.1, format: "png" });
await fs.writeFile(`${outDir}/preview.png`, new Uint8Array(await preview.arrayBuffer()));
console.log(overview.ndjson);
console.log(pc.ndjson);
