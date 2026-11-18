/* ==========================================================================
   INDOOR GROWING LAB — CALCULADORAS FÁCEIS, EQUIPAMENTOS & GUIAS PRÁTICOS
   Zero Emojis • Custom SVG Assets • Cohesive Fluid Design System
   ========================================================================== */

const LabState = {
  unitSystem: 'metric', // 'metric' | 'imperial'
  theme: 'light',       // 'light' | 'dark'
  currentSection: 1,
  // Passo 01: Tenda Selecionada
  tentKey: '120x120',
  stage: 'bloom',       // 'seedling' | 'veg' | 'bloom'
  // Passo 02: Força da Luz
  ppfd: 750,
  hours: 12,
  co2: false,
  // Passo 03: Temperatura e Umidade
  tempC: 26.5,
  rh: 60,
  leafOffsetC: -1.5,
  // Passo 04: Exaustor e Filtro
  carbonFilter: true,
  ductBends: 2,
  // Passo 05: Conta de Luz
  totalWatts: 540,
  tariff: 0.85,
  currency: 'BRL' // 'BRL' | 'USD' | 'EUR'
};

/* Helper para renderizar nossos Assets SVG Próprios sem nenhum emoji */
const LabIcons = {
  use(symbolId, extraClass = '') {
    return `<svg class="lab-icon ${extraClass}" aria-hidden="true"><use href="#${symbolId}"></use></svg>`;
  },
  starBadge() {
    return `<svg class="lab-star-icon" aria-hidden="true"><use href="#icon-lab-star"></use></svg>`;
  }
};

const TENT_PRESETS = {
  '60x60': {
    metricLabel: '60×60 cm',
    imperialLabel: '2×2 pés',
    plantsText: '1 a 2',
    areaM2: 0.36,
    areaFt2: 4,
    volM3: 0.576,
    volFt3: 21.2,
    recWattsVeg: 100,
    recWattsBloom: 150,
    recPpf: 410,
    ductMm: '100 mm (4 polegadas)'
  },
  '120x60': {
    metricLabel: '120×60 cm',
    imperialLabel: '2×4 pés',
    plantsText: '2 a 3',
    areaM2: 0.72,
    areaFt2: 8,
    volM3: 1.296,
    volFt3: 48.0,
    recWattsVeg: 200,
    recWattsBloom: 300,
    recPpf: 820,
    ductMm: '100 a 150 mm (4" a 6")'
  },
  '90x90': {
    metricLabel: '90×90 cm',
    imperialLabel: '3×3 pés',
    plantsText: '3 a 4',
    areaM2: 0.81,
    areaFt2: 9,
    volM3: 1.458,
    volFt3: 54.0,
    recWattsVeg: 240,
    recWattsBloom: 320,
    recPpf: 900,
    ductMm: '150 mm (6 polegadas)'
  },
  '120x120': {
    metricLabel: '120×120 cm',
    imperialLabel: '4×4 pés',
    plantsText: '4 a 6',
    areaM2: 1.44,
    areaFt2: 16,
    volM3: 2.88,
    volFt3: 104.0,
    recWattsVeg: 360,
    recWattsBloom: 500,
    recPpf: 1400,
    ductMm: '150 mm (6 polegadas)'
  },
  '150x150': {
    metricLabel: '150×150 cm',
    imperialLabel: '5×5 pés',
    plantsText: '6 a 9',
    areaM2: 2.25,
    areaFt2: 25,
    volM3: 4.5,
    volFt3: 162.5,
    recWattsVeg: 550,
    recWattsBloom: 730,
    recPpf: 2050,
    ductMm: '200 mm (8 polegadas)'
  }
};

/* ==========================================================================
   VITRINE DE EQUIPAMENTOS EXPLICADOS DE FORMA SIMPLES
   ========================================================================== */
