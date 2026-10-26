import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(process.argv[2]));
const s = wb.worksheets.getItem("Sheet1");
console.log(JSON.stringify(s.getRange(process.argv[3]).values));
