/* ==========================================================================
   Indoor Growing Lab — diário de cultivo
   Tudo fica no localStorage do navegador ('igl-diary'). Nada vai para servidor.
   ========================================================================== */
(() => {
  'use strict';
  const P = window.IGL_PLAN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'igl-diary';
  const DAY = P.DAY;

  const TYPES = {
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

  // --------- dados ---------
  const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  let entries = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(entries)); return true; } catch { toast('Não foi possível salvar neste navegador.'); return false; } };

  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const parse = s => new Date(s + 'T12:00:00');
  const today = () => parse(iso(new Date()));
  const daysBetween = (a, b) => Math.round((b - a) / DAY);
  const fmtDate = (d, opts) => d.toLocaleDateString('pt-BR', opts || { day: 'numeric', month: 'short' }).replace(/\./g, '');
  const num = v => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const ago = n => n === 0 ? 'hoje' : n === 1 ? 'ontem' : `há ${n} dias`;
  const inDays = n => n <= 0 ? 'hoje' : n === 1 ? 'amanhã' : `em ${n} dias`;

  function plan() {
    const s = P.saved();
    return s.start ? P.build(s.start, s.auto, s.veg) : null;
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
      tiles.push({ k: 'Dia do cultivo', v: '—', s: '<a href="index.html#energia">Defina a data de início</a>', html: true });
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
    tiles.push({ k: 'Anotações', v: String(entries.length), s: entries.length ? `desde ${fmtDate(parse(entries.reduce((a, e) => e.date < a ? e.date : a, entries[0].date)))}` : 'comece pela primeira' });

    $('#dstat').innerHTML = tiles.map(x => `
      <div class="dtile">
        <p class="dtile__k">${x.k}</p>
        <p class="dtile__v ${x.small ? 'dtile__v--sm' : ''}">${esc(x.v)}</p>
        <p class="dtile__s">${x.html ? x.s : esc(x.s)}</p>
      </div>`).join('');
  }

  // --------- histórico ---------
  let filter = 'all';
  function renderList() {
    const pl = plan();
    const list = entries.filter(e => filter === 'all' || e.type === filter)
      .sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created));
    $('#dempty').hidden = list.length > 0;
    $('#dempty').textContent = entries.length ? 'Nenhuma anotação desse tipo.' : 'Nenhuma anotação ainda. Que tal começar pela próxima rega?';
    const groups = [];
    list.forEach(e => { const g = groups[groups.length - 1]; if (g && g.date === e.date) g.items.push(e); else groups.push({ date: e.date, items: [e] }); });
    $('#dlist').innerHTML = groups.map(g => {
      const d = parse(g.date);
      let meta = fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' });
      if (pl) {
        const day = daysBetween(pl.steps[0].date, d) + 1;
        const w = P.where(pl, d);
        if (day >= 1) meta += ` · Dia ${day}${w.now ? ' · ' + w.now.phase : ''}`;
      }
      return `<li class="dgroup">
        <p class="dgroup__date">${esc(meta.charAt(0).toUpperCase() + meta.slice(1))}</p>
        <ul>${g.items.map(e => `
          <li class="dentry" data-id="${e.id}">
            <span class="dentry__type"><i style="background:${TYPES[e.type] ? TYPES[e.type].color : '#999'}"></i>${esc(TYPES[e.type] ? TYPES[e.type].label : e.type)}</span>
            ${e.note ? `<p class="dentry__note">${esc(e.note)}</p>` : ''}
            ${e.m && Object.keys(e.m).length ? `<p class="dentry__m">${MEASURES.filter(([k]) => e.m[k] !== undefined).map(([k, label, unit]) => `<span>${label} <b>${num(e.m[k])}${unit ? ' ' + unit : ''}</b></span>`).join('')}</p>` : ''}
            <button type="button" class="dentry__del" data-del="${e.id}" aria-label="Apagar anotação">×</button>
          </li>`).join('')}
        </ul>
      </li>`;
    }).join('');
    renderChart();
  }

  // gráfico da altura ao longo do tempo
  function renderChart() {
    const pts = entries.filter(e => e.m && e.m.h !== undefined).map(e => ({ d: parse(e.date), v: Number(e.m.h) })).sort((a, b) => a.d - b.d);
    const fig = $('#dchart');
    if (pts.length < 2) { fig.hidden = true; return; }
    fig.hidden = false;
    const W = 560, H = 160, X0 = 40, X1 = 548, Y0 = 14, Y1 = 132;
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
  let type = 'rega';
  const typeBox = $('#dtypes');
  typeBox.innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <label class="dtype"><input type="radio" name="dtype" value="${k}" ${k === type ? 'checked' : ''} /><span><i style="background:${t.color}"></i>${t.label}</span></label>`).join('');
  typeBox.addEventListener('change', e => { type = e.target.value; if (type === 'medicao') $('#d-measure').open = true; });

  $('#d-mgrid').innerHTML = MEASURES.map(([k, label, unit, step, min, max]) => `
    <label class="dm"><span class="ctl__label">${label}${unit ? ` (${unit})` : ''}</span>
      <input type="number" inputmode="decimal" data-m="${k}" step="${step}" min="${min}" max="${max}" /></label>`).join('');

  const dateIn = $('#d-date');
  dateIn.value = iso(new Date());

  $('#dform').addEventListener('submit', e => {
    e.preventDefault();
    const note = $('#d-note').value.trim();
    const m = {};
    $$('[data-m]').forEach(i => { if (i.value !== '' && !isNaN(Number(i.value))) m[i.dataset.m] = Number(i.value); });
    if (!note && !Object.keys(m).length) { toast('Escreva algo ou preencha uma medição.'); $('#d-note').focus(); return; }
    entries.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: dateIn.value || iso(new Date()), type, note, m, created: new Date().toISOString() });
    if (!save()) return;
    $('#d-note').value = '';
    $$('[data-m]').forEach(i => { i.value = ''; });
    toast('Anotação salva.');
    renderAll();
  });

  // --------- apagar com desfazer ---------
  let lastDeleted = null;
  $('#dlist').addEventListener('click', e => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    const i = entries.findIndex(x => x.id === b.dataset.del); if (i < 0) return;
    lastDeleted = entries.splice(i, 1)[0];
    save(); renderAll();
    toast('Anotação apagada.', 'Desfazer', () => { if (lastDeleted) { entries.push(lastDeleted); lastDeleted = null; save(); renderAll(); } });
  });

  $('#dfilter').addEventListener('click', e => {
    const b = e.target.closest('.pill'); if (!b) return;
    filter = b.dataset.f;
    $$('#dfilter .pill').forEach(p => p.classList.toggle('is-active', p === b));
    renderList();
  });
  $('#dfilter').innerHTML = `<button type="button" class="pill is-active" data-f="all">Tudo</button>` +
    Object.entries(TYPES).map(([k, t]) => `<button type="button" class="pill" data-f="${k}">${t.label}</button>`).join('');

  // --------- cópia de segurança ---------
  $('#d-export').addEventListener('click', () => {
    const data = { app: 'indoor-growing-lab', version: 1, exported: new Date().toISOString(), settings: { start: P.store.get('igl-start'), kind: P.store.get('igl-kind'), veg: P.store.get('igl-veg') }, entries };
    P.download(`diario-de-cultivo-${iso(new Date())}.json`, JSON.stringify(data, null, 2), 'application/json');
  });
  $('#d-import').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.entries;
      if (!Array.isArray(list)) throw new Error('formato');
      const ok = list.filter(x => x && typeof x.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && TYPES[x.type])
        .map(x => ({ id: String(x.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6)), date: x.date, type: x.type, note: String(x.note || '').slice(0, 2000), m: typeof x.m === 'object' && x.m ? x.m : {}, created: String(x.created || new Date().toISOString()) }));
      const ids = new Set(entries.map(x => x.id));
      const added = ok.filter(x => !ids.has(x.id));
      entries = entries.concat(added);
      if (data.settings && data.settings.start && !P.store.get('igl-start')) {
        P.store.set('igl-start', data.settings.start);
        if (data.settings.kind) P.store.set('igl-kind', data.settings.kind);
        if (data.settings.veg) P.store.set('igl-veg', data.settings.veg);
      }
      save(); renderAll();
      toast(`${added.length} ${added.length === 1 ? 'anotação restaurada' : 'anotações restauradas'}.`);
    } catch { toast('Esse arquivo não parece uma cópia do diário.'); }
    e.target.value = '';
  });
  $('#d-clear').addEventListener('click', () => {
    if (!entries.length) return;
    if (!window.confirm('Apagar todas as anotações deste navegador? Baixe uma cópia antes, se quiser guardar.')) return;
    entries = []; save(); renderAll(); toast('Diário apagado.');
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

  function renderAll() { renderStats(); renderList(); }
  renderAll();
  // muda se outra aba alterar os dados
  addEventListener('storage', e => { if (e.key === KEY || (e.key || '').startsWith('igl-')) { entries = load(); renderAll(); } });
})();
