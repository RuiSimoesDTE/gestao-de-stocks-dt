from pathlib import Path
import json
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "gestao_armazem_catenaria.html"
XLSX = Path(r"C:\Users\dst7973\Desktop\EXPORT_20260817_141131.xlsx")

text = HTML.read_text(encoding="utf-8")
match = re.search(r"const SEED_DATA=(\{.*?\});;", text, re.S)
if not match:
    raise RuntimeError("SEED_DATA não encontrado")
seed = json.loads(match.group(1))

def clean(value):
    if pd.isna(value):
        return ""
    value = str(value).strip()
    return value[:-2] if value.endswith(".0") else value

def number(value):
    if pd.isna(value) or str(value).strip() == "":
        return 0.0
    return float(str(value).replace(",", "."))

def material_type(description):
    d = description.lower()
    return "Máquina" if any(x in d for x in ("máquina", "ferrament", "berbequim", "rebarbadora")) else "Consumível"

existing_orders = {}
for order in seed["encomendas"]:
    item_match = re.search(r"Item\s+(\d+)", order.get("obs", ""))
    if item_match:
        existing_orders[(str(order.get("pedido", "")), item_match.group(1))] = order

materials_by_id = {m["id"]: m for m in seed["materiais"]}
frame = pd.read_excel(XLSX, dtype=object)
imported = 0
updated = 0

for _, row in frame.iterrows():
    po = clean(row.get("Documento de compras"))
    item = clean(row.get("Item"))
    sap = clean(row.get("Material"))
    if not po or not item or not sap:
        continue
    description = clean(row.get("Texto breve")) or sap
    supplier = clean(row.get("Fornecedor/centro fornecedor"))
    qty = number(row.get("Qtd.pedido"))
    outstanding = number(row.get("a ser fornecida (quantidade)"))
    received = max(0.0, qty - outstanding)
    unit_raw = clean(row.get("UM pedido")).lower()
    unit = {"un": "un", "und": "un", "m": "m", "l": "l", "rol": "rol"}.get(unit_raw, unit_raw or "un")
    date_value = row.get("Data do documento")
    date = pd.to_datetime(date_value).strftime("%Y-%m-%d") if not pd.isna(date_value) else ""
    pep = clean(row.get("Elemento PEP"))
    key = (po, item)

    if key in existing_orders:
        order = existing_orders[key]
        material = materials_by_id.get(order.get("mat"))
        if material:
            material.update({"codigo": sap, "sap": sap, "desc": description, "un": unit, "fornecedor": supplier})
        order.update({
            "qtdEnc": qty, "qtdRecebida": received, "un": unit,
            "fornecedor": supplier, "data": date,
            "estado": "Concluída" if outstanding <= 0 else ("Entrega parcial" if received > 0 else "Em encomenda"),
            "obs": f"Importado EXPORT SAP 17/08/2026 | PEP {pep} | Item {item} | Descrição SAP: {description}",
        })
        updated += 1
        continue

    material_id = f"sap20260817-mat-{po}-{item}"
    order_id = f"sap20260817-enc-{po}-{item}"
    material = {
        "id": material_id, "codigo": sap, "desc": description, "un": unit,
        "cat": "Importado SAP", "min": 0, "sap": sap, "ref": "",
        "fornecedor": supplier, "tipo": material_type(description),
    }
    order = {
        "id": order_id, "pedido": po, "mat": material_id,
        "qtdEnc": qty, "qtdRecebida": received, "un": unit,
        "fornecedor": supplier, "data": date,
        "estado": "Concluída" if outstanding <= 0 else ("Entrega parcial" if received > 0 else "Em encomenda"),
        "obs": f"Importado EXPORT SAP 17/08/2026 | PEP {pep} | Item {item} | Descrição SAP: {description}",
    }
    seed["materiais"].append(material)
    seed["encomendas"].append(order)
    materials_by_id[material_id] = material
    existing_orders[key] = order
    imported += 1

guide_lines = [
    ("10", 5, "Arnês sem cinto de dois pontos"),
    ("20", 4, "Arnês com cinto de dois pontos"),
    ("40", 6, "Cordas Y/Patacho"),
    ("50", 6, "Mosquetões de aço"),
]
orders_by_key = {}
for order in seed["encomendas"]:
    item_match = re.search(r"Item\s+(\d+)", order.get("obs", ""))
    if item_match:
        orders_by_key[(str(order.get("pedido", "")), item_match.group(1))] = order

movement_ids = {m["id"] for m in seed["movimentos"]}
for item, qty, label in guide_lines:
    order = orders_by_key[("4500883493", item)]
    material_id = order["mat"]
    entry_id = f"sap20260817-entrada-4500883493-{item}"
    transfer_id = f"gt2979-transferencia-4500883493-{item}"
    if entry_id not in movement_ids:
        seed["movimentos"].append({
            "id": entry_id, "data": "2026-08-17", "tipo": "entrada", "mat": material_id,
            "qtd": qty, "arm": "Armazém Catenária", "armDst": None,
            "pedido": "4500883493", "doc": "Receção SAP / PC 4500883493",
            "origem": "Farprotec -Com.de Uniformes e", "dest": "Obra IC-0019 - Vendas Novas",
            "obs": f"Entrada confirmada no SAP e expedida pela GT ATDT202601GT/2979: {label}.",
            "ajuste": False, "user": "", "ref": None,
        })
    if transfer_id not in movement_ids:
        seed["movimentos"].append({
            "id": transfer_id, "data": "2026-08-17", "tipo": "transferencia", "mat": material_id,
            "qtd": qty, "arm": "Armazém Catenária", "armDst": None, "obraDst": "pampilhosa",
            "pedido": "4500883493", "doc": "GT ATDT202601GT/2979",
            "origem": "Obra IC-0019 - Vendas Novas, Coruche", "dest": "Obra IC-0018 - Coimbra",
            "obs": f"Transferência entre obras: {label}. Guia emitida em 17/08/2026; transporte para 18/08/2026.",
            "ajuste": False, "guia": "guias_transferencia/GT_ATDT202601GT_2979.pdf", "user": "", "ref": None,
        })

