import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("C:/Users/dst7973/Desktop/IC-0019 Consumos 31_07_2026.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Sheet1");
for (const range of ["A1:L25", "J1:L442"]) {
  const region = await workbook.inspect({
    kind: "region,formula,computedStyle",
    sheetId: "Sheet1",
    range,
    maxChars: 12000,
    tableMaxRows: 30,
    tableMaxCols: 12,
    options: { maxResults: 100 },
  });
  console.log(`---${range}---`);
  console.log(region.ndjson);
}
console.log("FORMULAS J1:L25", JSON.stringify(sheet.getRange("J1:L25").formulas));
