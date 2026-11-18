#!/usr/bin/env node
/* ==========================================================================
   Gera as páginas estáticas dos guias a partir de data.js.
   Uso:  node scripts/build.js
   Saída: guias/<id>.html, sitemap.xml, robots.txt
   Sem dependências. Rode de novo sempre que editar um guia em data.js.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://codelift88.github.io/indoor-growing-lab/';
const UPDATED = 'nov. 2026';

// carrega data.js como no navegador
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), sandbox);
const D = sandbox.window.IGL_DATA;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// tabelas: cada célula ganha o rótulo da coluna, para virar cartão no celular
function labelTables(html) {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (table, inner) => {
    const heads = [...inner.matchAll(/<th>(.*?)<\/th>/g)].map(m => m[1].replace(/<[^>]+>/g, ''));
    let col = 0;
    const body = inner.replace(/<tr>|<td>/g, tag => {
      if (tag === '<tr>') { col = 0; return tag; }
      return `<td data-label="${esc(heads[col++] || '')}">`;
    });
    return `<table>${body}</table>`;
  });
}

// links internos do conteúdo: "#clima" vira a calculadora na home, "guia:rega" vira outro guia
function fixLinks(html) {
  return labelTables(html)
    .replace(/href="#([a-z-]+)"/g, 'href="../index.html#$1"')
    .replace(/href="guia:([a-z0-9-]+)"/g, 'href="$1.html"')
    .replace(/\s+data-close/g, '');
}

const ext = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>';
const leaf = '<svg class="wordmark__leaf" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22V9M12 9C12 5 9 2.5 6.5 2c-.3 3 .8 6.2 5.5 7Zm0 0c0-4 3-6.5 5.5-7 .3 3-.8 6.2-5.5 7Zm0 4.5C9.5 10 6 9.5 3.5 10.5c1 2.6 4.4 4.3 8.5 3m0 0c2.5-3.5 6-4 8.5-3-1 2.6-4.4 4.3-8.5 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function related(g) {
  const same = D.guides.filter(x => x.id !== g.id && x.cluster === g.cluster);
  const rest = D.guides.filter(x => x.id !== g.id && x.cluster !== g.cluster);
  return same.concat(rest).slice(0, 3);
}

function page(g) {
  const n = String(D.guides.indexOf(g) + 1).padStart(2, '0');
  const url = `${SITE}guias/${g.id}.html`;
  const img = `${SITE}assets/og/${g.id}.png`;
  const hw = D.hardware.find(h => h.id === g.hw);
  const more = related(g);

  return `<!DOCTYPE html>
<html lang="pt-BR" class="no-js">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(g.title)} · Indoor Growing Lab</title>
  <meta name="description" content="${esc(g.excerpt)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Indoor Growing Lab" />
  <meta property="og:title" content="${esc(g.title)}" />
  <meta property="og:description" content="${esc(g.excerpt)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#f2eee4" />
  <link rel="icon" type="image/svg+xml" href="../assets/logo-mark.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Instrument+Sans:wght@400..700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css" />
  <script>
    document.documentElement.classList.replace('no-js', 'js');
    try { var t = localStorage.getItem('igl-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  </script>
</head>
<body class="page-guide">

<a class="skip" href="#artigo">Pular para o conteúdo</a>

<header class="masthead" id="masthead">
  <a class="wordmark" href="../index.html" aria-label="Indoor Growing Lab, início">${leaf}<span>Indoor Growing <em>Lab</em></span></a>
  <nav class="masthead__nav" id="main-nav" aria-label="Seções">
    <a href="../index.html#ciclo">O ciclo</a>
    <a href="../index.html#calculadoras">Calculadoras</a>
    <a href="../index.html#diagnostico">Diagnóstico</a>
    <a href="../index.html#equipamentos">Equipamentos</a>
    <a href="../index.html#guias" class="is-current">Guias</a>
  </nav>
  <div class="masthead__tools">
    <button type="button" class="theme-switch" id="theme-btn" role="switch" aria-checked="false" aria-label="Modo escuro" title="Mudar para o modo escuro">
      <span class="theme-switch__thumb" aria-hidden="true"></span>
      <svg class="theme-switch__icon theme-switch__icon--sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></svg>
      <svg class="theme-switch__icon theme-switch__icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
    </button>
    <button type="button" class="icon-btn menu-btn" id="menu-btn" aria-expanded="false" aria-controls="main-nav" aria-label="Abrir menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg>
    </button>
  </div>
</header>

<main class="article" id="artigo">
  <nav class="crumbs" aria-label="Você está em"><a href="../index.html#guias">Guias</a><span aria-hidden="true">/</span><span>${esc(g.clusterLabel)}</span></nav>

  <header class="article__head">
    <p class="kicker">Guia ${n} · ${esc(g.readTime)} de leitura · revisado em ${UPDATED}</p>
    <h1 class="article__title">${esc(g.title)}</h1>
    <p class="article__lead">${esc(g.excerpt)}</p>
  </header>

  <div class="article__grid">
    <div class="article__body">
      <p class="tldr"><span class="tldr__k">Resumo</span>${esc(g.summary)}</p>
      <div class="prose">${fixLinks(g.html)}</div>
    </div>

    <aside class="article__aside">
      ${g.calc ? `<a class="aside-card aside-card--calc" href="../index.html${g.calc.href}">
        <span class="kicker">Faça a conta</span>
        <span class="aside-card__title">${esc(g.calc.label)} <span aria-hidden="true">→</span></span>
        <span class="aside-card__desc">Coloque os números da sua tenda e veja o resultado na hora.</span>
      </a>` : ''}
      ${hw ? `<div class="aside-card">
        <span class="kicker">Equipamento citado</span>
        <span class="aside-card__title">${esc(hw.brand)}</span>
        <span class="aside-card__desc">${esc(hw.model)}. ${esc(hw.why)}</span>
        <a class="btn" href="${esc(hw.officialUrl)}" target="_blank" rel="noopener${hw.officialAffiliate ? ' sponsored' : ''}">Loja oficial ${ext}</a>
      </div>` : ''}
    </aside>
  </div>

  <section class="more" aria-labelledby="more-title">
    <h2 class="kicker" id="more-title">Continue lendo</h2>
    <ol class="guide-list">
      ${more.map(m => `<li class="guide"><a href="${m.id}.html">
        <span class="guide__n">${String(D.guides.indexOf(m) + 1).padStart(2, '0')}</span>
        <span class="guide__title">${esc(m.title)}</span>
        <span class="guide__ex">${esc(m.excerpt)}</span>
        <span class="guide__meta">${esc(m.clusterLabel)} · ${esc(m.readTime)} <span class="guide__arrow" aria-hidden="true">→</span></span>
      </a></li>`).join('\n      ')}
    </ol>
  </section>
</main>

<footer class="foot">
  <div class="foot__legal">
    <p><strong>Conteúdo informativo e de redução de danos, para maiores de 18 anos.</strong> No Brasil, cultivar cannabis sem autorização ainda é ilegal. Desde 2024 o STF trata o cultivo para uso pessoal (até 6 plantas fêmeas) como infração administrativa, não como crime. Consulte a legislação do seu país antes de qualquer coisa.</p>
  </div>
  <nav class="foot__nav" aria-label="Atalhos">
    <a href="../index.html#ciclo">O ciclo</a>
    <a href="../index.html#kit">Espaço</a>
    <a href="../index.html#luz">Luz</a>
    <a href="../index.html#clima">Clima</a>
    <a href="../index.html#ar">Exaustão</a>
    <a href="../index.html#energia">Conta de luz</a>
    <a href="../index.html#diagnostico">Diagnóstico</a>
    <a href="../index.html#equipamentos">Equipamentos</a>
    <a href="../index.html#guias">Guias</a>
  </nav>
  <p class="foot__mark">Indoor Growing <em>Lab</em></p>
</footer>

<script src="../glossary.js"></script>
<script src="../guide.js"></script>
</body>
</html>
`;
}

fs.mkdirSync(path.join(ROOT, 'guias'), { recursive: true });
D.guides.forEach(g => fs.writeFileSync(path.join(ROOT, 'guias', `${g.id}.html`), page(g)));

const urls = [SITE, ...D.guides.map(g => `${SITE}guias/${g.id}.html`)];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log(`${D.guides.length} guias gerados em guias/, sitemap.xml e robots.txt atualizados.`);
