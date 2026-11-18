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

// moldura comum: head, cabeçalho e rodapé. base = '../' dentro de guias/, '' na raiz
function shell({ base, file, title, desc, img, type, current, main, scripts = [] }) {
  const url = SITE + file;
  const nav = [['ciclo', 'O ciclo'], ['calculadoras', 'Calculadoras'], ['diagnostico', 'Diagnóstico'], ['equipamentos', 'Equipamentos'], ['guias', 'Guias'], ['diario', 'Meu diário']];
  const navHref = id => id === 'diario' ? `${base}diario.html` : `${base}index.html#${id}`;
  const foot = [['ciclo', 'O ciclo'], ['kit', 'Espaço'], ['luz', 'Luz'], ['clima', 'Clima'], ['ar', 'Exaustão'], ['energia', 'Calendário e conta'], ['diagnostico', 'Diagnóstico'], ['equipamentos', 'Equipamentos'], ['guias', 'Guias']];
  return `<!DOCTYPE html>
<html lang="pt-BR" class="no-js">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} · Indoor Growing Lab</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Indoor Growing Lab" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}assets/og/${img}.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#f2eee4" />
  <link rel="icon" type="image/svg+xml" href="${base}assets/logo-mark.svg" />
  <link rel="manifest" href="${base}manifest.webmanifest" />
  <link rel="apple-touch-icon" href="${base}assets/icons/icon-180.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Instrument+Sans:wght@400..700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}styles.css" />
  <script>
    document.documentElement.classList.replace('no-js', 'js');
    try { var t = localStorage.getItem('igl-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  </script>
</head>
<body class="page-guide">

<a class="skip" href="#artigo">Pular para o conteúdo</a>

<header class="masthead" id="masthead">
  <a class="wordmark" href="${base}index.html" aria-label="Indoor Growing Lab, início">${leaf}<span>Indoor Growing <em>Lab</em></span></a>
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

<main class="article" id="artigo">
${main}
</main>

<footer class="foot">
  <div class="foot__legal">
    <p><strong>Conteúdo informativo e de redução de danos, para maiores de 18 anos.</strong> No Brasil, cultivar cannabis sem autorização ainda é ilegal. Desde 2024 o STF trata o cultivo para uso pessoal (até 6 plantas fêmeas) como infração administrativa, não como crime. Consulte a legislação do seu país antes de qualquer coisa.</p>
    <p class="foot__links"><a href="${base}diario.html">Meu diário</a> · <a href="${base}privacidade.html">Privacidade e contato</a></p>
  </div>
  <nav class="foot__nav" aria-label="Atalhos">
    ${foot.map(([id, label]) => `<a href="${base}index.html#${id}">${label}</a>`).join('\n    ')}
  </nav>
  <p class="foot__mark">Indoor Growing <em>Lab</em></p>
</footer>

<script src="${base}glossary.js"></script>
<script src="${base}guide.js"></script>
${scripts.map(src => `<script src="${base}${src}"></script>`).join('\n')}
</body>
</html>
`;
}

function page(g) {
  const n = String(D.guides.indexOf(g) + 1).padStart(2, '0');
  const hw = D.hardware.find(h => h.id === g.hw);
  const more = related(g);
  const main = `  <nav class="crumbs" aria-label="Você está em"><a href="../index.html#guias">Guias</a><span aria-hidden="true">/</span><span>${esc(g.clusterLabel)}</span></nav>

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
  return shell({ base: '../', file: `guias/${g.id}.html`, title: g.title, desc: g.excerpt, img: g.id, type: 'article', current: 'guias', main });
}


/* Diário de cultivo: a página é estática; diario.js faz o resto no navegador */
function diaryPage() {
  const main = `  <header class="article__head">
    <p class="kicker">Ferramenta · fica só no seu navegador</p>
    <h1 class="article__title">Diário de cultivo</h1>
    <p class="article__lead">Anote regas, adubo, medições e o que você observa. Em poucas semanas aparecem padrões que a memória não guarda.</p>
  </header>

  <section class="dstat" id="dstat" aria-label="Resumo do cultivo" aria-live="polite"></section>

  <div class="diary">
    <form class="dform" id="dform" autocomplete="off">
      <p class="ctl__label">Nova anotação</p>
      <div class="dtypes" id="dtypes" role="radiogroup" aria-label="Tipo de anotação"></div>
      <label class="dfield"><span class="ctl__label">Data</span><input type="date" id="d-date" class="date" /></label>
      <label class="dfield"><span class="ctl__label">O que aconteceu</span>
        <textarea id="d-note" rows="3" maxlength="2000" placeholder="Ex.: 1,5 L de água, escorreu um pouco pelo fundo."></textarea></label>
      <details class="dmeasure" id="d-measure">
        <summary>Medições <span>opcional</span></summary>
        <div class="dmgrid" id="d-mgrid"></div>
      </details>
      <button type="submit" class="btn btn--primary dsave">Salvar anotação</button>
    </form>

    <div class="dlog">
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
    <p>O diário fica salvo apenas neste navegador. Se limpar os dados do navegador ou trocar de celular, ele some. Baixe uma cópia de vez em quando.</p>
    <div class="dtools__btns">
      <button type="button" class="btn" id="d-export">Baixar cópia</button>
      <label class="btn dtools__file">Restaurar cópia<input type="file" id="d-import" accept="application/json,.json" /></label>
      <button type="button" class="btn dtools__danger" id="d-clear">Apagar tudo</button>
    </div>
    <p class="dtools__more">A data de início e o tipo de planta vêm do <a href="index.html#energia">calendário</a>.</p>
  </section>`;
  return shell({ base: '', file: 'diario.html', title: 'Diário de cultivo', desc: 'Anote regas, adubo, medições e problemas do seu cultivo. Grátis, sem cadastro, salvo só no seu navegador.', img: 'diario', type: 'website', current: 'diario', main, scripts: ['plan.js', 'diario.js'] });
}

/* Página de privacidade e contato. Mantenha fiel ao que o site realmente faz. */
const REPO = 'https://github.com/CodeLift88/indoor-growing-lab';
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
  return shell({ base: '', file: 'privacidade.html', title: 'Privacidade e contato', desc: 'O Indoor Growing Lab não tem cadastro, não usa cookies próprios e não coleta dados pessoais.', img: 'home', type: 'website', current: '', main });
}

fs.mkdirSync(path.join(ROOT, 'guias'), { recursive: true });
D.guides.forEach(g => fs.writeFileSync(path.join(ROOT, 'guias', `${g.id}.html`), page(g)));

fs.writeFileSync(path.join(ROOT, 'privacidade.html'), privacyPage());
fs.writeFileSync(path.join(ROOT, 'diario.html'), diaryPage());

const urls = [SITE, ...D.guides.map(g => `${SITE}guias/${g.id}.html`), `${SITE}diario.html`, `${SITE}privacidade.html`];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log(`${D.guides.length} guias gerados em guias/, diario.html, privacidade.html, sitemap.xml e robots.txt atualizados.`);
