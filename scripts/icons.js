#!/usr/bin/env node
/* Gera os ícones do modo app (PNG) a partir do desenho do logo.
   Uso: node scripts/icons.js   (requer Playwright com Chromium)
   Saída: assets/icons/icon-180.png, icon-192.png, icon-512.png, icon-maskable-512.png */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.resolve(__dirname, '..', 'assets', 'icons');
const sprout = `<path d="M16 27V13M16 13c0-4.5-3.4-7.3-6.2-7.8-.4 3.4.9 7 6.2 7.8Zm0 0c0-4.5 3.4-7.3 6.2-7.8.4 3.4-.9 7-6.2 7.8Zm0 5c-2.8-3.9-6.7-4.5-9.5-3.4 1.1 2.9 4.9 4.8 9.5 3.4m0 0c2.8-3.9 6.7-4.5 9.5-3.4-1.1 2.9-4.9 4.8-9.5 3.4" fill="none" stroke="#f2eee4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="27" r="2" fill="#d4f25a"/>`;

// maskable: fundo cheio e desenho dentro da zona segura (80% central)
const svg = (size, maskable) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" ${maskable ? '' : 'rx="7"'} fill="#16190f"/>
  <g transform="${maskable ? 'translate(4.8 4.4) scale(.7)' : 'translate(2.4 1.6) scale(.85)'}">${sprout}</g>
</svg>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [name, size, maskable] of [['icon-180', 180, false], ['icon-192', 192, false], ['icon-512', 512, false], ['icon-maskable-512', 512, true]]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg(size, maskable)}</body></html>`);
    await page.locator('svg').screenshot({ path: path.join(OUT, `${name}.png`), omitBackground: true });
  }
  await browser.close();
  console.log('Ícones gerados em assets/icons/.');
})();