const HARDWARE_DB = [
  {
    id: 'vivosun-vsfd6500',
    category: 'iluminacao',
    categoryLabel: 'Luz LED + Ventilação',
    brand: 'Vivosun',
    model: 'AeroLight Wing / Kit Tenda Inteligente',
    tentFit: ['120x60', '120x120'],
    efficacy: 'Gasta pouca energia e não esquenta',
    power: '400W a 450W reais',
    coverage: 'Ideal p/ Tendas 120×60 e 120×120 cm',
    diodes: 'Chips Samsung + Ventilador embutido no meio da luz',
    priceRange: 'US$ 389 – US$ 469',
    commissionNote: 'Desconto exclusivo de 10% com nosso cupom',
    coupon: 'IGLAB10',
    officialUrl: 'https://vivosun.com/',
    amazonUrl: 'https://www.amazon.com/s?k=Vivosun+AeroLight+LED+Grow+Light',
    labScore: 'Nota 9.6 / 10'
  },
  {
    id: 'acinfinity-cloudline-t6',
    category: 'clima',
    categoryLabel: 'Exaustor Silencioso (Tira Cheiro)',
    brand: 'AC Infinity',
    model: 'Cloudline Pro T6 + Painel Automático 69 Pro',
    tentFit: ['90x90', '120x120', '150x150'],
    efficacy: 'Super silencioso (você dorme no mesmo quarto)',
    power: 'Consome só 40W (Puxa 683 m³/h)',
    coverage: 'Tendas de 90×90 até 150×150 cm',
    diodes: 'Aumenta a força sozinho quando a tenda esquenta!',
    priceRange: 'US$ 149 – US$ 169',
    commissionNote: 'O favorito nº 1 dos cultivadores no mundo todo',
    coupon: 'IGLABAC',
    officialUrl: 'https://acinfinity.com/',
    amazonUrl: 'https://www.amazon.com/s?k=AC+Infinity+Cloudline+Pro+T6',
    labScore: 'Nota 9.9 / 10'
  },
  {
    id: 'pulse-pro-monitor',
    category: 'sensores',
    categoryLabel: 'Monitor pelo Celular',
    brand: 'Pulse Grow',
    model: 'Pulse One / Pulse Pro (Medidor Wi-Fi)',
    tentFit: ['60x60', '120x60', '90x90', '120x120', '150x150'],
    efficacy: 'Avisa no WhatsApp/App se a luz acabar ou esquentar',
    power: 'Funciona no Wi-Fi + Bateria caso falte luz',
    coverage: 'Serve em qualquer tamanho de tenda',
    diodes: 'Calcula o Clima Ideal (VPD) sozinho na tela do celular',
    priceRange: 'US$ 199 – US$ 499',
    commissionNote: 'Parceiro Oficial (10% de desconto / comissão)',
    coupon: 'IGLABPULSE',
    officialUrl: 'https://pulsegrow.com/',
    amazonUrl: 'https://www.amazon.com/s?k=Pulse+One+Grow+Room+Monitor',
    labScore: 'Nota 9.8 / 10'
  },
  {
    id: 'spiderfarmer-se5000',
    category: 'iluminacao',
    categoryLabel: 'Luz LED em Barras',
    brand: 'Spider Farmer',
    model: 'SE5000 480W (6 Barras de LED Samsung)',
    tentFit: ['120x120'],
    efficacy: 'Espalha a luz por igual até nos cantos da tenda',
    power: '480W reais com botão de regular a força',
    coverage: 'Perfeita para Tenda 120×120 cm (4×4 pés)',
    diodes: 'Chips Samsung LM301H Evo de última geração',
    priceRange: 'US$ 459 – US$ 519',
    commissionNote: 'Entrega rápida nos EUA, Europa e Reino Unido',
    coupon: 'IGLABSF',
    officialUrl: 'https://www.spider-farmer.com/',
    amazonUrl: 'https://www.amazon.com/s?k=Spider+Farmer+SE5000',
    labScore: 'Nota 9.5 / 10'
  },
  {
    id: 'buildasoil-living-soil',
    category: 'substratos',
    categoryLabel: 'Terra Orgânica ("Só Regar com Água")',
    brand: 'BuildASoil',
    model: 'Kit Terra Viva 3.0 + Adubo Natural Craft Blend',
    tentFit: ['60x60', '120x60', '90x90', '120x120', '150x150'],
    efficacy: 'Não precisa medir pH nem misturar líquidos químicos!',
    power: 'Terra rica em vida natural que alimenta a planta sozinha',
    coverage: 'Para vasos grandes de feltro ou canteiros',
    diodes: '100% Orgânico: impossível queimar a planta por excesso',
    priceRange: 'US$ 65 – US$ 240',
    commissionNote: 'Melhor opção para quem quer facilidade total',
    coupon: 'IGLABSOIL',
    officialUrl: 'https://buildasoil.com/',
    amazonUrl: 'https://www.amazon.com/s?k=BuildASoil+Craft+Blend',
    labScore: 'Nota 9.7 / 10'
  },
  {
    id: 'clickandgrow-sg9',
    category: 'substratos',
    categoryLabel: 'Horta Automática de Cozinha/Quarto',
    brand: 'Click & Grow',
    model: 'Smart Garden 9 Pro (Rega e Ilumina Sozinha)',
    tentFit: ['60x60'],
    efficacy: 'Coloque água 1 vez a cada 3 semanas e pronto!',
    power: 'Gasta só 13W (menos que uma lâmpada comum)',
    coverage: 'Planta 9 mudas ao mesmo tempo (ervas, pimentas, tomates)',
    diodes: 'Liga e desliga a luz automaticamente todos os dias',
    priceRange: 'US$ 229 – US$ 289',
    commissionNote: 'Parceiro Oficial (10%) — Perfeito p/ iniciantes',
    coupon: 'IGLABCG',
    officialUrl: 'https://www.clickandgrow.com/',
    amazonUrl: 'https://www.amazon.com/s?k=Click+and+Grow+Smart+Garden+9',
    labScore: 'Nota 9.4 / 10'
  }
];

/* ==========================================================================
   GUIAS PRÁTICOS DO BLOG (LINGUAGEM SIMPLES, DIRETA E AMIGÁVEL)
   ========================================================================== */
