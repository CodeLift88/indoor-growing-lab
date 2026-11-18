/* ==========================================================================
   Growmetria — modo app (service worker)
   Rede primeiro para tudo do site: quem está online sempre vê a versão nova.
   Sem internet, usa a última cópia guardada. Fontes do Google: cache primeiro.
   ========================================================================== */
const CACHE = 'igl-v9';
const CORE = ['./', 'index.html', 'styles.css', 'app.js', 'data.js', 'plan.js', 'glossary.js', 'guide.js', 'age.js',
  'diario.html', 'diario.js', 'privacidade.html', 'diagnostico.html', 'equipamentos.html',
  'calculadoras/espaco.html', 'calculadoras/luz.html', 'calculadoras/clima.html', 'calculadoras/exaustao.html',
  'calculadoras/calendario.html', 'assets/logo-mark.svg', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;

  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
});
