import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const path = "C:/Users/dst7973/Desktop/Consumos_IC0019/IC-0019 Consumos 31_06_2026.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const sheets = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 4000 });
console.log("SHEETS", sheets.ndjson);
for (let i = 0; ; i++) {
  let sheet;
  try { sheet = workbook.worksheets.getItemAt(i); } catch { break; }
  if (!sheet) break;
  const used = sheet.getUsedRange();
  if (!used) continue;
  const values = used.values;
  console.log("USED", JSON.stringify({sheet: sheet.name, rows: values.length, cols: Math.max(0,...values.map(r=>r.length))}));
  console.log("TOP_ROWS", JSON.stringify(values.slice(0,6)));
  for (let r = 0; r < values.length; r++) {
    const line = values[r].map(v => String(v ?? ""));
    const joined = line.join(" | ");
    if (/217A|\b515\b|4026342|4026521|PERFIL U PARA FIXA|ARTICULAÇÃO PARA PÉ/i.test(joined)) {
      console.log("MATCH", JSON.stringify({sheet:sheet.name,row:r+1,values:line}));
    }
  }
}
