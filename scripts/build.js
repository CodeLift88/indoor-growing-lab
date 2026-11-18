#!/usr/bin/env node
/* ==========================================================================
   Gera as páginas estáticas dos guias a partir de data.js.
   Uso:  node scripts/build.js
   Saída: guias/<id>.html, privacidade.html, sitemap.xml, robots.txt
   Sem dependências. Rode de novo sempre que editar um guia em data.js.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://codelift88.github.io/indoor-growing-lab/';
const UPDATED = 'nov. 2026';
const MODIFIED = '2026-11-18';
const REPO = 'https://github.com/CodeLift88/indoor-growing-lab';

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
    .replace(/href="#([a-z-]+)"/g, (m, k) => `href="../${D.routes[k] || 'index.html#' + k}"`)
    .replace(/href="guia:([a-z0-9-]+)"/g, 'href="$1.html"')
    .replace(/\s+data-close/g, '');
}

const ext = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>';
const leaf = '<svg class="wordmark__leaf" viewBox="5 6 90 90" aria-hidden="true"><path d="M29.8 73.2H70.2L72.6 77.2C74 79.6 74.6 81.6 74.6 84C74.6 88.4 71 91.8 66.4 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2Z" fill="#d4f25a"/><path d="M40.8 47C40.8 44.5 37.4 44 37.4 40.5C37.4 38.5 38.8 37.3 41 37.3H59.4C61.6 37.3 63 38.5 63 40.5C63 44 59.6 44.5 59.6 47V54.6L73 77.2C74.4 79.6 75 81.6 75 84C75 88.4 71.4 91.8 66.8 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2L40.8 54.6Z" fill="none" stroke="currentColor" stroke-width="5.6" stroke-linejoin="round"/><path d="M50.2 26.8C49.6 21 47 15 42 11.5C37.5 8.6 31 8.6 27.2 9.4C26 9.7 25.8 10.8 26 12.2C26.6 18 30 24 36 26.8C39.5 28.3 43 27.6 45.5 28.6C47.2 29.4 47.8 31 47.8 33V73.2H52.6V33.4C52.6 31.4 53.8 29.9 56.5 29.7C60 29.4 64.5 29.4 68.4 26.4C71.6 24 73.4 19 73.6 14.6C73.7 13.4 73 12.7 72 12.6C67.5 12 61 12.4 56.5 15.4C52.6 18 50.6 22.4 50.2 26.8Z" fill="currentColor"/></svg>';

function related(g) {
  const same = D.guides.filter(x => x.id !== g.id && x.cluster === g.cluster);
  const rest = D.guides.filter(x => x.id !== g.id && x.cluster !== g.cluster);
  return same.concat(rest).slice(0, 3);
}

// moldura comum: head, cabeçalho e rodapé. base = '../' dentro de guias/, '' na raiz
function shell({ base, file, title, desc, img, type, current, main, scripts = [], ld = null, noGuide = false, mainClass = 'article' }) {
  const url = SITE + file;
  const nav = [['ciclo', 'O ciclo'], ['ferramentas', 'Ferramentas'], ['diagnostico', 'Diagnóstico'], ['equipamentos', 'Equipamentos'], ['guias', 'Guias'], ['diario', 'Meu diário']];
  const navHref = id => base + (D.routes[id] || `index.html#${id}`);
  const foot = [['ciclo', 'O ciclo'], ['kit', 'Espaço'], ['luz', 'Luz'], ['clima', 'Clima'], ['ar', 'Exaustão'], ['energia', 'Calendário e conta'], ['diagnostico', 'Diagnóstico'], ['equipamentos', 'Equipamentos'], ['guias', 'Manual do Grow']];
  const footHref = id => base + (D.routes[id] || `index.html#${id}`);
  return `<!DOCTYPE html>
<html lang="pt-BR" class="no-js" data-level="1">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} · Growmetria</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Growmetria" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}assets/og/${img}.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#f3f4ee" />
  ${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}
  <link rel="icon" type="image/svg+xml" href="${base}assets/logo-mark.svg" />
  <link rel="manifest" href="${base}manifest.webmanifest" />
  <link rel="apple-touch-icon" href="${base}assets/icons/icon-180.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Martian+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}styles.css" />
  <script>
    document.documentElement.classList.replace('no-js', 'js');
    try {
      var t = localStorage.getItem('igl-theme'); if (t) document.documentElement.dataset.theme = t;
      var l = localStorage.getItem('igl-level'); if (l) document.documentElement.dataset.level = l;
      if (localStorage.getItem('igl-age') !== '1') document.documentElement.classList.add('age-gate');
    } catch (e) { document.documentElement.classList.add('age-gate'); }
  </script>
</head>
<body class="page-guide">

<a class="skip" href="#artigo">Pular para o conteúdo</a>

<header class="masthead" id="masthead">
  <a class="wordmark" href="${base}index.html" aria-label="Growmetria, início">${leaf}<span>Grow<em>metria</em></span></a>
  <nav class="masthead__nav" id="main-nav" aria-label="Seções">
    ${nav.map(([id, label]) => `<a href="${navHref(id)}" class="${[id === 'diario' ? 'nav-diary' : '', id === current ? 'is-current' : ''].join(' ').trim()}">${label}</a>`).join('\n    ')}
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

<main class="${mainClass}" id="artigo">
${main}
</main>

<footer class="foot">
  <div class="foot__legal">
    <p><strong>Conteúdo informativo e de redução de danos, para maiores de 18 anos.</strong> No Brasil, cultivar cannabis sem autorização ainda é ilegal. Desde 2024 o STF trata o cultivo para uso pessoal (até 6 plantas fêmeas) como infração administrativa, não como crime. Consulte a legislação do seu país antes de qualquer coisa.</p>
    <p class="foot__links"><a href="${base}diario.html">Meu diário</a> · <a href="${base}sobre.html">Quem somos</a> · <a href="${base}privacidade.html">Privacidade e contato</a></p>
  </div>
  <nav class="foot__nav" aria-label="Atalhos">
    ${foot.map(([id, label]) => `<a href="${footHref(id)}">${label}</a>`).join('\n    ')}
  </nav>
  <p class="foot__mark">Grow<em>metria</em></p>
</footer>

${scripts.map(src => `<script src="${base}${src}"></script>`).join('\n')}
<script src="${base}glossary.js"></script>
<script src="${base}age.js"></script>
${noGuide ? '' : `<script src="${base}guide.js"></script>`}
</body>
</html>
`;
}

function page(g) {
  const n = String(D.guides.indexOf(g) + 1).padStart(2, '0');
  const hw = D.hardware.find(h => h.id === g.hw);
  const more = related(g);
  const main = `  <nav class="crumbs" aria-label="Você está em"><a href="../index.html#guias">Manual do Grow</a><span aria-hidden="true">/</span><span>${esc(g.clusterLabel)}</span></nav>

  <header class="article__head">
    <p class="kicker">Guia ${n} · ${esc(g.readTime)} de leitura</p>
    <h1 class="article__title">${esc(g.title)}</h1>
    <p class="article__lead">${esc(g.excerpt)}</p>
    <p class="byline">Por <a href="../sobre.html">Equipe Growmetria</a> · revisado em ${UPDATED}</p>
  </header>

  <div class="article__grid">
    <div class="article__body">
      <p class="tldr"><span class="tldr__k">Resumo</span>${esc(g.summary)}</p>
      <div class="prose">${fixLinks(g.html)}</div>
    </div>

    <aside class="article__aside">
      ${g.calc ? `<a class="aside-card aside-card--calc" href="../${D.routes[g.calc.href.slice(1)] || 'index.html' + g.calc.href}">
        <span class="kicker">Faça a conta</span>
        <span class="aside-card__title">${esc(g.calc.label)} <span aria-hidden="true">→</span></span>
        <span class="aside-card__desc">Coloque os números do seu grow e veja o resultado na hora.</span>
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
  </section>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: g.title, description: g.excerpt, inLanguage: 'pt-BR',
    image: `${SITE}assets/og/${g.id}.png`, mainEntityOfPage: `${SITE}guias/${g.id}.html`,
    dateModified: MODIFIED,
    author: { '@type': 'Organization', name: 'Equipe Growmetria', url: `${SITE}sobre.html` },
    publisher: { '@type': 'Organization', name: 'Growmetria', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}assets/icons/icon-512.png` } }
  };
  return shell({ base: '../', file: `guias/${g.id}.html`, title: g.title, desc: g.excerpt, img: g.id, type: 'article', current: 'guias', main, ld });
}


/* Diário de cultivo: a página é estática; diario.js faz o resto no navegador */
function diaryPage() {
  const main = `  <header class="article__head">
    <p class="kicker">Ferramenta · fica só no seu navegador</p>
    <h1 class="article__title">Diário de cultivo</h1>
    <p class="article__lead">Fotografe a planta, anote regas, adubo e medições. Cada registro guarda o dia do cultivo e a fase, e as fotos viram uma linha do tempo do grão à colheita.</p>
  </header>

  <section class="dstat" id="dstat" aria-label="Resumo do cultivo" aria-live="polite"></section>

  <div class="dart-cta">
    <div>
      <p class="dart-cta__t">Arte do meu grow</p>
      <p class="dart-cta__s">Uma imagem com o dia, a fase, a foto mais recente e os números do seu grow, pronta para o story ou o feed.</p>
    </div>
    <button type="button" class="btn btn--primary" id="d-art">Gerar arte</button>
  </div>

  <div class="diary">
    <form class="dform" id="dform" autocomplete="off">
      <p class="ctl__label">Nova anotação</p>
      <div class="dtypes" id="dtypes" role="radiogroup" aria-label="Tipo de anotação"></div>
      <div class="dphoto">
        <label class="dphoto__pick" id="dphoto-pick">
          <input type="file" id="d-photo" accept="image/*" />
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.4-2h6.2L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.5" r="3.5"/></svg>
          <span><b>Adicionar foto</b><small>Câmera ou galeria</small></span>
        </label>
        <figure class="dphoto__prev" id="dphoto-prev" hidden>
          <img id="dphoto-img" alt="Prévia da foto" />
          <figcaption id="dphoto-size"></figcaption>
          <button type="button" id="dphoto-del" aria-label="Remover foto">×</button>
        </figure>
        <p class="dphoto__note">A foto fica só no seu aparelho. Ao salvar, apagamos a localização gravada na imagem.</p>
      </div>
      <div class="dwhen">
        <label class="dfield"><span class="ctl__label">Data</span><input type="date" id="d-date" class="date" /></label>
        <p class="dctx" id="d-ctx" aria-live="polite"></p>
      </div>
      <label class="dfield"><span class="ctl__label">O que aconteceu</span>
        <textarea id="d-note" rows="3" maxlength="2000" placeholder="Ex.: 1,5 L de água, escorreu um pouco pelo fundo."></textarea></label>
      <details class="dmeasure" id="d-measure">
        <summary>Medições <span>opcional</span></summary>
        <div class="dmgrid" id="d-mgrid"></div>
        <p class="dvpd" id="d-vpd" hidden></p>
      </details>
      <button type="submit" class="btn btn--primary dsave">Salvar no diário</button>
    </form>

    <div class="dlog">
      <section class="dgallery" id="dgallery" hidden aria-labelledby="dgallery-t">
        <div class="dgallery__head"><p class="ctl__label" id="dgallery-t">Linha do tempo</p><p class="dgallery__cap" id="dgallery-cap"></p></div>
        <div class="dgallery__strip" id="dgallery-strip"></div>
      </section>
      <figure class="dchart" id="dchart" hidden>
        <p class="ctl__label">Crescimento</p>
        <svg viewBox="0 0 560 160" id="dchart-svg" role="img" aria-labelledby="dchart-cap"></svg>
        <figcaption id="dchart-cap"></figcaption>
      </figure>
      <div class="dlog__head">
        <p class="ctl__label">Histórico</p>
        <div class="pills" id="dfilter" role="group" aria-label="Filtrar por tipo"></div>
      </div>
      <ol class="dlist" id="dlist"></ol>
      <p class="empty" id="dempty"></p>
    </div>
  </div>

  <section class="dtools" aria-labelledby="dtools-title">
    <h2 class="ctl__label" id="dtools-title">Seus dados</h2>
    <p>O diário e as fotos ficam salvos apenas neste navegador, nada vai para a internet. Se limpar os dados do navegador ou trocar de celular, eles somem. Baixe uma cópia de vez em quando: ela inclui as fotos.</p>
    <div class="dtools__btns">
      <button type="button" class="btn" id="d-export">Baixar cópia</button>
      <label class="btn dtools__file">Restaurar cópia<input type="file" id="d-import" accept="application/json,.json" /></label>
      <button type="button" class="btn dtools__danger" id="d-clear">Apagar tudo</button>
    </div>
    <p class="dtools__more">A data de início e o tipo de planta vêm do <a href="calculadoras/calendario.html">calendário</a>.</p>
  </section>

  <dialog class="dview" id="dview" aria-labelledby="dview-t">
    <div class="dview__top">
      <span class="dview__n" id="dview-n"></span>
      <button type="button" class="dview__x" id="dview-close" aria-label="Fechar">×</button>
    </div>
    <div class="dview__stage">
      <button type="button" class="dview__nav" id="dview-prev" aria-label="Foto anterior">←</button>
      <img id="dview-img" alt="" />
      <button type="button" class="dview__nav" id="dview-next" aria-label="Próxima foto">→</button>
    </div>
    <div class="dview__info">
      <p class="dview__ctx" id="dview-ctx"></p>
      <h2 class="dview__t" id="dview-t"></h2>
      <p class="dview__note" id="dview-note"></p>
      <div id="dview-m"></div>
      <div class="dview__btns">
        <button type="button" class="btn dview__art" id="dview-art">Gerar arte</button>
        <button type="button" class="btn dview__save" id="dview-save">Baixar foto</button>
      </div>
    </div>
  </dialog>

  <dialog class="dart" id="dart" aria-labelledby="dart-t">
    <div class="dview__top">
      <h2 class="dart__t" id="dart-t">Arte do meu grow</h2>
      <button type="button" class="dview__x" id="dart-close" aria-label="Fechar">×</button>
    </div>
    <div class="dart__fmt" id="dart-fmt" role="group" aria-label="Formato">
      <button type="button" data-fmt="story" aria-pressed="true">Story 9:16</button>
      <button type="button" data-fmt="feed" aria-pressed="false">Feed 4:5</button>
    </div>
    <div class="dart__stage"><img id="dart-img" alt="Prévia da arte com os dados do seu grow" /></div>
    <p class="dart__note">Confira antes de postar: a arte não mostra endereço nem localização, mas o fundo da foto pode mostrar.</p>
    <div class="dart__btns">
      <button type="button" class="btn btn--primary" id="dart-share" hidden>Compartilhar</button>
      <button type="button" class="btn" id="dart-save">Baixar arte</button>
    </div>
  </dialog>`;
  return shell({ base: '', file: 'diario.html', title: 'Diário de cultivo', desc: 'Fotos, regas, adubo e medições do seu cultivo, com o dia e a fase de cada registro. Grátis, sem cadastro, salvo só no seu aparelho.', img: 'diario', type: 'website', current: 'diario', main, scripts: ['data.js', 'plan.js', 'diario.js'] });
}



