/* Servidor local para EXPERIMENTAR o programa num telemóvel ligado à mesma rede Wi-Fi.
   Serve esta pasta (só leitura) em http://<IP deste computador>:8766/ e mostra um QR para abrir no telemóvel.
   Para parar: fechar a janela preta. Os dados do telemóvel ficam no próprio telemóvel (são cópias de teste). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const PORTA = Number(process.argv[2]) || 8766;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.csv': 'text/csv; charset=utf-8' };

function enderecos() {
  const lista = [];
  for (const [nome, ifs] of Object.entries(os.networkInterfaces())) for (const i of ifs || []) if (i.family === 'IPv4' && !i.internal) lista.push({ nome, ip: i.address });
  const pref = a => /^192\.168\./.test(a.ip) ? 0 : /^10\./.test(a.ip) ? 1 : /^172\.(1[6-9]|2\d|3[01])\./.test(a.ip) ? 2 : 3;
  return lista.sort((a, b) => pref(a) - pref(b));
}

function paginaTelemovel() {
  const ips = enderecos();
  const urls = ips.map(a => `http://${a.ip}:${PORTA}/gestao_materiais_catenaria.html?modo=operador`);
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>Abrir no telemóvel</title><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js" integrity="sha384-mZT2gIty7ZDdOGkxfP6joZcYdMW1Jvj9dRlfpTmaJAKKXTqzygtB22k7FLe+KZC1" crossorigin="anonymous"></script>
<style>body{font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:30px auto;padding:0 16px;color:#223}h1{color:#0b4f8a}.qr{width:280px;height:280px;margin:14px 0}code{background:#eef2f6;padding:3px 7px;border-radius:5px;word-break:break-all}.aviso{background:#fff3cd;border-radius:8px;padding:10px 12px;margin-top:18px;font-size:14px}</style></head><body>
<h1>Experimentar no telemóvel</h1>
<p>1. Liga o telemóvel à <b>mesma rede Wi-Fi</b> deste computador.<br>2. Aponta a câmara ao QR (ou escreve o endereço no navegador do telemóvel).<br>3. Abre o ecrã do operador: ler QR e dar baixa.</p>
${urls.length ? '<div id="q" class="qr"></div><p>Endereço: <code id="u">' + urls[0] + '</code></p>' + (urls.length > 1 ? '<p>Se não abrir, tenta um destes:<br>' + urls.slice(1).map(u => '<code>' + u + '</code>').join('<br>') + '</p>' : '') : '<p><b>Não encontrei o endereço de rede deste computador.</b> Confirma que estás ligado ao Wi-Fi.</p>'}
<p>Para ver o programa completo no telemóvel: <code>...gestao_materiais_catenaria.html?modo=normal</code></p>
<div class="aviso"><b>Se o telemóvel não abre:</b> o Windows pode ter perguntado se deixa o programa aceder à rede (responde "Permitir" em redes privadas) e algumas redes Wi-Fi de empresa bloqueiam a ligação entre aparelhos; nesse caso usa o Wi-Fi/hotspot do próprio telemóvel ou uma rede doméstica. O que fizeres no telemóvel fica só no telemóvel (cópia de teste).</div>
<script>try{var q=qrcode(0,'M');q.addData(document.getElementById('u').textContent);q.make();document.getElementById('q').innerHTML=q.createSvgTag(4,16).replace(/width="[^"]*"/,'width="100%"').replace(/height="[^"]*"/,'height="100%"');}catch(e){}</script>
</body></html>`;
}

http.createServer((req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    let caminho = decodeURIComponent(req.url.split('?')[0]);
    if (caminho === '/_telemovel') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(paginaTelemovel()); }
    if (caminho === '/') caminho = '/entrada.html';
    const partes = caminho.split('/').filter(Boolean);
    if (partes.some(p => p === '..' || p.startsWith('.') || p === 'node_modules')) { res.writeHead(404); return res.end(); }
    const ficheiro = path.resolve(RAIZ, '.' + path.sep + partes.join(path.sep));
    if (!ficheiro.startsWith(RAIZ) || !fs.existsSync(ficheiro) || !fs.statSync(ficheiro).isFile()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(ficheiro).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(ficheiro).pipe(res);
  } catch (e) { res.writeHead(500); res.end(); }
}).listen(PORTA, '0.0.0.0', () => {
  console.log('Servidor para o telemóvel ligado na porta ' + PORTA + '.');
  const e = enderecos();
  if (e.length) console.log('Endereço no telemóvel: http://' + e[0].ip + ':' + PORTA + '/gestao_materiais_catenaria.html?modo=operador');
  console.log('Não feches esta janela enquanto estiveres a experimentar.');
});
