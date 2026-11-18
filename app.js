/* ==========================================================================
   Growmetria — lógica do site
   Sem dependências. Conteúdo em data.js.
   ========================================================================== */
(() => {
  'use strict';

  // modo app: funciona offline depois da primeira visita (só em http/https)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const swUrl = new URL('sw.js', document.currentScript ? document.currentScript.src : location.href);
    addEventListener('load', () => navigator.serviceWorker.register(swUrl).catch(() => {}));
  }

  const D = window.IGL_DATA;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n, d = 1) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtInt = n => Math.round(n).toLocaleString('pt-BR');
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const setText = (sel, txt) => { const n = typeof sel === 'string' ? $(sel) : sel; if (n) n.textContent = txt; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem armazenamento */ } }
  };

  /* Número que desliza até o valor novo */
  const tweens = new WeakMap();
  function tweenNumber(node, to, format, dur = 380) {
    if (!node) return;
    const prev = tweens.get(node);
    if (prev) cancelAnimationFrame(prev.raf);
    const from = prev ? prev.value : null;
    if (from === null || reduced) { node.textContent = format(to); tweens.set(node, { value: to, raf: 0 }); return; }
    const start = performance.now();
    const st = { value: from, raf: 0 };
    tweens.set(node, st);
    const step = now => {
      const t = easeOut(clamp((now - start) / dur));
      st.value = lerp(from, to, t);
      node.textContent = format(st.value);
      if (t < 1) st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  }

  function swapWord(node, word) {
    if (node.textContent === word) return;
    node.textContent = word;
    node.classList.remove('swap'); void node.offsetWidth; node.classList.add('swap');
  }


  /* ------------------------------------------------------------------
     PÁGINAS SEPARADAS: cada ferramenta vive numa página, mas as contas
     usam o setup inteiro. Campos que não estão nesta página leem o valor
     salvo no navegador (ou o padrão), e cada mudança fica salva.
     ------------------------------------------------------------------ */
  const BASE = new URL('.', (document.currentScript && document.currentScript.src) || location.href).href;
  const route = key => BASE + ((window.IGL_DATA.routes || {})[key] || 'index.html#' + key);
  const HAS_CYCLE = !!document.getElementById('ciclo');
  const DEFAULTS = { 'in-ppfd': '500', 'in-hours': '18', 'in-co2': false, 'in-temp': '26', 'in-rh': '60', 'in-off': '-1.5',
    'in-filter': true, 'in-bends': '2', 'in-ach': '1', 'in-watts': '500', 'in-extra': '60', 'in-veg': '4',
    'in-tariff': '0.85', 'in-currency': 'BRL', 'in-start': '' };
  const RANGES = { 'in-ppfd': [100, 1500], 'in-hours': [10, 24], 'in-temp': [16, 35], 'in-rh': [30, 90], 'in-off': [-4, 2],
    'in-bends': [0, 5], 'in-ach': [0.5, 2], 'in-watts': [50, 1500], 'in-extra': [0, 300], 'in-veg': [3, 8], 'in-tariff': [0.1, 2.5] };
  let SAVED = {};
  try { SAVED = JSON.parse(localStorage.getItem('igl-setup') || '{}') || {}; } catch { SAVED = {}; }
  const persist = () => { try { localStorage.setItem('igl-setup', JSON.stringify(SAVED)); } catch { /* sem armazenamento */ } };
  const ghosts = {};
  function ghost(sel) {
    if (ghosts[sel]) return ghosts[sel];
    const id = sel.slice(1);
    let n;
    if (id in DEFAULTS) {
      n = document.createElement('input');
      n.id = id;
      const v = SAVED[id] !== undefined ? SAVED[id] : DEFAULTS[id];
      if (typeof DEFAULTS[id] === 'boolean') { n.type = 'checkbox'; n.checked = !!v; } else { n.value = v; }
      if (RANGES[id]) { n.min = RANGES[id][0]; n.max = RANGES[id][1]; }
      if (id === 'in-start') n.value = (() => { try { return localStorage.getItem('igl-start') || ''; } catch { return ''; } })();
    } else {
      n = document.createElement('div');
      n.value = '';
    }
    return (ghosts[sel] = n);
  }
  const $ = (s, r = document) => r.querySelector(s) || (r === document && /^#[\w-]+$/.test(s) ? ghost(s) : null);
  function saveInput(n) {
    if (!n || !n.id || !(n.id in DEFAULTS) || n.id === 'in-start') return;
    SAVED[n.id] = n.type === 'checkbox' ? n.checked : n.value;
    persist();
  }
  // campos reais desta página começam com o valor salvo
  Object.keys(DEFAULTS).forEach(id => {
    const n = document.getElementById(id);
    if (!n || SAVED[id] === undefined || id === 'in-start') return;
    if (n.type === 'checkbox') n.checked = !!SAVED[id]; else n.value = SAVED[id];
  });
  document.addEventListener('input', e => saveInput(e.target), true);
  document.addEventListener('change', e => saveInput(e.target), true);

  /* ------------------------------------------------------------------
     ESTADO COMPARTILHADO
     ------------------------------------------------------------------ */
  const S = {
    level: document.documentElement.dataset.level || '1',
    tent: D.tents[SAVED.tent] ? SAVED.tent : '120x120',
    phase: D.phases[SAVED.phase] ? SAVED.phase : 'veg',
    auto: store.get('igl-kind') === 'auto',
    wattsTouched: !!SAVED.wattsTouched
  };

  /* ------------------------------------------------------------------
     NÍVEL DO LEITOR E TEMA
     ------------------------------------------------------------------ */
  const LEVEL_NAMES = { 1: 'Nunca plantei', 2: 'Já fiz um ciclo', 3: 'Quero otimizar' };
  const LEVEL_SHORT = { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' };

  function applyLevel(v) {
    S.level = v;
    document.documentElement.dataset.level = v;
    setText('#level-chip-text', LEVEL_SHORT[v]);
    const chip = document.querySelector('.level-chip');
    if (chip) chip.title = `Nível: ${LEVEL_NAMES[v]}. Toque para mudar.`;
    const radio = $(`input[name="level"][value="${v}"]`);
    if (radio) radio.checked = true;
    $$('details.math').forEach(d => { d.open = v === '3'; });
    if (v !== '3') $('#in-off').value = -1.5;
    renderChecklist();
    updateAll();
  }

  // Claro é o padrão. O escuro só liga quando a pessoa escolhe.
  function initTheme() {
    const btn = $('#theme-btn');
    const root = document.documentElement;
    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      btn.setAttribute('aria-checked', String(dark));
      btn.title = dark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro';
      $('meta[name="theme-color"]').setAttribute('content', dark ? '#14160f' : '#f3f4ee');
    };
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.classList.add('theme-anim');
      root.dataset.theme = next;
      store.set('igl-theme', next);
      sync();
      setTimeout(() => root.classList.remove('theme-anim'), 500);
    });
    sync();
  }

  function initMenu() {
    const head = $('#masthead'), btn = $('#menu-btn');
    const close = () => { head.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => {
      const open = head.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    $$('#main-nav a').forEach(a => a.addEventListener('click', close));
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ------------------------------------------------------------------
     01 · PLANTA EM SVG E CICLO
     ------------------------------------------------------------------ */
  const plantG = $('#plant');
  const stem = el('path', { d: 'M200 438 C205 360 194 250 200 112', class: 'stem' }, plantG);
  const STEM_LEN = HAS_CYCLE ? stem.getTotalLength() : 1;
  stem.style.strokeDasharray = STEM_LEN;

  function leafletPath(len, wid, teeth = 16) {
    const left = [], right = [];
    for (let i = 0; i <= teeth; i++) {
      const u = i / teeth;
      const w = wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.9) * (i % 2 ? 0.78 : 1);
      left.push([-w, -len * u]);
      right.push([w, -len * u]);
    }
    return 'M' + left.concat(right.reverse()).map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
  }

  function fanLeaf(parent, count, size) {
    const g = el('g', {}, parent);
    const P = 18, L = 58;
    el('line', { x1: 0, y1: 0, x2: 0, y2: -P, class: 'petiole' }, g);
    const spread = count >= 7 ? 82 : count === 5 ? 64 : count === 3 ? 42 : 0;
    for (let k = 0; k < count; k++) {
      const rel = count === 1 ? 0 : (k / (count - 1)) * 2 - 1;
      const len = L * (1 - 0.48 * Math.pow(Math.abs(rel), 1.5));
      const lg = el('g', { transform: `translate(0 ${-P}) rotate(${(rel * spread).toFixed(1)})` }, g);
      el('path', { d: leafletPath(len, len * 0.13), class: 'leaflet' }, lg);
      el('line', { x1: 0, y1: 0, x2: 0, y2: (-len * 0.92).toFixed(1), class: 'rib' }, lg);
    }
    return { g, size };
  }

  function budCluster(parent, big) {
    const g = el('g', {}, parent);
    const n = big ? 6 : 3, step = big ? 9 : 7;
    for (let i = 0; i < n; i++) {
      const rx = (big ? 11 : 8) * (1 - i / (n * 1.6));
      el('ellipse', { cx: i % 2 ? 2 : -2, cy: -i * step, rx: rx.toFixed(1), ry: (rx * 0.8).toFixed(1), class: 'bud' }, g);
    }
    for (let i = 0; i < n * 2; i++) {
      const y = -(i / 2) * step - 2, side = i % 2 ? 1 : -1;
      el('path', { d: `M${side * 3} ${y} q${side * 6} -2 ${side * 9} -7`, class: 'pistil' }, g);
    }
    return g;
  }

  const NODES = [
    { f: 0.12, n: 1, s: 0.5 }, { f: 0.24, n: 3, s: 0.72 }, { f: 0.37, n: 5, s: 0.95 },
    { f: 0.5, n: 7, s: 1.05 }, { f: 0.62, n: 7, s: 1.0 }, { f: 0.73, n: 5, s: 0.86 }, { f: 0.83, n: 5, s: 0.7 }
  ];

  const seed = el('g', {}, $('#seed-layer'));
  const rootPath = el('path', { d: 'M200 446 q-3 14 2 26 q3 10 -2 20 M201 458 q7 6 9 14 M199 466 q-8 5 -10 12', class: 'root' }, seed);
  el('ellipse', { cx: 200, cy: 444, rx: 6, ry: 4.2, class: 'seed', transform: 'rotate(-20 200 444)' }, seed);
  const ROOT_LEN = HAS_CYCLE ? rootPath.getTotalLength() : 1;
  rootPath.style.strokeDasharray = ROOT_LEN;
  seed.setAttribute('transform', 'translate(200 444) scale(1.35) translate(-200 -444)');

  const coty = [-1, 1].map(side => {
    const g = el('g', {}, plantG);
    el('ellipse', { cx: side * 10, cy: 0, rx: 10, ry: 4.5, class: 'coty' }, g);
    return { g, side };
  });

  const nodes = NODES.map((d, i) => ({
    ...d, i,
    pt: HAS_CYCLE ? stem.getPointAtLength(d.f * STEM_LEN) : { x: 0, y: 0 },
    leaves: [-1, 1].map(side => ({ side, ...fanLeaf(plantG, d.n, d.s) })),
    buds: i >= 3 ? [-1, 1].map(side => ({ side, g: budCluster(plantG, false) })) : []
  }));
  const apexL = fanLeaf(plantG, 3, 0.42);
  const apexR = fanLeaf(plantG, 3, 0.42);
  const topCola = budCluster(plantG, true);
  const setT = (n, tx) => n.setAttribute('transform', tx);

  function renderPlant(g, b) {
    if (!HAS_CYCLE) return;
    stem.style.strokeDashoffset = STEM_LEN * (1 - clamp(g));
    stem.style.strokeWidth = (1.6 + 4.2 * g).toFixed(2);
    seed.style.opacity = 1 - clamp((g - 0.06) / 0.05);
    rootPath.style.strokeDashoffset = ROOT_LEN * (1 - clamp(g / 0.06));

    const base = stem.getPointAtLength(0.035 * STEM_LEN);
    const cs = easeOut(clamp((g - 0.02) / 0.05)) * (1 - clamp((g - 0.4) / 0.2) * 0.5);
    coty.forEach(c => setT(c.g, `translate(${base.x} ${base.y - 4}) rotate(${c.side * -18}) scale(${cs.toFixed(3)})`));

    nodes.forEach(nd => {
      const grow = easeOut(clamp((g - nd.f - 0.01) / 0.13));
      const tilt = 62 - nd.i * 4;
      nd.leaves.forEach(lf => setT(lf.g, `translate(${nd.pt.x.toFixed(1)} ${nd.pt.y.toFixed(1)}) rotate(${lf.side * tilt}) scale(${(lf.size * grow).toFixed(3)})`));
      nd.buds.forEach(bd => {
        const s = easeOut(clamp(b * 1.15 - (nd.i - 3) * 0.05)) * (0.6 + nd.i * 0.08);
        setT(bd.g, `translate(${(nd.pt.x + bd.side * 16).toFixed(1)} ${(nd.pt.y - 8).toFixed(1)}) rotate(${bd.side * 24}) scale(${s.toFixed(3)})`);
      });
    });

    const tip = stem.getPointAtLength(clamp(g) * STEM_LEN);
    const as = easeOut(clamp((g - 0.06) / 0.08)) * (1 - easeOut(b) * 0.5);
    setT(apexL.g, `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(-28) scale(${(apexL.size * as).toFixed(3)})`);
    setT(apexR.g, `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(28) scale(${(apexR.size * as).toFixed(3)})`);
    setT(topCola, `translate(${tip.x.toFixed(1)} ${(tip.y + 14).toFixed(1)}) scale(${(easeOut(b) * 1.15).toFixed(3)})`);
  }

  // detalhes da cena
  const diodes = $('.lamp__diodes');
  for (let i = 0; i < 12; i++) el('circle', { cx: 116 + i * 15.3, cy: 42, r: 1.6 }, diodes);

  const trich = $('#trichomes');
  for (let i = 0; i < 11; i++) {
    const x = 276 + i * 8 + (i % 3) * 2, h = 26 + ((i * 37) % 22), y0 = 214, dx = i % 2 ? 2 : -2;
    el('line', { x1: x, y1: y0, x2: x + dx, y2: y0 - h, class: 'trich-stalk' }, trich);
    const fill = (i === 3 || i === 8) ? '#d08a2e' : i === 6 ? 'rgba(230,236,240,.25)' : '#ece6d6';
    el('circle', { cx: x + dx, cy: y0 - h - 4, r: 5, class: 'trich-head', fill }, trich);
  }

  const jarBuds = $('.jar__buds');
  [[306, 476, 11], [330, 482, 12], [318, 456, 10], [342, 458, 9], [304, 438, 8], [328, 432, 9]]
    .forEach(([cx, cy, r]) => el('ellipse', { cx, cy, rx: r, ry: r * 0.82, class: 'bud' }, jarBuds));

  const ring = $('#photo-ring');
  const ringSegs = [];
  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2 - Math.PI / 2 + 0.025;
    const a1 = ((i + 1) / 24) * Math.PI * 2 - Math.PI / 2 - 0.025;
    const R = 30, r = 21, c = 32;
    const p = (a, rad) => `${(c + Math.cos(a) * rad).toFixed(2)} ${(c + Math.sin(a) * rad).toFixed(2)}`;
    const s = el('path', { d: `M${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(a1, r)} A${r} ${r} 0 0 0 ${p(a0, r)}Z`, class: 'seg' }, ring);
    s.style.transitionDelay = `${i * 18}ms`;
    ringSegs.push(s);
  }

  const cycle = $('#ciclo');
  const stages = $$('.stage', cycle);
  const railBtns = $$('#rail-steps button');
  const N = stages.length;
  const G_KEYS = [0.004, 0.1, 0.32, 0.68, 1, 1, 1];
  const growthAt = p => { const x = p * N, i = Math.min(N - 1, Math.floor(x)); return lerp(G_KEYS[i], G_KEYS[i + 1], easeOut(x - i)); };
  const budsAt = p => clamp((p * N - 3.15) / 1.1);

  let currentStage = -1;
  function setStage(i) {
    if (i === currentStage) return;
    currentStage = i;
    cycle.dataset.stage = i;
    stages.forEach((s, k) => s.classList.toggle('is-active', k === i));
    railBtns.forEach((b, k) => { b.classList.toggle('is-active', k <= i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    setText('#cycle-count', String(i + 1).padStart(2, '0'));
    const st = stages[i];
    cycle.style.setProperty('--glow', st.dataset.glow);
    const h = Number(st.dataset.hours);
    ringSegs.forEach((s, k) => s.classList.toggle('on', k < h));
    setText('#photo-val', h === 0 ? 'Luz apagada' : `${h} h de luz · ${24 - h} h de escuro`);
  }

  const anim = { g: 0, b: 0, tg: 0, tb: 0 };
  let plantTicking = false;
  function plantTick() {
    const k = reduced ? 1 : 0.14;
    anim.g += (anim.tg - anim.g) * k;
    anim.b += (anim.tb - anim.b) * k;
    renderPlant(anim.g, anim.b);
    if (Math.abs(anim.tg - anim.g) > 0.0005 || Math.abs(anim.tb - anim.b) > 0.0005) requestAnimationFrame(plantTick);
    else plantTicking = false;
  }

  railBtns.forEach(btn => btn.addEventListener('click', () => {
    const i = Number(btn.dataset.step);
    const span = cycle.offsetHeight - innerHeight;
    const top = cycle.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + span * ((i + 0.5) / N), behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ------------------------------------------------------------------
     FERRAMENTAS DE GRÁFICO
     ------------------------------------------------------------------ */
  function scaler(x0, x1, y0, y1, xMin, xMax, yMin, yMax) {
    return {
      x: v => x0 + ((v - xMin) / (xMax - xMin)) * (x1 - x0),
      y: v => y0 + ((yMax - v) / (yMax - yMin)) * (y1 - y0),
      x0, x1, y0, y1
    };
  }

  function drawGrid(g, sc, xs, ys, xFmt, yFmt, xLabel) {
    xs.forEach(v => {
      el('line', { x1: sc.x(v), x2: sc.x(v), y1: sc.y0, y2: sc.y1 }, g);
      el('text', { x: sc.x(v), y: sc.y1 + 18, 'text-anchor': 'middle' }, g).textContent = xFmt(v);
    });
    ys.forEach(v => {
      el('line', { x1: sc.x0, x2: sc.x1, y1: sc.y(v), y2: sc.y(v) }, g);
      el('text', { x: sc.x0 - 10, y: sc.y(v) + 4, 'text-anchor': 'end' }, g).textContent = yFmt(v);
    });
    el('line', { x1: sc.x0, x2: sc.x1, y1: sc.y1, y2: sc.y1, class: 'axis' }, g);
    el('line', { x1: sc.x0, x2: sc.x0, y1: sc.y0, y2: sc.y1, class: 'axis' }, g);
    if (xLabel) el('text', { x: sc.x1, y: sc.y1 + 34, 'text-anchor': 'end' }, g).textContent = xLabel;
  }

  // anima uma faixa (dois arrays de valores) entre estados
  function bandMorpher(draw) {
    let cur = null, raf = 0;
    return next => {
      if (!cur || reduced) { cur = next; draw(cur); return; }
      const from = cur, start = performance.now();
      cancelAnimationFrame(raf);
      const step = now => {
        const t = easeOut(clamp((now - start) / 520));
        cur = { hi: from.hi.map((v, i) => lerp(v, next.hi[i], t)), lo: from.lo.map((v, i) => lerp(v, next.lo[i], t)) };
        draw(cur);
        if (t < 1) raf = requestAnimationFrame(step); else cur = next;
      };
      raf = requestAnimationFrame(step);
    };
  }

  function placeLabelInBand(label, band, xAt, sc, target) {
    let idx = 0, best = Infinity;
    band.hi.forEach((h, i) => { const d = Math.abs((h + band.lo[i]) / 2 - target); if (d < best) { best = d; idx = i; } });
    label.setAttribute('x', sc.x(xAt(idx)).toFixed(1));
    label.setAttribute('y', (sc.y((band.hi[idx] + band.lo[idx]) / 2) + 4).toFixed(1));
    label.setAttribute('text-anchor', 'middle');
  }

  function fillRanges() {
    $$('input[type="range"]').forEach(r => {
      r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
    });
  }

  /* ------------------------------------------------------------------
     02 · ESPAÇO E KIT
     ------------------------------------------------------------------ */
  const tentPicker = $('#tent-picker');
  Object.entries(D.tents).forEach(([key, t]) => {
    const size = Math.round((t.w / 150) * 34), depth = Math.round((t.d / 150) * 34);
    const lab = document.createElement('label');
    lab.className = 'tent';
    lab.innerHTML = `
      <input type="radio" name="tent" value="${key}" ${key === S.tent ? 'checked' : ''} />
      <span class="tent__glyph" aria-hidden="true"><i style="width:${size}px;height:${depth}px"></i></span>
      <span class="tent__name">${t.label}</span>
      <span class="tent__meta">${t.plants[0]} a ${t.plants[1]} plantas</span>`;
    tentPicker.appendChild(lab);
  });
  tentPicker.addEventListener('change', e => {
    S.tent = e.target.value;
    SAVED.tent = S.tent; persist();
    if (!S.wattsTouched) { $('#in-watts').value = D.tents[S.tent].wattsBloom; saveInput($('#in-watts')); }
    updateAll();
  });

  // planta baixa
  const plan = $('#plan');
  const P = { x0: 40, y0: 30, size: 320 }; // 150 cm = 320 px
  const cm = v => (v / 150) * P.size;
  Object.values(D.tents).forEach(t => el('rect', { x: P.x0, y: P.y0 + P.size - cm(t.d), width: cm(t.w), height: cm(t.d), class: 'plan-other' }, plan));
  const planTent = el('rect', { x: P.x0, class: 'plan-tent' }, plan);
  const planLed = el('rect', { class: 'plan-led', rx: 3 }, plan);
  const planPlants = el('g', {}, plan);
  const dimW = el('text', { class: 'plan-dim', 'text-anchor': 'middle' }, plan);
  const dimD = el('text', { class: 'plan-dim', 'text-anchor': 'middle' }, plan);
  const ledLab = el('text', { class: 'plan-dim', 'text-anchor': 'middle' }, plan);

  function plantPositions(n, w, d) {
    // grade que preenche o retângulo
    let best = null;
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const cell = Math.min(w / cols, d / rows);
      if (!best || cell > best.cell) best = { cols, rows, cell };
    }
    const pts = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / best.cols), c = i % best.cols;
      const inRow = Math.min(best.cols, n - r * best.cols);
      const gx = w / inRow, gy = d / best.rows;
      pts.push([gx * (c + 0.5), gy * (r + 0.5), Math.min(gx, gy) * 0.36]);
    }
    return pts;
  }

  function updateKit() {
    const t = D.tents[S.tent];
    const w = cm(t.w), d = cm(t.d), x = P.x0, y = P.y0 + P.size - d;
    planTent.setAttribute('y', y); planTent.setAttribute('width', w); planTent.setAttribute('height', d);
    planLed.setAttribute('x', x + w * 0.12); planLed.setAttribute('y', y + d * 0.12);
    planLed.setAttribute('width', w * 0.76); planLed.setAttribute('height', d * 0.76);
    dimW.setAttribute('x', x + w / 2); dimW.setAttribute('y', P.y0 + P.size + 22); dimW.textContent = `${t.w} cm`;
    dimD.setAttribute('x', x + w + 18); dimD.setAttribute('y', y + d / 2);
    dimD.setAttribute('transform', `rotate(90 ${x + w + 18} ${y + d / 2})`); dimD.textContent = `${t.d} cm`;
    ledLab.setAttribute('x', x + w / 2); ledLab.setAttribute('y', y - 8); ledLab.textContent = 'tracejado: área coberta pelo LED';

    if (planPlants.dataset.tent === S.tent) return finishKit(t);
    planPlants.dataset.tent = S.tent;
    planPlants.innerHTML = '';
    plantPositions(t.plants[1], w * 0.9, d * 0.9).forEach(([px, py, r], i) => {
      const c = el('circle', { cx: (x + w * 0.05 + px).toFixed(1), cy: (y + d * 0.05 + py).toFixed(1), r: Math.min(r, 34).toFixed(1), class: 'plan-plant out' }, planPlants);
      setTimeout(() => c.classList.remove('out'), reduced ? 0 : 60 + i * 40);
    });
    finishKit(t);
  }

  function finishKit(t) {

    setText('#kit-tent-name', t.label);
    tweenNumber($('#kit-watts'), t.wattsBloom, v => fmtInt(v));
    setText('#kit-watts-veg', t.wattsVeg);
    setText('#kit-plants', `${t.plants[0]} a ${t.plants[1]}`);
    setText('#kit-ppf', `${fmtInt(t.ppf)} µmol/s`);
    setText('#ar-tent', t.label);
  }

  function renderChecklist() {
    const ul = $('#checklist');
    let saved = {};
    try { saved = JSON.parse(store.get('igl-check') || '{}'); } catch { saved = {}; }
    const items = D.checklist.filter(c => !c.lvl || Number(S.level) >= c.lvl);
    ul.innerHTML = items.map(c => `
      <li><label class="check">
        <input type="checkbox" data-id="${c.id}" ${saved[c.id] ? 'checked' : ''} />
        <span class="check__box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
        <span><span class="check__item">${esc(c.item)}</span><span class="check__why">${esc(c.why)}</span></span>
      </label></li>`).join('');
    const count = () => setText('#check-count', $$('input:checked', ul).length);
    setText('#check-total', items.length);
    count();
    ul.onchange = e => {
      saved[e.target.dataset.id] = e.target.checked;
      store.set('igl-check', JSON.stringify(saved));
      count();
    };
  }

  /* ------------------------------------------------------------------
     FASE COMPARTILHADA (luz + clima)
     ------------------------------------------------------------------ */
  function setPhase(phase, fromLight) {
    S.phase = phase;
    SAVED.phase = phase; persist();
    $$(`[data-bind="phase"] input[value="${phase}"]`).forEach(i => { i.checked = true; });
    if (fromLight !== false) applyPreset();
    updateAll();
  }
  // valores sugeridos de luz para a fase; autos ficam em 18 h a vida toda
  function applyPreset() {
    const p = D.phases[S.phase];
    const autoFlor = S.auto && S.phase === 'flor';
    $('#in-ppfd').value = autoFlor ? 650 : p.ppfd;
    $('#in-hours').value = S.auto ? 18 : p.hours;
    saveInput($('#in-ppfd')); saveInput($('#in-hours'));
  }
  $$('[data-bind="phase"]').forEach(fs => fs.addEventListener('change', e => setPhase(e.target.value)));

  /* TIPO DE PLANTA (compartilhado: espaço, luz, cronograma) */
  function setKind(kind) {
    S.auto = kind === 'auto';
    store.set('igl-kind', kind);
    $$(`[data-bind="kind"] input[value="${kind}"]`).forEach(i => { i.checked = true; });
    if (S.phase === 'flor') applyPreset();
    updateAll();
  }
  $$('[data-bind="kind"]').forEach(fs => fs.addEventListener('change', e => setKind(e.target.value)));

  /* ------------------------------------------------------------------
     03 · LUZ (DLI)
     ------------------------------------------------------------------ */
  const LZ = scaler(56, 536, 20, 316, 0, 24, 0, 1500);
  drawGrid($('#luz-grid'), LZ, [0, 6, 12, 18, 24], [0, 300, 600, 900, 1200, 1500], v => `${v} h`, v => v, 'horas de luz por dia →');
  const LH = []; for (let h = 1; h <= 24.0001; h += 0.25) LH.push(h);
  const ppfdFor = (dli, h) => (dli * 1e6) / (h * 3600);
  const luzZone = $('#luz-zone'), luzLab = $('#luz-zone-lab');
  const morphLuz = bandMorpher(b => {
    const up = b.hi.map((v, i) => `${LZ.x(LH[i]).toFixed(1)} ${LZ.y(v).toFixed(1)}`);
    const dn = b.lo.map((v, i) => `${LZ.x(LH[i]).toFixed(1)} ${LZ.y(v).toFixed(1)}`).reverse();
    luzZone.setAttribute('d', `M${up.join('L')}L${dn.join('L')}Z`);
    placeLabelInBand(luzLab, b, i => LH[i], LZ, 380);
  });
  let luzKey = '';
  const LIGHT_COPY = {
    ok: { word: 'Na medida', body: 'A planta recebe a luz que consegue usar: cresce firme, com entrenós curtos e sem queimar o topo.' },
    low: { word: 'Luz fraca', body: 'A planta estica procurando luz, fica fina e produz menos. É o erro mais comum de quem começa.' },
    high: { word: 'Luz demais', body: 'Acima do que a planta processa, as folhas do topo amarelam e desbotam. Energia jogada fora na conta.' }
  };

  function updateLight() {
    const ppfd = Number($('#in-ppfd').value), hours = Number($('#in-hours').value);
    const co2 = $('#in-co2').checked && S.level !== '1';
    const ph = D.phases[S.phase];
    const [dMin, dMax] = co2 ? ph.dliCo2 : ph.dli;
    const dli = (ppfd * hours * 3600) / 1e6;
    $('#luz').dataset.phase = S.phase;

    const tag = ppfd < 300 ? 'suave' : ppfd < 600 ? 'média' : ppfd < 900 ? 'forte' : 'muito forte';
    setText('#out-ppfd', S.level === '1' ? `${ppfd} · ${tag}` : `${ppfd} µmol/m²/s`);
    setText('#out-hours', `${hours} h`);

    const state = dli < dMin ? 'low' : dli > dMax ? 'high' : 'ok';
    const v = $('#luz-verdict');
    v.dataset.state = state === 'ok' ? 'ok' : state === 'low' ? 'humid' : 'dry';
    swapWord($('#luz-word'), LIGHT_COPY[state].word);
    let body = LIGHT_COPY[state].body;
    const needPpfd = ppfdFor((dMin + dMax) / 2, hours);
    let action;
    if (state === 'ok') action = `Mantenha. Com ${hours} h de luz, a força pode ir de ${fmtInt(ppfdFor(dMin, hours))} a ${fmtInt(ppfdFor(dMax, hours))}.`;
    else if (state === 'low') action = S.level === '1'
      ? 'Aproxime o LED das plantas (respeitando a distância do fabricante) ou aumente o dimmer.'
      : `Suba a força para perto de ${fmtInt(Math.min(1500, needPpfd))} µmol/m²/s, ou ligue mais horas.`;
    else action = S.level === '1'
      ? 'Suba o LED alguns centímetros ou baixe o dimmer.'
      : `Baixe a força para perto de ${fmtInt(needPpfd)} µmol/m²/s, ou reduza as horas.`;

    if (S.auto && hours < 16) {
      body += ' Autoflorescentes rendem mais com 18 a 20 h de luz a vida toda.';
    }
    if (S.phase === 'flor' && !S.auto && hours !== 12) {
      body = 'Na floração a luz precisa ficar em 12 h. Com mais que isso, plantas comuns (fotoperiódicas) não florescem direito.';
      action = 'Coloque o timer em 12 h ligadas e 12 h no escuro total. Se sua planta for autoflorescente, marque isso no tipo de planta.';
      v.dataset.state = 'dry';
      swapWord($('#luz-word'), 'Fotoperíodo errado');
    }
    setText('#luz-body', body);
    setText('#luz-action', action);
    setText('#luz-target', `${dMin}–${dMax}`);
    tweenNumber($('#luz-dli'), dli, n => fmtInt(n));

    const key = `${S.phase}${co2}`;
    if (key !== luzKey) {
      luzKey = key;
      morphLuz({ hi: LH.map(h => Math.min(1500, ppfdFor(dMax, h))), lo: LH.map(h => Math.min(1500, ppfdFor(dMin, h))) });
    }
    const rect = $('#luz-rect');
    rect.setAttribute('y', LZ.y(ppfd)); rect.setAttribute('width', LZ.x(hours) - LZ.x(0)); rect.setAttribute('height', LZ.y1 - LZ.y(ppfd));
    const txt = $('#luz-rect-txt');
    txt.setAttribute('x', (LZ.x(0) + LZ.x(hours)) / 2);
    txt.setAttribute('y', Math.min(LZ.y1 - 12, (LZ.y(ppfd) + LZ.y1) / 2 + 4));
    txt.textContent = `${S.level === '1' ? 'luz do dia' : 'DLI'} ${fmtInt(dli)}`;
    $('#luz-probe').style.transform = `translate(${LZ.x(hours)}px, ${LZ.y(ppfd)}px)`;

    $('#luz-math').innerHTML = `
      <p><b>DLI</b> (luz total do dia, em mol/m²/dia)<br>DLI = PPFD × horas × 3600 ÷ 1.000.000</p>
      <p>${ppfd} × ${hours} × 3600 ÷ 1.000.000 = <b>${fmt(dli, 1)} mol/m²/dia</b></p>
      <p>Alvo para ${ph.label.toLowerCase()}${co2 ? ' com CO₂' : ''}: ${dMin}–${dMax}<br>
         PPFD para o meio da faixa com ${hours} h: <b>${fmtInt(needPpfd)}</b></p>
      <p class="math__src">Fontes: Faust e Logan (2018), “Daily Light Integral: A Research Review”, <i>HortScience</i> 53(9). Rodriguez-Morrison, Llewellyn e Zheng (2021), resposta da planta a níveis crescentes de luz, <i>Frontiers in Plant Science</i> 12.</p>`;

    S.dli = dli; S.luzOk = state === 'ok' && !(S.phase === 'flor' && !S.auto && hours !== 12);
  }
  ['#in-ppfd', '#in-hours', '#in-co2'].forEach(s => $(s).addEventListener('input', updateAll));

  /* ------------------------------------------------------------------
     04 · CLIMA (VPD)
     ------------------------------------------------------------------ */
  const svp = t => 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
  const rhFor = (t, off, vpd) => ((svp(t + off) - vpd) / svp(t)) * 100;
  const CL = scaler(56, 536, 20, 316, 16, 35, 30, 90);
  drawGrid($('#clima-grid'), CL, [16, 20, 24, 28, 32], [30, 40, 50, 60, 70, 80, 90], v => `${v}°`, v => `${v}%`, 'temperatura do ar →');
  const CT = []; for (let t = 16; t <= 35.0001; t += 0.5) CT.push(t);
  const zOk = $('#z-ok'), zHumid = $('#z-humid'), climaLab = $('#clima-zone-lab');
  const morphClima = bandMorpher(b => {
    const up = b.hi.map((h, i) => `${CL.x(CT[i]).toFixed(1)} ${CL.y(h).toFixed(1)}`);
    const dn = b.lo.map((h, i) => `${CL.x(CT[i]).toFixed(1)} ${CL.y(h).toFixed(1)}`).reverse();
    zOk.setAttribute('d', `M${up.join('L')}L${dn.join('L')}Z`);
    zHumid.setAttribute('d', `M${CL.x0} ${CL.y0}L${up.join('L')}L${CL.x1} ${CL.y0}Z`);
    placeLabelInBand(climaLab, b, i => CT[i], CL, 58);
  });
  let climaKey = '';
  const CLIMA_COPY = {
    ok: { word: 'Confortável', body: 'A folha transpira no ritmo certo: a planta puxa água e nutrientes sem estresse.' },
    humid: { word: 'Úmido demais', body: 'A planta transpira devagar e cresce menos. Ar úmido e parado é convite para mofo, ainda mais na floração.' },
    dry: { word: 'Seco demais', body: 'A planta perde água mais rápido do que repõe, fecha os poros e para de crescer. As folhas enrolam para cima.' }
  };

  function updateClimate() {
    const t = Number($('#in-temp').value), h = Number($('#in-rh').value);
    const off = S.level === '3' ? Number($('#in-off').value) : -1.5;
    const [vMin, vMax] = D.phases[S.phase].vpd;

    setText('#out-temp', `${fmt(t)} °C`);
    setText('#out-rh', `${h}%`);
    setText('#out-off', `${off > 0 ? '+' : off < 0 ? '−' : ''}${fmt(Math.abs(off))} °C`);

    const sAir = svp(t), sLeaf = svp(t + off), vpAir = sAir * h / 100;
    const vpd = Math.max(0, sLeaf - vpAir);
    const state = vpd < vMin ? 'humid' : vpd > vMax ? 'dry' : 'ok';
    const rhMid = rhFor(t, off, (vMin + vMax) / 2);

    let word = CLIMA_COPY[state].word, body = CLIMA_COPY[state].body, vstate = state, action;
    if (state === 'ok') action = `Mantenha assim. A ${fmt(t)} °C, a umidade pode ficar entre ${Math.max(30, Math.round(rhFor(t, off, vMax)))}% e ${Math.min(90, Math.round(rhFor(t, off, vMin)))}%.`;
    else if (rhMid >= 30 && rhMid <= 90) action = state === 'humid'
      ? `Baixe a umidade para perto de ${Math.round(rhMid)}% (desumidificador ou mais exaustão).`
      : `Suba a umidade para perto de ${Math.round(rhMid)}% (umidificador) ou baixe a temperatura.`;
    else action = 'Só a umidade não resolve nessa temperatura. Ajuste o calor primeiro.';

    if (t > 30) { word = 'Quente demais'; vstate = 'hot'; body = 'Acima de 30 °C a planta sofre mesmo com a umidade certa: as folhas se fecham e o crescimento trava.'; action = 'Baixe a temperatura para 24–28 °C com mais exaustão ou ar-condicionado.'; }
    else if (t < 18) { word = 'Frio demais'; vstate = 'cold'; body = 'Abaixo de 18 °C o metabolismo desacelera e as raízes absorvem menos.'; action = 'Aqueça o ambiente para 22–26 °C.'; }

    $('#clima-verdict').dataset.state = vstate;
    swapWord($('#clima-word'), word);
    setText('#clima-body', body);
    setText('#clima-action', action);
    setText('#clima-target', `${fmt(vMin)}–${fmt(vMax)}`);
    tweenNumber($('#clima-kpa'), vpd, n => fmt(n, 2));

    const key = S.phase + off;
    if (key !== climaKey) {
      climaKey = key;
      morphClima({ hi: CT.map(x => clamp(rhFor(x, off, vMin), 30, 90)), lo: CT.map(x => clamp(rhFor(x, off, vMax), 30, 90)) });
    }
    const px = CL.x(t), py = CL.y(h);
    $('#clima-probe').style.transform = `translate(${px}px, ${py}px)`;
    const lx = $('#clima-px'), ly = $('#clima-py');
    lx.setAttribute('x1', 0); lx.setAttribute('x2', 0); lx.setAttribute('y1', 0); lx.setAttribute('y2', CL.y1 - py);
    ly.setAttribute('x1', 0); ly.setAttribute('x2', CL.x0 - px); ly.setAttribute('y1', 0); ly.setAttribute('y2', 0);

    $('#clima-math').innerHTML = `
      <p><b>Pressão de saturação (Tetens)</b><br>SVP(T) = 0,6108 · e<sup>17,27·T / (T + 237,3)</sup></p>
      <p>SVP do ar (${fmt(t)} °C) = <b>${fmt(sAir, 3)} kPa</b><br>
         SVP da folha (${fmt(t + off)} °C) = <b>${fmt(sLeaf, 3)} kPa</b><br>
         Vapor real no ar = ${fmt(sAir, 3)} × ${h}% = <b>${fmt(vpAir, 3)} kPa</b></p>
      <p><b>VPD da folha</b> = ${fmt(sLeaf, 3)} − ${fmt(vpAir, 3)} = <b>${fmt(vpd, 2)} kPa</b><br>
         Alvo para ${D.phases[S.phase].label.toLowerCase()}: ${fmt(vMin)}–${fmt(vMax)} kPa</p>
      <p class="math__src">Fórmula de Tetens, na forma de Murray (1967), “On the computation of saturation vapor pressure”, <i>Journal of Applied Meteorology</i> 6. As faixas de VPD por fase são as usadas na prática de cultivo indoor.</p>`;

    S.vpd = vpd; S.climaOk = vstate === 'ok'; S.climaWord = word;
  }
  ['#in-temp', '#in-rh', '#in-off'].forEach(s => $(s).addEventListener('input', updateAll));

  /* ------------------------------------------------------------------
     05 · EXAUSTÃO
     ------------------------------------------------------------------ */
  const diag = $('#ar-diagram');
  const ductG = el('g', {}, diag);
  // estufa
  el('rect', { x: 24, y: 24, width: 190, height: 160, rx: 2, class: 'tent-box' }, diag);
  el('text', { x: 119, y: 176, 'text-anchor': 'middle', class: 'diagram-txt' }, diag).textContent = 'estufa';
  // entrada de ar
  [140, 156].forEach(y => el('path', { d: `M4 ${y} h28 m-6 -5 l6 5 l-6 5`, class: 'inlet' }, diag));
  el('text', { x: 36, y: 128, class: 'diagram-txt' }, diag).textContent = 'ar entra';
  // filtro
  const filterG = el('g', {}, diag);
  el('rect', { x: 110, y: 40, width: 92, height: 34, rx: 8, class: 'filter-box' }, filterG);
  for (let i = 0; i < 9; i++) el('line', { x1: 118 + i * 9, y1: 44, x2: 112 + i * 9, y2: 70, class: 'filter-hatch' }, filterG);
  el('text', { x: 156, y: 92, 'text-anchor': 'middle', class: 'diagram-txt' }, filterG).textContent = 'filtro de carvão';
  // exaustor
  el('rect', { x: 222, y: 37, width: 40, height: 40, rx: 6, class: 'fan-box' }, diag);
  const blade = el('g', { class: 'fan-blade' }, diag);
  el('path', { d: 'M242 57 q-10 -12 0 -14 M242 57 q12 -6 10 4 M242 57 q-2 12 -10 6', fill: 'none' }, blade);
  el('text', { x: 242, y: 28, 'text-anchor': 'middle', class: 'diagram-txt' }, diag).textContent = 'exaustor';
  const ductPath = el('path', { class: 'duct' }, ductG);
  const ductFlow = el('path', { class: 'duct-flow' }, ductG);
  const ductOut = el('text', { class: 'diagram-txt' }, diag);

  function ductD(bends) {
    let x = 262, y = 57, d = `M${x} ${y}`;
    const avail = 270, seg = avail / (bends + 1);
    for (let i = 0; i < bends; i++) {
      x += seg; d += ` H${x.toFixed(1)}`;
      y = i % 2 === 0 ? 140 : 57; d += ` V${y}`;
    }
    d += ` H${262 + avail + 10}`;
    return { d, y };
  }

  const bars = $('#ar-bars');
  const BX0 = 130, BX1 = 540, CAP_MAX = 1400;
  const bx = v => BX0 + (v / CAP_MAX) * (BX1 - BX0);
  const fanRows = D.fans.map((f, i) => {
    const y = 14 + i * 46;
    el('text', { x: 0, y: y + 14, class: 'fanbar-txt' }, bars).textContent = f.size;
    el('text', { x: 0, y: y + 30, class: 'fanbar-sub' }, bars).textContent = `até ${fmtInt(f.cap)} m³/h`;
    el('rect', { x: BX0, y, width: BX1 - BX0, height: 30, class: 'fanbar-bg' }, bars);
    const bar = el('rect', { x: BX0, y, width: bx(f.cap) - BX0, height: 30, class: 'fanbar' }, bars);
    el('line', { x1: bx(f.cap * 0.7), x2: bx(f.cap * 0.7), y1: y, y2: y + 30, class: 'fanbar-70' }, bars);
    return { bar, f };
  });
  const needLine = el('line', { x1: 0, x2: 0, y1: 4, y2: 150, class: 'need-line' }, bars);
  const needTxt = el('text', { y: 164, 'text-anchor': 'middle', class: 'need-txt' }, bars);

  function updateAir() {
    const t = D.tents[S.tent];
    const filter = $('#in-filter').checked, bends = Number($('#in-bends').value), ach = Number($('#in-ach').value);
    const base = t.volM3 * 60 * ach;
    const mult = 1 + (filter ? 0.25 : 0) + bends * 0.15;
    const need = base * mult;
    const pick = D.fans.find(f => need <= f.cap * 0.7) || D.fans[D.fans.length - 1];
    const pct = Math.round((need / pick.cap) * 100);

    setText('#out-bends', bends === 0 ? 'nenhuma' : String(bends));
    setText('#out-ach', ach === 1 ? '1 por minuto' : `${fmt(ach)} por minuto`);
    tweenNumber($('#ar-flow'), need, v => fmtInt(v));
    setText('#ar-body', `Para trocar todo o ar da estufa ${ach === 1 ? 'uma vez' : fmt(ach) + ' vezes'} por minuto, já contando ${filter ? 'o filtro' : 'sem filtro'} e ${bends === 0 ? 'duto reto' : bends + (bends === 1 ? ' curva' : ' curvas')}.`);
    setText('#ar-action', pct <= 70
      ? `Exaustor de ${pick.size} rodando a cerca de ${pct}% da força: folga e silêncio.`
      : `Mesmo o exaustor de ${pick.size} vai trabalhar a ${pct}% da força. Reduza curvas ou use dois exaustores.`);
    setText('#kit-fan', pick.size);
    setText('#kit-flow', `${fmtInt(need)} m³/h`);
    if (!filter) setText('#ar-action', $('#ar-action').textContent + ' Sem filtro, o cheiro sai junto com o ar.');

    filterG.style.opacity = filter ? 1 : 0.15;
    const dd = ductD(bends);
    ductPath.setAttribute('d', dd.d);
    ductFlow.setAttribute('d', dd.d);
    ductOut.setAttribute('x', 540); ductOut.setAttribute('y', dd.y - 14); ductOut.setAttribute('text-anchor', 'end');
    ductOut.textContent = 'para fora →';
    const speed = clamp(2.4 - need / 400, 0.5, 2.4);
    diag.style.setProperty('--flow-s', `${speed.toFixed(2)}s`);
    diag.style.setProperty('--spin-s', `${(speed * 0.6).toFixed(2)}s`);

    fanRows.forEach(r => r.bar.classList.toggle('is-pick', r.f === pick));
    const nx = bx(Math.min(need, CAP_MAX));
    needLine.style.transform = `translateX(${nx}px)`;
    needTxt.setAttribute('x', clamp(nx, BX0 + 40, BX1 - 40));
    needTxt.textContent = `precisa: ${fmtInt(need)}`;

    $('#ar-math').innerHTML = `
      <p><b>Volume</b> = ${t.w} × ${t.d} × ${t.h} cm = <b>${fmt(t.volM3, 2)} m³</b></p>
      <p><b>Base</b> = volume × 60 min × ${fmt(ach)} troca/min = <b>${fmtInt(base)} m³/h</b></p>
      <p><b>Perdas</b> = 1 ${filter ? '+ 0,25 (filtro) ' : ''}+ ${bends} × 0,15 (curvas) = <b>× ${fmt(mult, 2)}</b></p>
      <p><b>Vazão necessária</b> = ${fmtInt(base)} × ${fmt(mult, 2)} = <b>${fmtInt(need)} m³/h</b><br>
         Escolha: menor exaustor em que isso fica abaixo de 70% da vazão máxima.</p>`;

    S.need = need; S.fan = pick.size;
  }
  ['#in-filter', '#in-bends', '#in-ach'].forEach(s => $(s).addEventListener('input', updateAll));

  /* ------------------------------------------------------------------
     06 · CONTA DE LUZ
     ------------------------------------------------------------------ */
  const enChart = $('#en-chart');
  const SYM = { BRL: 'R$', USD: 'US$', EUR: '€' };
  const money = (v, cur, d = 0) => `${SYM[cur]} ${v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

  const siteUrl = () => ($('link[rel="canonical"]') || location).href.split('?')[0].split('#')[0];
  const DAY = 864e5;
  const fmtDate = (d, long) => d.toLocaleDateString('pt-BR', long ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'short' }).replace('.', '');
  const addWeeks = (d, w) => new Date(d.getTime() + w * 7 * DAY);
  function startDate() {
    const v = $('#in-start').value;
    const d = v ? new Date(v + 'T12:00:00') : new Date();
    return isNaN(d) ? new Date() : d;
  }

  function updateEnergy() {
    const watts = Number($('#in-watts').value), extra = Number($('#in-extra').value);
    const vegW = Number($('#in-veg').value), tariff = Number($('#in-tariff').value);
    const cur = $('#in-currency').value;
    const auto = S.auto;
    const PLAN = window.IGL_PLAN.build(startDate(), auto, vegW);
    const vegN = PLAN.vegN, florN = PLAN.florN;
    $('#in-veg').disabled = auto;
    setText('#out-watts', `${watts} W`);
    setText('#out-extra', `${extra} W`);
    setText('#out-veg', auto ? 'a auto decide' : `${vegW} semanas`);
    setText('#out-tariff', money(tariff, cur, 2));

    const plan = [...Array(2).fill('muda'), ...Array(vegN).fill('veg'), ...Array(florN).fill('flor')];
    const hoursOf = ph => (auto ? 18 : D.phases[ph].hours);
    const weekKwh = ph => ((watts * D.phases[ph].power * hoursOf(ph)) + extra * 24) * 7 / 1000;
    const weeks = plan.map(ph => ({ ph, kwh: weekKwh(ph), cost: weekKwh(ph) * tariff }));
    const total = weeks.reduce((a, w) => a + w.cost, 0);
    const kwhTotal = weeks.reduce((a, w) => a + w.kwh, 0);
    const monthAvg = (total / plan.length) * 30 / 7;
    const top = ['muda', 'veg', 'flor'].reduce((a, ph) => weekKwh(ph) > weekKwh(a) ? ph : a, 'muda');

    // cronograma (plan.js é a fonte única das datas)
    const t0 = PLAN.steps[0].date, tLight = PLAN.tLight, tHarvest = PLAN.tHarvest;
    const steps = PLAN.steps;
    S.plan = PLAN;
    const now = new Date();
    let nowIdx = -1;
    steps.forEach((s, i) => { if (s.date <= now) nowIdx = i; });
    $('#timeline').innerHTML = steps.map((s, i) => `
      <li class="tl ${i < nowIdx ? 'is-past' : ''} ${i === nowIdx ? 'is-now' : ''} ${s.key ? 'is-key' : ''}">
        <span class="tl__date">${fmtDate(s.date)}</span>
        <span class="tl__body"><span class="tl__title">${esc(s.title)}${i === nowIdx ? ' <em class="tl__now">você está aqui</em>' : ''}</span>
        <span class="tl__desc">${esc(s.desc)}${s.guide ? ` <a href="${BASE}guias/${s.guide}.html">Ver guia</a>` : ''}${s.key ? ` <a class="tl__gcal" href="${esc(window.IGL_PLAN.googleLink(s, siteUrl()))}" target="_blank" rel="noopener">+ Google Agenda</a>` : ''}</span></span>
      </li>`).join('');

    swapWord($('#en-harvest'), fmtDate(tHarvest, true));
    setText('#en-harvest-sub', `${Math.round((tHarvest - t0) / (7 * DAY))} semanas depois de germinar${auto ? ', por ser autoflorescente' : ''}.`);
    tweenNumber($('#en-month'), monthAvg, v => money(v, cur));
    tweenNumber($('#en-total'), total, v => money(v, cur));
    setText('#en-peak', auto
      ? 'Na auto a luz fica em 18 h a vida toda, então a floração, com o LED no máximo, é a fase mais cara.'
      : top === 'flor'
        ? 'A semana mais cara é na floração, com o LED no máximo.'
        : 'Repare: a semana mais cara é no vegetativo. 18 h de luz a 75% pesam mais que 12 h no máximo.');
    setText('#en-kwh', `${fmtInt(kwhTotal)} kWh`);
    setText('#en-btu', `${fmtInt((watts + extra) * 3.412)} BTU/h`);

    // gráfico semanal: o DOM só é refeito quando muda a escala, as semanas ou as datas
    const X0 = 56, X1 = 548, Y0 = 16, Y1 = 220;
    const maxC = Math.max(...weeks.map(w => w.cost)) * 1.15 || 1;
    const gw = (X1 - X0) / weeks.length;
    const key = `${weeks.length}|${cur}|${t0.toDateString()}|${auto}`;
    const tip = (w, i) => `Semana ${i + 1}, a partir de ${fmtDate(addWeeks(tLight, i))} (${D.phases[w.ph].label}): ${money(w.cost, cur, 2)}`;
    if (enChart.dataset.key === key && maxC <= enMax && maxC > enMax * 0.45) {
      const rects = $$('.wk', enChart);
      weeks.forEach((w, i) => {
        const h = (w.cost / enMax) * (Y1 - Y0);
        rects[i].style.y = `${(Y1 - h).toFixed(1)}px`;
        rects[i].style.height = `${h.toFixed(1)}px`;
        rects[i].firstChild.textContent = tip(w, i);
      });
      return finishEnergy();
    }
    enChart.dataset.key = key;
    enMax = maxC;
    enChart.innerHTML = '';
    const g = el('g', { class: 'grid' }, enChart);
    const step = niceStep(maxC);
    for (let v = 0; v <= maxC; v += step) {
      const y = Y1 - (v / maxC) * (Y1 - Y0);
      el('line', { x1: X0, x2: X1, y1: y, y2: y }, g);
      el('text', { x: X0 - 8, y: y + 4, 'text-anchor': 'end' }, g).textContent = money(v, cur);
    }
    el('line', { x1: X0, x2: X1, y1: Y1, y2: Y1, class: 'axis' }, g);
    weeks.forEach((w, i) => {
      const h = (w.cost / maxC) * (Y1 - Y0);
      const r = el('rect', { x: (X0 + i * gw + gw * 0.14).toFixed(1), y: (Y1 - h).toFixed(1), width: (gw * 0.72).toFixed(1), height: h.toFixed(1), class: `wk wk--${w.ph}` }, enChart);
      el('title', {}, r).textContent = tip(w, i);
      r.style.y = `${(Y1 - h).toFixed(1)}px`; r.style.height = `${h.toFixed(1)}px`;
    });
    // chaves das fases, com a data de início de cada uma
    let start = 0;
    ['muda', 'veg', 'flor'].forEach(ph => {
      const n = plan.filter(p => p === ph).length;
      const xa = X0 + start * gw + 4, xb = X0 + (start + n) * gw - 4;
      el('path', { d: `M${xa} ${Y1 + 10} v6 H${xb} v-6`, class: 'wk-bracket' }, enChart);
      el('text', { x: (xa + xb) / 2, y: Y1 + 34, 'text-anchor': 'middle', class: 'wk-label' }, enChart).textContent = D.phases[ph].label;
      const since = fmtDate(addWeeks(tLight, start));
      el('text', { x: (xa + xb) / 2, y: Y1 + 50, 'text-anchor': 'middle', class: 'wk-date' }, enChart).textContent = n >= 4 ? `${n} sem. · ${since}` : since;
      start += n;
    });
    // linha de hoje
    const wNow = (now - tLight) / (7 * DAY);
    if (wNow >= 0 && wNow <= weeks.length) {
      const x = X0 + wNow * gw;
      el('line', { x1: x, x2: x, y1: Y0 - 6, y2: Y1, class: 'today-line' }, enChart);
      el('text', { x: x + 4, y: Y0 + 2, class: 'today-txt' }, enChart).textContent = 'hoje';
    }
    finishEnergy();

    function finishEnergy() {
      const hf = hoursOf('flor');
      $('#en-math').innerHTML = `
        <p><b>Semana</b> = (LED × força da fase × horas + outros × 24 h) × 7 ÷ 1000</p>
        <p>Floração: (${watts} × 100% × ${hf} + ${extra} × 24) × 7 ÷ 1000 = <b>${fmt(weekKwh('flor'), 1)} kWh</b><br>
           Vegetativo: (${watts} × 75% × 18 + ${extra} × 24) × 7 ÷ 1000 = <b>${fmt(weekKwh('veg'), 1)} kWh</b><br>
           Muda: (${watts} × 35% × 18 + ${extra} × 24) × 7 ÷ 1000 = <b>${fmt(weekKwh('muda'), 1)} kWh</b></p>
        <p><b>Ciclo</b> = ${fmtInt(kwhTotal)} kWh × ${money(tariff, cur, 2)} = <b>${money(total, cur, 2)}</b></p>
        <p><b>Datas</b>: 1 semana de germinação, 2 de muda, ${vegN} de vegetativo, ${florN} de floração, 2 de secagem e 2 de cura mínima.</p>`;
      S.month = money(monthAvg, cur);
      S.harvest = fmtDate(tHarvest);
    }
  }
  let enMax = 0;

  function niceStep(max) {
    const raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }

  // data de início: lembrada no navegador, hoje por padrão
  const startIn = $('#in-start');
  const isoToday = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  startIn.value = store.get('igl-start') || isoToday();
  startIn.addEventListener('change', () => { store.set('igl-start', startIn.value); updateEnergy(); updateSetup(); });
  $('#start-today').addEventListener('click', () => { startIn.value = isoToday(); store.set('igl-start', startIn.value); updateEnergy(); updateSetup(); });

  const vegIn = $('#in-veg');
  if (store.get('igl-veg')) vegIn.value = store.get('igl-veg');
  vegIn.addEventListener('input', () => store.set('igl-veg', vegIn.value));

  // baixar o calendário para a agenda do celular
  $('#ics-btn').addEventListener('click', () => {
    if (!S.plan) return;
    window.IGL_PLAN.download('meu-cultivo.ics', window.IGL_PLAN.ics(S.plan, siteUrl()), 'text/calendar;charset=utf-8');
    toast('Calendário baixado. Abra o arquivo para adicionar à sua agenda.');
  });

  ['#in-extra', '#in-veg', '#in-tariff', '#in-currency'].forEach(s => $(s).addEventListener('input', () => {
    fillRanges(); updateEnergy(); updateSetup();
  }));
  $('#in-watts').addEventListener('input', () => { S.wattsTouched = true; SAVED.wattsTouched = true; persist(); fillRanges(); updateEnergy(); updateSetup(); });

  /* ------------------------------------------------------------------
     07 · EQUIPAMENTOS
     ------------------------------------------------------------------ */
  let hwCat = 'all';
  const ext = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>';

  function hwCard(h, compact) {
    const fits = h.tentFit.includes(S.tent);
    return `
      <div class="hw__id">
        <p class="hw__cat">${esc(h.categoryLabel)}</p>
        <p class="hw__brand">${esc(h.brand)}</p>
        <p class="hw__model">${esc(h.model)}</p>
      </div>
      ${compact ? '' : `<div class="hw__info">
        <p class="hw__why">${esc(h.why)}</p>
        <dl class="hw__specs lvl-2">${h.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>`}
      <div class="hw__side">
        ${h.priceBRL ? `<p class="hw__price">${esc(h.priceBRL)}</p>` : ''}
        <span class="fit ${fits ? 'is-fit' : ''}">${fits ? `Serve no seu grow de ${D.tents[S.tent].label}` : 'Feito para outros tamanhos'}</span>
        <div class="hw__actions">
          ${shopLink(h.officialUrl, h.officialAffiliate, 'Site oficial', true)}
          ${h.amazonUrl ? shopLink(h.amazonUrl, h.amazonAffiliate, 'Amazon Brasil', false) : ''}
          ${h.mlUrl ? shopLink(h.mlUrl, h.mlAffiliate, 'Mercado Livre', false) : ''}
        </div>
        ${h.coupon ? `<button type="button" class="coupon" data-coupon="${esc(h.coupon)}" data-brand="${esc(h.brand)}">Cupom ${esc(h.coupon)} · copiar</button>` : ''}
      </div>`;
  }

  let hwKey = '';
  // link de loja: só leva "sponsored" e a marca ✦ quando for de afiliado
  function shopLink(url, affiliate, label, primary) {
    return `<a class="btn ${primary ? 'btn--primary' : ''}" href="${esc(url)}" target="_blank" rel="noopener${affiliate ? ' sponsored' : ''}">${label}${affiliate ? ' <span class="aff" title="Link de afiliado">✦</span>' : ''} ${ext}</a>`;
  }

  function renderHardware(force) {
    const key = `${hwCat}|${S.tent}|${$('#hw-fit').checked}`;
    if (key === hwKey && force !== true) return;
    hwKey = key;
    const onlyFit = $('#hw-fit').checked;
    const list = D.hardware.filter(h => (hwCat === 'all' || h.category === hwCat) && (!onlyFit || h.tentFit.includes(S.tent)));
    $('#hw-disclosure').hidden = !D.hardware.some(h => h.officialAffiliate || h.amazonAffiliate || h.mlAffiliate || h.coupon);
    $('#hw-list').innerHTML = list.length
      ? list.map((h, i) => `<article class="hw" style="animation-delay:${i * 50}ms">${hwCard(h)}</article>`).join('')
      : '<p class="empty">Nenhuma indicação para esse filtro e tamanho de grow.</p>';
  }

  $('#hw-filters').addEventListener('click', e => {
    const b = e.target.closest('.pill'); if (!b) return;
    hwCat = b.dataset.cat;
    $$('#hw-filters .pill').forEach(p => p.classList.toggle('is-active', p === b));
    renderHardware();
  });
  $('#hw-fit').addEventListener('change', () => renderHardware());

  document.addEventListener('click', e => {
    const c = e.target.closest('[data-coupon]'); if (!c) return;
    const code = c.dataset.coupon;
    const done = () => toast(`Cupom ${code} copiado. Use no checkout da ${c.dataset.brand}.`);
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done); else done();
  });

  let toastT = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  /* ------------------------------------------------------------------
     08 · GUIAS
     ------------------------------------------------------------------ */
  let guideCat = 'all';
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function renderGuides() {
    const q = norm($('#guide-search').value.trim());
    const list = D.guides.filter(g => (guideCat === 'all' || g.cluster === guideCat) &&
      (!q || norm(g.title + ' ' + (g.short || '') + ' ' + g.excerpt + ' ' + g.summary + ' ' + g.html.replace(/<[^>]+>/g, ' ')).includes(q)));
    $('#guide-list').innerHTML = list.map((g, i) => `
      <li class="guide" style="animation-delay:${i * 40}ms">
        <a href="${BASE}guias/${g.id}.html">
          <span class="guide__n">${String(D.guides.indexOf(g) + 1).padStart(2, '0')}</span>
          <span class="guide__title">${esc(g.short || g.title)}</span>
          <span class="guide__ex">${esc(g.blurb || g.excerpt)}</span>
          <span class="guide__meta">${esc(g.clusterLabel)} · ${esc(g.readTime)} <span class="guide__arrow" aria-hidden="true">→</span></span>
        </a>
      </li>`).join('');
    $('#guide-empty').hidden = list.length > 0;
  }

  $('#guide-filters').addEventListener('click', e => {
    const b = e.target.closest('.pill'); if (!b) return;
    guideCat = b.dataset.cat;
    $$('#guide-filters .pill').forEach(p => p.classList.toggle('is-active', p === b));
    renderGuides();
  });
  $('#guide-search').addEventListener('input', renderGuides);

  /* ------------------------------------------------------------------
     07 · DIAGNÓSTICO POR SINTOMA
     ------------------------------------------------------------------ */
  const IL = { green: '#7fa650', dark: '#3d5c28', yellow: '#e2cd58', pale: '#eff0cf', brown: '#9a5a2b', ink: '#16190f', white: '#fbfaf3', soil: '#7a5a3c' };
  let ilUid = 0;

  // pseudo-aleatório determinístico, para os desenhos não mudarem a cada render
  const rng = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  function fanSvg(o) {
    const n = o.n || 5, L = o.L || 46, spread = o.spread ?? 64, wid = o.wid || 0.14;
    const P = o.droop ? 0 : 8;
    let s = o.droop
      ? `<line x1="0" y1="-44" x2="0" y2="14" stroke="${IL.ink}" stroke-width="1.6" /><g transform="translate(0 -40)">`
      : `<line x1="0" y1="12" x2="0" y2="${-P}" stroke="${IL.ink}" stroke-width="1.4" /><g>`;
    for (let k = 0; k < n; k++) {
      const rel = n === 1 ? 0 : (k / (n - 1)) * 2 - 1;
      const len = L * (1 - 0.45 * Math.pow(Math.abs(rel), 1.5));
      const ang = o.droop ? 180 + rel * spread : rel * spread;
      const d = leafletPath(len, len * wid, 14);
      const id = `il${++ilUid}`;
      s += `<g transform="translate(0 ${-P}) rotate(${ang.toFixed(1)})">`;
      s += `<clipPath id="${id}"><path d="${d}" /></clipPath>`;
      s += `<path d="${d}" fill="${o.fill}" />`;
      if (o.inner) s += `<g clip-path="url(#${id})">${o.inner(len, k, rel)}</g>`;
      s += `<line x1="0" y1="0" x2="0" y2="${(-len * 0.92).toFixed(1)}" stroke="${o.rib || IL.ink}" stroke-width="${o.ribW || 0.7}" ${o.ribW ? '' : 'opacity=".55"'} />`;
      s += `<path d="${d}" fill="none" stroke="${IL.ink}" stroke-width="1" stroke-linejoin="round" />`;
      if (o.over) s += o.over(len, k, rel);
      s += `</g>`;
    }
    return s + `</g>`;
  }

  const ILLOS = {
    n: () => fanSvg({ fill: IL.yellow, rib: '#b39d2e', ribW: 0.8 }),
    mg: () => fanSvg({ fill: IL.yellow, rib: '#5d8a34', ribW: 2.6 }),
    fe: () => fanSvg({ fill: IL.pale, rib: '#6f9a42', ribW: 2.2 }),
    k: () => fanSvg({ fill: IL.green, inner: () => '' , over: (len, k) => {
      const id = `ilk${++ilUid}`, d = leafletPath(len, len * 0.14, 14);
      return `<clipPath id="${id}"><path d="${d}" /></clipPath><path d="${d}" fill="none" stroke="${IL.brown}" stroke-width="3.6" clip-path="url(#${id})" /><path d="${d}" fill="none" stroke="${IL.ink}" stroke-width="1" />`;
    } }),
    burn: () => fanSvg({ fill: IL.green, inner: len => `<rect x="-20" y="${-len - 1}" width="40" height="${(len * 0.2).toFixed(1)}" fill="${IL.brown}" />` }),
    ca: () => fanSvg({ fill: IL.green, inner: (len, k) => {
      const r = rng(k + 3);
      return [0.3, 0.5, 0.68].map(t => `<circle cx="${((r() - 0.5) * 5).toFixed(1)}" cy="${(-len * t).toFixed(1)}" r="${(1.8 + r() * 1.6).toFixed(1)}" fill="${IL.brown}" />`).join('');
    } }),
    light: () => `<rect x="-40" y="-70" width="80" height="5" rx="1" fill="${IL.ink}" /><path d="M-36 -64 L-52 -40 M36 -64 L52 -40 M0 -64 V-58" stroke="#e0b64a" stroke-width="1.2" opacity=".8" />` +
      fanSvg({ fill: IL.pale, rib: '#c9c69a', ribW: 0.8, inner: len => `<rect x="-20" y="${-len * 0.45}" width="40" height="${len * 0.45}" fill="${IL.green}" opacity=".55" />` }),
    claw: () => fanSvg({ fill: IL.dark, L: 42, rib: '#2a3f1b', ribW: 0.8, over: len => `<path d="M0 ${-len} q 6 -1 5 7" fill="none" stroke="${IL.dark}" stroke-width="3" stroke-linecap="round" /><path d="M0 ${-len} q 6 -1 5 7" fill="none" stroke="${IL.ink}" stroke-width=".8" />` }),
    over: () => fanSvg({ droop: true, fill: '#6f9644', wid: 0.17, spread: 46, L: 40 }),
    under: () => fanSvg({ droop: true, fill: '#a9b96f', wid: 0.085, spread: 22, L: 44 }),
    oidio: () => fanSvg({ fill: IL.green, inner: (len, k) => {
      const r = rng(k + 11);
      return [0.25, 0.45, 0.62, 0.8].map(t => `<circle cx="${((r() - 0.5) * 6).toFixed(1)}" cy="${(-len * t).toFixed(1)}" r="${(2.6 + r() * 2.4).toFixed(1)}" fill="${IL.white}" opacity=".92" />`).join('');
    } }),
    acaros: () => {
      let web = '';
      const tips = [-1, -0.5, 0, 0.5, 1].map(rel => { const len = 46 * (1 - 0.45 * Math.pow(Math.abs(rel), 1.5)); const a = (rel * 64 - 90) * Math.PI / 180; return [Math.cos(a) * len * 0.8, -8 + Math.sin(a) * len * 0.8]; });
      for (let i = 0; i < tips.length - 1; i++) web += `<path d="M${tips[i][0].toFixed(1)} ${tips[i][1].toFixed(1)} Q ${((tips[i][0] + tips[i + 1][0]) / 2).toFixed(1)} ${((tips[i][1] + tips[i + 1][1]) / 2 + 6).toFixed(1)} ${tips[i + 1][0].toFixed(1)} ${tips[i + 1][1].toFixed(1)}" fill="none" stroke="#8f8b7c" stroke-width=".6" />`;
      return fanSvg({ fill: IL.green, inner: (len, k) => {
        const r = rng(k + 21); let s = '';
        for (let i = 0; i < 12; i++) s += `<circle cx="${((r() - 0.5) * 7).toFixed(1)}" cy="${(-len * (0.12 + r() * 0.8)).toFixed(1)}" r=".9" fill="${IL.pale}" />`;
        return s;
      } }) + web;
    },
    gnats: () => {
      let s = `<path d="M-56 2 H56" stroke="${IL.ink}" stroke-width="1.4" /><rect x="-56" y="2" width="112" height="12" fill="${IL.soil}" />`;
      s += `<path d="M0 2 V-12" stroke="${IL.ink}" stroke-width="1.4" /><ellipse cx="-7" cy="-13" rx="7" ry="3.2" fill="${IL.green}" stroke="${IL.ink}" /><ellipse cx="7" cy="-13" rx="7" ry="3.2" fill="${IL.green}" stroke="${IL.ink}" />`;
      [[-32, -22], [20, -36], [36, -12], [-10, -46], [-40, -48]].forEach(([x, y], i) => {
        s += `<path d="M${x - 10} ${y + 6} q 5 -${4 + i} 10 -6" fill="none" stroke="#8f8b7c" stroke-width=".7" stroke-dasharray="1.5 2" />`;
        s += `<ellipse cx="${x - 1.6}" cy="${y - 2}" rx="2.6" ry="1.4" fill="#d9d6c8" opacity=".9" transform="rotate(-30 ${x} ${y})" /><ellipse cx="${x + 1.6}" cy="${y - 2}" rx="2.6" ry="1.4" fill="#d9d6c8" opacity=".9" transform="rotate(30 ${x} ${y})" /><ellipse cx="${x}" cy="${y}" rx="1.4" ry="2.4" fill="${IL.ink}" />`;
      });
      return s;
    },
    botrytis: () => {
      const cola = 'M0 -58 C 13 -48 19 -22 15 2 C 11 14 -11 14 -15 2 C -19 -22 -13 -48 0 -58Z';
      let s = `<path d="M0 12 V24" stroke="${IL.ink}" stroke-width="1.8" />`;
      // folhinhas de açúcar saindo do bud
      [[-1, -6], [1, -20], [-1, -34]].forEach(([side, y]) => {
        s += `<path d="M${side * 10} ${y} q ${side * 14} -4 ${side * 20} -16 q ${side * -10} 2 ${side * -20} 16Z" fill="#6f9644" stroke="${IL.ink}" stroke-width=".9" />`;
      });
      s += `<path d="${cola}" fill="#9dbb68" stroke="${IL.ink}" stroke-width="1.1" />`;
      const r = rng(9);
      for (let i = 0; i < 16; i++) {
        const t = i / 15, y = -52 + t * 60, w = 13 * Math.sin(Math.PI * (0.15 + t * 0.75));
        s += `<circle cx="${((r() - 0.5) * 2 * w).toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.6 + r() * 1.6).toFixed(1)}" fill="#b5cc84" stroke="${IL.ink}" stroke-width=".5" />`;
      }
      s += `<path d="M-6 -30 C 2 -36 12 -28 10 -16 C 8 -6 -4 -4 -9 -12 C -13 -20 -12 -26 -6 -30Z" fill="#8d857a" stroke="#5e574e" stroke-width=".8" />`;
      for (let i = 0; i < 22; i++) s += `<circle cx="${(-8 + r() * 17).toFixed(1)}" cy="${(-31 + r() * 26).toFixed(1)}" r="${(0.5 + r() * 0.8).toFixed(1)}" fill="#e2ddd2" />`;
      for (let i = 0; i < 6; i++) { const y = -46 + i * 9, side = i % 2 ? 1 : -1; s += `<path d="M${side * 6} ${y} q ${side * 7} -2 ${side * 10} -8" fill="none" stroke="${IL.white}" stroke-width="1.1" stroke-linecap="round" />`; }
      return s;
    }
  };

  const illoSvg = kind => `<svg viewBox="-54 -72 108 92" aria-hidden="true">${ILLOS[kind]()}</svg>`;

  let diagWhere = 'all', diagPick = null;
  const symList = $('#symptoms');

  function renderSymptoms() {
    const list = D.diagnoses.filter(d => diagWhere === 'all' || d.where.includes(diagWhere));
    symList.innerHTML = list.map(d => `
      <button type="button" class="sym" role="radio" aria-checked="${d.id === diagPick}" data-sym="${d.id}">
        ${illoSvg(d.illo)}
        <span class="sym__label">${esc(d.label)}</span>
      </button>`).join('');
  }

  const guideById = id => D.guides.find(g => g.id === id);

  function renderDiagnosis() {
    const box = $('#diag-result');
    const d = D.diagnoses.find(x => x.id === diagPick);
    if (!d) {
      box.innerHTML = `
        <p class="verdict__kicker">Antes de tudo</p>
        <p class="diag__empty-title">Confira os quatro suspeitos de sempre.</p>
        <p class="verdict__body">Rega, pH, luz e temperatura explicam a maioria dos problemas. Se algum deles estiver fora, corrija primeiro e observe as folhas novas por alguns dias.</p>
        <ul class="suspects">
          <li><a href="${BASE}guias/rega.html"><span>01</span>Rega</a></li>
          <li><a href="${BASE}guias/folhas-amarelas.html"><span>02</span>pH</a></li>
          <li><a href="${route('luz')}"><span>03</span>Luz</a></li>
          <li><a href="${route('clima')}"><span>04</span>Temperatura</a></li>
        </ul>
        <p class="diag__hint">Escolha o sintoma que você está vendo.</p>`;
      return;
    }
    const links = d.guides.map(guideById).filter(Boolean)
      .map(g => `<a class="btn" href="${BASE}guias/${g.id}.html">Guia: ${esc((g.short || g.title).split(':')[0])}</a>`);
    if (d.calc) links.unshift(`<a class="btn btn--primary" href="${route(d.calc.href.slice(1))}">${esc(d.calc.label)}</a>`);
    box.innerHTML = `
      <div class="diag__card">
        <div class="diag__head">
          <div class="diag__illo">${illoSvg(d.illo)}</div>
          <div>
            <p class="verdict__kicker">Causa provável</p>
            <p class="verdict__word verdict__word--ink diag__cause">${esc(d.cause)}</p>
          </div>
        </div>
        <p class="verdict__body">${esc(d.why)}</p>
        <p class="ctl__label diag__k">Faça agora</p>
        <ol class="diag__steps">${d.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        <p class="diag__not"><strong>Não confunda:</strong> ${esc(d.notThis)}</p>
        <p class="diag__tech lvl-3">${esc(d.tech)}</p>
        <div class="diag__links">${links.join('')}</div>
        <button type="button" class="diag__back" id="diag-back">↑ Escolher outro sintoma</button>
      </div>`;
    $('#diag-back').addEventListener('click', () => $('#diagnostico .diag__filter').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }));
    const card = $('.diag__card', box);
    if (card && !reduced) card.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
  }

  $('#diag-where').addEventListener('click', e => {
    const b = e.target.closest('.pill'); if (!b) return;
    diagWhere = b.dataset.where;
    $$('#diag-where .pill').forEach(p => p.classList.toggle('is-active', p === b));
    renderSymptoms();
  });
  symList.addEventListener('click', e => {
    const b = e.target.closest('.sym'); if (!b) return;
    diagPick = b.dataset.sym === diagPick ? null : b.dataset.sym;
    $$('.sym', symList).forEach(s => s.setAttribute('aria-checked', String(s.dataset.sym === diagPick)));
    renderDiagnosis();
    const box = $('#diag-result');
    if (diagPick && innerWidth < 900) box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
  // setas do teclado entre os sintomas
  symList.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const items = $$('.sym', symList), i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const next = items[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    next.focus();
  });

  /* ------------------------------------------------------------------
     RESUMO DO SETUP + ROLAGEM
     ------------------------------------------------------------------ */
  function updateSetup() {
    setText('#s-tent', D.tents[S.tent].label.replace(' cm', ''));
    setText('#s-luz', S.level === '1' ? (S.luzOk ? 'Luz ok' : 'Luz: ajustar') : `DLI ${fmtInt(S.dli)}`);
    $('#s-luz-dot').classList.toggle('warn', !S.luzOk);
    setText('#s-clima', S.level === '1' ? (S.climaOk ? 'Clima ok' : 'Clima: ajustar') : `${fmt(S.vpd, 2)} kPa`);
    $('#s-clima-dot').classList.toggle('warn', !S.climaOk);
    setText('#s-ar', `${fmtInt(S.need)} m³/h`);
    setText('#s-en', `${S.month}/mês`);
    setText('#s-harvest', S.harvest);
    const t = D.tents[S.tent];
    setText('#t-kit', `${t.label} · LED de ${t.wattsBloom} W`);
    setText('#t-luz', S.level === '1' ? (S.luzOk ? 'Sua luz: na medida' : 'Sua luz: ajustar') : `DLI ${fmtInt(S.dli)} · ${S.luzOk ? 'na faixa' : 'fora da faixa'}`);
    setText('#t-clima', S.level === '1' ? `Seu clima: ${(S.climaWord || '').toLowerCase()}` : `${S.climaWord} · ${fmt(S.vpd, 2)} kPa`);
    setText('#t-ar', `${fmtInt(S.need)} m³/h · exaustor ${S.fan || ''}`.trim());
    setText('#t-cal', `Colheita em ${S.harvest} · ${S.month}/mês`);
    setText('#t-hw', `Marcamos o que serve no seu grow de ${t.label}`);
    updateFicha();
  }

  /* FICHA DO GROW (hero da home): os mesmos números das calculadoras */
  const ficha = document.getElementById('f-sizes');
  const FICHA_SIZES = ['60x60', '80x80', '90x90', '120x60', '120x120'];
  const CLIMA_ALVO = { muda: ['22–26°', '65–75%'], veg: ['22–28°', '55–70%'], flor: ['20–26°', '40–50%'] };
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NUM = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;
  const parseBR = s => Number(s.replace(/\./g, '').replace(',', '.'));
  function tween(id, str) {
    const node = document.getElementById(id);
    if (!node || node.dataset.v === str) return;
    const from = node.dataset.v ? (node.dataset.v.match(NUM) || []) : null;
    const to = str.match(NUM) || [];
    node.dataset.v = str;
    node.classList.remove('is-new'); void node.offsetWidth; node.classList.add('is-new');
    setTimeout(() => node.classList.remove('is-new'), 700);
    const a = from && from.length === to.length ? from.map(parseBR) : to.map(() => 0);
    if (REDUCED || !to.length) { node.textContent = str; return; }
    const b = to.map(parseBR), t0 = performance.now(), dur = 650;
    const frame = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      let i = 0;
      node.textContent = str.replace(NUM, m => {
        const dec = (m.split(',')[1] || '').length, v = a[i] + (b[i] - a[i]) * e; i++;
        return v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: m.includes('.') });
      });
      if (k < 1 && node.dataset.v === str) requestAnimationFrame(frame);
      else if (node.dataset.v === str) node.textContent = str;
    };
    requestAnimationFrame(frame);
  }
  function updateFicha() {
    if (!ficha) return;
    const sizes = FICHA_SIZES.includes(S.tent) ? FICHA_SIZES : FICHA_SIZES.concat(S.tent);
    if (ficha.dataset.list !== sizes.join()) {
      ficha.dataset.list = sizes.join();
      ficha.innerHTML = sizes.map(k => `<button type="button" role="radio" data-tent="${k}">${D.tents[k].label.replace(' cm', '')}</button>`).join('');
    }
    $$('button', ficha).forEach(b => {
      const on = b.dataset.tent === S.tent;
      b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
    });
    const t = D.tents[S.tent], ph = D.phases[S.phase];
    setText('#f-phase', `${S.auto ? 'Auto · ' : ''}${ph.label} · ${$('#in-hours').value} h de luz`);
    const [temp, rh] = CLIMA_ALVO[S.phase];
    tween('f-grow', t.label.replace(' cm', ''));
    setText('#f-grow-u', `cm · ${t.plants[0] === t.plants[1] ? `${t.plants[0]} planta` : `${t.plants[0]} a ${t.plants[1]} plantas`}`);
    tween('f-led', String($('#in-watts').value));
    tween('f-clima', temp);
    setText('#f-clima-u', S.level === '1' ? `${rh} UR` : `${rh} UR · VPD ${fmt(ph.vpd[0], 1)}–${fmt(ph.vpd[1], 1)}`);
    tween('f-ar', fmtInt(S.need));
    setText('#f-ar-u', `m³/h · ${S.fan || t.duct}`);
    if (S.month) tween('f-conta', S.month);
    if (S.harvest) tween('f-colheita', S.harvest.replace(' de ', ' '));
  }
  function pickTent(key) {
    S.tent = key;
    SAVED.tent = key; persist();
    if (!S.wattsTouched) { $('#in-watts').value = D.tents[key].wattsBloom; saveInput($('#in-watts')); }
    updateAll();
  }
  if (ficha) {
    ficha.addEventListener('click', e => { const b = e.target.closest('button[data-tent]'); if (b) pickTent(b.dataset.tent); });
    ficha.addEventListener('keydown', e => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const bs = $$('button', ficha), i = bs.findIndex(b => b.dataset.tent === S.tent);
      const n = bs[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length];
      pickTent(n.dataset.tent); n.focus();
    });
  }

  function updateAll() {
    fillRanges();
    updateKit();
    updateLight();
    updateClimate();
    updateAir();
    updateEnergy();
    renderHardware();
    updateSetup();
  }

  const masthead = $('#masthead');
  const setupBar = document.getElementById('setup') || document.createElement('aside');
  const navLinks = $$('#main-nav a[href^="#"]');
  const navTargets = navLinks.map(a => $(a.getAttribute('href')));
  const here = location.href.split('#')[0].split('?')[0];
  $$('#setup a').forEach(a => a.classList.toggle('is-here', a.href === here));
  if (!HAS_CYCLE && document.getElementById('setup')) setupBar.classList.add('is-on');

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      const vh = innerHeight;
      // ciclo (só na home)
      if (HAS_CYCLE) {
        const r = cycle.getBoundingClientRect();
        const span = cycle.offsetHeight - vh;
        const p = clamp(-r.top / span);
        setStage(Math.min(N - 1, Math.floor(p * N)));
        cycle.classList.toggle('hint-off', p > 0.03);
        $('#rail-fill').style.transform = `scaleX(${p.toFixed(4)})`;
        anim.tg = growthAt(p); anim.tb = budsAt(p);
        if (!plantTicking) { plantTicking = true; requestAnimationFrame(plantTick); }
        masthead.classList.toggle('on-night', r.top <= 40 && r.bottom > 40);
      }

      // seção atual
      const mark = vh * 0.35;
      navLinks.forEach((l, i) => {
        const t = navTargets[i].getBoundingClientRect();
        const next = navTargets[i + 1] ? navTargets[i + 1].getBoundingClientRect().top : Infinity;
        l.classList.toggle('is-current', t.top <= mark && next > mark);
      });
    });
  }

  /* ------------------------------------------------------------------
     COMPARTILHAR O SETUP: o link abre as calculadoras já preenchidas
     ------------------------------------------------------------------ */
  const SHARE = [['ppfd', '#in-ppfd'], ['h', '#in-hours'], ['temp', '#in-temp'], ['rh', '#in-rh'], ['off', '#in-off'], ['b', '#in-bends'], ['a', '#in-ach'], ['w', '#in-watts'], ['x', '#in-extra'], ['v', '#in-veg'], ['tf', '#in-tariff']];
  function shareUrl() {
    const q = new URLSearchParams({ t: S.tent, k: S.auto ? 'auto' : 'foto', p: S.phase });
    SHARE.forEach(([k, sel]) => q.set(k, $(sel).value));
    if ($('#in-co2').checked) q.set('co2', '1');
    if (!$('#in-filter').checked) q.set('f', '0');
    q.set('c', $('#in-currency').value);
    return `${siteUrl()}?${q}`;
  }
  // aplica um setup vindo de link; não grava nada no navegador de quem abriu
  function applyShared() {
    const q = new URLSearchParams(location.search);
    if (!q.has('t')) return false;
    if (D.tents[q.get('t')]) {
      S.tent = q.get('t');
      const r = $(`input[name="tent"][value="${S.tent}"]`); if (r) r.checked = true;
    }
    if (q.has('k')) S.auto = q.get('k') === 'auto';
    if (D.phases[q.get('p')]) S.phase = q.get('p');
    SHARE.forEach(([k, sel]) => {
      const v = q.get(k), input = $(sel);
      if (v !== null && v !== '' && !isNaN(Number(v))) input.value = clamp(Number(v), Number(input.min), Number(input.max));
    });
    $('#in-co2').checked = q.get('co2') === '1';
    $('#in-filter').checked = q.get('f') !== '0';
    if (['BRL', 'USD', 'EUR'].includes(q.get('c'))) $('#in-currency').value = q.get('c');
    S.wattsTouched = q.has('w');
    return true;
  }
  $('#share-btn').addEventListener('click', async () => {
    const url = shareUrl();
    if (navigator.share) {
      try { await navigator.share({ title: 'Meu setup de cultivo', text: 'Olha o meu setup no Growmetria:', url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); toast('Link do seu setup copiado.'); }
    catch { window.prompt('Copie o link do seu setup:', url); }
  });

  /* revelação ao rolar */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('[data-reveal]').forEach(n => io.observe(n));
  const revealIn = sel => {
    const t = sel && sel.length > 1 && document.getElementById(sel.slice(1));
    if (t) [t, ...t.querySelectorAll('[data-reveal]')].forEach(n => { n.classList.add('in'); io.unobserve(n); });
  };
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a) revealIn(a.getAttribute('href')); });
  revealIn(location.hash);

  /* ------------------------------------------------------------------
     INÍCIO
     ------------------------------------------------------------------ */
  $$('input[name="level"]').forEach(r => r.addEventListener('change', e => {
    store.set('igl-level', e.target.value);
    applyLevel(e.target.value);
  }));

  initTheme();
  initMenu();
  renderGuides();
  renderSymptoms();
  renderDiagnosis();
  const shared = applyShared();
  $$(`[data-bind="kind"] input[value="${S.auto ? 'auto' : 'foto'}"]`).forEach(i => { i.checked = true; });
  $$(`[data-bind="phase"] input[value="${S.phase}"]`).forEach(i => { i.checked = true; });
  if (S.auto && !shared) applyPreset();
  applyLevel(S.level);
  if (shared) setTimeout(() => toast('Você abriu um setup compartilhado. Mude o que quiser.'), 600);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  if (HAS_CYCLE) { anim.g = anim.tg; anim.b = anim.tb; renderPlant(anim.g, anim.b); }
})();
