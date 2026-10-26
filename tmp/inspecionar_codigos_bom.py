from pathlib import Path
import json

d=json.loads(Path('dados_armazem_catenaria.json').read_text(encoding='utf-8'))
mats={m['id']:m for m in d['materiais']}
alvos=['E-6179 IIA','E-6181 TC','E-6182 TA','E-6183 F','E-6184 X','E-6188 I']
for cod in alvos:
    ms=[x for x in d['montagens'] if str(x.get('codigo','')).upper()==cod]
    print('\nMONTAGEM',cod,'ENCONTRADA',len(ms))
    for mo in ms:
        for b in mo.get('bom',[])[:30]:
            m=mats.get(b.get('mat'),{})
            print({'bom':b,'material':{k:m.get(k) for k in ('id','codigo','codigo_alt','sap','ref','desc')}})
