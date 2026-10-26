import json
from collections import Counter, defaultdict
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
print("AUDITORIA PRECISA - Gestão de Materiais de Catenária")
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
        erros.append(f"CÓDIGO DUPLICADO '{codigo}': {count} materiais - {', '.join(mat_ids[:3])}" +
                    ("..." if len(mat_ids) > 3 else ""))

# Materiais sem código
sem_codigo = [m_id for m_id, m in materiais.items() if not m.get('codigo') or m['codigo'].strip() == '']
if sem_codigo:
    erros.append(f"SEM CÓDIGO: {len(sem_codigo)} materiais ({', '.join(sem_codigo)})")

# Materiais sem descrição
sem_desc = [m_id for m_id, m in materiais.items() if not m.get('desc') or m['desc'].strip() == '']
if sem_desc:
    avisos.append(f"SEM DESCRIÇÃO: {len(sem_desc)} materiais")

# Materiais sem SAP
sem_sap = [m_id for m_id, m in materiais.items() if not m.get('sap') or m['sap'].strip() == '']
if len(sem_sap) > 100:
    avisos.append(f"SEM SAP: {len(sem_sap)} materiais (possível para materiais não-SAP)")

# Preços zerados
preco_zero = [m_id for m_id, m in materiais.items() if m.get('preco', 0) == 0]
if len(preco_zero) > 100:
    avisos.append(f"PREÇO ZERADO: {len(preco_zero)} materiais")

print(f"✓ Materiais: {len(materiais)}")
print(f"  - Códigos duplicados: {len(duplicados_codigo)}")
print(f"  - Sem código: {len(sem_codigo)}")
print(f"  - Sem descrição: {len(sem_desc)}")
print(f"  - Sem SAP: {len(sem_sap)}")
print(f"  - Preço zerado: {len(preco_zero)}")

# ============================================================================
# 2. AUDITORIA DE MOVIMENTOS
# ============================================================================
print("\n[2] AUDITORIA DE MOVIMENTOS")
print("-" * 80)

# Movimentos sem data
sem_data = [m['id'] for m in movimentos if not m.get('data')]
if sem_data:
    erros.append(f"SEM DATA: {len(sem_data)} movimentos - {sem_data[:5]}")

# Movimentos sem material (campo 'mat')
sem_mat = [m['id'] for m in movimentos if not m.get('mat')]
if sem_mat:
    erros.append(f"SEM MATERIAL: {len(sem_mat)} movimentos")

# Movimentos com material inexistente
mat_inexistente = [m['id'] for m in movimentos if m.get('mat') and m['mat'] not in materiais]
if mat_inexistente:
    erros.append(f"MATERIAL INEXISTENTE: {len(mat_inexistente)} movimentos")

# Movimentos sem quantidade
sem_qtd = [m['id'] for m in movimentos if m.get('qtd') is None or m.get('qtd') == '']
if sem_qtd:
    erros.append(f"SEM QUANTIDADE: {len(sem_qtd)} movimentos")

# Movimentos com tipo inválido
tipos_validos = {'entrada', 'saida', 'transferencia', 'ajuste'}
tipo_invalido = [m['id'] for m in movimentos if m.get('tipo') not in tipos_validos]
if tipo_invalido:
    erros.append(f"TIPO INVÁLIDO: {len(tipo_invalido)} movimentos - {tipo_invalido[:5]}")

# Verificar distribuição de tipos
tipos = Counter(m.get('tipo') for m in movimentos)
print(f"✓ Movimentos: {len(movimentos)}")
print(f"  - Entradas: {tipos['entrada']}")
print(f"  - Saídas: {tipos['saida']}")
print(f"  - Transferências: {tipos.get('transferencia', 0)}")
print(f"  - Ajustes: {tipos.get('ajuste', 0)}")
print(f"  - Sem data: {len(sem_data)}")
print(f"  - Sem material: {len(sem_mat)}")
print(f"  - Material inexistente: {len(mat_inexistente)}")
print(f"  - Sem quantidade: {len(sem_qtd)}")
print(f"  - Tipo inválido: {len(tipo_invalido)}")

