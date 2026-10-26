from __future__ import annotations

import json
import os
import re
import subprocess
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader

ROOT = Path("projeto_vendas_novas/V09_IFTE_PDes")
PREVIEWS = ROOT / "previews"
PREVIEWS.mkdir(parents=True, exist_ok=True)
PDFTOPPM = Path(
    r"C:\Users\dst7973\.cache\codex-runtimes\codex-primary-runtime"
    r"\dependencies\native\poppler\Library\bin\pdftoppm.exe"
)


def clean(text: str) -> str:
    return re.sub(r"[ \t]+", " ", text.replace("\x00", "")).strip()


records = []
for pdf in sorted(ROOT.glob("*.pdf")):
    doc = PdfReader(str(pdf))
    pages = [clean(page.extract_text() or "") for page in doc.pages]
    width = float(doc.pages[0].mediabox.width) if doc.pages else 0
    height = float(doc.pages[0].mediabox.height) if doc.pages else 0
    preview_prefix = PREVIEWS / pdf.stem
    subprocess.run(
        [str(PDFTOPPM), "-f", "1", "-singlefile", "-jpeg", "-r", "80",
         str(pdf.resolve()), str(preview_prefix.resolve())],
        check=True,
        capture_output=True,
    )
    records.append(
        {
            "ficheiro": pdf.name,
            "formato": "PDF",
            "paginas": len(pages),
            "dimensao_pontos": [round(width, 1), round(height, 1)],
            "texto": "\n\n".join(pages),
            "preview": f"previews/{pdf.stem}.jpg",
        }
    )

for dwf in sorted(ROOT.glob("*.dwf")):
    names = []
    snippets = []
    is_zip = zipfile.is_zipfile(dwf)
    if is_zip:
        with zipfile.ZipFile(dwf) as archive:
            names = archive.namelist()
            for name in names:
                if name.lower().endswith((".xml", ".dwfx", ".descriptor", ".manifest")):
                    try:
                        snippets.append(archive.read(name).decode("utf-8", errors="ignore"))
                    except Exception:
                        pass
    records.append(
        {
            "ficheiro": dwf.name,
            "formato": "DWF",
            "tamanho_bytes": dwf.stat().st_size,
            "contentor_zip": is_zip,
            "recursos_internos": names[:200],
            "texto_metadados": clean("\n".join(snippets))[:20000],
        }
    )

(ROOT / "indice_documentos.json").write_text(
    json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
)

pdf_records = [r for r in records if r["formato"] == "PDF"]
thumb_w, thumb_h = 440, 320
margin, label_h = 18, 46
cols = 3
font = ImageFont.load_default()
for batch_no in range(0, len(pdf_records), 9):
    batch = pdf_records[batch_no : batch_no + 9]
    rows = (len(batch) + cols - 1) // cols
    canvas = Image.new(
        "RGB",
        (cols * (thumb_w + margin) + margin, rows * (thumb_h + label_h + margin) + margin),
        "white",
    )
    draw = ImageDraw.Draw(canvas)
    for index, record in enumerate(batch):
        image = Image.open(ROOT / record["preview"]).convert("RGB")
        image.thumbnail((thumb_w, thumb_h))
        x = margin + (index % cols) * (thumb_w + margin)
        y = margin + (index // cols) * (thumb_h + label_h + margin)
        canvas.paste(image, (x + (thumb_w - image.width) // 2, y))
        label = record["ficheiro"].replace("42517.PE.09.IFT.00.", "")
        draw.text((x, y + thumb_h + 6), label, fill="black", font=font)
    sheet_no = batch_no // 9 + 1
    canvas.save(PREVIEWS / f"contact_sheet_{sheet_no}.jpg", quality=90)

print(
    json.dumps(
        {
            "pdfs": len(pdf_records),
            "dwfs": len(records) - len(pdf_records),
            "paginas_pdf": sum(r["paginas"] for r in pdf_records),
            "contact_sheets": (len(pdf_records) + 8) // 9,
        },
        ensure_ascii=False,
    )
)
