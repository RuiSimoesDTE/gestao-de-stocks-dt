/* Service worker da aplicação de catenária.
   Regra: os DADOS nunca vêm da cache — só os ficheiros fixos (ícones, módulos).
   Assim ninguém trabalha sobre stock desatualizado sem dar por isso. */

const CACHE = 'catenaria-estatico-v1';
const FIXOS = [
  '/manifest.webmanifest',
  '/icone-192.png',
  '/icone-512.png',
  '/logo_dte_dst.png',
  '/modulos/pendulagem.html',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FIXOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ns => Promise.all(ns.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API e página principal: sempre do servidor. Nunca servir dados de stock em cache.
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname === '/') return;

  // Ficheiros fixos: da cache, com atualização em segundo plano.
  e.respondWith(
    caches.match(e.request).then(guardado => {
      const rede = fetch(e.request).then(resp => {
        if (resp && resp.ok && resp.type === 'basic') {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return resp;
      }).catch(() => guardado);
      return guardado || rede;
    })
  );
});
