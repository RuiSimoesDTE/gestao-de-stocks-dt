import json
from collections import Counter

# Carregar dados
with open('seed_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

movimentos = data.get('movimentos', [])

print("=" * 80)
print("ANÁLISE DETALHADA DE MOVIMENTOS")
print("=" * 80)

# Verificar primeira amostra de movimentos
print("\n[AMOSTRA DE 5 PRIMEIROS MOVIMENTOS]")
print("-" * 80)
for i, mov in enumerate(movimentos[:5]):
    print(f"\nMovimento {i+1}: {mov.get('id', 'SEM ID')}")
    print(f"  Chaves: {list(mov.keys())}")
    for chave, valor in mov.items():
        if chave not in ['id']:
            print(f"  {chave}: {valor}")

# Verificar estrutura comum
print("\n[ESTRUTURA DE MOVIMENTOS]")
print("-" * 80)
todas_chaves = set()
for mov in movimentos:
    todas_chaves.update(mov.keys())
print(f"Todas as chaves encontradas: {sorted(todas_chaves)}")

# Verificar quais chaves contêm dados
chaves_preenchidas = {}
for chave in todas_chaves:
    preenchidas = sum(1 for mov in movimentos if mov.get(chave))
    chaves_preenchidas[chave] = preenchidas

print("\nOcorrências por chave:")
for chave in sorted(chaves_preenchidas, key=lambda x: -chaves_preenchidas[x]):
    count = chaves_preenchidas[chave]
    print(f"  {chave}: {count}/{len(movimentos)} ({100*count/len(movimentos):.1f}%)")

# Verificar tipos de movimento
print("\n[TIPOS DE MOVIMENTO]")
print("-" * 80)
tipos = Counter()
for mov in movimentos:
    tipo = mov.get('tipo', 'SEM TIPO')
    tipos[tipo] += 1

for tipo, count in tipos.most_common():
    print(f"  {tipo}: {count}")

# Verificar se há dados em campos alternativos
print("\n[ANÁLISE DE CAMPO 'MATERIAL']")
print("-" * 80)
com_material = sum(1 for mov in movimentos if mov.get('material'))
print(f"Com 'material': {com_material}/{len(movimentos)}")

# Procurar campos que possam conter referência a material
campos_suspeitos = ['mat', 'materia', 'cod', 'codigo', 'ref', 'referencia', 'desc', 'descricao']
print("\nProcurando campos alternativos:")
for campo in campos_suspeitos:
    with_campo = sum(1 for mov in movimentos if campo in mov)
    if with_campo > 0:
        print(f"  {campo}: {with_campo}")

# Verificar encomendas
print("\n[ANÁLISE DE ENCOMENDAS]")
print("-" * 80)
encomendas = data.get('encomendas', [])
print(f"Total de encomendas: {len(encomendas)}")

if encomendas:
    print("\n[AMOSTRA DE 3 PRIMEIRAS ENCOMENDAS]")
    for i, enc in enumerate(encomendas[:3]):
        print(f"\nEncomenda {i+1}: {enc.get('id', 'SEM ID')}")
        print(f"  Chaves: {list(enc.keys())}")
        for chave, valor in enc.items():
            if chave not in ['id']:
                print(f"  {chave}: {valor}")

    # Verificar estrutura de encomendas
    todas_chaves_enc = set()
    for enc in encomendas:
        todas_chaves_enc.update(enc.keys())
    print("\nTodas as chaves em encomendas: " + str(sorted(todas_chaves_enc)))

    # Verificar preenchimento
    print("\nOcorrências por chave (Encomendas):")
    chaves_preenchidas_enc = {}
    for chave in todas_chaves_enc:
        preenchidas = sum(1 for enc in encomendas if enc.get(chave))
        chaves_preenchidas_enc[chave] = preenchidas

    for chave in sorted(chaves_preenchidas_enc, key=lambda x: -chaves_preenchidas_enc[x]):
        count = chaves_preenchidas_enc[chave]
        print(f"  {chave}: {count}/{len(encomendas)} ({100*count/len(encomendas):.1f}%)")

