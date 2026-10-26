from __future__ import annotations

import csv
import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path("projeto_vendas_novas/V09_IFTE_PDes")
FILES = [
    "42517.PE.09.IFT.00.301_03.pdf",
    "42517.PE.09.IFT.00.302_03.pdf",
    "42517.PE.09.IFT.00.303_03.pdf",
    "42517.PE.09.IFT.00.304_03.pdf",
    "42517.PE.09.IFT.00.305_03.pdf",
    "42517.PE.09.IFT.00.306_05_NOVO.pdf",
]
POST_RE = re.compile(r"POSTE\s*:\s*([0-9]{1,2}-[0-9]{1,2}[A-Z]?)", re.I)
REF_RE = re.compile(r"\b(?:EC|E|C)-\d+[A-Z]?\b", re.I)

records = []
for filename in FILES:
    reader = PdfReader(str(ROOT / filename))
    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        post_match = POST_RE.search(text)
        if not post_match:
            continue
        post = post_match.group(1).upper()
        lines = [" ".join(line.split()) for line in text.splitlines() if line.strip()]
        reference_lines = [line for line in lines if REF_RE.search(line)]
        references = []
        for line in reference_lines:
            for ref in REF_RE.findall(line):
                ref = ref.upper()
                if ref not in references:
                    references.append(ref)
        records.append(
            {
                "poste": post,
                "ficheiro": filename,
                "pagina_pdf": page_number,
                "referencias": references,
                "linhas_origem": reference_lines,
            }
        )

records.sort(key=lambda row: (row["ficheiro"], row["pagina_pdf"]))
(ROOT / "referencias_por_poste.json").write_text(
    json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
)
with (ROOT / "referencias_por_poste.csv").open("w", encoding="utf-8-sig", newline="") as handle:
    writer = csv.writer(handle, delimiter=";")
    writer.writerow(["Poste", "Ficheiro", "Página PDF", "Referências", "Linhas originais"])
    for row in records:
        writer.writerow(
            [
                row["poste"],
                row["ficheiro"],
                row["pagina_pdf"],
                ", ".join(row["referencias"]),
                " | ".join(row["linhas_origem"]),
            ]
        )

unique_refs = sorted({ref for row in records for ref in row["referencias"]})
print(
    json.dumps(
        {
            "postes_extraidos": len(records),
            "postes_unicos": len({row["poste"] for row in records}),
            "referencias_unicas": len(unique_refs),
            "referencias": unique_refs,
        },
        ensure_ascii=False,
    )
)
