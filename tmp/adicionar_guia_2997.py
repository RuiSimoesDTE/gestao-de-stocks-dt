from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
html = root / "gestao_armazem_catenaria.html"
data_file = root / "dados_armazem_catenaria.json"
text = html.read_text(encoding="utf-8")
match = re.search(r"const SEED_DATA=(\{.*?\});;", text, re.S)
if not match:
    raise RuntimeError("SEED_DATA não encontrado")
seed = json.loads(match.group(1))

materials = [
    {
        "id": "GT2997-MAT-AT",
        "codigo": "GT2997-AT",
        "desc": "AT (designação conforme GT ATDT202601GT/2997; tipo por confirmar)",
        "un": "un",
        "cat": "Guia AT - identificação pendente",
        "min": 0,
        "sap": "",
        "ref": "GT ATDT202601GT/2997",
        "fornecedor": "",
        "tipo": "Consumível",
        "codigo_provisorio": True,
    },
    {
        "id": "GT2997-MAT-ISOLADORES",
        "codigo": "GT2997-ISOLADORES",
        "desc": "Isoladores (tipo por confirmar conforme GT ATDT202601GT/2997)",
        "un": "un",
        "cat": "Guia AT - identificação pendente",
        "min": 0,
        "sap": "",
        "ref": "GT ATDT202601GT/2997",
        "fornecedor": "",
        "tipo": "Consumível",
        "codigo_provisorio": True,
    },
    {
        "id": "GT2997-MAT-FERROS-U",
        "codigo": "GT2997-FERROS-U",
        "desc": "Ferros U (medidas e referência por confirmar conforme GT ATDT202601GT/2997)",
        "un": "un",
        "cat": "Guia AT - identificação pendente",
        "min": 0,
        "sap": "",
        "ref": "GT ATDT202601GT/2997",
        "fornecedor": "",
        "tipo": "Consumível",
        "codigo_provisorio": True,
    },
]

movements = [
    ("GT2997-ENTRADA-AT", "GT2997-MAT-AT", 2, "AT"),
    ("GT2997-ENTRADA-ISOLADORES", "GT2997-MAT-ISOLADORES", 15, "Isoladores"),
    ("GT2997-ENTRADA-FERROS-U", "GT2997-MAT-FERROS-U", 2, "Ferros U"),
]

material_ids = {m.get("id") for m in seed["materiais"]}
for material in materials:
    if material["id"] not in material_ids:
        seed["materiais"].append(material)

movement_ids = {m.get("id") for m in seed["movimentos"]}
for movement_id, material_id, quantity, label in movements:
    if movement_id in movement_ids:
        continue
    seed["movimentos"].append({
        "id": movement_id,
        "data": "2026-08-19",
        "tipo": "entrada",
        "mat": material_id,
        "qtd": quantity,
        "arm": "Armazém Catenária",
        "armDst": None,
        "pedido": "",
        "doc": "GT ATDT202601GT/2997",
        "origem": "Estação Ferroviária de Vidigal - Vendas Novas",
        "dest": "Estaleiro DAI - Monte da Barca, Coruche",
        "obs": f"Entrada documentada pela GT ATDT202601GT/2997. {label}: identificação técnica/código SAP por confirmar; não foi inventada correspondência.",
        "ajuste": False,
        "guia": "guias_at/GT ATDT202601GT_2997.pdf",
        "user": "",
        "ref": None,
    })

new_json = json.dumps(seed, ensure_ascii=False, separators=(",", ":"))
text = text[:match.start(1)] + new_json + text[match.end(1):]

row = """          <tr><td>19/08/2026</td><td>GT ATDT202601GT/2997</td><td>Estação Ferroviária de Vidigal — Vendas Novas</td><td>Estaleiro DAI — Monte da Barca, Coruche</td><td>2 × AT; 15 × Isoladores; 2 × Ferros U <span class="muted">(códigos/especificações por confirmar)</span></td><td><a class="btn sm" target="_blank" href="guias_at/GT ATDT202601GT_2997.pdf">Abrir guia</a></td></tr>
"""
anchor = """          <tr><td>19/08/2026</td><td>GT ATDT202601GT/2989</td><td>Rua Adriano Lucas, 170, Armazém D — Eiras/Coimbra</td><td>Estaleiro DAI — Monte da Barca, Coruche</td><td>1 × Monitor; 1 × Alcoolímetro; 1 × Chave de automóvel</td><td><a class="btn sm" target="_blank" href="guias_at/GT ATDT202601GT_2989.pdf">Abrir guia</a></td></tr>
"""
if "GT ATDT202601GT/2997</td>" not in text:
    if anchor not in text:
        raise RuntimeError("Linha da guia 2989 não encontrada")
    text = text.replace(anchor, anchor + row, 1)

html.write_text(text, encoding="utf-8")
data_file.write_text(json.dumps(seed, ensure_ascii=False, indent=2), encoding="utf-8")
print("Guia 2997 e três entradas adicionadas")
