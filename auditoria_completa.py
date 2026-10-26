import json
import re
from collections import defaultdict, Counter
from datetime import datetime

# Carregar dados
with open('seed_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Estruturas de dados
materiais = {m['id']: m for m in data.get('materiais', [])}
movimentos = data.get('movimentos', [])
postes = {p['id']: p for p in data.get('postes', [])}
encomendas = data.get('encomendas', [])
montagens = {m['id']: m for m in data.get('montagens', [])}

erros = []
avisos = []
info_msg = []

print("=" * 80)
print("AUDITORIA COMPLETA - Gestão de Materiais de Catenária")
print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)

# ============================================================================
# 1. AUDITORIA DE MATERIAIS
# ============================================================================
print("\n[1] AUDITORIA DE MATERIAIS")
print("-" * 80)

# Códigos duplicados
codigos = Counter()
for m_id, m in materiais.items():
    if m.get('codigo'):
        codigos[m['codigo']] += 1

duplicados_codigo = {c: count for c, count in codigos.items() if count > 1}
if duplicados_codigo:
    for codigo, count in sorted(duplicados_codigo.items()):
        mat_ids = [m_id for m_id, m in materiais.items() if m.get('codigo') == codigo]
        erros.append(f"MATERIAL: {count} materiais com código duplicado '{codigo}': {mat_ids}")

# Materiais sem código
sem_codigo = [m_id for m_id, m in materiais.items() if not m.get('codigo') or m['codigo'].strip() == '']
if sem_codigo:
    erros.append(f"MATERIAL: {len(sem_codigo)} materiais SEM código: {sem_codigo[:10]}")

# Materiais sem descrição
sem_desc = [m_id for m_id, m in materiais.items() if not m.get('desc') or m['desc'].strip() == '']
if sem_desc:
    avisos.append(f"MATERIAL: {len(sem_desc)} materiais SEM descrição")

# Materiais sem SAP mas com ref/fornecedor
sem_sap = []
for m_id, m in materiais.items():
    if (not m.get('sap') or m['sap'].strip() == '') and (m.get('ref') or m.get('fornecedor')):
        sem_sap.append(m_id)
if sem_sap:
    avisos.append(f"MATERIAL: {len(sem_sap)} materiais SEM SAP mas COM ref/fornecedor")

# Preços zerados
preco_zero = [m_id for m_id, m in materiais.items() if m.get('preco', 0) == 0]
if len(preco_zero) > 100:
    avisos.append(f"MATERIAL: {len(preco_zero)} materiais COM preço zerado")

print(f"✓ Total de materiais: {len(materiais)}")
print(f"  - Sem código: {len(sem_codigo)}")
print(f"  - Sem descrição: {len(sem_desc)}")
print(f"  - Sem SAP (mas com ref): {len(sem_sap)}")
print(f"  - Preço zerado: {len(preco_zero)}")

# ============================================================================
# 2. AUDITORIA DE MOVIMENTOS
# ============================================================================
print("\n[2] AUDITORIA DE MOVIMENTOS")
print("-" * 80)

# Movimentos sem data
sem_data = [m['id'] for m in movimentos if not m.get('data')]
if sem_data:
    erros.append(f"MOVIMENTO: {len(sem_data)} movimentos SEM data")

# Movimentos sem material
sem_material = [m['id'] for m in movimentos if not m.get('material')]
if sem_material:
    erros.append(f"MOVIMENTO: {len(sem_material)} movimentos SEM material")

# Movimentos com material inexistente
material_inexistente = [m['id'] for m in movimentos if m.get('material') and m['material'] not in materiais]
if material_inexistente:
    erros.append(f"MOVIMENTO: {len(material_inexistente)} movimentos com MATERIAL INEXISTENTE")

# Movimentos sem quantidade
sem_qtd = [m['id'] for m in movimentos if m.get('qtd') is None or m.get('qtd') == '']
if sem_qtd:
    erros.append(f"MOVIMENTO: {len(sem_qtd)} movimentos SEM quantidade")

# Movimentos com tipo inválido
tipos_validos = {'entrada', 'saida', 'transferencia', 'ajuste'}
tipo_invalido = [m['id'] for m in movimentos if m.get('tipo') not in tipos_validos]
if tipo_invalido:
    erros.append(f"MOVIMENTO: {len(tipo_invalido)} movimentos com TIPO inválido")

print(f"✓ Total de movimentos: {len(movimentos)}")
print(f"  - Sem data: {len(sem_data)}")
print(f"  - Sem material: {len(sem_material)}")
print(f"  - Material inexistente: {len(material_inexistente)}")
print(f"  - Sem quantidade: {len(sem_qtd)}")
print(f"  - Tipo inválido: {len(tipo_invalido)}")

