/* ==========================================================================
   Growmetria — diário de cultivo
   Anotações no localStorage ('igl-diary'); fotos no IndexedDB ('igl-photos').
   Nada vai para servidor. As fotos são redesenhadas ao salvar, o que apaga
   os metadados da imagem (inclusive a localização do GPS).
   ========================================================================== */
(() => {
  'use strict';
  const P = window.IGL_PLAN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'igl-diary';
  const DAY = P.DAY;
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const TYPES = {
    foto: { label: 'Foto', color: '#9bc23c' },
    rega: { label: 'Rega', color: '#5b86b8' },
    adubo: { label: 'Adubo', color: '#e0913f' },
    medicao: { label: 'Medição', color: '#8f8b7c' },
    obs: { label: 'Observação', color: '#3a3f31' },
    treino: { label: 'Treino ou poda', color: '#4c7a2b' },
    problema: { label: 'Problema', color: '#b4532f' }
  };
  const MEASURES = [
    ['h', 'Altura', 'cm', 1, 0, 300],
    ['t', 'Temperatura', '°C', 0.5, 0, 50],
    ['rh', 'Umidade', '%', 1, 0, 100],
    ['ph', 'pH', '', 0.1, 0, 14],
    ['l', 'Água', 'L', 0.1, 0, 100]
  ];
  // faixas de VPD por fase (kPa), as mesmas da calculadora de clima
  const VPD_RANGE = { 'Muda': [0.4, 0.8], 'Vegetativo': [0.8, 1.2], 'Floração': [1.2, 1.5] };

  // --------- dados ---------
  const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  let entries = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(entries)); return true; } catch { toast('Não foi possível salvar neste navegador.'); return false; } };

  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const parse = s => new Date(s + 'T12:00:00');
  const today = () => parse(iso(new Date()));
  const daysBetween = (a, b) => Math.round((b - a) / DAY);
  const fmtDate = (d, opts) => d.toLocaleDateString('pt-BR', opts || { day: 'numeric', month: 'short' }).replace(/\./g, '');
  const num = (v, d = 1) => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: d });
  const ago = n => n === 0 ? 'hoje' : n === 1 ? 'ontem' : `há ${n} dias`;
  const inDays = n => n <= 0 ? 'hoje' : n === 1 ? 'amanhã' : `em ${n} dias`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function plan() {
    const s = P.saved();
    return s.start ? P.build(s.start, s.auto, s.veg) : null;
  }
  // dia do cultivo, fase e semana da fase numa data
  function ctxFor(dateStr) {
    const pl = plan(); if (!pl) return null;
    const d = parse(dateStr);
    const day = daysBetween(pl.steps[0].date, d) + 1;
    if (day < 1) return null;
    const w = P.where(pl, d);
    if (!w.now) return { day };
    const first = pl.steps.find(s => s.phase === w.now.phase) || w.now;
    return { day, phase: w.now.phase, wk: Math.floor(daysBetween(first.date, d) / 7) + 1 };
  }
  const ctxOf = e => e.ctx || ctxFor(e.date);
  const ctxLabel = c => !c ? '' : `Dia ${c.day}${c.phase ? ` · ${c.phase}${c.wk ? ` · semana ${c.wk}` : ''}` : ''}`;

  // VPD da folha (folha 1,5 °C mais fria que o ar)
  const svp = T => 0.6108 * Math.exp(17.27 * T / (T + 237.3));
  const vpdOf = (t, rh) => Math.max(0, svp(t - 1.5) - svp(t) * rh / 100);
  function vpdInfo(t, rh, phase) {
    const v = vpdOf(t, rh), r = VPD_RANGE[phase];
    const state = !r ? '' : v < r[0] ? 'úmido demais' : v > r[1] ? 'seco demais' : 'na faixa';
    return { v, state, ok: state === 'na faixa' };
  }

  // --------- fotos (IndexedDB) ---------
  const DB = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      if (!('indexedDB' in window)) { rej(new Error('sem IndexedDB')); return; }
      const r = indexedDB.open('igl-photos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const run = (mode, fn) => open().then(db => new Promise((res, rej) => {
      const tx = db.transaction('photos', mode);
      const req = fn(tx.objectStore('photos'));
      tx.oncomplete = () => res(req ? req.result : undefined);
      tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
    }));
    return {
      put: (id, blob) => run('readwrite', s => s.put(blob, id)),
      get: id => run('readonly', s => s.get(id)),
      del: id => run('readwrite', s => s.delete(id)),
      keys: () => run('readonly', s => s.getAllKeys()),
      clear: () => run('readwrite', s => s.clear())
    };
  })();
  const urls = new Map();
  async function photoUrl(id) {
    if (urls.has(id)) return urls.get(id);
    try {
      const b = await DB.get(id); if (!b) return null;
      const u = URL.createObjectURL(b); urls.set(id, u); return u;
    } catch { return null; }
  }
  function hydrate(root) {
    $$('img[data-photo]', root).forEach(async img => {
      const u = await photoUrl(img.dataset.photo);
      if (u) img.src = u; else img.closest('[data-open]')?.classList.add('is-missing');
    });
  }
  // reduz para no máximo 1600 px e regrava em JPEG: some o GPS e o resto dos metadados
  async function compress(file) {
    let src;
    try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch {
      src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
    }
    const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight;
    const k = Math.min(1, 1600 / Math.max(w0, h0));
    const c = document.createElement('canvas');
    c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    if (src.close) src.close();
    return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/jpeg', 0.82));
  }

  // --------- painel ---------
  function renderStats() {
    const pl = plan(), t = today();
    const tiles = [];
    if (pl) {
      const day = daysBetween(pl.steps[0].date, t) + 1;
      const w = P.where(pl, t);
      tiles.push(day >= 1
        ? { k: 'Dia do cultivo', v: `Dia ${day}`, s: w.now ? w.now.phase : 'Antes da germinação' }
        : { k: 'Começa em', v: `${-day + 1} dias`, s: fmtDate(pl.steps[0].date, { day: 'numeric', month: 'long' }) });
      tiles.push(w.next
        ? { k: 'Próximo marco', v: w.next.title, s: `${inDays(daysBetween(t, w.next.date))} · ${fmtDate(w.next.date)}`, small: true }
        : { k: 'Próximo marco', v: 'Ciclo concluído', s: 'Hora de planejar o próximo.', small: true });
    } else {
      tiles.push({ k: 'Dia do cultivo', v: '—', s: '<a href="calculadoras/calendario.html">Defina a data de início</a>', html: true });
    }
    const regas = entries.filter(e => e.type === 'rega').map(e => parse(e.date)).sort((a, b) => a - b);
    if (regas.length) {
      const last = regas[regas.length - 1];
      let sub = `${regas.length} ${regas.length === 1 ? 'rega anotada' : 'regas anotadas'}`;
      if (regas.length >= 3) {
        const gaps = regas.slice(1).map((d, i) => daysBetween(regas[i], d)).filter(g => g > 0);
        if (gaps.length) sub = `a cada ${num(gaps.reduce((a, b) => a + b, 0) / gaps.length)} dias, em média`;
      }
      tiles.push({ k: 'Última rega', v: ago(daysBetween(last, t)), s: sub });
    } else {
      tiles.push({ k: 'Última rega', v: '—', s: 'Nenhuma rega anotada' });
    }
    const nPhotos = entries.filter(e => e.photo).length;
    tiles.push({ k: 'Anotações', v: String(entries.length), s: entries.length ? `${nPhotos ? `${nPhotos} com foto · ` : ''}desde ${fmtDate(parse(entries.reduce((a, e) => e.date < a ? e.date : a, entries[0].date)))}` : 'comece pela primeira' });

    $('#dstat').innerHTML = tiles.map(x => `
      <div class="dtile">
        <p class="dtile__k">${x.k}</p>
        <p class="dtile__v ${x.small ? 'dtile__v--sm' : ''}">${esc(x.v)}</p>
        <p class="dtile__s">${x.html ? x.s : esc(x.s)}</p>
      </div>`).join('');
  }

  // --------- linha do tempo de fotos ---------
  const photoEntries = () => entries.filter(e => e.photo).sort((a, b) => (a.date + a.created).localeCompare(b.date + b.created));
  function renderGallery() {
    const list = photoEntries();
    const box = $('#dgallery');
    box.hidden = !list.length;
    if (!list.length) { $('#dgallery-strip').innerHTML = ''; return; }
    const first = parse(list[0].date), last = parse(list[list.length - 1].date);
    $('#dgallery-cap').textContent = `${list.length} ${list.length === 1 ? 'foto' : 'fotos'}${list.length > 1 ? ` · ${fmtDate(first)} a ${fmtDate(last)}` : ''}`;
    const strip = $('#dgallery-strip');
    strip.innerHTML = list.map(e => {
      const c = ctxOf(e);
      return `<button type="button" class="dthumb" data-open="${e.id}">
        <img data-photo="${e.photo}" alt="Foto de ${fmtDate(parse(e.date), { day: 'numeric', month: 'long' })}" loading="lazy" />
        <span class="dthumb__d">${c ? `Dia ${c.day}` : esc(fmtDate(parse(e.date)))}</span>
        <span class="dthumb__p">${c && c.phase ? esc(c.phase) : esc(fmtDate(parse(e.date)))}</span>
      </button>`;
    }).join('');
    hydrate(strip);
    requestAnimationFrame(() => { strip.scrollLeft = strip.scrollWidth; });
  }

  function measuresHtml(e, phase) {
    if (!e.m || !Object.keys(e.m).length) return '';
    const parts = MEASURES.filter(([k]) => e.m[k] !== undefined).map(([k, label, unit]) => `<span>${label} <b>${num(e.m[k])}${unit ? ' ' + unit : ''}</b></span>`);
    if (e.m.t !== undefined && e.m.rh !== undefined) {
      const v = vpdInfo(e.m.t, e.m.rh, phase);
      parts.push(`<span class="${v.state ? (v.ok ? 'is-ok' : 'is-warn') : ''}">VPD <b>${num(v.v, 2)} kPa</b>${v.state ? ` · ${v.state}` : ''}</span>`);
    }
    return `<p class="dentry__m">${parts.join('')}</p>`;
  }

  // --------- histórico ---------
  let filter = 'all';
  function renderList() {
    const list = entries.filter(e => filter === 'all' || (filter === 'foto' ? (e.photo || e.type === 'foto') : e.type === filter))
      .sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created));
    $('#dempty').hidden = list.length > 0;
    $('#dempty').textContent = entries.length ? 'Nenhuma anotação desse tipo.' : 'Nenhuma anotação ainda. Que tal começar com uma foto da planta hoje?';
    const groups = [];
    list.forEach(e => { const g = groups[groups.length - 1]; if (g && g.date === e.date) g.items.push(e); else groups.push({ date: e.date, items: [e] }); });
    $('#dlist').innerHTML = groups.map(g => {
      const d = parse(g.date);
      const c = ctxFor(g.date);
      const meta = fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' }) + (c ? ' · ' + ctxLabel(c) : '');
      return `<li class="dgroup">
        <p class="dgroup__date">${esc(cap(meta))}</p>
        <ul>${g.items.map(e => {
          const ec = ctxOf(e);
          return `
          <li class="dentry${e.photo ? ' has-photo' : ''}" data-id="${e.id}">
            ${e.photo ? `<button type="button" class="dentry__img" data-open="${e.id}" aria-label="Ver foto"><img data-photo="${e.photo}" alt="" loading="lazy" /></button>` : ''}
            <div class="dentry__body">
              <span class="dentry__type"><i style="background:${TYPES[e.type] ? TYPES[e.type].color : '#999'}"></i>${esc(TYPES[e.type] ? TYPES[e.type].label : e.type)}</span>
              ${e.note ? `<p class="dentry__note">${esc(e.note)}</p>` : ''}
              ${measuresHtml(e, ec && ec.phase)}
            </div>
            <button type="button" class="dentry__del" data-del="${e.id}" aria-label="Apagar anotação">×</button>
          </li>`;
        }).join('')}
        </ul>
      </li>`;
    }).join('');
    hydrate($('#dlist'));
    renderChart();
  }

  // gráfico da altura ao longo do tempo
  function renderChart() {
    const pts = entries.filter(e => e.m && e.m.h !== undefined).map(e => ({ d: parse(e.date), v: Number(e.m.h) })).sort((a, b) => a.d - b.d);
    const fig = $('#dchart');
    if (pts.length < 2) { fig.hidden = true; return; }
    fig.hidden = false;
    const X0 = 40, X1 = 548, Y0 = 14, Y1 = 132;
    const t0 = pts[0].d, t1 = pts[pts.length - 1].d, span = Math.max(1, t1 - t0);
    const max = Math.max(...pts.map(p => p.v)) * 1.1 || 1;
    const x = d => X0 + ((d - t0) / span) * (X1 - X0), y = v => Y1 - (v / max) * (Y1 - Y0);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)} ${y(p.v).toFixed(1)}`).join('');
    const area = `${line}L${x(t1).toFixed(1)} ${Y1}L${X0} ${Y1}Z`;
    const growth = pts[pts.length - 1].v - pts[0].v, days = daysBetween(t0, t1);
    $('#dchart-svg').innerHTML = `
      <line x1="${X0}" x2="${X1}" y1="${Y1}" y2="${Y1}" class="dchart__axis" />
      <text x="${X0 - 6}" y="${y(max / 1.1) + 4}" text-anchor="end" class="dchart__t">${num(max / 1.1)}</text>
      <text x="${X0 - 6}" y="${Y1 + 4}" text-anchor="end" class="dchart__t">0</text>
      <path d="${area}" class="dchart__area" />
      <path d="${line}" class="dchart__line" />
      ${pts.map(p => `<circle cx="${x(p.d).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4" class="dchart__dot"><title>${fmtDate(p.d)}: ${num(p.v)} cm</title></circle>`).join('')}
      <text x="${X0}" y="${Y1 + 20}" class="dchart__t">${fmtDate(t0)}</text>
      <text x="${X1}" y="${Y1 + 20}" text-anchor="end" class="dchart__t">${fmtDate(t1)}</text>`;
    $('#dchart-cap').textContent = `Altura: ${growth >= 0 ? '+' : ''}${num(growth)} cm em ${days} ${days === 1 ? 'dia' : 'dias'}${days > 0 ? `, cerca de ${num(growth / days)} cm por dia` : ''}.`;
  }

  // --------- formulário ---------
  let type = 'foto', typeTouched = false;
  const typeBox = $('#dtypes');
  const setType = k => { type = k; const r = $(`input[name="dtype"][value="${k}"]`, typeBox); if (r) r.checked = true; };
  typeBox.innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <label class="dtype"><input type="radio" name="dtype" value="${k}" ${k === type ? 'checked' : ''} /><span><i style="background:${t.color}"></i>${t.label}</span></label>`).join('');
  typeBox.addEventListener('change', e => { type = e.target.value; typeTouched = true; if (type === 'medicao') $('#d-measure').open = true; });

  $('#d-mgrid').innerHTML = MEASURES.map(([k, label, unit, step, min, max]) => `
    <label class="dm"><span class="ctl__label">${label}${unit ? ` (${unit})` : ''}</span>
      <input type="number" inputmode="decimal" data-m="${k}" step="${step}" min="${min}" max="${max}" /></label>`).join('');

  const dateIn = $('#d-date');
  dateIn.value = iso(new Date());

  // dados do momento: aparecem ao lado da data e mudam com ela
  function renderCtx() {
    const c = ctxFor(dateIn.value || iso(new Date()));
    const box = $('#d-ctx');
    box.innerHTML = c ? `<b>${esc(ctxLabel(c))}</b>` : 'Defina a data de início no <a href="calculadoras/calendario.html">calendário</a> para ver o dia e a fase.';
    renderVpd();
  }
  function renderVpd() {
    const t = $('[data-m="t"]').value, rh = $('[data-m="rh"]').value, out = $('#d-vpd');
    if (t === '' || rh === '') { out.hidden = true; return; }
    const c = ctxFor(dateIn.value || iso(new Date()));
    const v = vpdInfo(Number(t), Number(rh), c && c.phase);
    out.hidden = false;
    out.className = 'dvpd' + (v.state ? (v.ok ? ' is-ok' : ' is-warn') : '');
    out.innerHTML = `VPD <b>${num(v.v, 2)} kPa</b>${v.state ? `: ${v.state}${c && c.phase ? ` para ${c.phase.toLowerCase()}` : ''}` : ''}`;
  }
  dateIn.addEventListener('change', renderCtx);
  $('#d-mgrid').addEventListener('input', renderVpd);

  // foto escolhida (câmera ou galeria)
  let pending = null, pendingUrl = '';
  const pick = $('#d-photo'), prev = $('#dphoto-prev'), pickLab = $('#dphoto-pick');
  function clearPending() {
    pending = null; if (pendingUrl) URL.revokeObjectURL(pendingUrl); pendingUrl = '';
    prev.hidden = true; pickLab.hidden = false; pick.value = '';
  }
  pick.addEventListener('change', async () => {
    const file = pick.files[0]; if (!file) return;
    pickLab.classList.add('is-busy');
    try {
      pending = await compress(file);
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      pendingUrl = URL.createObjectURL(pending);
      $('#dphoto-img').src = pendingUrl;
      $('#dphoto-size').textContent = `${num(pending.size / 1024, 0)} KB · sem localização`;
      prev.hidden = false; pickLab.hidden = true;
      if (!typeTouched) setType('foto');
    } catch {
      toast('Não deu para abrir essa imagem. Tente outra foto.');
      clearPending();
    }
    pickLab.classList.remove('is-busy');
  });
  $('#dphoto-del').addEventListener('click', clearPending);

  $('#dform').addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#d-note').value.trim();
    const m = {};
    $$('[data-m]').forEach(i => { if (i.value !== '' && !isNaN(Number(i.value))) m[i.dataset.m] = Number(i.value); });
    if (!note && !Object.keys(m).length && !pending) { toast('Adicione uma foto, escreva algo ou preencha uma medição.'); $('#d-note').focus(); return; }
    const date = dateIn.value || iso(new Date());
    const entry = { id: newId(), date, type, note, m, created: new Date().toISOString() };
    const c = ctxFor(date); if (c) entry.ctx = c;
    if (pending) {
      const pid = 'p-' + newId();
      try { await DB.put(pid, pending); }
      catch { toast('Não deu para guardar a foto neste navegador. A anotação não foi salva.'); return; }
      entry.photo = pid;
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    }
    entries.push(entry);
    if (!save()) return;
    $('#d-note').value = '';
    $$('[data-m]').forEach(i => { i.value = ''; });
    renderVpd();
    clearPending();
    typeTouched = false; setType('foto');
    toast(entry.photo ? 'Foto salva no diário.' : 'Anotação salva.');
    renderAll();
  });

  // --------- foto ampliada ---------
  const view = $('#dview');
  let viewId = null;
  async function openView(id) {
    const list = photoEntries();
    const i = list.findIndex(x => x.id === id); if (i < 0) return;
    const e = list[i]; viewId = id;
    const c = ctxOf(e);
    $('#dview-t').textContent = cap(fmtDate(parse(e.date), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    $('#dview-ctx').textContent = c ? ctxLabel(c) : '';
    $('#dview-note').textContent = e.note || '';
    $('#dview-note').hidden = !e.note;
    $('#dview-m').innerHTML = measuresHtml(e, c && c.phase);
    $('#dview-n').textContent = `${i + 1} de ${list.length}`;
    $('#dview-prev').disabled = i === 0;
    $('#dview-next').disabled = i === list.length - 1;
    const img = $('#dview-img');
    img.removeAttribute('src');
    img.alt = `Foto de ${fmtDate(parse(e.date), { day: 'numeric', month: 'long' })}`;
    const u = await photoUrl(e.photo); if (u && viewId === id) img.src = u;
    if (!view.open) view.showModal();
  }
  function step(dir) {
    const list = photoEntries(), i = list.findIndex(x => x.id === viewId);
    const n = list[i + dir]; if (n) openView(n.id);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-open]'); if (!b) return;
    openView(b.dataset.open);
  });
  $('#dview-prev').addEventListener('click', () => step(-1));
  $('#dview-next').addEventListener('click', () => step(1));
  $('#dview-close').addEventListener('click', () => view.close());
  view.addEventListener('click', e => { if (e.target === view) view.close(); });
  view.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  $('#dview-save').addEventListener('click', async () => {
    const e = entries.find(x => x.id === viewId); if (!e) return;
    const b = await DB.get(e.photo).catch(() => null); if (!b) return;
    const c = ctxOf(e);
    const url = URL.createObjectURL(b);
    const a = Object.assign(document.createElement('a'), { href: url, download: `growmetria-${e.date}${c ? `-dia-${c.day}` : ''}.jpg` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // --------- apagar com desfazer ---------
  let lastDeleted = null;
  $('#dlist').addEventListener('click', e => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    const i = entries.findIndex(x => x.id === b.dataset.del); if (i < 0) return;
    lastDeleted = entries.splice(i, 1)[0];
    save(); renderAll();
    toast(lastDeleted.photo ? 'Anotação e foto apagadas.' : 'Anotação apagada.', 'Desfazer', () => { if (lastDeleted) { entries.push(lastDeleted); lastDeleted = null; save(); renderAll(); } });
  });

  $('#dfilter').addEventListener('click', e => {
    const b = e.target.closest('.pill'); if (!b) return;
    filter = b.dataset.f;
    $$('#dfilter .pill').forEach(p => p.classList.toggle('is-active', p === b));
    renderList();
  });
  $('#dfilter').innerHTML = `<button type="button" class="pill is-active" data-f="all">Tudo</button>` +
    Object.entries(TYPES).map(([k, t]) => `<button type="button" class="pill" data-f="${k}">${k === 'foto' ? 'Fotos' : t.label}</button>`).join('');

  // --------- cópia de segurança (com as fotos) ---------
  const toDataUrl = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
  $('#d-export').addEventListener('click', async () => {
    const btn = $('#d-export'); btn.disabled = true;
    const photos = {};
    for (const e of entries.filter(x => x.photo)) {
      const b = await DB.get(e.photo).catch(() => null);
      if (b) photos[e.photo] = await toDataUrl(b);
    }
    const data = { app: 'growmetria', version: 2, exported: new Date().toISOString(), settings: { start: P.store.get('igl-start'), kind: P.store.get('igl-kind'), veg: P.store.get('igl-veg') }, entries, photos };
    P.download(`diario-de-cultivo-${iso(new Date())}.json`, JSON.stringify(data), 'application/json');
    btn.disabled = false;
    const n = Object.keys(photos).length;
    toast(n ? `Cópia baixada com ${n} ${n === 1 ? 'foto' : 'fotos'}.` : 'Cópia baixada.');
  });
  $('#d-import').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.entries;
      if (!Array.isArray(list)) throw new Error('formato');
      const photos = data && typeof data.photos === 'object' && data.photos ? data.photos : {};
      const ok = list.filter(x => x && typeof x.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && TYPES[x.type])
        .map(x => {
          const y = { id: String(x.id || newId()), date: x.date, type: x.type, note: String(x.note || '').slice(0, 2000), m: typeof x.m === 'object' && x.m ? x.m : {}, created: String(x.created || new Date().toISOString()) };
          if (x.ctx && typeof x.ctx === 'object') y.ctx = { day: Number(x.ctx.day) || undefined, phase: typeof x.ctx.phase === 'string' ? x.ctx.phase.slice(0, 40) : undefined, wk: Number(x.ctx.wk) || undefined };
          if (typeof x.photo === 'string' && /^[\w-]{1,40}$/.test(x.photo)) y.photo = x.photo;
          return y;
        });
      const ids = new Set(entries.map(x => x.id));
      const added = ok.filter(x => !ids.has(x.id));
      let nPhotos = 0;
      for (const x of added) {
        if (!x.photo) continue;
        const src = photos[x.photo];
        if (typeof src === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(src)) {
          try { await DB.put(x.photo, await (await fetch(src)).blob()); nPhotos++; continue; } catch { /* sem foto */ }
        }
        if (!(await DB.get(x.photo).catch(() => null))) delete x.photo;
      }
      entries = entries.concat(added);
      if (data.settings && data.settings.start && !P.store.get('igl-start')) {
        P.store.set('igl-start', data.settings.start);
        if (data.settings.kind) P.store.set('igl-kind', data.settings.kind);
        if (data.settings.veg) P.store.set('igl-veg', data.settings.veg);
      }
      save(); renderAll(); renderCtx();
      toast(`${added.length} ${added.length === 1 ? 'anotação restaurada' : 'anotações restauradas'}${nPhotos ? `, com ${nPhotos} ${nPhotos === 1 ? 'foto' : 'fotos'}` : ''}.`);
    } catch { toast('Esse arquivo não parece uma cópia do diário.'); }
    e.target.value = '';
  });
  $('#d-clear').addEventListener('click', async () => {
    if (!entries.length) return;
    if (!window.confirm('Apagar todas as anotações e fotos deste navegador? Baixe uma cópia antes, se quiser guardar.')) return;
    entries = []; save();
    await DB.clear().catch(() => {});
    urls.forEach(u => URL.revokeObjectURL(u)); urls.clear();
    renderAll(); toast('Diário apagado.');
  });

  // --------- aviso rápido ---------
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
  document.body.appendChild(t);
  let tt = 0;
  function toast(msg, action, fn) {
    t.innerHTML = esc(msg) + (action ? ` <button type="button" class="toast__btn">${esc(action)}</button>` : '');
    if (action) $('.toast__btn', t).onclick = () => { fn(); t.classList.remove('is-on'); };
    t.classList.add('is-on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), action ? 6000 : 2600);
  }

  function renderAll() { renderStats(); renderGallery(); renderList(); }
  renderAll();
  renderCtx();
  // fotos sem anotação (apagadas em outra visita) são removidas ao abrir o diário
  setTimeout(() => {
    DB.keys().then(keys => {
      const used = new Set(entries.map(e => e.photo).filter(Boolean));
      keys.filter(k => !used.has(k)).forEach(k => DB.del(k).catch(() => {}));
    }).catch(() => {});
  }, 3000);
  // muda se outra aba alterar os dados
  addEventListener('storage', e => { if (e.key === KEY || (e.key || '').startsWith('igl-')) { entries = load(); renderAll(); renderCtx(); } });
})();
