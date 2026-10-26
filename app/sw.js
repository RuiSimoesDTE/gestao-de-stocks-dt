/* Service worker — Gestão de Materiais de Catenária (DTE)
   Objetivo: a aplicação abre e funciona sem rede. Os dados continuam no localStorage do
   navegador (o service worker nunca lhes toca); isto só guarda os FICHEIROS da aplicação.

   Estratégias:
   - a página principal (HTML, 2,8 MB, com os dados embebidos): rede primeiro, com 4 s de espera;
     se não houver rede (ou o servidor local estiver desligado), usa a cópia guardada;
   - ficheiros da própria aplicação (ícones, logótipo, módulos, scripts): cópia guardada primeiro e
     atualização em segundo plano;
   - PDFs (guias, cadernos): ficam guardados só depois de abertos uma vez;
   - bibliotecas externas (xlsx no cdnjs): ficam guardadas depois da primeira vez;
   - tudo o que não é GET, e pedidos por partes (range) de PDFs, passam direto, sem guardar.
   Para forçar uma limpeza total da cópia guardada, aumentar VERSAO. */
const VERSAO = '2026-10-14-08-catenaria-logo';
const CACHE_APP = 'dte-catenaria-app-' + VERSAO;
const CACHE_EXTRA = 'dte-catenaria-extra-v1';   // PDFs e bibliotecas: sobrevive às versões da aplicação
const PAGINA = './gestao_materiais_catenaria.html';
const PRE_CACHE = [
  PAGINA, './entrada.html', './manifest.webmanifest', './manifest-operador.webmanifest', '../recursos/logo_dte.png',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png',
  './modulos/pendulagem.html', './projeto_vendas_novas/V09_IFTE_PDes/postes_paginas.js', './access-config.json'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE_APP);
    /* um ficheiro em falta não pode impedir a instalação: guarda-se o que existir */
    await Promise.all(PRE_CACHE.map(async u => { try { const r = await fetch(new Request(u, { cache: 'reload' })); if (r.ok) await c.put(u, r); } catch (_) {} }));
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('dte-catenaria-app-') && k !== CACHE_APP) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'ATUALIZAR_AGORA') self.skipWaiting(); });

const comTempo = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('tempo esgotado')), ms))]);
const eHtml = r => /text\/html/i.test((r.headers.get('content-type') || ''));

async function paginaRedePrimeiro(req) {
  const c = await caches.open(CACHE_APP);
  try {
    const r = await comTempo(fetch(req), 4000);
    if (r && r.ok && eHtml(r)) { c.put(PAGINA, r.clone()); return r; }     // só guarda se for mesmo a página
    throw new Error('resposta inesperada ' + (r && r.status));
  } catch (_) {
    const guardada = await c.match(PAGINA, { ignoreSearch: true });
    return guardada || new Response('<!doctype html><meta charset="utf-8"><title>Sem ligação</title><body style="font-family:Segoe UI,sans-serif;padding:32px"><h2>Sem ligação e sem cópia guardada</h2><p>Abre uma vez a aplicação com ligação (ou com o servidor local ligado) para ela ficar guardada neste computador.</p>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function guardadoPrimeiro(req, nomeCache) {
  const c = await caches.open(nomeCache);
  const guardado = await c.match(req, { ignoreSearch: true });
  const rede = fetch(req).then(r => { if (r && r.status === 200 && (r.type === 'basic' || r.type === 'cors' || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => null);
  return guardado || (await rede) || new Response('', { status: 504 });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;       // POST, PDFs em partes, etc.: passam direto
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    const raiz = new URL('./', self.location).pathname;
    /* só a página principal tem tratamento de "página": PDFs e iframes (ex.: Pendulagem) seguem o seu caminho */
    if (url.pathname === raiz || url.pathname === new URL(PAGINA, self.location).pathname) { e.respondWith(paginaRedePrimeiro(req)); return; }
    if (/\.pdf$/i.test(url.pathname)) { e.respondWith(guardadoPrimeiro(req, CACHE_EXTRA)); return; }
    e.respondWith(guardadoPrimeiro(req, CACHE_APP)); return;
  }
  if (/(^|\.)cdnjs\.cloudflare\.com$/.test(url.hostname)) { e.respondWith(guardadoPrimeiro(req, CACHE_EXTRA)); }   // xlsx e afins
  /* outros endereços externos (ex.: outlook.office.com abre-se numa janela à parte): não são interceptados */
});

