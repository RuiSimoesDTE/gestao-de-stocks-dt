from html.parser import HTMLParser
from pathlib import Path

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.sec=None; self.depth=0; self.capture=None; self.buf=[]; self.out=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='section' and 'view' in a.get('class','').split():
            self.sec={'id':a.get('id'),'headings':[],'hints':[],'labels':[]}; self.depth=1; return
        if self.sec:
            if tag=='section': self.depth+=1
            if tag in ('h2','h3') or (tag=='p' and 'hint' in a.get('class','').split()) or tag=='label':
                self.capture=('headings' if tag in ('h2','h3') else 'hints' if tag=='p' else 'labels'); self.buf=[]
    def handle_data(self,d):
        if self.sec and self.capture:self.buf.append(d)
    def handle_endtag(self,tag):
        if self.sec and self.capture and tag in ('h2','h3','p','label'):
            txt=' '.join(''.join(self.buf).split())
            if txt:self.sec[self.capture].append(txt)
            self.capture=None;self.buf=[]
        if self.sec and tag=='section':
            self.depth-=1
            if self.depth==0:self.out.append(self.sec);self.sec=None

p=P();p.feed(Path('gestao_armazem_catenaria.html').read_text(encoding='utf-8'))
for x in p.out:
    print('\n',x['id'])
    print('  títulos:', ' | '.join(x['headings'][:10]))
    print('  descrição:', ' | '.join(x['hints'][:4]))
    print('  campos:', ' | '.join(x['labels'][:15]))