/* Páginas das ferramentas: o trecho de partials/ dentro da moldura comum */
const PARTIALS = path.join(ROOT, 'partials');
const partial = (name, base) => fs.readFileSync(path.join(PARTIALS, `${name}.html`), 'utf8').replace(/\{\{base\}\}/g, base);
const LEVELS = [['1', 'Iniciante'], ['2', 'Intermediário'], ['3', 'Avançado']];

function toolPage(t, opts = {}) {
  const base = '../'.repeat(t.file.split('/').length - 1);
  const list = D.tools;
  const i = list.indexOf(t);
  const prev = i > 0 ? list[i - 1] : null;
  const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
  const card = (x, dir) => x ? `<a class="tool-next__card" href="${base}${x.file}"><span class="kicker">${dir}</span><span class="tool-next__name">${esc(x.name)}</span><span class="tool-next__q">${esc(x.q)}</span></a>` : '<span></span>';
  const main = `  <div class="tool-top">
    <nav class="crumbs" aria-label="Você está em"><a href="${base}index.html#ferramentas">Ferramentas</a><span aria-hidden="true">/</span><span>${esc(t.name)}</span></nav>
    <fieldset class="lvl-switch">
      <legend class="sr-only">Nível de detalhe</legend>
      <span class="lvl-switch__k" aria-hidden="true">Detalhe:</span>
      ${LEVELS.map(([v, l]) => `<label><input type="radio" name="level" value="${v}"${v === '1' ? ' checked' : ''} /><span>${l}</span></label>`).join('')}
    </fieldset>
  </div>
${partial(t.partial, base).replace(/<h2 class="sec-head__title"([^>]*)>([\s\S]*?)<\/h2>/, '<h1 class="sec-head__title"$1>$2</h1>')}
  ${opts.noNext ? '' : `<nav class="tool-next" aria-label="Outras ferramentas">
    ${card(prev, '← Anterior')}
    <a class="tool-next__all" href="${base}index.html#ferramentas">Todas as ferramentas</a>
    ${card(next, 'Próxima →')}
  </nav>`}
${opts.noSetup ? '' : partial('setup', base)}
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  return shell({ base, file: t.file, title: t.title, desc: t.desc, img: `tool-${t.id}`, type: 'website',
    current: opts.current || (t.id === 'diagnostico' ? 'diagnostico' : 'ferramentas'),
    main, scripts: ['data.js', 'plan.js', 'app.js'], noGuide: true, mainClass: 'tool-page' });
}

/* Quem somos */
function aboutPage() {
  const main = `  <header class="article__head">
    <p class="kicker">Quem somos</p>
    <h1 class="article__title">Equipe Growmetria</h1>
    <p class="article__lead">Somos apaixonados pela cultura, pela planta e pelos benefícios que ela pode trazer à saúde de quem precisa. Este site é o guia que gostaríamos de ter tido no primeiro cultivo.</p>
  </header>

  <div class="article__grid">
    <div class="article__body">
      <div class="prose">
        <h3>Por que fazemos isso</h3>
        <p>A cannabis tem uma história longa com as pessoas, e ganha cada vez mais espaço na pesquisa científica e no cuidado com a saúde. Mesmo assim, quem quer aprender a cultivar ainda encontra pouca informação clara em português, muito mito e muita venda disfarçada de conselho.</p>
        <p>Queremos mudar isso com <strong>respostas diretas para quem nunca plantou</strong> e <strong>as contas à mostra para quem já planta</strong>.</p>

        <h3>Como trabalhamos</h3>
        <ul>
          <li><strong>Números reais.</strong> As calculadoras usam dados de fabricantes e estudos de horticultura, e as fórmulas ficam abertas em “Ver a matemática”, com as fontes citadas.</li>
          <li><strong>Linguagem de gente.</strong> Cada guia explica o que fazer e por quê, sem sigla quando não precisa.</li>
          <li><strong>Revisão constante.</strong> Cada guia mostra quando foi revisado pela última vez. Achou um erro? Fale com a gente.</li>
          <li><strong>Indicação antes de comissão.</strong> Quando um link for de afiliado, ele fica marcado, e a comissão nunca muda o que indicamos.</li>
        </ul>

        <h3>Saúde em primeiro lugar</h3>
        <p>Acreditamos no potencial da planta para quem precisa dela, e por isso levamos o assunto a sério: <strong>nada aqui substitui a orientação de um médico.</strong> No Brasil, o uso medicinal da cannabis depende de prescrição médica e de produtos autorizados pela Anvisa. Se você busca tratamento, comece por um profissional de saúde.</p>

        <h3>O que não fazemos</h3>
        <ul>
          <li>Não vendemos nem indicamos onde comprar sementes.</li>
          <li>Não incentivamos nada que vá contra a lei. O conteúdo é informativo e de redução de danos, para maiores de 18 anos.</li>
          <li>Não coletamos seus dados. Veja a <a href="privacidade.html">página de privacidade</a>.</li>
        </ul>

        <h3>Fale com a gente</h3>
        <p>Dúvidas, correções ou sugestões de guia: abra uma <a href="${REPO}/issues" target="_blank" rel="noopener">conversa no GitHub</a>. É público, então não inclua informações pessoais.</p>
      </div>
    </div>
    <aside class="article__aside">
      <div class="aside-card">
        <span class="kicker">Em uma linha</span>
        <span class="aside-card__title">Cultivo com informação, não com chute.</span>
        <span class="aside-card__desc">Feito por quem gosta da planta, para quem quer cultivar bem.</span>
      </div>
      <a class="aside-card aside-card--calc" href="index.html#guias">
        <span class="kicker">Comece por aqui</span>
        <span class="aside-card__title">Manual do Grow <span aria-hidden="true">→</span></span>
        <span class="aside-card__desc">Leituras curtas, do grão à colheita.</span>
      </a>
    </aside>
  </div>`;
  return shell({ base: '', file: 'sobre.html', title: 'Quem somos', desc: 'A equipe do Growmetria: apaixonados pela cultura, pela planta e pelos benefícios que ela pode trazer à saúde de quem precisa.', img: 'home', type: 'website', current: '', main });
}

/* Página de privacidade e contato. Mantenha fiel ao que o site realmente faz. */
function privacyPage() {
  const main = `  <header class="article__head">
    <p class="kicker">Atualizada em ${UPDATED}</p>
    <h1 class="article__title">Privacidade e contato</h1>
    <p class="article__lead">Resumo: o site não tem cadastro, não usa cookies próprios e não coleta seus dados. O que você escolhe nas calculadoras fica só no seu navegador.</p>
  </header>

  <div class="article__grid">
    <div class="article__body">
      <div class="prose">
        <h3>1. O que o site guarda, e onde</h3>
        <p>Para lembrar suas escolhas entre uma visita e outra, o site usa o <strong>armazenamento local do seu navegador</strong> (localStorage). Nada disso é enviado para nenhum servidor:</p>
        <table>
          <thead><tr><th>O que</th><th>Para quê</th></tr></thead>
          <tbody>
            <tr><td>Nível de leitura</td><td>Mostrar mais ou menos detalhe técnico.</td></tr>
            <tr><td>Tema claro ou escuro</td><td>Abrir o site do jeito que você deixou.</td></tr>
            <tr><td>Tipo de planta</td><td>Ajustar luz e calendário para auto ou fotoperiódica.</td></tr>
            <tr><td>Data de início do cultivo</td><td>Montar o seu calendário.</td></tr>
            <tr><td>Itens marcados na lista do primeiro cultivo</td><td>Lembrar o que você já tem.</td></tr>
            <tr><td>Anotações do diário de cultivo</td><td>Mostrar seu histórico. Você pode baixar uma cópia ou apagar tudo na própria página do diário.</td></tr>
          </tbody>
        </table>
        <p>Para apagar tudo, limpe os dados deste site nas configurações do navegador.</p>

        <h3>2. O que não fazemos</h3>
        <ul>
          <li>Não há cadastro, login nem formulário.</li>
          <li>Não usamos ferramentas de estatística de visitas nem anúncios.</li>
          <li>O modo app (instalar na tela inicial) só guarda uma cópia das páginas no seu aparelho para abrir sem internet.</li>
          <li>Não vendemos nem compartilhamos dados, porque não coletamos nenhum.</li>
        </ul>

        <h3>3. Serviços de terceiros</h3>
        <ul>
          <li><strong>GitHub Pages</strong> hospeda o site. Como qualquer servidor, o GitHub registra dados técnicos de acesso, como o endereço IP, por segurança. Veja a <a href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">política de privacidade do GitHub</a>.</li>
          <li><strong>Google Fonts</strong> fornece as fontes do site. Ao carregar a página, seu navegador faz um pedido aos servidores do Google. Veja a <a href="https://policies.google.com/privacy?hl=pt-BR" target="_blank" rel="noopener">política de privacidade do Google</a>.</li>
          <li><strong>Lojas</strong>: ao clicar num link de loja, você sai deste site e passa a seguir a política daquela loja. Links de afiliado, quando existirem, ficam marcados com ✦ e podem fazer a loja registrar que você veio daqui.</li>
        </ul>

        <h3>4. Seus direitos</h3>
        <p>Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir informações sobre qualquer tratamento dos seus dados. Como o site não guarda dados pessoais em servidor, não há o que consultar ou apagar do nosso lado. Os dados locais você controla direto no navegador.</p>

        <h3>5. Contato</h3>
        <p>Dúvidas, correções nos guias ou sugestões de conteúdo: abra uma <a href="${REPO}/issues" target="_blank" rel="noopener">conversa no GitHub</a>. É público, então não inclua informações pessoais.</p>
      </div>
    </div>
    <aside class="article__aside">
      <div class="aside-card">
        <span class="kicker">Em uma linha</span>
        <span class="aside-card__title">Sem cadastro, sem rastreio.</span>
        <span class="aside-card__desc">Suas escolhas ficam só no seu navegador.</span>
      </div>
    </aside>
  </div>`;
  return shell({ base: '', file: 'privacidade.html', title: 'Privacidade e contato', desc: 'O Growmetria não tem cadastro, não usa cookies próprios e não coleta dados pessoais.', img: 'home', type: 'website', current: '', main });
}

fs.mkdirSync(path.join(ROOT, 'guias'), { recursive: true });
D.guides.forEach(g => fs.writeFileSync(path.join(ROOT, 'guias', `${g.id}.html`), page(g)));

fs.writeFileSync(path.join(ROOT, 'privacidade.html'), privacyPage());
fs.writeFileSync(path.join(ROOT, 'diario.html'), diaryPage());
fs.writeFileSync(path.join(ROOT, 'sobre.html'), aboutPage());
fs.mkdirSync(path.join(ROOT, 'calculadoras'), { recursive: true });
D.tools.forEach(t => fs.writeFileSync(path.join(ROOT, t.file), toolPage(t)));
D.pages.forEach(p => fs.writeFileSync(path.join(ROOT, p.file), toolPage(p, { noNext: true, noSetup: true, current: p.current })));

const urls = [SITE, ...D.tools.map(t => SITE + t.file), ...D.pages.map(p => SITE + p.file), ...D.guides.map(g => `${SITE}guias/${g.id}.html`), `${SITE}diario.html`, `${SITE}sobre.html`, `${SITE}privacidade.html`];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log(`${D.tools.length} ferramentas, ${D.pages.length} página(s) extra, ${D.guides.length} guias, diario.html, sobre.html, privacidade.html, sitemap.xml e robots.txt atualizados.`);
