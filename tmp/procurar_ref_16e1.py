import csv
import pathlib

import openpyxl

with open("tmp/listas_desenhos_global.csv", encoding="utf-8-sig", errors="replace") as f:
    rows = list(csv.DictReader(f))

files = [
    row.get("FullName") or row.get("Caminho") or next(iter(row.values()))
    for row in rows
]
terms = ["04.101.23", "04.104.01", "16E1", "33144416", "4026467", "M18x55"]
print("FICHEIROS", len(files))

for filename in files:
    path = pathlib.Path(filename)
    try:
        workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
        for sheet in workbook.worksheets:
            for row in sheet.iter_rows():
                values = [str(cell.value) for cell in row if cell.value is not None]
                line = " | ".join(values)
                if any(term.lower() in line.lower() for term in terms):
                    print(f"{path} :: {sheet.title} :: {line}")
        workbook.close()
    except Exception as error:
        print("ERRO", path, type(error).__name__)