# ============================================================================
# 3. AUDITORIA DE POSTES
# ============================================================================
print("\n[3] AUDITORIA DE POSTES")
print("-" * 80)

# Postes sem dados críticos
postes_incompletos = []
for p_id, p in postes.items():
    problemas = []
    if not p.get('poste'):
        problemas.append('sem número')
    if not p.get('montagem'):
        problemas.append('sem montagem')
    if not p.get('materiais'):
        problemas.append('sem materiais')
    if problemas:
        postes_incompletos.append((p_id, ', '.join(problemas)))

if postes_incompletos:
    avisos.append(f"POSTE: {len(postes_incompletos)} postes INCOMPLETOS")

# Postes com referência a materiais inexistentes
postes_mat_inexistente = []
for p_id, p in postes.items():
    if p.get('materiais'):
        for mat_id in p['materiais']:
            if mat_id not in materiais:
                postes_mat_inexistente.append((p_id, mat_id))

if postes_mat_inexistente:
    erros.append(f"POSTE: {len(postes_mat_inexistente)} referências a MATERIAIS INEXISTENTES")

# Postes com montagem inexistente
postes_mont_inexistente = [p_id for p_id, p in postes.items() if p.get('montagem') and p['montagem'] not in montagens]
if postes_mont_inexistente:
    avisos.append(f"POSTE: {len(postes_mont_inexistente)} postes com MONTAGEM INEXISTENTE")

print(f"✓ Total de postes: {len(postes)}")
print(f"  - Incompletos: {len(postes_incompletos)}")
print(f"  - Com material inexistente: {len(postes_mat_inexistente)}")
print(f"  - Com montagem inexistente: {len(postes_mont_inexistente)}")

# ============================================================================
# 4. AUDITORIA DE ENCOMENDAS
# ============================================================================
print("\n[4] AUDITORIA DE ENCOMENDAS")
print("-" * 80)

# Encomendas sem data
enc_sem_data = [e['id'] for e in encomendas if not e.get('data')]
if enc_sem_data:
    avisos.append(f"ENCOMENDA: {len(enc_sem_data)} encomendas SEM data")

# Encomendas sem quantidade
enc_sem_qtd = [e['id'] for e in encomendas if e.get('qtd') is None or e.get('qtd') == '']
if enc_sem_qtd:
    avisos.append(f"ENCOMENDA: {len(enc_sem_qtd)} encomendas SEM quantidade")

# Encomendas sem fornecedor
enc_sem_forn = [e['id'] for e in encomendas if not e.get('fornecedor')]
if enc_sem_forn:
    avisos.append(f"ENCOMENDA: {len(enc_sem_forn)} encomendas SEM fornecedor")

# Encomendas com material inexistente
enc_mat_inexistente = [e['id'] for e in encomendas if e.get('material') and e['material'] not in materiais]
if enc_mat_inexistente:
    erros.append(f"ENCOMENDA: {len(enc_mat_inexistente)} encomendas com MATERIAL INEXISTENTE")

# Status inválidos
status_validos = {'pendente', 'parcial', 'completa', 'cancelada'}
status_invalido = [e['id'] for e in encomendas if e.get('status') and e.get('status') not in status_validos]
if status_invalido:
    avisos.append(f"ENCOMENDA: {len(status_invalido)} encomendas com STATUS inválido")

print(f"✓ Total de encomendas: {len(encomendas)}")
print(f"  - Sem data: {len(enc_sem_data)}")
print(f"  - Sem quantidade: {len(enc_sem_qtd)}")
print(f"  - Sem fornecedor: {len(enc_sem_forn)}")
print(f"  - Material inexistente: {len(enc_mat_inexistente)}")
print(f"  - Status inválido: {len(status_invalido)}")

# ============================================================================
# 5. AUDITORIA DE MONTAGENS
# ============================================================================
print("\n[5] AUDITORIA DE MONTAGENS")
print("-" * 80)

# Montagens sem dados críticos
mont_incompletos = []
for m_id, m in montagens.items():
    problemas = []
    if not m.get('nome'):
        problemas.append('sem nome')
    if not m.get('pecas') and not m.get('peças'):
        problemas.append('sem peças')
    if problemas:
        mont_incompletos.append((m_id, ', '.join(problemas)))

# Montagens com referência a materiais inexistentes
mont_mat_inexistente = []
for m_id, m in montagens.items():
    pecas = m.get('pecas') or m.get('peças') or []
    for peca in pecas:
        if isinstance(peca, dict) and peca.get('material') and peca['material'] not in materiais:
            mont_mat_inexistente.append((m_id, peca['material']))

