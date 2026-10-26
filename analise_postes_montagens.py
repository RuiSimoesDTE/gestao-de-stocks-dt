import json

with open('seed_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

postes = {p['id']: p for p in data.get('postes', [])}
montagens = {m['id']: m for m in data.get('montagens', [])}

print("=" * 80)
print("ANÁLISE DETALHADA: POSTES E MONTAGENS")
print("=" * 80)

print("\n[POSTES - AMOSTRA DE 10 PRIMEIROS]")
print("-" * 80)
for i, (p_id, p) in enumerate(list(postes.items())[:10]):
    print(f"\n{i+1}. {p_id}")
    print(f"   Chaves: {list(p.keys())}")
    for k, v in p.items():
        if k != 'id':
            print(f"   {k}: {v}")

print("\n\n[MONTAGENS - AMOSTRA DE 10 PRIMEIRAS]")
print("-" * 80)
for i, (m_id, m) in enumerate(list(montagens.items())[:10]):
    print(f"\n{i+1}. {m_id}")
    print(f"   Chaves: {list(m.keys())}")
    for k, v in m.items():
        if k != 'id':
            valor = str(v)
            if len(valor) > 100:
                valor = valor[:100] + "..."
            print(f"   {k}: {valor}")

# Verificar estrutura
print("\n\n[ESTRUTURA DE POSTES]")
print("-" * 80)
todas_chaves_postes = set()
for p in postes.values():
    todas_chaves_postes.update(p.keys())
print(f"Chaves encontradas: {sorted(todas_chaves_postes)}")

print("\n[ESTRUTURA DE MONTAGENS]")
print("-" * 80)
todas_chaves_montagens = set()
for m in montagens.values():
    todas_chaves_montagens.update(m.keys())
print(f"Chaves encontradas: {sorted(todas_chaves_montagens)}")

