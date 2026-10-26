import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

for (const path of process.argv.slice(2)) {
  const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
  const sheets = await wb.inspect({ kind: "sheet", include: "id,name", maxChars: 4000 });
  process.stdout.write(`FILE ${path}\n${sheets.ndjson}\n`);
  for (const sheetName of ["Sheet1", "Linhas para preencher", "Auditoria Consumos", "Pendentes"]) {
    try {
      const out = await wb.inspect({ kind: "table", sheetId: sheetName, range: sheetName === "Sheet1" ? "A306:J314" : "A1:Z30", include: "values,formulas", tableMaxRows: 35, tableMaxCols: 26, maxChars: 12000 });
      process.stdout.write(`SHEET ${sheetName}\n${out.ndjson}\n`);
    } catch {}
  }
}
