from pathlib import Path
import csv
import json
import re

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "dados_armazem_catenaria.json").read_text(encoding="utf-8"))

materials = {str(m.get("id")): m for m in data.get("materiais", [])}
movements = data.get("movimentos", [])

def material_row(move):
    mat = materials.get(str(move.get("mat")), {})
    return {
        "id_movimento": move.get("id", ""),
        "data": move.get("data", ""),
        "tipo": move.get("tipo", ""),
        "codigo": mat.get("codigo", ""),
        "sap": mat.get("sap", ""),
        "descricao": mat.get("desc", ""),
        "quantidade": move.get("qtd", ""),
        "unidade": mat.get("un", ""),
        "fornecedor_material": mat.get("fornecedor", ""),
        "origem": move.get("origem", ""),
        "destino": move.get("dest", ""),
        "pedido": move.get("pedido", ""),
        "documento": move.get("doc", ""),
        "observacoes": move.get("obs", ""),
        "ajuste": bool(move.get("ajuste")),
        "roubo": bool(move.get("roubo")) or "roubo" in str(move.get("dest", "")).lower() or "assalto" in str(move.get("obs", "")).lower(),
    }

period = [material_row(m) for m in movements if "2026-07-01" <= str(m.get("data", "")) <= "2026-08-21"]
headers = list(period[0]) if period else []
with (root / "tmp" / "movimentos_julho_2026.csv").open("w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=headers, delimiter=";")
    writer.writeheader()
    writer.writerows(period)

def is_jsa(row):
    text = " ".join(str(row.get(k, "")) for k in ("fornecedor_material", "origem", "observacoes")).lower()
    return "azevedo" in text

def is_guia_at(row):
    text = " ".join(str(row.get(k, "")) for k in ("documento", "observacoes")).lower()
    return bool(re.search(r"atdt|guia|\bgt\b", text))

def is_consumption_candidate(row):
    if row["tipo"] != "saida" or row["ajuste"] or row["roubo"]:
        return False
    text = (str(row["destino"]) + " " + str(row["observacoes"])).lower()
    if "ajuste sap" in text:
        return False
    if "transfer" in text or "ic-0018" in text or "coimbra" in text or "pampilhosa" in text:
        return False
    return True

summary = {
    "movimentos_periodo": len(period),
    "entradas_periodo": sum(r["tipo"] == "entrada" for r in period),
    "saidas_periodo": sum(r["tipo"] == "saida" for r in period),
    "saidas_consumo_candidatas": sum(is_consumption_candidate(r) for r in period),
    "linhas_js_azevedo": sum(is_jsa(r) for r in period),
    "linhas_guia_at": sum(is_guia_at(r) for r in period),
}
print(json.dumps(summary, ensure_ascii=False, indent=2))

for label, rows in (
    ("saidas_candidatas", [r for r in period if is_consumption_candidate(r)]),
    ("js_azevedo", [r for r in period if is_jsa(r)]),
    ("guias_at", [r for r in period if is_guia_at(r)]),
):
    with (root / "tmp" / f"{label}_20260701_20260821.csv").open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=headers, delimiter=";")
        writer.writeheader()
        writer.writerows(rows)
    print(f"{label}={len(rows)}")
