from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
html = root / "gestao_armazem_catenaria.html"
text = html.read_text(encoding="utf-8")
match = re.search(r"const SEED_DATA=(\{.*?\});;", text, re.S)
if not match:
    raise RuntimeError("SEED_DATA não encontrado")
seed = json.loads(match.group(1))

changed = 0
for movement in seed["movimentos"]:
    if str(movement.get("id", "")).startswith("gt2979-transferencia-4500883493-"):
        movement["tipo"] = "saida"
        movement.pop("obraDst", None)
        movement["dest"] = "Obra IC-0018 - Coimbra"
        movement["obs"] = movement.get("obs", "").replace(
            "Transferência entre obras:",
            "Saída/consumo da Obra IC-0019 com destino à Obra IC-0018:"
        )
        changed += 1

new_json = json.dumps(seed, ensure_ascii=False, separators=(",", ":"))
text = text[:match.start(1)] + new_json + text[match.end(1):]

old = """else if(/^sap\\d{8}-(?:mat|enc)-/.test(String(x.id||'')))Object.assign(porId.get(x.id),copia(x));"""
new = """else if(/^sap\\d{8}-(?:mat|enc)-/.test(String(x.id||''))||/^gt2979-transferencia-/.test(String(x.id||'')))Object.assign(porId.get(x.id),copia(x));"""
if old in text:
    text = text.replace(old, new, 1)
elif new not in text:
    raise RuntimeError("Regra de atualização do SEED não encontrada")

html.write_text(text, encoding="utf-8")
(root / "dados_armazem_catenaria.json").write_text(
    json.dumps(seed, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"Movimentos GT 2979 alterados para saída: {changed}")