const BLOG_ARTICLES = [
  {
    id: 'art-dli-ppfd',
    cluster: 'cluster-luz',
    clusterLabel: 'Como Escolher a Luz LED',
    date: 'ATUALIZADO NOV 2026',
    readTime: '4 min de leitura',
    figRef: 'GUIA PRÁTICO #01',
    title: 'Como Escolher a Luz LED Certa (e Não Cair no Golpe dos "1000W Falsos")',
    excerpt: 'Sabe aquelas lâmpadas roxas baratas que dizem ter "1000W" ou "2000W" nos anúncios? Descubra como olhar a força real do LED em 30 segundos e economizar na conta de luz.',
    formula: 'Regra de Ouro: Você precisa de cerca de 30W a 35W REAIS na tomada para cada 30×30 cm de tenda.',
    recommendedHwId: 'vivosun-vsfd6500',
    contentHtml: `
      <p>Quando você procura uma luz de cultivo na internet, é muito comum encontrar anúncios prometendo <strong>"LED 1000W" ou "LED 2000W" por um preço super baixo</strong>. Mas quando você olha as letras miúdas, aquela lâmpada puxa apenas 80W da tomada — e suas plantas crescem esticadas, fracas e sem peso.</p>
      <h3>1. Olhe Sempre o "Consumo Real na Tomada" (True Watts)</h3>
      <p>Esqueça o número que está no nome comercial da lâmpada. Procure sempre na descrição a frase <strong>"Potência Real" (Power Draw)</strong>:</p>
      <ul style="padding-left:1.25rem;line-height:1.8;">
        <li><strong>Tenda Pequena (60×60 cm):</strong> Precisa de <strong>100W a 150W reais</strong>.</li>
        <li><strong>Tenda Retangular (120×60 cm):</strong> Precisa de <strong>240W a 300W reais</strong>.</li>
        <li><strong>Tenda Padrão (120×120 cm):</strong> Precisa de <strong>450W a 500W reais</strong>.</li>
      </ul>
      <h3>2. Por Que os Painéis em "Barras" São Melhores que as Placas Antigas?</h3>
      <p>Antigamente, os LEDs eram uma placa única no meio da tenda: o centro ficava forte demais (queimando a planta do meio) e os cantos ficavam no escuro. Os modelos modernos em <strong>barras espaçadas</strong> (como os da <em>Vivosun</em> e da <em>Spider Farmer</em>) espalham a luz por igual em toda a tenda e deixam o ar circular entre as barras, mantendo tudo mais fresco!</p>
    `
  },
  {
    id: 'art-vpd-foliar',
    cluster: 'cluster-clima',
    clusterLabel: 'Temperatura e Umidade',
    date: 'ATUALIZADO NOV 2026',
    readTime: '5 min de leitura',
    figRef: 'GUIA PRÁTICO #02',
    title: 'Temperatura e Umidade Sem Mistério: O Segredo para Suas Plantas Crescerem o Dobro',
    excerpt: 'Suas folhas estão enrolando ou com manchas estranhas? Muitas vezes a culpa não é do adubo, e sim do ar seco ou úmido demais! Veja a tabela fácil para acertar de primeira.',
    formula: 'Crescimento (Folhas): 24°C a 28°C com 60%–70% de umidade | Floração: 22°C a 26°C com 45%–55% de umidade.',
    recommendedHwId: 'pulse-pro-monitor',
    contentHtml: `
      <p>Muita gente gasta uma fortuna comprando dezenas de fertilizantes caros achando que a planta está com fome, quando na verdade <strong>o clima dentro da tenda está impedindo a planta de beber água</strong>!</p>
      <h3>1. Como a Planta "Bebe" e "Sua"</h3>
      <p>Para puxar água e comida pelas raízes lá no vaso, a planta precisa evaporar água pelos furinhos das folhas. Pense em você fazendo exercício:</p>
      <ul style="padding-left:1.25rem;line-height:1.8;">
        <li><strong>Se o ar estiver úmido demais (acima de 75% na floração):</strong> O suor não seca, a planta para de puxar Cálcio pelas raízes e aparece o temido mofo!</li>
        <li><strong>Se o ar estiver seco e quente demais (ex.: 31°C com 35% de umidade):</strong> A planta fica com medo de desidratar, fecha as folhas como uma canoa e trava o crescimento.</li>
      </ul>
      <h3>2. A Regra Fácil para Nunca Mais Errar</h3>
      <p>Use a nossa <strong>Calculadora 03 (Passo 3 acima)</strong>: basta manter a nota entre <strong>0.8 e 1.2 durante o crescimento</strong> (ar mais úmido) e entre <strong>1.2 e 1.5 durante a floração</strong> (ar mais sequinho). Se quiser facilitar ainda mais, um sensor inteligente como o <em>Pulse One</em> mostra isso pronto na tela do seu celular!</p>
    `
  },
  {
    id: 'art-cfm-pressao-estatica',
    cluster: 'cluster-exaustao',
    clusterLabel: 'Tirar Cheiro e Calor',
    date: 'ATUALIZADO NOV 2026',
    readTime: '4 min de leitura',
    figRef: 'GUIA PRÁTICO #03',
    title: 'Como Eliminar 100% do Cheiro e do Calor da Tenda (Sem Barulho de Avião no Quarto)',
    excerpt: 'Aprenda como ligar o filtro de carvão ativado no exaustor do jeito certo e descubra o truque simples para deixar sua tenda totalmente silenciosa.',
    formula: 'Truque do Silêncio: Compre um exaustor um tamanho acima e use na velocidade 4 ou 5 (metade da força)!',
    recommendedHwId: 'acinfinity-cloudline-t6',
    contentHtml: `
      <p>Quem cultiva em apartamento ou dentro do quarto tem duas preocupações principais: <strong>não deixar sair nenhum cheiro para o corredor</strong> e <strong>não ter um motor barulhento zumbindo a noite inteira</strong>.</p>
      <h3>1. Como Funciona a "Pressão Negativa" (O Segredo para Zero Cheiro)</h3>
      <p>Quando o seu exaustor puxa o ar de dentro da tenda através do <strong>filtro de carvão ativado</strong> e joga para fora, as paredes da tenda dão uma leve "chupada" para dentro. Isso é ótimo! Significa que o ar só sai depois de passar pelo carvão, garantindo <strong>zero cheiro no ambiente</strong>.</p>
      <h3>2. Por Que o Exaustor de 150 mm (6") é Muito Mais Silencioso que o de 100 mm (4")?</h3>
      <p>Um exaustor pequeno trabalhando em 100% da velocidade faz muito barulho de vento. Já quando você coloca um <strong>AC Infinity Cloudline T6 (150 mm)</strong> trabalhando a apenas 40% ou 50% da velocidade, ele puxa a mesma quantidade de ar fazendo menos barulho que um ventilador de mesa!</p>
    `
  },
  {
    id: 'art-lm301h-evo-benchmarks',
    cluster: 'cluster-hardware',
    clusterLabel: 'Comparativos de Marcas',
    date: 'ATUALIZADO NOV 2026',
    readTime: '5 min de leitura',
    figRef: 'GUIA PRÁTICO #04',
    title: 'Vivosun vs. Spider Farmer vs. AC Infinity: Qual Marca Vale Mais o Seu Dinheiro em 2026?',
    excerpt: 'Comparamos as três marcas mais famosas do mundo em qualidade de construção, economia de energia, preço e facilidade de uso para você escolher sem dúvida.',
    formula: 'Melhor Automação e Exaustão: AC Infinity | Melhor Custo-Benefício em Kits e LEDs: Vivosun & Spider Farmer.',
    recommendedHwId: 'spiderfarmer-se5000',
    contentHtml: `
      <p>Hoje você não precisa mais pagar o olho da cara em lojas antigas para ter equipamentos de primeira linha. Três marcas dominam as recomendações dos cultivadores no mundo todo, e cada uma brilha em um ponto:</p>
      <h3>1. AC Infinity — A "Apple" dos Exaustores e Controladores</h3>
      <p>Se você quer que a sua tenda se cuide sozinha pelo aplicativo do celular, o conjunto de exaustor <strong>Cloudline Pro + Controlador 69 Pro</strong> da AC Infinity é imbatível em acabamento e silêncio.</p>
      <h3>2. Vivosun & Spider Farmer — Campeãs em Custo-Benefício de Luzes LED</h3>
      <p>Para comprar o painel LED com chips <strong>Samsung LM301H Evo</strong> ou montar o kit completo gastando menos (especialmente usando nosso cupom de 10% de desconto na loja oficial), a <em>Vivosun</em> e a <em>Spider Farmer</em> entregam a mesma potência de luz custando bem menos!</p>
    `
  },
  {
    id: 'art-substratos-hidroponia-solo-vivo',
    cluster: 'cluster-substratos',
    clusterLabel: 'Terra Orgânica vs. Hidroponia',
    date: 'ATUALIZADO NOV 2026',
    readTime: '5 min de leitura',
    figRef: 'GUIA PRÁTICO #05',
    title: 'Qual o Jeito Mais Fácil de Começar: Terra Orgânica ("Só Água"), Fibra de Coco ou Hidroponia?',
    excerpt: 'Não sabe se começa plantando na terra ou na água? Veja os prós e contras sinceros de cada método antes de comprar seus vasos.',
    formula: 'Quer zero trabalho e zero erro? Vá de Terra Orgânica Viva. Quer velocidade máxima? Vá de Coco ou Hidroponia.',
    recommendedHwId: 'buildasoil-living-soil',
    contentHtml: `
      <p>Antes de ligar a sua tenda, você precisa decidir onde as raízes da sua planta vão morar. Existem três caminhos principais, do mais fácil ao mais avançado:</p>
      <h3>1. Terra Orgânica Viva ("Living Soil" — O Mais Fácil de Todos!)</h3>
      <p>Na terra orgânica completa (como o método da <strong>BuildASoil</strong>), toda a comida que a planta precisa para os 3 meses já está misturada na terra de forma natural. <strong>Você só precisa regar com água pura!</strong> Não precisa medir pH todo dia nem misturar garrafinhas de fertilizante.</p>
      <h3>2. Fibra de Coco e Hidroponia — Crescimento Rápido para Quem Gosta de Controle</h3>
      <p>Na fibra de coco ou na água (DWC), a planta cresce até 30% mais rápido na fase inicial, mas depende 100% de você misturar os nutrientes na água e conferir o medidor de pH/EC toda semana.</p>
    `
  },
  {
    id: 'art-setup-alemao-60x60-120x60',
    cluster: 'cluster-luz',
    clusterLabel: 'Como Escolher a Luz LED',
    date: 'ATUALIZADO NOV 2026',
    readTime: '4 min de leitura',
    figRef: 'GUIA PRÁTICO #06',
    title: 'Morando em Apartamento: Como Montar um Cultivo Discreto de 2 a 3 Plantas (120×60 cm)',
    excerpt: 'Por que a tenda retangular de 120×60 cm (que cabe dentro de qualquer guarda-roupa ou canto de quarto) virou febre na Europa e nos EUA.',
    formula: 'Tenda 120×60 cm + LED de 240W a 300W + Exaustor Silencioso = Colheita farta ocupando o espaço de uma cômoda!',
    recommendedHwId: 'clickandgrow-sg9',
    contentHtml: `
      <p>Você não precisa de um quarto inteiro vazio para ter um cultivo indoor incrível. Na verdade, o formato que mais cresce no mundo hoje é a <strong>tenda retangular de 120 cm de largura por apenas 60 cm de profundidade</strong> (conhecida como <em>2×4 pés</em>).</p>
      <h3>1. Por Que 120×60 cm é Mais Prática que uma Tenda Quadrada Grande?</h3>
      <p>Como ela tem apenas <strong>60 cm de fundo</strong> (a mesma profundidade de um guarda-roupa comum ou de uma geladeira), ela não atrapalha a passagem no quarto e todas as 2 ou 3 plantas ficam bem na sua frente quando você abre o zíper — super fácil de regar e cuidar!</p>
      <h3>2. E Para Quem Quer Começar na Bancada da Cozinha?</h3>
      <p>Se você quer cultivar temperos frescos, pimentas, morangos ou mudas na bancada da sala sem nem precisar de tenda, sistemas automáticos como o <strong>Click & Grow Smart Garden 9</strong> fazem tudo sozinhos e ainda decoram a casa.</p>
    `
  }
];

