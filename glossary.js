/* ==========================================================================
   Indoor Growing Lab — glossário embutido
   Marca a primeira ocorrência de cada termo por seção e mostra a explicação
   ao passar o mouse, focar ou tocar. Usado na home e nas páginas de guia.
   ========================================================================== */
(() => {
  'use strict';

  // [chave, padrão, título, explicação]
  const TERMS = [
    ['grow', /grow/iu, 'Grow', 'Como a comunidade chama o espaço de cultivo indoor: a estufa, a luz, o exaustor e tudo o que está montado.'],
    ['estufa', /estufas?/iu, 'Estufa (grow box)', 'A “barraca” de cultivo: estrutura fechada, forrada por dentro com material que reflete a luz, que isola luz, cheiro e clima.'],
    ['ppfd', /PPFD/u, 'PPFD', 'A força da luz que chega às folhas, em µmol/m²/s. Quanto maior, mais forte.'],
    ['dli', /DLI/u, 'DLI', 'A luz total do dia: a força (PPFD) somada ao longo das horas ligada. Medida em mol/m²/dia.'],
    ['vpd', /VPD/u, 'VPD', 'Diz se o ar está seco ou úmido do ponto de vista da folha. Na faixa certa, a planta transpira e se alimenta no ritmo ideal.'],
    ['lst', /LST/u, 'LST', 'Treino de baixo estresse: dobrar e prender os galhos para a copa ficar plana, sem cortar nada.'],
    ['ph', /pH/u, 'pH', 'Acidez da água ou do substrato. Fora da faixa certa, a planta não consegue absorver os nutrientes, mesmo que eles estejam lá.'],
    ['ec', /EC/u, 'EC', 'Condutividade elétrica: mostra quanto adubo está dissolvido na água.'],
    ['calmag', /CalMag/u, 'CalMag', 'Suplemento de cálcio e magnésio, muito usado em fibra de coco e sob LED.'],
    ['dwc', /DWC/u, 'DWC', 'Hidroponia em que as raízes ficam mergulhadas em água com oxigênio e nutrientes.'],
    ['bti', /Bti/u, 'Bti', 'Bactéria (Bacillus thuringiensis israelensis) que mata as larvas da mosquinha-do-fungo na terra e não faz mal à planta.'],
    ['tricomas', /tricomas?/iu, 'Tricomas', 'As glândulas de resina que cobrem o bud. Vistas na lupa, a cor delas indica o ponto de colheita.'],
    ['pistilos', /pistilos?/iu, 'Pistilos', 'Os “pelinhos” da flor. Mudam de branco para laranja, mas enganam como guia de colheita.'],
    ['fotoperiodo', /fotoper[ií]odo/iu, 'Fotoperíodo', 'Quantas horas de luz e de escuro a planta recebe por dia. Nas fotoperiódicas, é o que dispara a floração.'],
    ['auto', /autoflorescentes?/iu, 'Autoflorescente', 'Planta que floresce pela idade, umas 3 a 5 semanas depois de germinar, sem depender das horas de luz.'],
    ['cotiledones', /cotil[ée]dones/iu, 'Cotilédones', 'As duas primeiras folhinhas redondas da muda, antes das folhas serrilhadas.'],
    ['substrato', /substrato/iu, 'Substrato', 'Onde as raízes ficam: terra, fibra de coco ou outro material.'],
    ['oidio', /o[ií]dio/iu, 'Oídio', 'Fungo que forma um pó branco sobre as folhas. Aparece com ar úmido e parado.'],
    ['dimmer', /dimmer/iu, 'Dimmer', 'O controle do LED que regula a potência, como o de uma luz de casa.'],
    ['pressao', /press[aã]o negativa/iu, 'Pressão negativa', 'Quando o exaustor tira mais ar do que entra: a estufa fica levemente “chupada” e o ar só sai passando pelo filtro.']
  ];
  // palavra inteira, sem pegar pedaço de outra palavra (inclui acentos)
  const RX = TERMS.map(([key, re, title, def]) => ({
    key, title, def,
    re: new RegExp(`(?<![\\p{L}\\p{N}])(?:${re.source})(?![\\p{L}\\p{N}])`, re.flags.includes('i') ? 'iu' : 'u')
  }));

  const SKIP = 'a, button, label, h1, h2, h3, th, svg, output, script, style, .term, .kicker, .stage__name, .stage__dur, .tl__date';
  const SCOPES = [
    '.hero__lead', '.chapter__lead', '.sec-head__lead', '.stage__lead', '.stage__tip', '.specs dd',
    '.ctl__help', '.about p', '.specs dt', '.verdict__target', '.prose', '.tldr', '.article__lead', '.aside-card__desc', 'figcaption'
  ].join(', ');

  function link(root) {
    const seen = new Map(); // por seção: termos já marcados
    root.querySelectorAll(SCOPES).forEach(scope => {
      const group = scope.closest('section, article.stage, main') || document.body;
      if (!seen.has(group)) seen.set(group, new Set());
      const used = seen.get(group);
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.nodeValue.trim() && !n.parentElement.closest(SKIP)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        let text = node.nodeValue, frag = null, cursor = node;
        // encontra o termo mais cedo no texto que ainda não foi usado
        for (;;) {
          let best = null;
          RX.forEach(t => {
            if (used.has(t.key)) return;
            const m = t.re.exec(text);
            if (m && (!best || m.index < best.m.index)) best = { t, m };
          });
          if (!best) break;
          used.add(best.t.key);
          frag = frag || document.createDocumentFragment();
          frag.appendChild(document.createTextNode(text.slice(0, best.m.index)));
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'term';
          b.dataset.term = best.t.key;
          b.textContent = best.m[0];
          b.setAttribute('aria-haspopup', 'dialog');
          frag.appendChild(b);
          text = text.slice(best.m.index + best.m[0].length);
        }
        if (frag) {
          frag.appendChild(document.createTextNode(text));
          cursor.parentNode.replaceChild(frag, cursor);
        }
      });
    });
  }

  // balão de explicação
  const pop = document.createElement('div');
  pop.className = 'term-pop';
  pop.id = 'term-pop';
  pop.setAttribute('role', 'tooltip');
  pop.hidden = true;
  document.body.appendChild(pop);
  let current = null, hideT = 0;
  const hoverable = matchMedia('(hover: hover)').matches;

  function show(btn) {
    clearTimeout(hideT);
    const t = RX.find(x => x.key === btn.dataset.term);
    if (!t) return;
    current = btn;
    pop.innerHTML = `<span class="term-pop__t">${t.title}</span>${t.def}`;
    pop.hidden = false;
    btn.setAttribute('aria-describedby', 'term-pop');
    const r = btn.getBoundingClientRect();
    const w = Math.min(300, innerWidth - 24);
    pop.style.width = w + 'px';
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    const below = r.bottom + 10 + pop.offsetHeight < innerHeight;
    pop.style.left = left + 'px';
    pop.style.top = (below ? r.bottom + 8 : r.top - pop.offsetHeight - 8) + 'px';
    pop.classList.toggle('is-above', !below);
  }
  function hide() {
    if (current) current.removeAttribute('aria-describedby');
    current = null;
    pop.hidden = true;
  }
  const later = () => { clearTimeout(hideT); hideT = setTimeout(hide, 120); };

  // toque não deve abrir pelo foco/hover, só pelo clique
  let lastPointer = 'mouse';
  document.addEventListener('pointerdown', e => { lastPointer = e.pointerType; }, true);
  document.addEventListener('mouseover', e => { const b = e.target.closest('.term'); if (b && hoverable && lastPointer === 'mouse') show(b); });
  document.addEventListener('mouseout', e => { if (e.target.closest('.term') && lastPointer === 'mouse') later(); });
  document.addEventListener('focusin', e => { const b = e.target.closest('.term'); if (b && lastPointer !== 'touch') show(b); });
  document.addEventListener('focusout', e => { if (e.target.closest('.term')) later(); });
  document.addEventListener('click', e => {
    const b = e.target.closest('.term');
    // com mouse o balão já abriu no hover; no toque, o clique abre e fecha
    if (b) { e.preventDefault(); (lastPointer === 'touch' || !hoverable) && current === b && !pop.hidden ? hide() : show(b); return; }
    if (!e.target.closest('.term-pop')) hide();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  addEventListener('scroll', () => { if (!pop.hidden) hide(); }, { passive: true });

  link(document);
})();
