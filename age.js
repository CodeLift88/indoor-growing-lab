/* ==========================================================================
   Growmetria — aviso de +18
   O site fica desfocado atrás até a pessoa segurar o botão de entrada.
   A classe .age-gate é posta no <html> pelo script do <head>, antes de pintar.
   ========================================================================== */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('age-gate')) return;

  const KEY = 'igl-age';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOLD = REDUCED ? 600 : 1100;

  const flask = on => `
    <svg class="gate__flask" viewBox="5 6 90 90" aria-hidden="true">
      <path class="gate__liquid" d="M29.8 73.2H70.2L72.6 77.2C74 79.6 74.6 81.6 74.6 84C74.6 88.4 71 91.8 66.4 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2Z"/>
      <path class="gate__glass" d="M40.8 47C40.8 44.5 37.4 44 37.4 40.5C37.4 38.5 38.8 37.3 41 37.3H59.4C61.6 37.3 63 38.5 63 40.5C63 44 59.6 44.5 59.6 47V54.6L73 77.2C74.4 79.6 75 81.6 75 84C75 88.4 71.4 91.8 66.8 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2L40.8 54.6Z"/>
      <g class="gate__sprout${on ? ' is-on' : ''}"><path d="M50.2 26.8C49.6 21 47 15 42 11.5C37.5 8.6 31 8.6 27.2 9.4C26 9.7 25.8 10.8 26 12.2C26.6 18 30 24 36 26.8C39.5 28.3 43 27.6 45.5 28.6C47.2 29.4 47.8 31 47.8 33V73.2H52.6V33.4C52.6 31.4 53.8 29.9 56.5 29.7C60 29.4 64.5 29.4 68.4 26.4C71.6 24 73.4 19 73.6 14.6C73.7 13.4 73 12.7 72 12.6C67.5 12 61 12.4 56.5 15.4C52.6 18 50.6 22.4 50.2 26.8Z"/></g>
    </svg>`;

  const gate = document.createElement('div');
  gate.className = 'gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'gate-title');
  gate.setAttribute('aria-describedby', 'gate-desc');
  gate.innerHTML = `
    <div class="gate__card">
      <p class="gate__kick"><span>Grow<em>metria</em></span><span class="gate__badge">+18</span></p>
      <h2 class="gate__title" id="gate-title">Antes de entrar: você tem <em>18 anos ou mais?</em></h2>
      <p class="gate__txt" id="gate-desc">Conteúdo educativo sobre cultivo indoor, feito para adultos. Se tem, segure o botão até o broto nascer.</p>
      <button class="gate__btn" type="button" aria-describedby="gate-hint">
        <span class="gate__layer">${flask(false)}<span class="gate__label">Segure para entrar</span></span>
        <span class="gate__layer gate__layer--on" aria-hidden="true">${flask(true)}<span class="gate__label">Segure para entrar</span></span>
      </button>
      <p class="gate__hint" id="gate-hint" aria-live="polite">Tenho 18 anos ou mais</p>
      <button class="gate__no" type="button">Tenho menos de 18</button>
    </div>`;
  document.body.appendChild(gate);
  // o resto da página fica fora do alcance do teclado e do leitor de tela
  const others = [...document.body.children].filter(n => n !== gate);
  others.forEach(n => n.setAttribute('inert', ''));

  const btn = gate.querySelector('.gate__btn');
  const labels = gate.querySelectorAll('.gate__label');
  const hint = gate.querySelector('.gate__hint');
  const setLabel = t => labels.forEach(l => { l.textContent = t; });
  requestAnimationFrame(() => btn.focus({ preventScroll: true }));

  let p = 0, holding = false, last = 0, raf = 0, done = false, tries = 0;
  const WORDS = [[0, 'Segure para entrar'], [0.02, 'Germinando…'], [0.45, 'Brotando…'], [0.8, 'Quase lá…']];

  function tick(now) {
    const dt = last ? now - last : 16; last = now;
    p = holding ? Math.min(1, p + dt / HOLD) : Math.max(0, p - dt / 380);
    btn.style.setProperty('--p', p.toFixed(4));
    if (holding) setLabel(WORDS.filter(w => p >= w[0]).pop()[1]);
    if (p >= 1) return finish();
    if (holding || p > 0) raf = requestAnimationFrame(tick);
    else { raf = 0; last = 0; }
  }
  function start(e) {
    if (done || holding) return;
    if (e && e.type === 'pointerdown') { if (e.button !== 0) return; btn.setPointerCapture(e.pointerId); }
    holding = true; btn.classList.add('is-holding');
    hint.textContent = 'Tenho 18 anos ou mais';
    if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
  }
  function stop() {
    if (done || !holding) return;
    holding = false; btn.classList.remove('is-holding');
    if (p < 1) {
      tries++;
      setLabel('Segure para entrar');
      hint.textContent = tries > 1 ? 'Sem pressa: segure até o fim, o broto precisa de um segundo.' : 'Segure mais um pouco, o broto ainda não nasceu.';
      btn.classList.remove('nudge'); void btn.offsetWidth; btn.classList.add('nudge');
    }
  }

  function burst() {
    if (REDUCED || !btn.animate) return;
    const r = btn.getBoundingClientRect();
    const cx = r.left + 36, cy = r.top + r.height / 2;
    for (let i = 0; i < 14; i++) {
      const leaf = document.createElement('span');
      leaf.className = 'gate__leaf';
      leaf.style.left = cx + 'px'; leaf.style.top = cy + 'px';
      document.body.appendChild(leaf);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
      const dist = 90 + Math.random() * 160;
      const x = Math.cos(ang) * dist + r.width * 0.35 * Math.random(), y = Math.sin(ang) * dist;
      const rot = (Math.random() - 0.5) * 540;
      leaf.animate([
        { transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(${rot}deg)`, opacity: 1, offset: .65 },
        { transform: `translate(calc(-50% + ${x * 1.1}px), calc(-50% + ${y + 80}px)) scale(.8) rotate(${rot * 1.3}deg)`, opacity: 0 }
      ], { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => leaf.remove();
    }
  }

  function finish() {
    done = true; holding = false; raf = 0;
    btn.style.setProperty('--p', '1');
    btn.classList.add('is-done');
    setLabel('Bem-vindo ao grow');
    hint.textContent = 'Entrando…';
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* sem armazenamento: pergunta de novo na próxima página */ }
    burst();
    setTimeout(() => {
      root.classList.add('age-leaving');
      gate.classList.add('is-leaving');
      others.forEach(n => n.removeAttribute('inert'));
      setTimeout(() => {
        root.classList.remove('age-gate', 'age-leaving');
        gate.remove();
      }, REDUCED ? 50 : 750);
    }, REDUCED ? 100 : 520);
  }

  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', stop);
  btn.addEventListener('pointercancel', stop);
  btn.addEventListener('lostpointercapture', stop);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); start(); }
  });
  btn.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') stop(); });
  btn.addEventListener('blur', stop);

  gate.querySelector('.gate__no').addEventListener('click', () => {
    const card = gate.querySelector('.gate__card');
    card.classList.add('is-minor');
    card.innerHTML = `
      <p class="gate__kick"><span>Grow<em>metria</em></span><span class="gate__badge">+18</span></p>
      ${flask(false)}
      <h2 class="gate__title" id="gate-title" tabindex="-1">Volte quando fizer <em>18.</em></h2>
      <p class="gate__txt">A gente guarda a semente para você. Até lá, este conteúdo não é para você.</p>`;
    card.querySelector('.gate__title').focus();
  });
})();