new_json = json.dumps(seed, ensure_ascii=False, separators=(",", ":"))
text = text[:match.start(1)] + new_json + text[match.end(1):]

old_join = """function juntarPorId(atual,seed){
  const out=Array.isArray(atual)?atual:[],ids=new Set(out.map(x=>x.id));
  for(const x of (seed||[]))if(!ids.has(x.id)){out.push(copia(x));ids.add(x.id);}
  return out;
}"""
new_join = """function juntarPorId(atual,seed){
  const out=Array.isArray(atual)?atual:[],porId=new Map(out.map(x=>[x.id,x]));
  for(const x of (seed||[])){
    if(!porId.has(x.id)){const novo=copia(x);out.push(novo);porId.set(x.id,novo);}
    else if(/^sap\\d{8}-(?:mat|enc)-/.test(String(x.id||'')))Object.assign(porId.get(x.id),copia(x));
  }
  return out;
}"""
if old_join not in text:
    raise RuntimeError("Função juntarPorId não encontrada")
text = text.replace(old_join, new_join, 1)

old_stock = """else if(mv.tipo==='transferencia'){
      e[mv.arm]=(e[mv.arm]||0)-q;
      if(mv.armDst)e[mv.armDst]=(e[mv.armDst]||0)+q;
    }"""
new_stock = """else if(mv.tipo==='transferencia'){
      e[mv.arm]=(e[mv.arm]||0)-q;
      if(mv.armDst)e[mv.armDst]=(e[mv.armDst]||0)+q;
      else if(mv.obraDst)e.__t-=q;
    }"""
if old_stock not in text:
    raise RuntimeError("Lógica de stock de transferência não encontrada")
text = text.replace(old_stock, new_stock, 1)

anchor = """  OBRAS=multi;fundirSeedEmVendas();if(!OBRAS.obras[OBRAS.ativa])OBRAS.ativa=Object.keys(OBRAS.obras)[0];ativarObra(OBRAS.ativa);guardar();localStorage.removeItem(CHAVE);setTimeout(atualizarSeletorObras,0);"""
replacement = """  OBRAS=multi;fundirSeedEmVendas();
  const pamp=OBRAS.obras.pampilhosa;
  pamp.materiais=juntarPorId(pamp.materiais,SEED_DATA.materiais);
  const rececoesPamp=[
    ['10',5,'Arnês sem cinto de dois pontos'],['20',4,'Arnês com cinto de dois pontos'],
    ['40',6,'Cordas Y/Patacho'],['50',6,'Mosquetões de aço']
  ].map(([item,qtd,desc])=>{const enc=SEED_DATA.encomendas.find(e=>e.pedido==='4500883493'&&String(e.obs||'').includes('Item '+item+' |'));return {
    id:'gt2979-rececao-4500883493-'+item,data:'2026-08-17',tipo:'entrada',mat:enc.mat,qtd,
    arm:'Armazém Catenária',armDst:null,pedido:'4500883493',doc:'GT ATDT202601GT/2979',
    origem:'Obra IC-0019 - Vendas Novas, Coruche',dest:'Obra IC-0018 - Coimbra',
    obs:'Receção por transferência entre obras: '+desc+'. Guia emitida em 17/08/2026; transporte para 18/08/2026.',
    ajuste:false,guia:'guias_transferencia/GT_ATDT202601GT_2979.pdf',user:'',ref:null};});
  pamp.movimentos=juntarPorId(pamp.movimentos,rececoesPamp);
  if(!OBRAS.obras[OBRAS.ativa])OBRAS.ativa=Object.keys(OBRAS.obras)[0];ativarObra(OBRAS.ativa);guardar();localStorage.removeItem(CHAVE);setTimeout(atualizarSeletorObras,0);"""
if anchor not in text:
    raise RuntimeError("Ponto de migração multiobra não encontrado")
text = text.replace(anchor, replacement, 1)

guide_row = """          <tr><td>17/08/2026</td><td>GT ATDT202601GT/2979</td><td>IC-0019 — Vendas Novas</td><td>IC-0018 — Coimbra</td><td>4 × arnês com cinto; 5 × arnês sem cinto; 6 × cordas Y; 6 × mosquetões de aço</td><td><a class="btn sm" target="_blank" href="guias_transferencia/GT_ATDT202601GT_2979.pdf">Abrir guia</a></td></tr>
"""
row_anchor = """          <tr><td>05/08/2026</td><td>GT ATDT202601GT/2829</td><td>IC-0019 — Vendas Novas</td><td>IC-0018 — Pampilhosa</td><td>1 × Molde de soldadura para fita de aço cobreado</td><td><a class="btn sm" target="_blank" href="guias_transferencia/GT_ATDT202601GT_2829.pdf">Abrir guia</a></td></tr>
"""
if "GT ATDT202601GT/2979</td><td>IC-0019" not in text:
    if row_anchor not in text:
        raise RuntimeError("Tabela de transferências não encontrada")
    text = text.replace(row_anchor, row_anchor + guide_row, 1)

HTML.write_text(text, encoding="utf-8")
print(json.dumps({"novas_linhas_pc": imported, "linhas_pc_atualizadas": updated, "total_encomendas": len(seed['encomendas'])}, ensure_ascii=False))
