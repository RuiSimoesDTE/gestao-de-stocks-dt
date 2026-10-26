import csv
from pathlib import Path

from pypdf import PdfReader

terms = ["04.101.23", "04.104.01", "33144416", "4026467", "M18x55/42", "16E1"]
paths = []
with open("tmp/catalogo_completo_desenhos.csv", encoding="utf-8-sig", errors="replace") as file:
    for row in csv.DictReader(file):
        if str(row.get("Extension", "")).lower() == ".pdf":
            path = row.get("FullName")
            if path and path not in paths:
                paths.append(path)

print("PDFS", len(paths))
for index, filename in enumerate(paths, 1):
    try:
        text = "\n".join((page.extract_text() or "") for page in PdfReader(filename).pages)
    except Exception:
        continue
    found = [term for term in terms if term.lower() in text.lower()]
    if found:
        print(" | ".join(found), "::", Path(filename))
