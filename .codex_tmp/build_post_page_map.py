from __future__ import annotations

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

page_map: dict[str, list[dict[str, object]]] = {}
for filename in FILES:
    reader = PdfReader(str(ROOT / filename))
    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        match = POST_RE.search(text)
        if not match:
            continue
        code = match.group(1).upper()
        page_map.setdefault(code, []).append(
            {"ficheiro": filename, "pagina": page_number}
        )

target = ROOT / "postes_paginas.js"
target.write_text(
    "/* Mapa interno gerado a partir dos cadernos PDF enviados. */\n"
    "var PROJETO_PAGINAS_POSTE="
    + json.dumps(page_map, ensure_ascii=False, separators=(",", ":"))
    + ";\n",
    encoding="utf-8",
)
print(
    json.dumps(
        {
            "postes": len(page_map),
            "paginas_mapeadas": sum(len(items) for items in page_map.values()),
            "ficheiro": str(target),
        },
        ensure_ascii=False,
    )
)
