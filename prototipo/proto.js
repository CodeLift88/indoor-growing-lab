/* ==========================================================================
   Indoor Growing Lab — protótipo
   Sem dependências: rolagem fixa, planta em SVG e calculadora de clima.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n, d = 1) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  /* ------------------------------------------------------------------
     NÍVEL DO LEITOR (iniciante → avançado)
     ------------------------------------------------------------------ */
  const LEVEL_NAMES = { 1: 'Nunca plantei', 2: 'Já fiz um ciclo', 3: 'Quero otimizar' };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem armazenamento */ } }
  };

  function applyLevel(v) {
    document.documentElement.dataset.level = v;
    $('#level-chip-text').textContent = LEVEL_NAMES[v];
    const radio = $(`input[name="level"][value="${v}"]`);
    if (radio) radio.checked = true;
    const math = $('#math');
    if (math) math.open = v === '3';
    if (v !== '3') { offset.value = -1.5; }
    updateClimate();
  }

  /* ------------------------------------------------------------------
     PLANTA EM SVG
     ------------------------------------------------------------------ */
  const plantG = $('#plant');
  const STEM_D = 'M200 438 C205 360 194 250 200 112';
  const stem = el('path', { d: STEM_D, class: 'stem' }, plantG);
  const STEM_LEN = stem.getTotalLength();
  stem.style.strokeDasharray = STEM_LEN;

  // folíolo serrilhado: pontos alternados criam os dentes
  function leafletPath(len, wid, teeth = 16) {
    const left = [], right = [];
    for (let i = 0; i <= teeth; i++) {
      const u = i / teeth;
      const w = wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.9) * (i % 2 ? 0.78 : 1);
      left.push([-w, -len * u]);
      right.push([w, -len * u]);
    }
    const pts = left.concat(right.reverse());
    return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
  }

  function fanLeaf(parent, count, size) {
    const g = el('g', {}, parent);
    const P = 18;
    el('line', { x1: 0, y1: 0, x2: 0, y2: -P, class: 'petiole' }, g);
    const spread = count >= 7 ? 82 : count === 5 ? 64 : count === 3 ? 42 : 0;
    const L = 58;
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
    const n = big ? 6 : 3;
    for (let i = 0; i < n; i++) {
      const y = -i * (big ? 9 : 7);
      const rx = (big ? 11 : 8) * (1 - i / (n * 1.6));
      el('ellipse', { cx: (i % 2 ? 2 : -2), cy: y, rx: rx.toFixed(1), ry: (rx * 0.8).toFixed(1), class: 'bud' }, g);
    }
    for (let i = 0; i < n * 2; i++) {
      const y = -(i / 2) * (big ? 9 : 7) - 2;
      const side = i % 2 ? 1 : -1;
      el('path', { d: `M${side * 3} ${y} q${side * 6} -2 ${side * 9} -7`, class: 'pistil' }, g);
    }
    return g;
  }

  // nós da planta: altura no caule, folíolos, tamanho
  const NODES = [
    { f: 0.12, n: 1, s: 0.5 },
    { f: 0.24, n: 3, s: 0.72 },
    { f: 0.37, n: 5, s: 0.95 },
    { f: 0.5, n: 7, s: 1.05 },
    { f: 0.62, n: 7, s: 1.0 },
    { f: 0.73, n: 5, s: 0.86 },
    { f: 0.83, n: 5, s: 0.7 }
  ];

  const seed = el('g', {}, plantG);
  el('path', { d: 'M200 446 q-2 12 3 22 m-3 -22 q4 8 -5 16', class: 'root' }, seed);
  el('ellipse', { cx: 200, cy: 444, rx: 6, ry: 4.2, class: 'seed', transform: 'rotate(-20 200 444)' }, seed);

  const coty = [-1, 1].map(side => {
    const g = el('g', {}, plantG);
    el('ellipse', { cx: side * 10, cy: 0, rx: 10, ry: 4.5, class: 'coty' }, g);
    return { g, side };
  });

  const nodes = NODES.map((d, i) => {
    const pt = stem.getPointAtLength(d.f * STEM_LEN);
    const leaves = [-1, 1].map(side => ({ side, ...fanLeaf(plantG, d.n, d.s) }));
    const buds = i >= 3 ? [-1, 1].map(side => ({ side, g: budCluster(plantG, false) })) : [];
    return { ...d, pt, leaves, buds, i };
  });
  const apex = fanLeaf(plantG, 3, 0.42);
  const apex2 = fanLeaf(plantG, 3, 0.42);
  const topCola = budCluster(plantG, true);

  const setT = (node, tx) => node.setAttribute('transform', tx);

  function renderPlant(g, b) {
    stem.style.strokeDashoffset = STEM_LEN * (1 - clamp(g));
    stem.style.strokeWidth = (1.6 + 4.2 * g).toFixed(2);

    seed.style.opacity = 1 - clamp((g - 0.02) / 0.05);

    const base = stem.getPointAtLength(0.035 * STEM_LEN);
    const cs = easeOut(clamp((g - 0.02) / 0.05)) * (1 - clamp((g - 0.4) / 0.2) * 0.5);
    coty.forEach(c => setT(c.g, `translate(${base.x} ${base.y - 4}) rotate(${c.side * -18}) scale(${cs.toFixed(3)})`));

    nodes.forEach(nd => {
      const grow = easeOut(clamp((g - nd.f - 0.01) / 0.13));
      const tilt = 62 - nd.i * 4;
      nd.leaves.forEach(lf => {
        const s = lf.size * grow;
        setT(lf.g, `translate(${nd.pt.x.toFixed(1)} ${nd.pt.y.toFixed(1)}) rotate(${lf.side * tilt}) scale(${s.toFixed(3)})`);
      });
      nd.buds.forEach(bd => {
        const s = easeOut(clamp(b * 1.15 - (nd.i - 3) * 0.05)) * (0.6 + nd.i * 0.08);
        setT(bd.g, `translate(${(nd.pt.x + bd.side * 16).toFixed(1)} ${(nd.pt.y - 8).toFixed(1)}) rotate(${bd.side * 24}) scale(${s.toFixed(3)})`);
      });
    });

    const tip = stem.getPointAtLength(clamp(g) * STEM_LEN);
    const as = easeOut(clamp((g - 0.06) / 0.08)) * (1 - easeOut(b) * 0.5);
    setT(apex.g, `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(-28) scale(${(apex.size * as).toFixed(3)})`);
    setT(apex2.g, `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(28) scale(${(apex2.size * as).toFixed(3)})`);
    setT(topCola, `translate(${tip.x.toFixed(1)} ${(tip.y + 14).toFixed(1)}) scale(${(easeOut(b) * 1.15).toFixed(3)})`);
  }

  // diodos da luminária
  const diodes = $('.lamp__diodes');
  for (let i = 0; i < 12; i++) el('circle', { cx: 116 + i * 15.3, cy: 42, r: 1.6 }, diodes);

  // tricomas na lupa
  const trich = $('#trichomes');
  for (let i = 0; i < 11; i++) {
    const x = 276 + i * 8 + (i % 3) * 2;
    const h = 26 + ((i * 37) % 22);
    const y0 = 214;
    el('line', { x1: x, y1: y0, x2: x + (i % 2 ? 2 : -2), y2: y0 - h, class: 'trich-stalk' }, trich);
    const amber = i === 3 || i === 8;
    const clear = i === 6;
    el('circle', {
      cx: x + (i % 2 ? 2 : -2), cy: y0 - h - 4, r: 5,
      class: 'trich-head',
      fill: amber ? '#d08a2e' : clear ? 'rgba(230,236,240,.25)' : '#ece6d6'
    }, trich);
  }

  // botões dentro do pote
  const jarBuds = $('.jar__buds');
  [[306, 476, 11], [330, 482, 12], [318, 456, 10], [342, 458, 9], [304, 438, 8], [328, 432, 9]]
    .forEach(([cx, cy, r]) => el('ellipse', { cx, cy, rx: r, ry: r * 0.82, class: 'bud' }, jarBuds));

  /* ------------------------------------------------------------------
     ANEL DO FOTOPERÍODO (24 h)
     ------------------------------------------------------------------ */
  const ring = $('#photo-ring');
  const ringSegs = [];
  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2 - Math.PI / 2 + 0.025;
    const a1 = ((i + 1) / 24) * Math.PI * 2 - Math.PI / 2 - 0.025;
    const R = 30, r = 21, c = 32;
    const p = (a, rad) => `${(c + Math.cos(a) * rad).toFixed(2)} ${(c + Math.sin(a) * rad).toFixed(2)}`;
    const d = `M${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(a1, r)} A${r} ${r} 0 0 0 ${p(a0, r)}Z`;
    const s = el('path', { d, class: 'seg' }, ring);
    s.style.transitionDelay = `${i * 18}ms`;
    ringSegs.push(s);
  }

  /* ------------------------------------------------------------------
     CICLO — rolagem fixa
     ------------------------------------------------------------------ */
  const cycle = $('#ciclo');
  const stages = $$('.stage', cycle);
  const railBtns = $$('#rail-steps button');
  const railFill = $('#rail-fill');
  const counter = $('#cycle-count');
  const photoVal = $('#photo-val');
  const masthead = $('#masthead');
  const N = stages.length;

  // crescimento ao longo do ciclo (marcos por fase)
  const G_KEYS = [0, 0.1, 0.32, 0.68, 1, 1, 1];
  const growthAt = p => {
    const x = p * N, i = Math.min(N - 1, Math.floor(x));
    return lerp(G_KEYS[i], G_KEYS[i + 1], easeOut(x - i));
  };
  const budsAt = p => clamp((p * N - 3.15) / 1.1);

  let current = -1;
  function setStage(i) {
    if (i === current) return;
    current = i;
    cycle.dataset.stage = i;
    stages.forEach((s, k) => s.classList.toggle('is-active', k === i));
    railBtns.forEach((b, k) => {
      b.classList.toggle('is-active', k <= i);
      b.setAttribute('aria-current', k === i ? 'step' : 'false');
    });
    counter.textContent = String(i + 1).padStart(2, '0');
    const st = stages[i];
    cycle.style.setProperty('--glow', st.dataset.glow);
    const h = Number(st.dataset.hours);
    ringSegs.forEach((s, k) => s.classList.toggle('on', k < h));
    photoVal.textContent = h === 0 ? 'Luz apagada' : `${h} h de luz · ${24 - h} h de escuro`;
  }

  const anim = { g: 0, b: 0, tg: 0, tb: 0 };
  let ticking = false;

  function cycleProgress() {
    const r = cycle.getBoundingClientRect();
    const span = cycle.offsetHeight - innerHeight;
    return clamp(-r.top / span);
  }

  function onScroll() {
    const p = cycleProgress();
    setStage(Math.min(N - 1, Math.floor(p * N)));
    railFill.style.transform = `scaleX(${p.toFixed(4)})`;
    anim.tg = growthAt(p);
    anim.tb = budsAt(p);

    const r = cycle.getBoundingClientRect();
    masthead.classList.toggle('on-night', r.top <= 40 && r.bottom > 40);

    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }

  function tick() {
    const k = reduced ? 1 : 0.14;
    anim.g += (anim.tg - anim.g) * k;
    anim.b += (anim.tb - anim.b) * k;
    renderPlant(anim.g, anim.b);
    if (Math.abs(anim.tg - anim.g) > 0.0005 || Math.abs(anim.tb - anim.b) > 0.0005) {
      requestAnimationFrame(tick);
    } else {
      ticking = false;
    }
  }

  railBtns.forEach(btn => btn.addEventListener('click', () => {
    const i = Number(btn.dataset.step);
    const span = cycle.offsetHeight - innerHeight;
    const top = cycle.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + span * ((i + 0.5) / N), behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ------------------------------------------------------------------
     CALCULADORA DE CLIMA (VPD)
     ------------------------------------------------------------------ */
  const svp = t => 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
  const TARGETS = { muda: [0.4, 0.8], veg: [0.8, 1.2], flor: [1.2, 1.5] };

  const temp = $('#in-temp'), rh = $('#in-rh'), offset = $('#in-off');
  const form = $('#climate-form');
  const X0 = 56, X1 = 536, Y0 = 20, Y1 = 316;
  const T_MIN = 16, T_MAX = 35, RH_MIN = 30, RH_MAX = 90;
  const sx = t => X0 + ((t - T_MIN) / (T_MAX - T_MIN)) * (X1 - X0);
  const sy = h => Y0 + ((RH_MAX - h) / (RH_MAX - RH_MIN)) * (Y1 - Y0);
  const rhFor = (t, off, vpd) => ((svp(t + off) - vpd) / svp(t)) * 100;

  // grade e eixos
  const grid = $('#chart-grid');
  for (let t = 16; t <= 34; t += 2) {
    el('line', { x1: sx(t), x2: sx(t), y1: Y0, y2: Y1 }, grid);
    if (t % 4 === 0) el('text', { x: sx(t), y: Y1 + 18, 'text-anchor': 'middle' }, grid).textContent = `${t}°`;
  }
  for (let h = 30; h <= 90; h += 10) {
    el('line', { x1: X0, x2: X1, y1: sy(h), y2: sy(h) }, grid);
    el('text', { x: X0 - 10, y: sy(h) + 4, 'text-anchor': 'end' }, grid).textContent = `${h}%`;
  }
  el('line', { x1: X0, x2: X1, y1: Y1, y2: Y1, class: 'axis' }, grid);
  el('line', { x1: X0, x2: X0, y1: Y0, y2: Y1, class: 'axis' }, grid);
  el('text', { x: X1, y: Y1 + 34, 'text-anchor': 'end' }, grid).textContent = 'temperatura do ar →';

  const zHumid = $('#z-humid'), zOk = $('#z-ok'), labOk = $('#lab-ok');
  const probe = $('#probe'), probeX = $('#probe-x'), probeY = $('#probe-y');

  function bandPoints(off, [vMin, vMax]) {
    const hi = [], lo = [];
    for (let t = T_MIN; t <= T_MAX + 1e-6; t += 0.5) {
      hi.push(clamp(rhFor(t, off, vMin), RH_MIN, RH_MAX));
      lo.push(clamp(rhFor(t, off, vMax), RH_MIN, RH_MAX));
    }
    return { hi, lo };
  }
  const tempsAt = i => T_MIN + i * 0.5;

  let band = null, bandAnim = null;
  function drawBand(b) {
    const up = b.hi.map((h, i) => `${sx(tempsAt(i)).toFixed(1)} ${sy(h).toFixed(1)}`);
    const dn = b.lo.map((h, i) => `${sx(tempsAt(i)).toFixed(1)} ${sy(h).toFixed(1)}`).reverse();
    zOk.setAttribute('d', `M${up.join('L')}L${dn.join('L')}Z`);
    zHumid.setAttribute('d', `M${X0} ${Y0}L${up.join('L')}L${X1} ${Y0}Z`);
    // rótulo onde a faixa passa perto de 58% de umidade
    let mid = 0, best = Infinity;
    b.hi.forEach((h, i) => { const d = Math.abs((h + b.lo[i]) / 2 - 58); if (d < best) { best = d; mid = i; } });
    labOk.setAttribute('x', sx(tempsAt(mid)));
    labOk.setAttribute('text-anchor', 'middle');
    labOk.setAttribute('y', (sy((b.hi[mid] + b.lo[mid]) / 2) + 4).toFixed(1));
  }
  function morphBand(next) {
    if (!band || reduced) { band = next; drawBand(band); return; }
    const from = band, start = performance.now(), dur = 520;
    cancelAnimationFrame(bandAnim);
    const step = now => {
      const t = easeOut(clamp((now - start) / dur));
      band = {
        hi: from.hi.map((v, i) => lerp(v, next.hi[i], t)),
        lo: from.lo.map((v, i) => lerp(v, next.lo[i], t))
      };
      drawBand(band);
      if (t < 1) bandAnim = requestAnimationFrame(step);
      else band = next;
    };
    bandAnim = requestAnimationFrame(step);
  }

  // número que desliza até o valor novo
  const kpaEl = $('#v-kpa');
  let kpaShown = null, kpaRaf = null;
  function animateKpa(to) {
    if (kpaShown === null || reduced) { kpaShown = to; kpaEl.textContent = fmt(to, 2); return; }
    const from = kpaShown, start = performance.now();
    cancelAnimationFrame(kpaRaf);
    const step = now => {
      const t = easeOut(clamp((now - start) / 380));
      kpaShown = lerp(from, to, t);
      kpaEl.textContent = fmt(kpaShown, 2);
      if (t < 1) kpaRaf = requestAnimationFrame(step);
    };
    kpaRaf = requestAnimationFrame(step);
  }

  const COPY = {
    ok: {
      word: 'Confortável',
      body: 'A folha transpira no ritmo certo: a planta puxa água e nutrientes sem estresse.'
    },
    humid: {
      word: 'Úmido demais',
      body: 'A planta transpira devagar e cresce menos. Ar úmido e parado é convite para mofo, ainda mais na floração.'
    },
    dry: {
      word: 'Seco demais',
      body: 'A planta perde água mais rápido do que repõe, fecha os poros e para de crescer. As folhas enrolam para cima.'
    }
  };

  let lastState = '';
  let lastPhase = '';
  function updateClimate() {
    const t = Number(temp.value), h = Number(rh.value);
    const off = document.documentElement.dataset.level === '3' ? Number(offset.value) : -1.5;
    const phase = form.querySelector('input[name="phase"]:checked').value;
    const [vMin, vMax] = TARGETS[phase];

    // sliders: preenchimento da trilha
    [temp, rh, offset].forEach(r => {
      const pct = ((r.value - r.min) / (r.max - r.min)) * 100;
      r.style.setProperty('--fill', pct + '%');
    });
    $('#out-temp').textContent = `${fmt(t)} °C`;
    $('#out-rh').textContent = `${h}%`;
    $('#out-off').textContent = `${off > 0 ? '+' : off < 0 ? '−' : ''}${fmt(Math.abs(off))} °C`;

    const sAir = svp(t), sLeaf = svp(t + off), vpAir = sAir * h / 100;
    const vpd = Math.max(0, sLeaf - vpAir);

    let state = vpd < vMin ? 'humid' : vpd > vMax ? 'dry' : 'ok';
    const mid = (vMin + vMax) / 2;
    const rhMid = rhFor(t, off, mid);
    const rhLo = rhFor(t, off, vMax), rhHi = rhFor(t, off, vMin);

    let action;
    if (state === 'ok') {
      action = `Mantenha assim. A ${fmt(t)} °C, a umidade pode ficar entre ${Math.max(30, Math.round(rhLo))}% e ${Math.min(90, Math.round(rhHi))}%.`;
    } else if (rhMid >= 30 && rhMid <= 90) {
      action = state === 'humid'
        ? `Baixe a umidade para perto de ${Math.round(rhMid)}% (desumidificador ou mais exaustão).`
        : `Suba a umidade para perto de ${Math.round(rhMid)}% (umidificador) ou baixe a temperatura.`;
    } else {
      action = 'Só a umidade não resolve nessa temperatura. Ajuste o calor primeiro.';
    }

    let body = COPY[state].body;
    let word = COPY[state].word;
    let vstate = state;
    if (t > 30) { word = 'Quente demais'; vstate = 'hot'; body = 'Acima de 30 °C a planta sofre mesmo com a umidade certa: as folhas se fecham e o crescimento trava. ' + (state === 'ok' ? '' : body); action = 'Baixe a temperatura para 24–28 °C com mais exaustão ou ar-condicionado.'; }
    else if (t < 18) { word = 'Frio demais'; vstate = 'cold'; body = 'Abaixo de 18 °C o metabolismo desacelera e as raízes absorvem menos.'; action = 'Aqueça o ambiente para 22–26 °C.'; }

    const verdict = $('#verdict');
    verdict.dataset.state = vstate;
    const wordEl = $('#v-word');
    if (word !== lastState) {
      wordEl.textContent = word;
      wordEl.classList.remove('swap'); void wordEl.offsetWidth; wordEl.classList.add('swap');
      lastState = word;
    }
    $('#v-body').textContent = body;
    $('#v-action').textContent = action;
    $('#v-target').textContent = `${fmt(vMin)}–${fmt(vMax)}`;
    animateKpa(vpd);

    // gráfico
    const key = phase + off;
    if (key !== lastPhase) { morphBand(bandPoints(off, TARGETS[phase])); lastPhase = key; }
    const px = sx(t), py = sy(h);
    probe.style.transform = `translate(${px}px, ${py}px)`;
    probeX.setAttribute('x1', 0); probeX.setAttribute('x2', 0);
    probeX.setAttribute('y1', 0); probeX.setAttribute('y2', Y1 - py);
    probeY.setAttribute('x1', 0); probeY.setAttribute('x2', X0 - px);
    probeY.setAttribute('y1', 0); probeY.setAttribute('y2', 0);

    // matemática aberta
    $('#math-body').innerHTML = `
      <p><b>Pressão de saturação (Tetens)</b><br>SVP(T) = 0,6108 · e<sup>17,27·T / (T + 237,3)</sup></p>
      <p>SVP do ar (${fmt(t)} °C) = <b>${fmt(sAir, 3)} kPa</b><br>
         SVP da folha (${fmt(t + off)} °C) = <b>${fmt(sLeaf, 3)} kPa</b><br>
         Vapor real no ar = ${fmt(sAir, 3)} × ${h}% = <b>${fmt(vpAir, 3)} kPa</b></p>
      <p><b>VPD da folha</b> = ${fmt(sLeaf, 3)} − ${fmt(vpAir, 3)} = <b>${fmt(vpd, 2)} kPa</b><br>
         Alvo para ${phase === 'muda' ? 'muda' : phase === 'veg' ? 'vegetativo' : 'floração'}: ${fmt(vMin)}–${fmt(vMax)} kPa</p>`;
  }

  [temp, rh, offset].forEach(r => r.addEventListener('input', updateClimate));
  form.addEventListener('change', updateClimate);

  /* ------------------------------------------------------------------
     REVELAÇÃO AO ROLAR
     ------------------------------------------------------------------ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('[data-reveal]').forEach(n => io.observe(n));

  /* ------------------------------------------------------------------
     INÍCIO
     ------------------------------------------------------------------ */
  $$('input[name="level"]').forEach(r => r.addEventListener('change', e => {
    store.set('igl-level', e.target.value);
    applyLevel(e.target.value);
  }));

  applyLevel(store.get('igl-level') || '1');
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  anim.g = anim.tg; anim.b = anim.tb;
  renderPlant(anim.g, anim.b);
})();
