import json
from pathlib import Path

import pdfplumber


source = Path(r"C:\Users\dst7973\Desktop\Guias de transporte")
output = Path(r"C:\Users\dst7973\Desktop\gestao_de_stocks_dte\tmp\pdfs\guides_text.json")

records = []
for pdf_path in sorted(source.glob("*.pdf"), key=lambda p: p.name.casefold()):
    with pdfplumber.open(pdf_path) as pdf:
        pages = []
        for page_number, page in enumerate(pdf.pages, start=1):
            pages.append({
                "page": page_number,
                "width": page.width,
                "height": page.height,
                "text": page.extract_text(x_tolerance=2, y_tolerance=3) or "",
                "tables": page.extract_tables() or [],
            })
        records.append({"file": pdf_path.name, "path": str(pdf_path), "pages": pages})

output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Extracted {len(records)} PDFs to {output}")
