/* Indoor Growing Lab — páginas de guia: tema e menu */
(() => {
  'use strict';

  // modo app: funciona offline depois da primeira visita (só em http/https)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const swUrl = new URL('sw.js', document.currentScript ? document.currentScript.src : location.href);
    addEventListener('load', () => navigator.serviceWorker.register(swUrl).catch(() => {}));
  }
  const root = document.documentElement;
  const btn = document.getElementById('theme-btn');
  const meta = document.querySelector('meta[name="theme-color"]');

  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-checked', String(dark));
    btn.title = dark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro';
    if (meta) meta.setAttribute('content', dark ? '#14160f' : '#f3f4ee');
  };
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-anim');
    root.dataset.theme = next;
    try { localStorage.setItem('igl-theme', next); } catch (e) { /* sem armazenamento */ }
    sync();
    setTimeout(() => root.classList.remove('theme-anim'), 500);
  });
  sync();

  const head = document.getElementById('masthead');
  const menu = document.getElementById('menu-btn');
  const close = () => { head.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(head.classList.toggle('menu-open'))));
  document.querySelectorAll('#main-nav a').forEach(a => a.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