# ============================================================================
# 3. AUDITORIA DE POSTES
# ============================================================================
print("\n[3] AUDITORIA DE POSTES")
print("-" * 80)

postes_sem_poste = [p_id for p_id, p in postes.items() if not p.get('poste')]
postes_sem_montagem = [p_id for p_id, p in postes.items() if not p.get('montagem')]
postes_sem_materiais = [p_id for p_id, p in postes.items() if not p.get('materiais')]

if postes_sem_poste:
    avisos.append(f"POSTES SEM NÚMERO: {len(postes_sem_poste)}")
if postes_sem_montagem:
    avisos.append(f"POSTES SEM MONTAGEM: {len(postes_sem_montagem)}")
if postes_sem_materiais:
    avisos.append(f"POSTES SEM LISTA DE MATERIAIS: {len(postes_sem_materiais)}")

# Postes com material inexistente
postes_mat_inexistente = []
for p_id, p in postes.items():
    if p.get('materiais'):
        for mat_id in p['materiais']:
            if mat_id not in materiais:
                postes_mat_inexistente.append((p_id, mat_id))

if postes_mat_inexistente:
    erros.append(f"POSTES COM MATERIAL INEXISTENTE: {len(postes_mat_inexistente)} referências")

# Postes com montagem inexistente
postes_mont_inexistente = [p_id for p_id, p in postes.items() if p.get('montagem') and p['montagem'] not in montagens]
if postes_mont_inexistente:
    avisos.append(f"POSTES COM MONTAGEM INEXISTENTE: {len(postes_mont_inexistente)}")

print(f"✓ Postes: {len(postes)}")
print(f"  - Sem número: {len(postes_sem_poste)}")
print(f"  - Sem montagem: {len(postes_sem_montagem)}")
print(f"  - Sem lista de materiais: {len(postes_sem_materiais)}")
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
    avisos.append(f"ENCOMENDAS SEM DATA: {len(enc_sem_data)}")

# Encomendas sem quantidade encomendada
enc_sem_qtd = [e['id'] for e in encomendas if e.get('qtdEnc') is None or e.get('qtdEnc') == '']
if enc_sem_qtd:
    avisos.append(f"ENCOMENDAS SEM QTD ENCOMENDADA: {len(enc_sem_qtd)}")

# Encomendas sem fornecedor
enc_sem_forn = [e['id'] for e in encomendas if not e.get('fornecedor')]
if enc_sem_forn:
    avisos.append(f"ENCOMENDAS SEM FORNECEDOR: {len(enc_sem_forn)}")

# Encomendas com material inexistente
enc_mat_inexistente = [e['id'] for e in encomendas if e.get('mat') and e['mat'] not in materiais]
if enc_mat_inexistente:
    erros.append(f"ENCOMENDAS COM MATERIAL INEXISTENTE: {len(enc_mat_inexistente)}")

# Estados inválidos
estados_validos = {'pendente', 'parcial', 'completa', 'cancelada', 'Concluída', 'Entrega parcial', 'Pendente'}
estado_invalido = [e['id'] for e in encomendas if e.get('estado') and e.get('estado') not in estados_validos]
if estado_invalido:
    estados_encontrados = set(e.get('estado') for e in encomendas)
    info_msg.append(f"ENCOMENDAS: Estados encontrados: {estados_encontrados}")

# Verificar encomendas sem quantidade recebida mas completas
enc_sem_qtd_rec = [e['id'] for e in encomendas if e.get('estado') == 'Concluída' and not e.get('qtdRecebida')]
if enc_sem_qtd_rec:
    avisos.append(f"ENCOMENDAS COMPLETAS SEM QTD RECEBIDA: {len(enc_sem_qtd_rec)}")

