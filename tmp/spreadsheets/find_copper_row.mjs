import fs from "node:fs/promises";
import { SpreadsheetFile } from "@oai/artifact-tool";
const file = "C:/Users/dst7973/Desktop/gestao_de_stocks_dte/outputs/consumos_202607_20260821/IC-0019_Consumos_01-07_a_21-08-2026_PREENCHIDO.xlsx";
const wb = await SpreadsheetFile.importXlsx(await fs.readFile(file));
const x = await wb.inspect({kind:"match", searchTerm:"Bobine de Cobre", options:{useRegex:false,maxResults:20}, summary:"localizar bobine"});
console.log(x.ndjson);