/* ==========================================================================
   CÁLCULOS POR TRÁS DOS CONTROLES (SIMPLES POR FORA, PRECISOS POR DENTRO)
   ========================================================================== */

function calcDLI(ppfd, hours) {
  return (ppfd * hours * 3600) / 1000000;
}

function calcSVP(tempC) {
  return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

function calcVPDMetrics(tempC, rh, leafOffsetC) {
  const svpAir = calcSVP(tempC);
  const vpAir = svpAir * (rh / 100);
  const roomVpd = Math.max(0, svpAir - vpAir);

  const leafTempC = tempC + leafOffsetC;
  const svpLeaf = calcSVP(leafTempC);
  const leafVpd = Math.max(0, svpLeaf - vpAir);

  return { roomVpd, leafVpd, leafTempC };
}

function calcExhaustMetrics(tentKey, hasCarbonFilter, bendsCount) {
  const preset = TENT_PRESETS[tentKey];
  const baseCfm = preset.volFt3 / 1.5;
  let multiplier = 1.15;
  if (hasCarbonFilter) multiplier += 0.25;
  multiplier += bendsCount * 0.12;

  const requiredCfm = Math.round(baseCfm * multiplier);
  const requiredM3h = Math.round(requiredCfm * 1.699);
  const staticPenaltyPct = Math.round((multiplier - 1) * 100);

  return {
    baseCfm: Math.round(baseCfm),
    requiredCfm,
    requiredM3h,
    staticPenaltyPct
  };
}

function calcEnergyMetrics(watts, hoursPerDay, tariff, currency) {
  const dailyKwh = (watts * hoursPerDay) / 1000;
  const monthlyKwh = dailyKwh * 30;
  const monthlyCost = monthlyKwh * tariff;
  const cycle90Cost = monthlyCost * 3;
  const btuPerHour = Math.round(watts * 3.41214);

  const symbols = { BRL: 'R$', USD: 'US$', EUR: '€' };
  return {
    dailyKwh,
    monthlyKwh,
    monthlyCost,
    cycle90Cost,
    btuPerHour,
    symbol: symbols[currency] || 'R$'
  };
}

function setStatusBadge(badgeId, statusClass, iconId, text) {
  const el = document.getElementById(badgeId);
  if (!el) return;
  el.className = `kpi-status-badge ${statusClass}`;
  el.innerHTML = `${LabIcons.use(iconId)}<span>${text}</span>`;
}

/* ==========================================================================
   ATUALIZAÇÃO EM TEMPO REAL COM EXPLICAÇÕES AMIGÁVEIS E ASSETS SVG
   ========================================================================== */
function updateAllCalculators() {
  const isMetric = LabState.unitSystem === 'metric';
  const preset = TENT_PRESETS[LabState.tentKey];

  document.getElementById('hero-stat-tent').textContent = isMetric ? preset.metricLabel : preset.imperialLabel;

  // --- PASSO 01: TAMANHO DA TENDA ---
  const targetWatts = LabState.stage === 'bloom'
    ? preset.recWattsBloom
    : (LabState.stage === 'veg' ? preset.recWattsVeg : Math.round(preset.recWattsVeg * 0.5));
  const exhaust = calcExhaustMetrics(LabState.tentKey, LabState.carbonFilter, LabState.ductBends);

  const wPct = Math.min(100, Math.max(42, Math.round((targetWatts / 750) * 100)));
  const plantsPct = Math.min(100, Math.max(42, Math.round((preset.areaM2 / 2.25) * 100)));
  const airPct = Math.min(100, Math.max(42, Math.round((exhaust.requiredCfm / 500) * 100)));

  setKineticBar('fig1-bar-1', wPct, `${targetWatts}W`);
  setKineticBar('fig1-bar-2', plantsPct, preset.plantsText);
  setKineticBar('fig1-bar-3', airPct, isMetric ? `${exhaust.requiredM3h}` : `${exhaust.requiredCfm}`);

  document.getElementById('fig1-col3-sub').textContent = isMetric ? 'Vazão de Ar (m³/h)' : 'Vazão de Ar (CFM)';
  document.getElementById('fig1-headline-num').textContent = `LED de ${targetWatts}W`;

  const stageLabelMap = {
    seedling: { icon: 'icon-seedling', label: 'Fase de Mudas' },
    veg: { icon: 'icon-leaf', label: 'Fase de Crescimento' },
    bloom: { icon: 'icon-bloom', label: 'Fase de Floração' }
  };
  const stInfo = stageLabelMap[LabState.stage] || stageLabelMap.bloom;
  setStatusBadge('fig1-status-badge', 'status-good', stInfo.icon, stInfo.label);

  document.getElementById('fig1-headline-copy').textContent =
    `Para uma tenda de ${isMetric ? preset.metricLabel : preset.imperialLabel} (onde cabem de ${preset.plantsText} plantas com conforto), você precisa de uma luz LED de cerca de ${targetWatts}W reais na tomada e um exaustor com saída de ${preset.ductMm}.`;

  // --- PASSO 02: FORÇA DA LUZ (PPFD / DLI SIMPLES) ---
  const dli = calcDLI(LabState.ppfd, LabState.hours);
  const maxSafeDli = LabState.co2 ? 55 : 40;

  let dliStatusClass = 'status-good';
  let dliIcon = 'icon-check';
  let dliFriendlyLabel = 'Na Medida Certa';
  let dliAdvice = `Excelente! Com força ${LabState.ppfd} ligada por ${LabState.hours}h/dia, suas plantas estão recebendo a quantidade ideal de luz para crescerem fortes sem queimar as folhas.`;

  if (dli < 16) {
    dliStatusClass = 'status-warn';
    dliIcon = 'icon-seedling';
    dliFriendlyLabel = 'Luz Suave (Mudas)';
    dliAdvice = `Nível de luz suave (${dli.toFixed(0)} pontos/dia). É perfeito para mudas recém-nascidas e clones, mas se a planta já estiver grande, abaixe um pouco a lâmpada ou aumente a potência!`;
  } else if (dli > maxSafeDli) {
    dliStatusClass = 'status-danger';
    dliIcon = 'icon-alert';
    dliFriendlyLabel = 'Forte Demais';
    dliAdvice = LabState.co2
      ? `Atenção: mesmo com gás CO₂ extra, passar de 55 pontos por dia pode queimar o topo das plantas. Suba um pouco a lâmpada ou diminua o dimmer!`
      : `Cuidado: ${dli.toFixed(0)} pontos/dia é luz demais para quem não usa cilindro de CO₂! Você está gastando energia à toa e pode amarelar as folhas do topo. Diminua a força do LED ou reduza as horas.`;
  }

  let ppfdTag = 'Luz Média';
  if (LabState.ppfd < 350) ppfdTag = 'Suave (Mudas)';
  else if (LabState.ppfd >= 700) ppfdTag = 'Forte (Floração)';

  setKineticBar('fig2-bar-1', Math.min(100, Math.max(42, Math.round((LabState.ppfd / 1500) * 100))), `${LabState.ppfd}`);
  setKineticBar('fig2-bar-2', Math.min(100, Math.max(42, Math.round((dli / 65) * 100))), dli.toFixed(0));
  setKineticBar('fig2-bar-3', Math.min(100, Math.max(42, Math.round((LabState.hours / 24) * 100))), `${LabState.hours}h`);

  document.getElementById('val-ppfd').textContent = `${LabState.ppfd} (${ppfdTag})`;
  document.getElementById('val-hours').textContent = `${LabState.hours} horas por dia`;
  document.getElementById('fig2-headline-num').textContent = `${dli.toFixed(0)} pts / dia`;
  setStatusBadge('fig2-status-badge', dliStatusClass, dliIcon, dliFriendlyLabel);
  document.getElementById('fig2-headline-copy').textContent = dliAdvice;
  document.getElementById('hero-stat-dli').textContent = `${dli.toFixed(0)} pts (${dli <= maxSafeDli && dli >= 16 ? 'Ótima' : 'Ajustar'})`;

  // --- PASSO 03: CLIMA PERFEITO (TEMPERATURA + UMIDADE) ---
  const vpdData = calcVPDMetrics(LabState.tempC, LabState.rh, LabState.leafOffsetC);
  const displayAirTemp = isMetric ? `${LabState.tempC.toFixed(1)} °C` : `${((LabState.tempC * 9 / 5) + 32).toFixed(1)} °F`;
  const displayLeafOffset = isMetric ? `${LabState.leafOffsetC.toFixed(1)} °C` : `${(LabState.leafOffsetC * 1.8).toFixed(1)} °F`;

  let vpdStatusClass = 'status-good';
  let vpdIcon = 'icon-check';
  let vpdBadgeText = 'Clima Ideal';
  let vpdCopy = `Perfeito! Com ${displayAirTemp} e ${LabState.rh}% de umidade, suas plantas estão na Zona Verde Ideal: elas bebem água e absorvem nutrientes na velocidade máxima!`;

  if (vpdData.leafVpd < 0.45) {
    vpdStatusClass = 'status-danger';
    vpdIcon = 'icon-alert';
    vpdBadgeText = 'Úmido Demais';
    vpdCopy = `Cuidado com o mofo! O ar está muito pesado e úmido para essa temperatura. Aumente a velocidade do exaustor ou ligue um desumidificador.`;
  } else if (vpdData.leafVpd < 0.8) {
    vpdStatusClass = 'status-good';
    vpdIcon = 'icon-seedling';
    vpdBadgeText = 'Bom para Mudas';
    vpdCopy = `Clima bem úmido e fresco: excelente para mudas pequenas nos primeiros 15 dias! Se a planta já estiver grande ou com flores, diminua um pouco a umidade.`;
  } else if (vpdData.leafVpd >= 1.2 && vpdData.leafVpd <= 1.55) {
    vpdStatusClass = 'status-good';
    vpdIcon = 'icon-bloom';
    vpdBadgeText = 'Ótimo p/ Floração';
    vpdCopy = `Clima mais sequinho e seguro! Essa faixa entre 1.2 e 1.5 é perfeita durante a fase de floração/frutos para proteger a colheita contra fungos.`;
  } else if (vpdData.leafVpd > 1.55) {
    vpdStatusClass = 'status-danger';
    vpdIcon = 'icon-thermal';
    vpdBadgeText = 'Seco / Quente Demais';
    vpdCopy = `Alerta: O ar está seco ou quente demais! A planta fecha os poros das folhas para não perder água e para de crescer. Abaixe o calor ou aumente a umidade!`;
  }

  setKineticBar('fig3-bar-1', Math.min(100, Math.max(42, Math.round((LabState.tempC / 36) * 100))), isMetric ? `${Math.round(LabState.tempC)}°` : `${Math.round((LabState.tempC * 9 / 5) + 32)}°`);
  setKineticBar('fig3-bar-2', Math.min(100, Math.max(42, Math.round((vpdData.leafVpd / 2.2) * 100))), vpdData.leafVpd.toFixed(2));
  setKineticBar('fig3-bar-3', Math.min(100, Math.max(42, LabState.rh)), `${LabState.rh}%`);

  document.getElementById('val-temp').textContent = displayAirTemp;
  document.getElementById('val-rh').textContent = `${LabState.rh}% de Umidade`;
  document.getElementById('val-offset').textContent = displayLeafOffset;
  document.getElementById('fig3-headline-num').textContent = `${vpdData.leafVpd.toFixed(2)} kPa`;
  setStatusBadge('fig3-status-badge', vpdStatusClass, vpdIcon, vpdBadgeText);
  document.getElementById('fig3-headline-copy').textContent = vpdCopy;
  document.getElementById('hero-stat-vpd').textContent = `${vpdData.leafVpd.toFixed(2)} (${vpdData.leafVpd >= 0.45 && vpdData.leafVpd <= 1.55 ? 'Bom' : 'Ajustar'})`;

  // --- PASSO 04: EXAUSTOR E CHEIRO ---
  setKineticBar('fig4-bar-1', Math.min(100, Math.max(42, Math.round((exhaust.baseCfm / 350) * 100))), isMetric ? `${Math.round(exhaust.baseCfm * 1.699)}` : `${exhaust.baseCfm}`);
  setKineticBar('fig4-bar-2', Math.min(100, Math.max(42, exhaust.staticPenaltyPct)), `+${exhaust.staticPenaltyPct}%`);
  setKineticBar('fig4-bar-3', Math.min(100, Math.max(42, Math.round((exhaust.requiredCfm / 450) * 100))), isMetric ? `${exhaust.requiredM3h}` : `${exhaust.requiredCfm}`);

  document.getElementById('val-bends').textContent = `${LabState.ductBends} dobras no tubo`;
  document.getElementById('fig4-headline-num').textContent = isMetric
    ? `${exhaust.requiredM3h} m³/h`
    : `${exhaust.requiredCfm} CFM`;
  setStatusBadge(
    'fig4-status-badge',
    LabState.carbonFilter ? 'status-good' : 'status-warn',
    LabState.carbonFilter ? 'icon-check' : 'icon-alert',
    LabState.carbonFilter ? 'Zero Cheiro c/ Filtro' : 'Sem Filtro de Odres'
  );
  document.getElementById('fig4-headline-copy').textContent =
    `Para vencer o peso do ${LabState.carbonFilter ? 'Filtro de Carvão (que tira o cheiro)' : 'tubo de saída'} e ${LabState.ductBends} dobras no duto, escolha um exaustor de ${preset.ductMm} que puxe pelo menos ${isMetric ? exhaust.requiredM3h + ' m³/h' : exhaust.requiredCfm + ' CFM'}.`;

  // --- PASSO 05: SIMULADOR DA CONTA DE LUZ ---
  const energy = calcEnergyMetrics(LabState.totalWatts, LabState.hours, LabState.tariff, LabState.currency);
  setKineticBar('fig5-bar-1', Math.min(100, Math.max(42, Math.round((energy.monthlyKwh / 650) * 100))), `${Math.round(energy.monthlyKwh)}`);
  setKineticBar('fig5-bar-2', Math.min(100, Math.max(42, Math.round((energy.monthlyCost / 600) * 100))), `${energy.symbol}${Math.round(energy.monthlyCost)}`);
  setKineticBar('fig5-bar-3', Math.min(100, Math.max(42, Math.round((energy.cycle90Cost / 1600) * 100))), `${energy.symbol}${Math.round(energy.cycle90Cost)}`);

  document.getElementById('val-watts').textContent = `${LabState.totalWatts} Watts no total`;
  document.getElementById('val-tariff').textContent = `${energy.symbol} ${LabState.tariff.toFixed(2)} / kWh`;
  document.getElementById('fig5-headline-num').textContent = `${energy.symbol} ${energy.monthlyCost.toFixed(2)} / mês`;
  document.getElementById('fig5-headline-copy').textContent =
    `Seus equipamentos vão consumir cerca de ${energy.monthlyKwh.toFixed(0)} kWh por mês (${energy.dailyKwh.toFixed(1)} kWh por dia ligados ${LabState.hours}h). Uma colheita completa de 3 meses custará cerca de ${energy.symbol} ${energy.cycle90Cost.toFixed(2)} na conta de luz.`;
  document.getElementById('hero-stat-kwh').textContent = `${energy.symbol} ${energy.monthlyCost.toFixed(0)}/mês`;
}

function setKineticBar(elementId, heightPct, textValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.height = `${heightPct}%`;
  const numSpan = el.querySelector('.kinetic-rotated-num');
  if (numSpan) numSpan.textContent = textValue;
}

/* ==========================================================================
   VITRINE DE EQUIPAMENTOS (COM ESTRELA SVG EXCLUSIVA + DUPLO BOTÃO)
   ========================================================================== */
function renderHardwareGrid(filterCategory = 'all', btnEl = null) {
  const container = document.getElementById('hardware-grid-container');
  if (!container) return;

  if (btnEl) {
    document.querySelectorAll('#hw-filter-group .pill-option').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }

  const filtered = HARDWARE_DB.filter(item => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'my-tent') return item.tentFit.includes(LabState.tentKey);
    return item.category === filterCategory;
  });

  container.innerHTML = filtered.map(hw => `
    <article class="hw-card">
      <div>
        <div class="hw-badge-row">
          <span class="hw-category-tag">${hw.categoryLabel}</span>
          <span class="hw-score-pill">
            ${LabIcons.starBadge()}
            <span>${hw.labScore}</span>
          </span>
        </div>
        <h3 class="hw-card-title">${hw.brand} — ${hw.model}</h3>
        <p class="hw-price-meta">
          ${hw.commissionNote} • Preço médio: <strong>${hw.priceRange}</strong>
        </p>
        <div class="hw-specs-list">
          <div><strong>Por que vale a pena:</strong>${hw.efficacy}</div>
          <div><strong>Potência / Consumo:</strong>${hw.power}</div>
          <div><strong>Onde usar:</strong>${hw.coverage}</div>
          <div><strong>Destaque:</strong>${hw.diodes}</div>
        </div>
      </div>

      <div class="recommendation-strip">
        <div class="rec-header">
          <span>COMPRE COM SEGURANÇA E DESCONTO</span>
          <span>100% ORIGINAL</span>
        </div>
        <div class="dual-cta-row">
          <a href="${hw.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn-dtc-primary">
            <span>Loja Oficial ${hw.brand}</span>
            ${LabIcons.use('icon-external', 'lab-icon--sm')}
          </a>
          <button type="button" class="btn-coupon-copy" onclick="copyLabCoupon('${hw.coupon}', '${hw.brand}')">
            ${LabIcons.use('icon-coupon')}
            <span>CUPOM: ${hw.coupon}</span>
          </button>
          <a href="${hw.amazonUrl}" target="_blank" rel="noopener noreferrer" class="btn-amazon-secondary">
            <span>Ver na Amazon</span>
            ${LabIcons.use('icon-external', 'lab-icon--sm')}
          </a>
        </div>
      </div>
    </article>
  `).join('');
}

