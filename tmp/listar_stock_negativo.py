from pathlib import Path
from collections import defaultdict
import json

d = json.loads(Path("dados_armazem_catenaria.json").read_text(encoding="utf-8"))
mats = {m["id"]: m for m in d.get("materiais", [])}
saldo = defaultdict(lambda: defaultdict(float))
total = defaultdict(float)
for mv in d.get("movimentos", []):
    mid = mv.get("mat")
    q = float(mv.get("qtd", 0) or 0)
    arm = str(mv.get("arm") or "")
    tipo = mv.get("tipo")
    if tipo == "entrada":
        saldo[mid][arm] += q; total[mid] += q
    elif tipo == "saida":
        saldo[mid][arm] -= q; total[mid] -= q
    elif tipo == "transferencia":
        saldo[mid][arm] -= q
        if mv.get("armDst"):
            saldo[mid][str(mv.get("armDst"))] += q
        elif mv.get("obraDst"):
            total[mid] -= q

neg_tot = []
neg_arm = []
for mid, n in total.items():
    if n < -0.0005:
        m = mats.get(mid, {})
        neg_tot.append((n, mid, m.get("codigo", ""), m.get("sap", ""), m.get("desc", "")))
for mid, arms in saldo.items():
    for arm, n in arms.items():
        if n < -0.0005:
            m = mats.get(mid, {})
            neg_arm.append((n, arm, mid, m.get("codigo", ""), m.get("sap", ""), m.get("desc", "")))

print("NEG_TOTAL", len(neg_tot), "AJUSTE", round(sum(-x[0] for x in neg_tot), 3))
for x in sorted(neg_tot): print(x)
print("NEG_ARMAZEM", len(neg_arm), "AJUSTE", round(sum(-x[0] for x in neg_arm), 3))
for x in sorted(neg_arm): print(x)
