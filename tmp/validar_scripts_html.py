from pathlib import Path
import re
import subprocess
import sys

html_path = Path(__file__).resolve().parents[1] / "gestao_armazem_catenaria.html"
node = Path(r"C:\Users\dst7973\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
text = html_path.read_text(encoding="utf-8")
scripts = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", text, flags=re.I | re.S)
errors = []
for index, script in enumerate(scripts, 1):
    result = subprocess.run(
        [node, "--check"], input=script.encode("utf-8"), capture_output=True
    )
    if result.returncode:
        errors.append((index, result.stderr.decode("utf-8", errors="replace").strip()))

print(f"scripts={len(scripts)} errors={len(errors)}")
for index, error in errors:
    print(f"SCRIPT {index}:\n{error}")
sys.exit(1 if errors else 0)
