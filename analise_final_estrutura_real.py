import json
from collections import Counter

with open('seed_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

postes = data.get('postes', [])
montagens = {m['id']: m for m in data.get('montagens', [])}

print("=" * 80)
print("ANÁLISE FINAL - ESTRUTURA REAL")
print("=" * 80)

# POSTES
print("\n[POSTES - ANÁLISE REAL]")
print("-" * 80)

estados = Counter()
com_montagem = 0
sem_montagem = 0
com_codigo = 0
sem_codigo = 0

for p in postes:
    if p.get('codigo'):
        com_codigo += 1
    else:
        sem_codigo += 1
    
    if p.get('montagem'):
        com_montagem += 1
    else:
        sem_montagem += 1
    
    estados[p.get('estado', 'N/A')] += 1

print(f"Total de postes: {len(postes)}")
print(f"\nCódigo (número):")
print(f"  - Com código: {com_codigo}")
print(f"  - Sem código: {sem_codigo}")

print(f"\nMontagem:")
print(f"  - Com montagem: {com_montagem}")
print(f"  - Sem montagem: {sem_montagem}")

print(f"\nEstado:")
for estado, count in estados.most_common():
    print(f"  - {estado}: {count}")

# MONTAGENS
print("\n[MONTAGENS - ANÁLISE REAL]")
print("-" * 80)

com_bom = 0
sem_bom = 0
com_componentes = 0
sem_componentes = 0
com_codigo_mont = 0
sem_codigo_mont = 0

for m in montagens.values():
    bom = m.get('bom', [])
    if isinstance(bom, list) and len(bom) > 0:
        com_bom += 1
    else:
        sem_bom += 1
    
    comps = m.get('componentes', [])
    if isinstance(comps, list) and len(comps) > 0:
        com_componentes += 1
    else:
        sem_componentes += 1
    
    if m.get('codigo'):
        com_codigo_mont += 1
    else:
        sem_codigo_mont += 1

print(f"Total de montagens: {len(montagens)}")
print(f"\nCódigo:")
print(f"  - Com código: {com_codigo_mont}")
print(f"  - Sem código: {sem_codigo_mont}")

print(f"\nBOM (Bill of Materials):")
print(f"  - Com BOM: {com_bom}")
print(f"  - Sem BOM: {sem_bom}")

print(f"\nComponentes:")
print(f"  - Com componentes: {com_componentes}")
print(f"  - Sem componentes: {sem_componentes}")

# Amostra de montagens sem BOM
sem_bom_list = [m for m in montagens.values() if not m.get('bom') or len(m.get('bom', [])) == 0]
if sem_bom_list:
    print(f"\nAmostra de montagens SEM BOM:")
    for m in sem_bom_list[:5]:
        print(f"  - {m.get('id')}: {m.get('codigo')}")

