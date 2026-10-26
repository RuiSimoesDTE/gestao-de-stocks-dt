import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

for (const path of [
  "C:/Users/dst7973/Desktop/Consumos_IC0019/IC-0019 Consumos 31_06_2026.xlsx",
  "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/mapas_mensais/IC-0019_Consumos_30_06_2026_FOLHA_PREENCHER.xlsx",
]) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
  const sheet = workbook.worksheets.getItemAt(0);
  const used = sheet.getUsedRange();
  const values = used.values;
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (r[9] !== null && r[9] !== "" && Number(r[9]) !== 0) {
      rows.push({ row: i + 1, sap: r[0], desc: r[1], pep: r[5], stock: r[6], consumo: r[9] });
    }
  }
  console.log(`\n--- ${path} rows=${values.length} consumos=${rows.length} ---`);
  console.log(JSON.stringify(rows, null, 2));
}