if mont_incompletos:
    avisos.append(f"MONTAGEM: {len(mont_incompletos)} montagens INCOMPLETAS")

if mont_mat_inexistente:
    erros.append(f"MONTAGEM: {len(mont_mat_inexistente)} referências a MATERIAIS INEXISTENTES")

print(f"✓ Total de montagens: {len(montagens)}")
print(f"  - Incompletas: {len(mont_incompletos)}")
print(f"  - Com material inexistente: {len(mont_mat_inexistente)}")

# ============================================================================
# 6. CONSISTÊNCIA GERAL
# ============================================================================
print("\n[6] CONSISTÊNCIA GERAL")
print("-" * 80)

# Materiais não referenciados em nenhum movimento ou poste ou montagem
mat_referenciados = set()
for mov in movimentos:
    if mov.get('material'):
        mat_referenciados.add(mov['material'])
for p_id, p in postes.items():
    if p.get('materiais'):
        mat_referenciados.update(p['materiais'])
for m_id, m in montagens.items():
    pecas = m.get('pecas') or m.get('peças') or []
    for peca in pecas:
        if isinstance(peca, dict) and peca.get('material'):
            mat_referenciados.add(peca['material'])

mat_orfaos = set(materiais.keys()) - mat_referenciados
if mat_orfaos:
    info_msg.append(f"CONSISTÊNCIA: {len(mat_orfaos)} materiais NÃO referenciados (órfãos)")

# Verificar IDs únicos
ids_totais = set(materiais.keys()) | set(p['id'] for p in postes.values()) | set(m['id'] for m in montagens.values()) | set(e['id'] for e in encomendas)
ids_movimento = set(m['id'] for m in movimentos)

duplicados_ids = ids_totais & ids_movimento
if duplicados_ids:
    erros.append(f"CONSISTÊNCIA: {len(duplicados_ids)} IDs duplicados entre tabelas")

print(f"✓ Materiais órfãos (não referenciados): {len(mat_orfaos)}")
print(f"✓ Verificação de IDs únicos: OK" if not duplicados_ids else f"✗ IDs duplicados: {len(duplicados_ids)}")

# ============================================================================
# RESUMO FINAL
# ============================================================================
print("\n" + "=" * 80)
print("RESUMO")
print("=" * 80)
print(f"✗ ERROS CRÍTICOS: {len(erros)}")
print(f"⚠ AVISOS: {len(avisos)}")
print(f"ℹ INFORMAÇÕES: {len(info_msg)}")
print("=" * 80)

# Salvar relatório
with open('AUDITORIA_COMPLETA_ERROS_PROGRAMA.txt', 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("AUDITORIA COMPLETA - Gestão de Materiais de Catenária\n")
    f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write("=" * 80 + "\n\n")

    f.write("1. RESUMO EXECUTIVO\n")
    f.write("-" * 80 + "\n")
    f.write(f"Total de Materiais: {len(materiais)}\n")
    f.write(f"Total de Movimentos: {len(movimentos)}\n")
    f.write(f"Total de Postes: {len(postes)}\n")
    f.write(f"Total de Encomendas: {len(encomendas)}\n")
    f.write(f"Total de Montagens: {len(montagens)}\n\n")

    f.write(f"ERROS CRÍTICOS ENCONTRADOS: {len(erros)}\n")
    f.write(f"AVISOS: {len(avisos)}\n")
    f.write(f"INFORMAÇÕES: {len(info_msg)}\n\n")

    f.write("2. ERROS CRÍTICOS (Deve corrigir)\n")
    f.write("-" * 80 + "\n")
    if erros:
        for i, erro in enumerate(erros, 1):
            f.write(f"{i}. {erro}\n")
    else:
        f.write("Nenhum erro crítico encontrado.\n")
    f.write("\n")

    f.write("3. AVISOS (Problemas secundários)\n")
    f.write("-" * 80 + "\n")
    if avisos:
        for i, aviso in enumerate(avisos, 1):
            f.write(f"{i}. {aviso}\n")
    else:
        f.write("Nenhum aviso encontrado.\n")
    f.write("\n")

    f.write("4. INFORMAÇÕES\n")
    f.write("-" * 80 + "\n")
    if info_msg:
        for i, msg in enumerate(info_msg, 1):
            f.write(f"{i}. {msg}\n")
    else:
        f.write("Nenhuma informação adicional.\n")

print("\n✓ Relatório salvo em: AUDITORIA_COMPLETA_ERROS_PROGRAMA.txt")
