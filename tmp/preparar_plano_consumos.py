from collections import defaultdict
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
backup_path = root / "backup_armazem_catenaria_2026-08-21_14h43.json"
raw_data = json.loads(backup_path.read_text(encoding="utf-8"))
data = raw_data.get("obras", {}).get("vendas_novas", raw_data)
sheet_values = json.loads((root / ".artifacts" / "consumos_202607" / "workbook_values.json").read_text(encoding="utf-8"))
materials = {str(m.get("id")): m for m in data.get("materiais", [])}
movements = data.get("movimentos", [])
start, end = "2026-07-01", "2026-08-21"

def in_period(m):
    return start <= str(m.get("data", "")) <= end

def mat(m):
    return materials.get(str(m.get("mat")), {})

def sap_of(m):
    x = mat(m)
    return str(x.get("sap") or x.get("codigo_alt") or "").strip()

def code_of(m):
    return str(mat(m).get("codigo") or "").strip()

def description_of(m):
    return str(mat(m).get("desc") or "").strip()

def is_azevedo_entry(m):
    if m.get("tipo") != "entrada" or not in_period(m):
        return False
    text = " ".join((str(m.get("origem", "")), str(mat(m).get("fornecedor", "")), str(m.get("obs", "")))).lower()
    return "azevedo" in text

def is_real_consumption_output(m):
    if m.get("tipo") != "saida" or not in_period(m):
        return False
    text = " ".join((str(m.get("dest", "")), str(m.get("obs", "")))).lower()
    if m.get("ajuste") or m.get("roubo") or "ajuste sap" in text or "assalto" in text or "roubo" in text:
        return False
    if any(term in text for term in ("ic-0018", "pampilhosa", "coimbra", "transferência", "transferencia")):
        return False
    return True

aggregated = {}

def add(m, qty, source):
    sap = sap_of(m)
    code = code_of(m)
    key = sap or f"COD:{code}"
    if key not in aggregated:
        aggregated[key] = {
            "key": key,
            "sap": sap,
            "codigo": code,
            "descricao": description_of(m),
            "quantidade": 0.0,
            "fontes": defaultdict(float),
            "datas": set(),
            "movimentos": [],
        }
    rec = aggregated[key]
    rec["quantidade"] += float(qty or 0)
    rec["fontes"][source] += float(qty or 0)
    rec["datas"].add(str(m.get("data", "")))
    rec["movimentos"].append(str(m.get("id", "")))

outputs = [m for m in movements if is_real_consumption_output(m)]
for m in outputs:
    add(m, m.get("qtd", 0), "Saída registada")

# Tudo o que entrou da João S. Azevedo deve ser consumido. Só acrescentamos a
# diferença ainda não representada por uma saída real do mesmo PC e SAP/código.
out_by_order_item = defaultdict(float)
for m in outputs:
    out_by_order_item[(str(m.get("pedido", "")), sap_of(m) or f"COD:{code_of(m)}")] += float(m.get("qtd", 0) or 0)

entries_by_order_item = defaultdict(list)
for m in movements:
    if is_azevedo_entry(m):
        entries_by_order_item[(str(m.get("pedido", "")), sap_of(m) or f"COD:{code_of(m)}")].append(m)

for key, entries in entries_by_order_item.items():
    entry_total = sum(float(m.get("qtd", 0) or 0) for m in entries)
    missing = max(0.0, entry_total - out_by_order_item.get(key, 0.0))
    if missing:
        add(entries[0], missing, "João S. Azevedo - entrada a consumir")

# Índice das linhas SAP. Para uniformizar duplicados, P-01 é a linha canónica.
rows_by_sap = defaultdict(list)
rows_by_code = defaultdict(list)
for idx, row in enumerate(sheet_values[1:], start=2):
    sap = str(row[0] or "").strip()
    if sap:
        info = {
            "linha": idx,
            "sap_excel": sap,
            "descricao_excel": row[1],
            "pep": row[5],
            "estoque": float(row[6] or 0),
            "unidade": row[7],
        }
        rows_by_sap[sap].append(info)
        match = re.match(r"^([0-9]+[A-Z]?[0-9]*)-", str(row[1] or "").strip(), flags=re.I)
        if match:
            rows_by_code[match.group(1).upper()].append(info)

records = []
for rec in aggregated.values():
    choices = rows_by_sap.get(rec["sap"], []) if rec["sap"] else []
    method = "SAP"
    if not choices and rec["codigo"]:
        choices = rows_by_code.get(rec["codigo"].upper(), [])
        method = "Código interno"
    chosen = None
    if choices:
        chosen = next((r for r in choices if str(r["pep"]).strip() == "IC-0019-P-01"), choices[0])
    qty = round(rec["quantidade"], 6)
    status = "Sem SAP - confirmar correspondência"
    if rec["sap"] and not choices:
        status = "SAP não existe no ficheiro"
    elif chosen:
        status = "OK para preencher"
        if qty > chosen["estoque"]:
            status = "Consumo superior ao estoque da linha - confirmar"
    records.append({
        "sap": rec["sap"],
        "sap_excel": chosen["sap_excel"] if chosen else "",
        "codigo": rec["codigo"],
        "descricao": rec["descricao"],
        "quantidade": qty,
        "fontes": "; ".join(f"{k}: {v:g}" for k, v in sorted(rec["fontes"].items())),
        "datas": ", ".join(sorted(rec["datas"])),
        "linha_excel": chosen["linha"] if chosen else None,
        "pep": chosen["pep"] if chosen else "",
        "estoque_excel": chosen["estoque"] if chosen else None,
        "descricao_excel": chosen["descricao_excel"] if chosen else "",
        "status": status,
        "metodo": method if chosen else "",
        "movimentos": ", ".join(rec["movimentos"]),
        "linhas_duplicadas_sap": ", ".join(str(r["linha"]) for r in choices if not chosen or r["linha"] != chosen["linha"]),
    })

# A GT 2558 é uma saída inequívoca, mas a guia só diz "Bobine de Cobre".
# Sem secção/código, fica na auditoria e não é lançada automaticamente num SAP.
records.append({
    "sap": "",
    "sap_excel": "",
    "codigo": "",
    "descricao": "Bobine de Cobre - GT ATDT202601GT/2558",
    "quantidade": 1539,
    "fontes": "Guia AT 2558",
    "datas": "2026-07-14",
    "linha_excel": None,
    "pep": "",
    "estoque_excel": None,
    "descricao_excel": "",
    "status": "Falta código SAP/descrição técnica da bobine",
    "metodo": "",
    "movimentos": "",
    "linhas_duplicadas_sap": "",
})

records.sort(key=lambda r: (r["status"] != "OK para preencher", r["sap"], r["codigo"], r["descricao"]))
summary = {
    "periodo": f"{start} a {end}",
    "saidas_reais": len(outputs),
    "materiais_agregados": len(records),
    "prontos": sum(r["status"] == "OK para preencher" for r in records),
    "consumo_superior_stock": sum(r["status"].startswith("Consumo superior") for r in records),
    "sem_match": sum(r["status"] not in ("OK para preencher",) and not r["status"].startswith("Consumo superior") for r in records),
}
payload = {"summary": summary, "records": records}
(root / ".artifacts" / "consumos_202607" / "plano_consumos.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
for r in records:
    if r["status"] != "OK para preencher":
        print(f"{r['status']} | {r['sap']} | {r['codigo']} | {r['descricao']} | {r['quantidade']}")