print(f"✓ Encomendas: {len(encomendas)}")
print(f"  - Estados únicos: {len(set(e.get('estado') for e in encomendas))}")
print(f"  - Sem data: {len(enc_sem_data)}")
print(f"  - Sem qtd encomendada: {len(enc_sem_qtd)}")
print(f"  - Sem fornecedor: {len(enc_sem_forn)}")
print(f"  - Material inexistente: {len(enc_mat_inexistente)}")
print(f"  - Estado inválido: {len(estado_invalido)}")

# ============================================================================
# 5. AUDITORIA DE MONTAGENS
# ============================================================================
print("\n[5] AUDITORIA DE MONTAGENS")
print("-" * 80)

mont_sem_nome = [m_id for m_id, m in montagens.items() if not m.get('nome')]
mont_sem_pecas = [m_id for m_id, m in montagens.items() if not (m.get('pecas') or m.get('peças'))]

if mont_sem_nome:
    avisos.append(f"MONTAGENS SEM NOME: {len(mont_sem_nome)}")
if mont_sem_pecas:
    avisos.append(f"MONTAGENS SEM PEÇAS: {len(mont_sem_pecas)}")

# Montagens com material inexistente
mont_mat_inexistente = []
for m_id, m in montagens.items():
    pecas = m.get('pecas') or m.get('peças') or []
    for peca in pecas:
        if isinstance(peca, dict) and peca.get('material') and peca['material'] not in materiais:
            mont_mat_inexistente.append((m_id, peca['material']))

if mont_mat_inexistente:
    erros.append(f"MONTAGENS COM MATERIAL INEXISTENTE: {len(mont_mat_inexistente)}")

print(f"✓ Montagens: {len(montagens)}")
print(f"  - Sem nome: {len(mont_sem_nome)}")
print(f"  - Sem peças: {len(mont_sem_pecas)}")
print(f"  - Com material inexistente: {len(mont_mat_inexistente)}")

# ============================================================================
# 6. CONSISTÊNCIA GERAL
# ============================================================================
print("\n[6] CONSISTÊNCIA GERAL")
print("-" * 80)

# Materiais referenciados
mat_referenciados = set()
for mov in movimentos:
    if mov.get('mat'):
        mat_referenciados.add(mov['mat'])
for p_id, p in postes.items():
    if p.get('materiais'):
        mat_referenciados.update(p['materiais'])
for m_id, m in montagens.items():
    pecas = m.get('pecas') or m.get('peças') or []
    for peca in pecas:
        if isinstance(peca, dict) and peca.get('material'):
            mat_referenciados.add(peca['material'])
for enc in encomendas:
    if enc.get('mat'):
        mat_referenciados.add(enc['mat'])

mat_orfaos = set(materiais.keys()) - mat_referenciados
if len(mat_orfaos) > 100:
    info_msg.append(f"MATERIAIS ÓRFÃOS: {len(mat_orfaos)} não referenciados em movimentos/postes/montagens/encomendas")

print(f"✓ Materiais referenciados: {len(mat_referenciados)}")
print(f"✓ Materiais órfãos: {len(mat_orfaos)}")

# ============================================================================
# RESUMO FINAL
# ============================================================================
print("\n" + "=" * 80)
print("RESUMO FINAL")
print("=" * 80)
print(f"✗ ERROS CRÍTICOS: {len(erros)}")
print(f"⚠ AVISOS: {len(avisos)}")
print(f"ℹ INFORMAÇÕES: {len(info_msg)}")
print("=" * 80)

