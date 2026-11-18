#!/usr/bin/env node
/* ==========================================================================
   Gera as imagens de prévia (Open Graph, 1200×630) usadas ao compartilhar
   links no WhatsApp, redes sociais etc.
   Uso:  node scripts/og.js        (requer Playwright com Chromium)
   Saída: assets/og/home.png e assets/og/<id-do-guia>.png
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'og');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'), sandbox);
const D = sandbox.window.IGL_DATA;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// folha de cannabis em traço, no mesmo desenho da planta do site
function fanLeaf() {
  const leaflet = (len, wid, teeth = 18) => {
    const l = [], r = [];
    for (let i = 0; i <= teeth; i++) {
      const u = i / teeth;
      const w = wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.9) * (i % 2 ? 0.78 : 1);
      l.push([-w, -len * u]); r.push([w, -len * u]);
    }
    return 'M' + l.concat(r.reverse()).map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
  };
  let out = '';
  const n = 7, spread = 82, L = 300;
  for (let k = 0; k < n; k++) {
    const rel = (k / (n - 1)) * 2 - 1;
    const len = L * (1 - 0.48 * Math.pow(Math.abs(rel), 1.5));
    out += `<g transform="rotate(${(rel * spread).toFixed(1)})"><path d="${leaflet(len, len * 0.13)}" class="lf"/><line x1="0" y1="0" x2="0" y2="${(-len * 0.92).toFixed(1)}" class="rib"/></g>`;
  }
  return `<svg class="leaf" viewBox="-340 -330 680 420" aria-hidden="true"><line x1="0" y1="0" x2="0" y2="120" class="rib" style="stroke-width:3"/>${out}</svg>`;
}

function card({ title, kicker, size }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: #f2eee4; color: #16190f; font-family: 'Fraunces', serif; position: relative; overflow: hidden; }
  .top { position: absolute; left: 72px; right: 72px; top: 56px; display: flex; justify-content: space-between; align-items: center; }
  .mark { display: flex; align-items: center; gap: 12px; font-size: 30px; }
  .mark svg { width: 40px; height: 40px; }
  .mark em { font-weight: 400; }
  .kick { font: 500 20px 'IBM Plex Mono', monospace; color: #6a6e60; }
  h1 { position: absolute; left: 72px; top: 150px; width: 780px; font-weight: 400; font-size: ${size}px; line-height: .98; letter-spacing: -.03em; font-variation-settings: "opsz" 144; text-wrap: balance; }
  h1 em { font-weight: 300; }
  .foot { position: absolute; left: 72px; right: 72px; bottom: 52px; padding-top: 22px; border-top: 2px solid #16190f; display: flex; align-items: center; gap: 14px; font: 500 20px 'IBM Plex Mono', monospace; color: #3a3f31; }
  .dot { width: 16px; height: 16px; border-radius: 50%; background: #d4f25a; box-shadow: 0 0 0 2px #16190f; }
  .leaf { position: absolute; right: 64px; top: 112px; width: 330px; height: 330px; }
  .lf { fill: #c9e38a; stroke: #16190f; stroke-width: 2.2; stroke-linejoin: round; }
  .rib { stroke: #16190f; stroke-width: 1.4; opacity: .55; }
</style></head><body>
  <div class="top">
    <div class="mark"><svg viewBox="5 6 90 90"><path d="M29.8 73.2H70.2L72.6 77.2C74 79.6 74.6 81.6 74.6 84C74.6 88.4 71 91.8 66.4 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2Z" fill="#d4f25a"/><path d="M40.8 47C40.8 44.5 37.4 44 37.4 40.5C37.4 38.5 38.8 37.3 41 37.3H59.4C61.6 37.3 63 38.5 63 40.5C63 44 59.6 44.5 59.6 47V54.6L73 77.2C74.4 79.6 75 81.6 75 84C75 88.4 71.4 91.8 66.8 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2L40.8 54.6Z" fill="none" stroke="#16190f" stroke-width="5.6" stroke-linejoin="round"/><path d="M50.2 26.8C49.6 21 47 15 42 11.5C37.5 8.6 31 8.6 27.2 9.4C26 9.7 25.8 10.8 26 12.2C26.6 18 30 24 36 26.8C39.5 28.3 43 27.6 45.5 28.6C47.2 29.4 47.8 31 47.8 33V73.2H52.6V33.4C52.6 31.4 53.8 29.9 56.5 29.7C60 29.4 64.5 29.4 68.4 26.4C71.6 24 73.4 19 73.6 14.6C73.7 13.4 73 12.7 72 12.6C67.5 12 61 12.4 56.5 15.4C52.6 18 50.6 22.4 50.2 26.8Z" fill="#16190f"/></svg><span>Indoor Growing <em>Lab</em></span></div>
    <span class="kick">${esc(kicker)}</span>
  </div>
  <svg class="leaf" viewBox="5 6 90 90" aria-hidden="true"><path d="M29.8 73.2H70.2L72.6 77.2C74 79.6 74.6 81.6 74.6 84C74.6 88.4 71 91.8 66.4 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2Z" fill="#d4f25a"/><path d="M40.8 47C40.8 44.5 37.4 44 37.4 40.5C37.4 38.5 38.8 37.3 41 37.3H59.4C61.6 37.3 63 38.5 63 40.5C63 44 59.6 44.5 59.6 47V54.6L73 77.2C74.4 79.6 75 81.6 75 84C75 88.4 71.4 91.8 66.8 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2L40.8 54.6Z" fill="none" stroke="#16190f" stroke-width="5.6" stroke-linejoin="round"/><path d="M50.2 26.8C49.6 21 47 15 42 11.5C37.5 8.6 31 8.6 27.2 9.4C26 9.7 25.8 10.8 26 12.2C26.6 18 30 24 36 26.8C39.5 28.3 43 27.6 45.5 28.6C47.2 29.4 47.8 31 47.8 33V73.2H52.6V33.4C52.6 31.4 53.8 29.9 56.5 29.7C60 29.4 64.5 29.4 68.4 26.4C71.6 24 73.4 19 73.6 14.6C73.7 13.4 73 12.7 72 12.6C67.5 12 61 12.4 56.5 15.4C52.6 18 50.6 22.4 50.2 26.8Z" fill="#16190f"/></svg>
  <h1>${title}</h1>
  <div class="foot"><span class="dot"></span>Calculadoras e guias de cultivo indoor · conteúdo +18</div>
</body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

  const jobs = [
    { file: 'home', title: 'Do grão à colheita, sem <em>chute.</em>', kicker: 'do iniciante ao avançado', size: 112 },
    { file: 'diario', title: 'Seu diário de <em>cultivo.</em>', kicker: 'grátis · sem cadastro', size: 104 }
  ]
    .concat(D.guides.map((g, i) => ({
      file: g.id,
      title: esc(g.title),
      kicker: `guia ${String(i + 1).padStart(2, '0')} · ${g.clusterLabel.toLowerCase()}`,
      size: g.title.length > 60 ? 64 : g.title.length > 42 ? 74 : 84
    })));

  for (const j of jobs) {
    await page.setContent(card(j), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${j.file}.png`) });
  }
  await browser.close();
  console.log(`${jobs.length} imagens geradas em assets/og/.`);
})();
