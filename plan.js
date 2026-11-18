/* ==========================================================================
   Indoor Growing Lab — cronograma do cultivo
   Fonte única das datas, usada pela home (calendário) e pelo diário.
   ========================================================================== */
(() => {
  'use strict';
  const DAY = 864e5;
  const addWeeks = (d, w) => new Date(d.getTime() + w * 7 * DAY);

  /* t0: dia de pôr a semente para germinar. auto: autoflorescente.
     vegWeeks: semanas de vegetativo (só fotoperiódica). */
  function build(t0, auto, vegWeeks) {
    const vegN = auto ? 2 : vegWeeks, florN = auto ? 6 : 9;
    const tLight = addWeeks(t0, 1);
    const tVeg = addWeeks(tLight, 2);
    const tFlor = addWeeks(tVeg, vegN);
    const tHarvest = addWeeks(tFlor, florN);
    const steps = [
      { id: 'germ', phase: 'Germinação', date: t0, title: 'Germinação', desc: 'Semente no papel toalha ou direto no substrato, no escuro.', guide: 'germinacao' },
      { id: 'muda', phase: 'Muda', date: tLight, title: 'Muda', desc: 'Primeiras folhas. Luz suave, 18 h por dia.' },
      { id: 'veg', phase: 'Vegetativo', date: tVeg, title: 'Vegetativo', desc: auto ? 'Crescimento rápido. A auto decide sozinha quando florescer.' : 'Construir estrutura. Você escolhe quanto tempo fica aqui.' },
      { id: 'flor', phase: 'Floração', date: tFlor, title: auto ? 'Começa a florescer sozinha' : 'Virar o timer para 12 h', desc: auto ? 'Não mexa na luz: continua em 18 h.' : '12 h de luz e 12 h de escuro total, sem vazamento.', key: true },
      { id: 'lupa', phase: 'Floração', date: addWeeks(tHarvest, -2), title: 'Comece a olhar os tricomas', desc: 'Lupa de 60× a cada 2 ou 3 dias.' },
      { id: 'colheita', phase: 'Colheita', date: tHarvest, title: 'Colheita estimada', desc: 'A data certa quem diz são os tricomas, não o calendário.', key: true },
      { id: 'cura', phase: 'Secagem e cura', date: addWeeks(tHarvest, 2), title: 'Fim da secagem, começa a cura', desc: 'Potes de vidro, abrindo todo dia na primeira semana.' },
      { id: 'fim', phase: 'Cura', date: addWeeks(tHarvest, 4), title: 'Cura mínima', desc: 'Sabor e aroma seguem melhorando por até 8 semanas.' }
    ];
    return { vegN, florN, tLight, tFlor, tHarvest, steps };
  }

  // fase em que uma data cai, e o próximo marco depois dela
  function where(plan, date) {
    let now = null, next = null;
    plan.steps.forEach(s => { if (s.date <= date) now = s; else if (!next) next = s; });
    return { now, next };
  }

  /* Arquivo .ics: eventos de dia inteiro, com lembrete às 9 h */
  const ymd = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  function ics(plan, siteUrl) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Indoor Growing Lab//Calendario//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Meu cultivo'];
    plan.steps.forEach((s, i) => {
      const end = new Date(s.date.getTime() + DAY);
      lines.push('BEGIN:VEVENT',
        `UID:igl-${ymd(plan.steps[0].date)}-${s.id}-${i}@indoorgrowinglab`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(s.date)}`,
        `DTEND;VALUE=DATE:${ymd(end)}`,
        `SUMMARY:${icsEsc('Cultivo: ' + s.title)}`,
        `DESCRIPTION:${icsEsc(s.desc + (siteUrl ? '\n' + siteUrl : ''))}`,
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(s.title)}`, 'TRIGGER;RELATED=START:PT9H', 'END:VALARM',
        'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }
  function googleLink(step, siteUrl) {
    const end = new Date(step.date.getTime() + DAY);
    const q = new URLSearchParams({ action: 'TEMPLATE', text: 'Cultivo: ' + step.title, dates: `${ymd(step.date)}/${ymd(end)}`, details: step.desc + (siteUrl ? '\n' + siteUrl : '') });
    return 'https://calendar.google.com/calendar/render?' + q.toString();
  }
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // dados guardados no navegador e compartilhados entre páginas
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem armazenamento */ } }
  };
  function saved() {
    const v = store.get('igl-start');
    const d = v ? new Date(v + 'T12:00:00') : null;
    return {
      start: d && !isNaN(d) ? d : null,
      auto: store.get('igl-kind') === 'auto',
      veg: Number(store.get('igl-veg')) || 4
    };
  }

  window.IGL_PLAN = { DAY, addWeeks, build, where, ics, googleLink, download, store, saved };
})();
