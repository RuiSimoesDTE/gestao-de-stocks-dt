from pathlib import Path
import json

path = Path(__file__).resolve().parents[1] / "gestao_armazem_catenaria.html"
text = path.read_text(encoding="utf-8")
marker = "const SEED_DATA="
start = text.index(marker) + len(marker)
depth = 0
quoted = False
escaped = False
end = None
for i, char in enumerate(text[start:], start):
    if quoted:
        if escaped:
            escaped = False
        elif char == "\\":
            escaped = True
        elif char == '"':
            quoted = False
        continue
    if char == '"':
        quoted = True
    elif char in "[{":
        depth += 1
    elif char in "]}":
        depth -= 1
        if depth == 0:
            end = i + 1
            break
if end is None:
    raise RuntimeError("SEED_DATA sem fecho")
data = json.loads(text[start:end])
print(
    "materiais={materiais} movimentos={movimentos} postes={postes} montagens={montagens}".format(
        **{key: len(data.get(key, [])) for key in ("materiais", "movimentos", "postes", "montagens")}
    )
)