# Salvar relatório completo
with open('AUDITORIA_COMPLETA_ERROS_PROGRAMA.txt', 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("AUDITORIA COMPLETA E PROFUNDA - Gestão de Materiais de Catenária\n")
    f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write("=" * 80 + "\n\n")

    f.write("═ RESUMO EXECUTIVO\n")
    f.write("=" * 80 + "\n\n")
    f.write(f"Materiais:        {len(materiais):>6}\n")
    f.write(f"Movimentos:       {len(movimentos):>6}\n")
    f.write(f"Postes:           {len(postes):>6}\n")
    f.write(f"Encomendas:       {len(encomendas):>6}\n")
    f.write(f"Montagens:        {len(montagens):>6}\n")
    f.write(f"\nErros críticos:   {len(erros):>6}\n")
    f.write(f"Avisos:           {len(avisos):>6}\n")
    f.write(f"Informações:      {len(info_msg):>6}\n\n")

    f.write("═ PRIORIDADES\n")
    f.write("=" * 80 + "\n\n")
    f.write("CRÍTICO (Deve corrigir IMEDIATAMENTE):\n")
    f.write("  - Códigos duplicados de materiais (podem causar confusão em consumos)\n")
    f.write("  - Materiais inexistentes em movimentos, encomendas e postes\n")
    f.write("  - Montagens inexistentes referenciadas por postes\n\n")

    f.write("ALTO (Deve corrigir em breve):\n")
    f.write("  - Postes incompletos\n")
    f.write("  - Encomendas com dados faltando\n")
    f.write("  - Materiais sem SAP\n\n")

    f.write("MÉDIO (Melhoramento):\n")
    f.write("  - Materiais órfãos (não usados)\n")
    f.write("  - Preços zerados\n\n")

    f.write("═ ERROS CRÍTICOS DETALHADOS\n")
    f.write("=" * 80 + "\n")
    if erros:
        for i, erro in enumerate(erros, 1):
            f.write(f"\n{i}. {erro}\n")
    else:
        f.write("\nNenhum erro crítico encontrado.\n")
    f.write("\n")

    f.write("═ AVISOS SECUNDÁRIOS\n")
    f.write("=" * 80 + "\n")
    if avisos:
        for i, aviso in enumerate(avisos, 1):
            f.write(f"\n{i}. {aviso}\n")
    else:
        f.write("\nNenhum aviso encontrado.\n")
    f.write("\n")

    f.write("═ INFORMAÇÕES ADICIONAIS\n")
    f.write("=" * 80 + "\n")
    if info_msg:
        for i, msg in enumerate(info_msg, 1):
            f.write(f"\n{i}. {msg}\n")
    f.write("\n")

    f.write("═ RECOMENDAÇÕES\n")
    f.write("=" * 80 + "\n\n")
    f.write("1. ELIMINAR CÓDIGOS DUPLICADOS\n")
    f.write("   - Consolidar materiais com mesmo código SAP em uma única entrada\n")
    f.write("   - Usar o 'id' para rastreamento interno, 'codigo' (SAP) para operações\n\n")

    f.write("2. COMPLETAR DADOS DE POSTES\n")
    f.write("   - Adicionar número de poste (campo 'poste')\n")
    f.write("   - Referência correta a montagem (com validação)\n")
    f.write("   - Lista de materiais necessários\n\n")

    f.write("3. VALIDAR REFERÊNCIAS CRUZADAS\n")
    f.write("   - Toda montagem deve existir no catálogo\n")
    f.write("   - Todo material deve estar cadastrado\n")
    f.write("   - Toda referência deve ser resolvível\n\n")

    f.write("4. ENCOMENDAS\n")
    f.write("   - Garantir quantidade encomendada para todos os itens\n")
    f.write("   - Validar estado do pedido\n")
    f.write("   - Rastrear quantidade recebida vs. encomendada\n\n")

    f.write("5. LIMPEZA DE DADOS ÓRFÃOS\n")
    f.write("   - Revisar materiais não utilizados\n")
    f.write("   - Decidir: consolidar, transferir ou eliminar\n\n")

print("\n✓ Relatório COMPLETO salvo em: AUDITORIA_COMPLETA_ERROS_PROGRAMA.txt")
