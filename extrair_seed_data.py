import re
import json
import sys

# Ler o ficheiro HTML
with open('gestao_armazem_catenaria.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Procurar SEED_DATA
match = re.search(r'const SEED_DATA=(\{.*?\});', html_content, re.DOTALL)

if match:
    seed_json = match.group(1)
    # Salvar o JSON extraído
    with open('seed_data.json', 'w', encoding='utf-8') as f:
        f.write(seed_json)
    
    # Carregar e validar
    try:
        data = json.loads(seed_json)
        print(f"✓ SEED_DATA extraído com sucesso")
        print(f"  - Materiais: {len(data.get('materiais', []))}")
        print(f"  - Movimentos: {len(data.get('movimentos', []))}")
        print(f"  - Postes: {len(data.get('postes', []))}")
        print(f"  - Encomendas: {len(data.get('encomendas', []))}")
        print(f"  - Montagens: {len(data.get('montagens', []))}")
        print(f"  - Armazens: {len(data.get('armazens', []))}")
    except json.JSONDecodeError as e:
        print(f"✗ Erro ao parsear JSON: {e}")
        sys.exit(1)
else:
    print("✗ SEED_DATA não encontrado")
    sys.exit(1)
