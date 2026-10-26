import json
from collections import Counter, defaultdict

with open('seed_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

materiais = {m['id']: m for m in data.get('materiais', [])}

# Agrupar por código
codigos_materiais = defaultdict(list)
for m_id, m in materiais.items():
    cod = m.get('codigo', 'SEM_CÓDIGO')
    codigos_materiais[cod].append((m_id, m))

# Encontrar duplicados
duplicados = {cod: mats for cod, mats in codigos_materiais.items() if len(mats) > 1}

with open('LISTA_DETALHADA_CODIGOS_DUPLICADOS.txt', 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("LISTA DETALHADA - CÓDIGOS SAP DUPLICADOS\n")
    f.write("=" * 80 + "\n\n")
    
    f.write(f"Total de códigos com duplicação: {len(duplicados)}\n")
    f.write(f"Total de materiais envolvidos: {sum(len(mats) for mats in duplicados.values())}\n\n")
    
    f.write("OBSERVAÇÃO IMPORTANTE:\n")
    f.write("  Manter a entrada original (ex: M####)\n")
    f.write("  Mesclar dados de importações SAP (sap20260XXX-mat-...)\n")
    f.write("  Redirecionar referências cruzadas\n")
    f.write("=" * 80 + "\n\n")
    
    for i, (codigo, materiais_list) in enumerate(sorted(duplicados.items()), 1):
        f.write(f"\n[GRUPO {i}] CÓDIGO '{codigo}' — {len(materiais_list)} entradas\n")
        f.write("-" * 80 + "\n")
        
        # Ordenar por ID (originais primeiro, depois SAP)
        materiais_list_sorted = sorted(materiais_list, 
                                      key=lambda x: (not x[0].startswith('M'), x[0]))
        
        for mat_id, mat in materiais_list_sorted:
            origem = "ORIGINAL" if mat_id.startswith('M') and not mat_id[1:].startswith('sap') else "IMPORTADO SAP"
            desc = mat.get('desc', 'SEM DESCRIÇÃO')[:60]
            sap = mat.get('sap', 'N/A')
            
            f.write(f"\n  ID: {mat_id}\n")
            f.write(f"  Origem: {origem}\n")
            f.write(f"  SAP: {sap}\n")
            f.write(f"  Descrição: {desc}...\n" if len(mat.get('desc', '')) > 60 else f"  Descrição: {desc}\n")
            f.write(f"  Preço: {mat.get('preco', 0)}\n")
            f.write(f"  Fornecedor: {mat.get('fornecedor', 'N/A')}\n")
        
        f.write("\n  RECOMENDAÇÃO:\n")
        # Encontrar original
        originais = [m_id for m_id, _ in materiais_list_sorted if m_id.startswith('M') and not m_id[1:].startswith('sap')]
        importados = [m_id for m_id, _ in materiais_list_sorted if not m_id in originais]
        
        if originais:
            f.write(f"    Manter: {originais[0]}\n")
            f.write(f"    Mesclar: {', '.join(importados)}\n")
        else:
            f.write(f"    Sem original - escolher um como principal\n")
            f.write(f"    Opções: {', '.join([m_id for m_id, _ in materiais_list_sorted[:3]])}\n")

print(f"✓ Lista detalhada salva em: LISTA_DETALHADA_CODIGOS_DUPLICADOS.txt")
print(f"✓ Total de grupos de duplicação: {len(duplicados)}")