/* ==========================================================================
   BLOG DE GUIAS PRÁTICOS (FÁCIL DE ENTENDER E SEM EMOJIS)
   ========================================================================== */
function renderBlogGrid(filterCluster = 'all', searchQuery = '', btnEl = null) {
  const container = document.getElementById('blog-grid-container');
  if (!container) return;

  if (btnEl) {
    document.querySelectorAll('#blog-filter-group .pill-option').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = BLOG_ARTICLES.filter(art => {
    const matchCluster = filterCluster === 'all' || art.cluster === filterCluster;
    const matchSearch = !q ||
      art.title.toLowerCase().includes(q) ||
      art.excerpt.toLowerCase().includes(q) ||
      art.clusterLabel.toLowerCase().includes(q);
    return matchCluster && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="folio-card full-span" style="padding:2rem;text-align:center;font-family:var(--font-mono);">Nenhum guia encontrado para essa busca. Tente palavras como "LED", "cheiro" ou "umidade".</div>`;
    return;
  }

  container.innerHTML = filtered.map(art => `
    <article class="blog-card">
      <div class="blog-card-top">
        <div class="blog-meta-line">
          <span class="blog-cluster-tag">${art.figRef} // ${art.clusterLabel}</span>
          <span class="blog-read-time">
            ${LabIcons.use('icon-clock', 'lab-icon--sm')}
            <span>${art.readTime}</span>
          </span>
        </div>
        <h3 class="blog-title">${art.title}</h3>
        <p class="blog-excerpt">${art.excerpt}</p>
        <div class="article-formula-box">
          <span class="formula-box-kicker">
            ${LabIcons.use('icon-insight')}
            <span>Resumo Rápido:</span>
          </span><br>
          ${art.formula}
        </div>
      </div>
      <div class="blog-card-footer">
        <span>${art.date}</span>
        <button type="button" class="btn-table-toggle" onclick="openArticleModal('${art.id}')">
          <span>Ler Guia Passo a Passo</span>
          ${LabIcons.use('icon-arrow-right', 'lab-icon--sm')}
        </button>
      </div>
    </article>
  `).join('');
}

function openArticleModal(articleId) {
  const art = BLOG_ARTICLES.find(a => a.id === articleId);
  if (!art) return;
  const hw = HARDWARE_DB.find(h => h.id === art.recommendedHwId) || HARDWARE_DB[0];

  document.getElementById('modal-header-title').textContent = `${art.figRef} — ${art.clusterLabel.toUpperCase()}`;
  document.getElementById('modal-body-container').innerHTML = `
    <div class="article-modal-meta">
      ${art.date} • LEITURA RÁPIDA: ${art.readTime.toUpperCase()}
    </div>
    <h2>${art.title}</h2>
    <div class="article-formula-box">
      <span class="formula-box-kicker">
        ${LabIcons.use('icon-insight')}
        <span>REGRA PRÁTICA PARA GUARDAR:</span>
      </span><br>
      ${art.formula}
    </div>
    ${art.contentHtml}
    <div class="recommendation-strip recommendation-strip--modal">
      <div class="rec-header">
        <span>EQUIPAMENTO INDICADO NESTE GUIA</span>
        <span class="hw-score-pill">
          ${LabIcons.starBadge()}
          <span>${hw.labScore}</span>
        </span>
      </div>
      <div class="rec-product-title">${hw.brand} — ${hw.model}</div>
      <p class="blog-excerpt">
        ${hw.efficacy} • ${hw.coverage} • Faixa de preço: ${hw.priceRange}
      </p>
      <div class="dual-cta-row">
        <a href="${hw.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn-dtc-primary">
          <span>Comprar na Loja Oficial ${hw.brand}</span>
          ${LabIcons.use('icon-external', 'lab-icon--sm')}
        </a>
        <button type="button" class="btn-coupon-copy" onclick="copyLabCoupon('${hw.coupon}', '${hw.brand}')">
          ${LabIcons.use('icon-coupon')}
          <span>COPIAR CUPOM: ${hw.coupon}</span>
        </button>
        <a href="${hw.amazonUrl}" target="_blank" rel="noopener noreferrer" class="btn-amazon-secondary">
          <span>Ver Preço na Amazon</span>
          ${LabIcons.use('icon-external', 'lab-icon--sm')}
        </a>
      </div>
    </div>
  `;

  document.getElementById('article-modal-backdrop').classList.add('open');
}

function closeArticleModal() {
  document.getElementById('article-modal-backdrop').classList.remove('open');
}

/* ==========================================================================
   BOTÕES DE INTERAÇÃO DA PÁGINA
   ========================================================================== */
function toggleDataDrawer(drawerId, btnEl) {
  const drawer = document.getElementById(drawerId);
  if (!drawer) return;
  const isOpen = drawer.classList.toggle('open');
  btnEl.innerHTML = isOpen
    ? `<span>Ocultar tabela</span>${LabIcons.use('icon-chevron-up', 'lab-icon--sm')}`
    : `<span>Ver tabela resumida</span>${LabIcons.use('icon-chevron-down', 'lab-icon--sm')}`;
}

function copyLabCoupon(code, brandName) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  const toast = document.getElementById('lab-toast');
  toast.innerHTML = `${LabIcons.use('icon-check')}<span>CUPOM "${code}" COPIADO! Use no site oficial da ${brandName} para ganhar desconto.</span>`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3600);
}

function selectTentSize(tentKey, btnEl) {
  LabState.tentKey = tentKey;
  const preset = TENT_PRESETS[tentKey];
  LabState.totalWatts = LabState.stage === 'bloom' ? preset.recWattsBloom + 40 : preset.recWattsVeg + 40;
  const wattsSlider = document.getElementById('slider-watts');
  if (wattsSlider) wattsSlider.value = LabState.totalWatts;

  document.querySelectorAll('[data-tent-btn]').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const topSelect = document.getElementById('global-tent-select');
  if (topSelect) topSelect.value = tentKey;

  updateAllCalculators();
}

function selectGrowthStage(stageKey, btnEl) {
  LabState.stage = stageKey;
  if (stageKey === 'seedling') { LabState.ppfd = 275; LabState.hours = 18; LabState.rh = 70; }
  if (stageKey === 'veg')      { LabState.ppfd = 550; LabState.hours = 18; LabState.rh = 62; }
  if (stageKey === 'bloom')    { LabState.ppfd = 800; LabState.hours = 12; LabState.rh = 52; }

  document.getElementById('slider-ppfd').value = LabState.ppfd;
  document.getElementById('slider-hours').value = LabState.hours;
  document.getElementById('slider-rh').value = LabState.rh;

  const preset = TENT_PRESETS[LabState.tentKey];
  LabState.totalWatts = stageKey === 'bloom' ? preset.recWattsBloom + 40 : preset.recWattsVeg + 40;
  document.getElementById('slider-watts').value = LabState.totalWatts;

  document.querySelectorAll('[data-stage-btn]').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  updateAllCalculators();
}

function toggleUnitSystem() {
  LabState.unitSystem = LabState.unitSystem === 'metric' ? 'imperial' : 'metric';
  const btn = document.getElementById('btn-unit-toggle');
  btn.textContent = LabState.unitSystem === 'metric'
    ? 'MEDIDAS: METROS & °C (BR/UE)'
    : 'MEDIDAS: PÉS & °F (EUA)';
  updateAllCalculators();
}

function toggleThemeMode() {
  LabState.theme = LabState.theme === 'light' ? 'dark' : 'light';
  if (LabState.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const btn = document.getElementById('btn-theme-toggle');
  btn.innerHTML = LabState.theme === 'light'
    ? `${LabIcons.use('icon-theme', 'lab-icon--sm')}<span>MODO ESCURO</span>`
    : `${LabIcons.use('icon-theme', 'lab-icon--sm')}<span>MODO CLARO</span>`;
}

function stepSection(delta) {
  const sections = ['sec-calculadoras', 'sec-vpd-cfm', 'sec-energia', 'sec-hardware', 'sec-blog', 'sec-protocolo'];
  LabState.currentSection = Math.max(1, Math.min(6, LabState.currentSection + delta));
  document.getElementById('stepper-counter').textContent = `Passo 0${LabState.currentSection} / 06`;
  const targetEl = document.getElementById(sections[LabState.currentSection - 1]);
  if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function jumpToSection(sectionIndex, elementId, tabEl) {
  LabState.currentSection = sectionIndex;
  document.getElementById('stepper-counter').textContent = `Passo 0${LabState.currentSection} / 06`;
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
  const el = document.getElementById(elementId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('slider-ppfd').addEventListener('input', e => {
    LabState.ppfd = Number(e.target.value);
    updateAllCalculators();
  });
  document.getElementById('slider-hours').addEventListener('input', e => {
    LabState.hours = Number(e.target.value);
    updateAllCalculators();
  });
  document.getElementById('chk-co2').addEventListener('change', e => {
    LabState.co2 = e.target.checked;
    updateAllCalculators();
  });

  document.getElementById('slider-temp').addEventListener('input', e => {
    LabState.tempC = Number(e.target.value);
    updateAllCalculators();
  });
  document.getElementById('slider-rh').addEventListener('input', e => {
    LabState.rh = Number(e.target.value);
    updateAllCalculators();
  });
  document.getElementById('slider-offset').addEventListener('input', e => {
    LabState.leafOffsetC = Number(e.target.value);
    updateAllCalculators();
  });

  document.getElementById('chk-filter').addEventListener('change', e => {
    LabState.carbonFilter = e.target.checked;
    updateAllCalculators();
  });
  document.getElementById('slider-bends').addEventListener('input', e => {
    LabState.ductBends = Number(e.target.value);
    updateAllCalculators();
  });

  document.getElementById('slider-watts').addEventListener('input', e => {
    LabState.totalWatts = Number(e.target.value);
    updateAllCalculators();
  });
  document.getElementById('slider-tariff').addEventListener('input', e => {
    LabState.tariff = Number(e.target.value);
    updateAllCalculators();
  });
  document.getElementById('select-currency').addEventListener('change', e => {
    LabState.currency = e.target.value;
    updateAllCalculators();
  });

  document.getElementById('global-tent-select').addEventListener('change', e => {
    const key = e.target.value;
    const matchingBtn = document.querySelector(`[data-tent-btn="${key}"]`);
    selectTentSize(key, matchingBtn);
  });

  document.getElementById('blog-search-input').addEventListener('input', e => {
    renderBlogGrid('all', e.target.value);
  });

  document.getElementById('article-modal-backdrop').addEventListener('click', e => {
    if (e.target.id === 'article-modal-backdrop') closeArticleModal();
  });

  updateAllCalculators();
  renderHardwareGrid('all');
  renderBlogGrid('all');
});
