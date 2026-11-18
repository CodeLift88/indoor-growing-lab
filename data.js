/* ==========================================================================
   Indoor Growing Lab — conteúdo (tendas, fases, equipamentos, guias)
   Editar aqui não exige mexer no app.js.
   ========================================================================== */

window.IGL_DATA = {

  /* Tamanhos de tenda. volM3 considera a altura usual de cada modelo. */
  tents: {
    '60x60':   { label: '60×60 cm',   w: 60,  d: 60,  h: 160, plants: [1, 2], areaM2: 0.36, volM3: 0.576, wattsVeg: 100, wattsBloom: 150, ppf: 410,  duct: '100 mm (4")' },
    '120x60':  { label: '120×60 cm',  w: 120, d: 60,  h: 180, plants: [2, 3], areaM2: 0.72, volM3: 1.296, wattsVeg: 200, wattsBloom: 300, ppf: 820,  duct: '100 a 150 mm (4" a 6")' },
    '90x90':   { label: '90×90 cm',   w: 90,  d: 90,  h: 180, plants: [3, 4], areaM2: 0.81, volM3: 1.458, wattsVeg: 240, wattsBloom: 320, ppf: 900,  duct: '150 mm (6")' },
    '120x120': { label: '120×120 cm', w: 120, d: 120, h: 200, plants: [4, 6], areaM2: 1.44, volM3: 2.88,  wattsVeg: 360, wattsBloom: 500, ppf: 1400, duct: '150 mm (6")' },
    '150x150': { label: '150×150 cm', w: 150, d: 150, h: 200, plants: [6, 9], areaM2: 2.25, volM3: 4.5,   wattsVeg: 550, wattsBloom: 730, ppf: 2050, duct: '200 mm (8")' }
  },

  /* Alvos por fase: luz (PPFD/horas), DLI e VPD da folha */
  phases: {
    muda: { label: 'Muda',       ppfd: 250, hours: 18, dli: [10, 20], dliCo2: [10, 22], vpd: [0.4, 0.8], power: 0.35 },
    veg:  { label: 'Vegetativo', ppfd: 500, hours: 18, dli: [20, 40], dliCo2: [20, 45], vpd: [0.8, 1.2], power: 0.75 },
    flor: { label: 'Floração',   ppfd: 800, hours: 12, dli: [30, 45], dliCo2: [35, 60], vpd: [1.2, 1.5], power: 1 }
  },

  /* Exaustores de referência (vazão máxima típica em m³/h) */
  fans: [
    { size: '100 mm (4")', cap: 350 },
    { size: '150 mm (6")', cap: 680 },
    { size: '200 mm (8")', cap: 1370 }
  ],

  /* Lista do primeiro cultivo */
  checklist: [
    { id: 'tenda',   item: 'Tenda',                       why: 'Isola luz, cheiro e clima. O tamanho define todo o resto.' },
    { id: 'led',     item: 'Luz LED de potência real',    why: 'Veja o consumo na tomada, não o número do anúncio.' },
    { id: 'exaustor',item: 'Exaustor + filtro de carvão', why: 'Tira calor, renova o ar e segura o cheiro.' },
    { id: 'duto',    item: 'Duto e abraçadeiras',         why: 'Leva o ar filtrado para fora do cômodo.' },
    { id: 'vent',    item: 'Ventilador interno pequeno',  why: 'Mexe as folhas e evita bolsões de ar úmido.' },
    { id: 'termo',   item: 'Termo-higrômetro',            why: 'Sem medir temperatura e umidade, é chute.' },
    { id: 'vasos',   item: 'Vasos de feltro (11 a 20 L)', why: 'As raízes respiram e não enrolam.' },
    { id: 'terra',   item: 'Substrato ou terra orgânica', why: 'Terra viva pronta é o caminho mais fácil para começar.' },
    { id: 'timer',   item: 'Timer de tomada',             why: 'Liga e desliga a luz sempre na mesma hora.' },
    { id: 'lupa',    item: 'Lupa de 60×',                 why: 'Para ver os tricomas e acertar o dia da colheita.' },
    { id: 'ph',      item: 'Medidor de pH', lvl: 2,       why: 'Necessário em fibra de coco e hidroponia; dispensável em terra viva.' }
  ],

  /* Equipamentos.
     Quando tiver links de afiliado: troque officialUrl/amazonUrl pelo link
     e marque officialAffiliate/amazonAffiliate como true. Cupom real vai em
     coupon: 'CODIGO'. O aviso de afiliado aparece sozinho. */
  hardware: [
    {
      id: 'vivosun-vsfd6500',
      category: 'luz',
      categoryLabel: 'Luz LED + ventilação',
      brand: 'Vivosun',
      model: 'AeroLight Wing / kit de tenda inteligente',
      tentFit: ['120x60', '120x120'],
      why: 'Gasta pouca energia e esquenta pouco.',
      specs: [['Potência', '400 a 450 W reais'], ['Cobertura', 'Tendas de 120×60 e 120×120 cm'], ['Destaque', 'Chips Samsung e ventilador embutido no centro da luz']],
      priceRange: 'US$ 389 – 469',
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://vivosun.com/',
      amazonUrl: 'https://www.amazon.com/s?k=Vivosun+AeroLight+LED+Grow+Light'
    },
    {
      id: 'spiderfarmer-se5000',
      category: 'luz',
      categoryLabel: 'Luz LED em barras',
      brand: 'Spider Farmer',
      model: 'SE5000 480 W (6 barras Samsung)',
      tentFit: ['120x120'],
      why: 'Espalha a luz por igual, até nos cantos da tenda.',
      specs: [['Potência', '480 W reais, com dimmer'], ['Cobertura', 'Tenda de 120×120 cm'], ['Destaque', 'Chips Samsung LM301H Evo']],
      priceRange: 'US$ 459 – 519',
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://www.spider-farmer.com/',
      amazonUrl: 'https://www.amazon.com/s?k=Spider+Farmer+SE5000'
    },
    {
      id: 'acinfinity-cloudline-t6',
      category: 'ar',
      categoryLabel: 'Exaustor silencioso',
      brand: 'AC Infinity',
      model: 'Cloudline Pro T6 + controlador 69 Pro',
      tentFit: ['90x90', '120x120', '150x150'],
      why: 'Silencioso o bastante para dormir no mesmo quarto.',
      specs: [['Potência', '40 W, até 683 m³/h'], ['Cobertura', 'Tendas de 90×90 a 150×150 cm'], ['Destaque', 'Acelera sozinho quando a tenda esquenta']],
      priceRange: 'US$ 149 – 169',
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://acinfinity.com/',
      amazonUrl: 'https://www.amazon.com/s?k=AC+Infinity+Cloudline+Pro+T6'
    },
    {
      id: 'pulse-pro-monitor',
      category: 'sensores',
      categoryLabel: 'Monitor pelo celular',
      brand: 'Pulse Grow',
      model: 'Pulse One / Pulse Pro (Wi-Fi)',
      tentFit: ['60x60', '120x60', '90x90', '120x120', '150x150'],
      why: 'Avisa no celular se a luz falhar ou a tenda esquentar.',
      specs: [['Conexão', 'Wi-Fi, com bateria para quedas de energia'], ['Cobertura', 'Qualquer tamanho de tenda'], ['Destaque', 'Mostra o VPD pronto na tela']],
      priceRange: 'US$ 199 – 499',
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://pulsegrow.com/',
      amazonUrl: 'https://www.amazon.com/s?k=Pulse+One+Grow+Room+Monitor'
    },
    {
      id: 'buildasoil-living-soil',
      category: 'substratos',
      categoryLabel: 'Terra orgânica viva',
      brand: 'BuildASoil',
      model: 'Kit terra viva 3.0 + Craft Blend',
      tentFit: ['60x60', '120x60', '90x90', '120x120', '150x150'],
      why: 'Só regar com água: sem medir pH nem misturar fertilizante.',
      specs: [['Tipo', 'Terra com vida microbiana que alimenta a planta'], ['Uso', 'Vasos grandes de feltro ou canteiros'], ['Destaque', 'Orgânico: difícil queimar a planta por excesso']],
      priceRange: 'US$ 65 – 240',
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://buildasoil.com/',
      amazonUrl: 'https://www.amazon.com/s?k=BuildASoil+Craft+Blend'
    },
    {
      id: 'clickandgrow-sg9',
      category: 'substratos',
      categoryLabel: 'Horta automática',
      brand: 'Click & Grow',
      model: 'Smart Garden 9 Pro',
      tentFit: ['60x60'],
      why: 'Rega e ilumina sozinha. Água uma vez a cada 3 semanas.',
      specs: [['Potência', '13 W'], ['Capacidade', '9 mudas (ervas, pimentas, tomates)'], ['Destaque', 'Liga e desliga a luz automaticamente']],
      priceRange: 'US$ 229 – 289',
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://www.clickandgrow.com/',
      amazonUrl: 'https://www.amazon.com/s?k=Click+and+Grow+Smart+Garden+9'
    }
  ],

  guides: [
    {
      id: 'germinacao',
      cluster: 'cuidados',
      clusterLabel: 'Cuidados',
      readTime: '5 min',
      title: 'Germinação passo a passo: do grão à primeira folha',
      excerpt: 'Papel toalha ou direto no substrato? Temperatura, profundidade e os erros que mais matam mudas na primeira semana.',
      summary: 'Calor estável (22–26 °C), umidade sem encharcar e escuro até a raiz aparecer. Plante a 0,5–1 cm de profundidade, raiz para baixo.',
      calc: { href: '#clima', label: 'Calculadora de clima' },
      hw: 'pulse-pro-monitor',
      html: `
        <p>A germinação é a fase mais curta do cultivo, de 1 a 7 dias, e a que mais assusta quem está começando. A boa notícia: a semente já traz tudo de que precisa. Seu trabalho é só dar <strong>água, calor e escuro</strong> na medida certa.</p>

        <h3>1. Escolha o método</h3>
        <p>Os dois funcionam. A diferença é quanto você mexe na semente.</p>
        <table>
          <thead><tr><th>Método</th><th>Como é</th><th>Para quem</th></tr></thead>
          <tbody>
            <tr><td><strong>Papel toalha</strong></td><td>Semente entre duas folhas úmidas, num prato tampado, até a raiz sair.</td><td>Quer ver acontecer e descartar o que não germinou.</td></tr>
            <tr><td><strong>Direto no substrato</strong></td><td>Semente plantada já no copo ou vaso definitivo.</td><td>Quer mexer o mínimo. A raiz nunca é tocada.</td></tr>
          </tbody>
        </table>

        <h3>2. Papel toalha, passo a passo</h3>
        <ol>
          <li><strong>Umedeça, não encharque.</strong> O papel deve estar molhado, mas sem poça. Água parada afoga a semente.</li>
          <li><strong>Feche e guarde no escuro</strong>, entre 22 e 26 °C. Em cima da geladeira ou do roteador costuma ser um bom lugar.</li>
          <li><strong>Confira a cada 12 horas.</strong> Se o papel secou, borrife um pouco de água.</li>
          <li><strong>Quando a raiz tiver 0,5 a 1 cm</strong>, plante. Não espere ficar comprida: ela quebra fácil.</li>
        </ol>

        <h3>3. Na hora de plantar</h3>
        <ul>
          <li><strong>Profundidade:</strong> de 0,5 a 1 cm. Mais fundo, a muda gasta energia demais para chegar à superfície.</li>
          <li><strong>Raiz para baixo</strong>, segurando a semente pela casca, nunca pela raiz.</li>
          <li><strong>Substrato úmido, não molhado.</strong> Aperte um punhado: se pingar, está molhado demais.</li>
          <li><strong>Cubra de leve</strong>, sem compactar a terra por cima.</li>
        </ul>

        <h3>4. Os primeiros dias acima da terra</h3>
        <p>A primeira coisa a aparecer são duas folhinhas redondas, os <em>cotilédones</em>. Depois vêm as primeiras folhas serrilhadas. A partir daqui a muda precisa de luz suave (18 h por dia) e ar úmido, entre 65% e 70%.</p>

        <h3>Erros comuns</h3>
        <ul>
          <li><strong>Regar demais.</strong> O caule fino apodrece rente à terra e a muda tomba (o “tombamento”). Molhe só em volta, pouco de cada vez.</li>
          <li><strong>Luz forte cedo demais.</strong> A muda queima ou para de crescer. Use o LED na potência mínima e mais alto.</li>
          <li><strong>Desistir cedo.</strong> Algumas sementes levam até 7 dias. Se passar disso sem sinal, aí sim, provavelmente não vai germinar.</li>
        </ul>`
    },
    {
      id: 'rega',
      cluster: 'cuidados',
      clusterLabel: 'Cuidados',
      readTime: '5 min',
      title: 'Rega: quanto e quando molhar (o erro nº 1 de quem começa)',
      excerpt: 'Mais plantas morrem de excesso de água do que de falta. Aprenda o teste do peso do vaso e nunca mais regue no chute.',
      summary: 'Regue quando o vaso estiver leve e os primeiros 2–3 cm do substrato secos. Molhe tudo de uma vez, depois espere secar de novo.',
      calc: { href: '#clima', label: 'Calculadora de clima' },
      hw: 'buildasoil-living-soil',
      html: `
        <p>Quem começa costuma regar por carinho: um pouco todo dia. O problema é que <strong>a raiz também precisa de ar</strong>. Substrato sempre molhado sufoca a raiz, a planta murcha mesmo com água sobrando e abre espaço para fungos.</p>

        <h3>1. A regra: molhe bem, depois deixe secar</h3>
        <p>O ciclo saudável é <strong>molhar o vaso inteiro e esperar ele secar</strong> antes da próxima rega. Nesse intervalo, a raiz cresce procurando água, e é isso que deixa a planta forte.</p>

        <h3>2. Como saber a hora: três testes</h3>
        <ol>
          <li><strong>Peso do vaso.</strong> O melhor de todos. Levante o vaso logo depois de regar e grave a sensação. Quando ele estiver bem leve, é hora.</li>
          <li><strong>Dedo na terra.</strong> Enfie o dedo 2 a 3 cm. Se sair seco, pode regar. Se sair úmido, espere.</li>
          <li><strong>Aparência da planta.</strong> Folhas levemente caídas e moles, com o vaso leve, indicam sede. Folhas caídas e <em>duras</em>, com o vaso pesado, indicam excesso.</li>
        </ol>

        <h3>3. Quanto colocar</h3>
        <ul>
          <li><strong>Mudas:</strong> pouca água, em círculo a uns 5 cm do caule. A raiz ainda é pequena.</li>
          <li><strong>Plantas maiores:</strong> regue devagar até toda a terra ficar úmida. Uma referência é cerca de 25% do volume do vaso (2,5 L num vaso de 11 L).</li>
          <li><strong>Fibra de coco:</strong> regue até escorrer 10% a 20% pelo fundo. Isso evita acúmulo de sais.</li>
          <li><strong>Terra viva:</strong> regue sem deixar escorrer muito, para não lavar a vida e os nutrientes da terra.</li>
        </ul>

        <h3>4. Excesso ou falta? Como diferenciar</h3>
        <table>
          <thead><tr><th>Sinal</th><th>Excesso de água</th><th>Falta de água</th></tr></thead>
          <tbody>
            <tr><td>Folhas</td><td>Caídas, cheias, duras, viradas para baixo</td><td>Caídas, finas, moles, sem força</td></tr>
            <tr><td>Vaso</td><td>Pesado</td><td>Leve</td></tr>
            <tr><td>Substrato</td><td>Úmido há dias, cheiro de mofo</td><td>Seco e soltando da borda</td></tr>
          </tbody>
        </table>

        <h3>5. A água</h3>
        <ul>
          <li><strong>Temperatura ambiente.</strong> Água gelada dá choque na raiz.</li>
          <li><strong>Água da torneira</strong> costuma servir. Em terra viva, um filtro de carvão ajuda a tirar o cloro, que prejudica a vida do solo.</li>
          <li><strong>pH:</strong> em terra, entre 6,0 e 7,0. Em fibra de coco ou hidroponia, entre 5,5 e 6,5. Fora disso a planta não absorve os nutrientes, mesmo que eles estejam lá.</li>
        </ul>

        <h3>Erros comuns</h3>
        <ul>
          <li><strong>Regar por calendário</strong> (“toda segunda e quinta”). A sede muda com o tamanho da planta, a fase e o clima da tenda.</li>
          <li><strong>Vaso grande para muda pequena.</strong> A terra demora demais para secar. Comece num copo ou vaso pequeno e transplante depois.</li>
          <li><strong>Prato cheio embaixo do vaso.</strong> Esvazie depois de 15 minutos, senão a raiz fica de molho.</li>
        </ul>`
    },
    {
      id: 'folhas-amarelas',
      cluster: 'cuidados',
      clusterLabel: 'Cuidados',
      readTime: '6 min',
      title: 'Folhas amarelas ou manchadas: o que a planta está dizendo',
      excerpt: 'Antes de comprar adubo, olhe onde o problema começou. A posição da folha já diz metade do diagnóstico.',
      summary: 'Antes de adubar, confira nesta ordem: rega, pH, luz e temperatura. A maioria das “deficiências” é um desses quatro.',
      calc: { href: '#luz', label: 'Calculadora de luz' },
      hw: 'pulse-pro-monitor',
      html: `
        <p>Folha amarela é o sintoma que mais gera pânico, e o que mais leva a gastos desnecessários com fertilizante. Na maioria das vezes, <strong>a comida está no vaso, mas a planta não consegue absorver</strong>, por causa de rega, pH, luz ou temperatura.</p>

        <h3>1. Primeiro, onde começou?</h3>
        <p>Alguns nutrientes “andam” dentro da planta e outros não. Por isso a posição da folha é a melhor pista:</p>
        <ul>
          <li><strong>Folhas de baixo (velhas) primeiro:</strong> a planta está tirando nutrientes delas para mandar ao topo. Pense em nitrogênio, magnésio ou potássio.</li>
          <li><strong>Folhas do topo (novas) primeiro:</strong> o nutriente não chega. Pense em pH errado, ferro, cálcio ou luz demais.</li>
        </ul>

        <h3>2. Tabela rápida</h3>
        <table>
          <thead><tr><th>O que você vê</th><th>Causa provável</th><th>O que fazer</th></tr></thead>
          <tbody>
            <tr><td>Folhas de baixo amarelando por inteiro, de baixo para cima</td><td>Falta de nitrogênio</td><td>No vegetativo, reforce o adubo. Nas últimas semanas de floração, é normal.</td></tr>
            <tr><td>Amarelo entre as nervuras, que ficam verdes, nas folhas velhas</td><td>Falta de magnésio</td><td>CalMag na rega. Comum sob LED e em fibra de coco.</td></tr>
            <tr><td>Manchas marrons, cor de ferrugem, em folhas do meio</td><td>Falta de cálcio</td><td>CalMag e conferir o pH.</td></tr>
            <tr><td>Bordas queimadas e secas, das pontas para dentro, em folhas velhas</td><td>Falta de potássio</td><td>Conferir pH. Na floração, adubo de floração.</td></tr>
            <tr><td>Folhas novas amarelo-claras, quase brancas, com nervuras verdes</td><td>Ferro bloqueado, quase sempre por pH alto</td><td>Corrigir o pH da água antes de qualquer adubo.</td></tr>
            <tr><td>Só as pontas queimadas, marrons e secas</td><td>Excesso de adubo</td><td>Reduza a dose. Em coco, regue só com água até escorrer.</td></tr>
            <tr><td>Folhas do topo desbotadas, perto do LED</td><td>Luz demais</td><td>Suba o LED ou baixe o dimmer. Confira na calculadora de luz.</td></tr>
            <tr><td>Folhas verde-escuras, viradas para baixo como garras</td><td>Excesso de nitrogênio ou de rega</td><td>Reduza o adubo e espaçe as regas.</td></tr>
          </tbody>
        </table>

        <h3>3. Antes de adubar, confira nesta ordem</h3>
        <ol>
          <li><strong>Rega:</strong> o vaso está secando entre as regas? Veja o <a href="guia:rega">guia de rega</a>.</li>
          <li><strong>pH:</strong> fora da faixa (6,0–7,0 em terra, 5,5–6,5 em coco), a planta “passa fome” com comida no prato.</li>
          <li><strong>Luz:</strong> topo desbotado é luz, não falta de nutriente.</li>
          <li><strong>Temperatura e umidade:</strong> frio e ar parado travam a absorção. Confira na <a href="#clima" data-close>calculadora de clima</a>.</li>
        </ol>

        <h3>Erros comuns</h3>
        <ul>
          <li><strong>Adubar mais quando a folha amarela.</strong> Se o problema era pH, mais adubo só piora.</li>
          <li><strong>Mudar várias coisas de uma vez.</strong> Corrija uma, espere 3 a 5 dias e observe as folhas <em>novas</em>. As antigas não voltam a ficar verdes.</li>
          <li><strong>Se assustar no fim da floração.</strong> Folhas amarelando nas últimas semanas são normais: a planta está usando as reservas.</li>
        </ul>`
    },
    {
      id: 'led-watts-reais',
      calc: { href: '#luz', label: 'Calculadora de luz' },
      cluster: 'luz',
      clusterLabel: 'Luz LED',
      readTime: '4 min',
      title: 'Como escolher a luz LED certa (e não cair no golpe dos “1000 W”)',
      excerpt: 'Aquelas lâmpadas roxas baratas que dizem ter 1000 W ou 2000 W? Veja como descobrir a força real de um LED em 30 segundos.',
      summary: 'Regra de bolso: de 30 a 35 W reais na tomada para cada 30×30 cm de tenda.',
      hw: 'vivosun-vsfd6500',
      html: `
        <p>Ao procurar uma luz de cultivo, é comum achar anúncios de <strong>“LED 1000 W” ou “LED 2000 W” por um preço baixo</strong>. Nas letras miúdas, a lâmpada puxa só 80 W da tomada, e as plantas crescem esticadas, fracas e sem peso.</p>
        <h3>1. Olhe sempre o consumo real na tomada</h3>
        <p>Ignore o número do nome comercial. Procure na descrição a <strong>potência real</strong> (em inglês, <em>power draw</em> ou <em>true watts</em>):</p>
        <ul>
          <li><strong>Tenda de 60×60 cm:</strong> 100 a 150 W reais.</li>
          <li><strong>Tenda de 120×60 cm:</strong> 240 a 300 W reais.</li>
          <li><strong>Tenda de 120×120 cm:</strong> 450 a 500 W reais.</li>
        </ul>
        <h3>2. Por que os painéis em barras são melhores que as placas antigas</h3>
        <p>As placas únicas concentravam a luz no centro: a planta do meio queimava e os cantos ficavam no escuro. Os modelos em <strong>barras espaçadas</strong> espalham a luz por igual e deixam o ar circular entre as barras, mantendo tudo mais fresco.</p>`
    },
    {
      id: 'clima-vpd',
      calc: { href: '#clima', label: 'Calculadora de clima' },
      cluster: 'clima',
      clusterLabel: 'Clima',
      readTime: '5 min',
      title: 'Temperatura e umidade sem mistério',
      excerpt: 'Folhas enrolando ou com manchas estranhas? Muitas vezes a culpa não é do adubo, e sim do ar seco ou úmido demais.',
      summary: 'Vegetativo: 22–28 °C com 55–65% de umidade. Floração: 20–26 °C com 40–50%.',
      hw: 'pulse-pro-monitor',
      html: `
        <p>Muita gente gasta com fertilizante achando que a planta está com fome, quando na verdade <strong>o clima da tenda está impedindo a planta de beber água</strong>.</p>
        <h3>1. Como a planta “bebe” e “sua”</h3>
        <p>Para puxar água e nutrientes pelas raízes, a planta precisa evaporar água pelos poros das folhas. É como você se exercitando:</p>
        <ul>
          <li><strong>Ar úmido demais</strong> (acima de 75% na floração): o suor não seca, a planta para de puxar cálcio e o mofo aparece.</li>
          <li><strong>Ar seco e quente demais</strong> (31 °C com 35%, por exemplo): a planta fecha os poros para não desidratar e trava o crescimento.</li>
        </ul>
        <h3>2. A regra para não errar</h3>
        <p>Use a <a href="#clima" data-close>calculadora de clima</a>: mantenha o VPD entre <strong>0,8 e 1,2 kPa no vegetativo</strong> e entre <strong>1,2 e 1,5 kPa na floração</strong>. Um sensor como o <em>Pulse One</em> mostra esse número pronto no celular.</p>`
    },
    {
      id: 'cheiro-e-calor',
      calc: { href: '#ar', label: 'Calculadora de exaustão' },
      cluster: 'ar',
      clusterLabel: 'Exaustão',
      readTime: '4 min',
      title: 'Como segurar o cheiro e o calor da tenda sem barulho',
      excerpt: 'Como ligar o filtro de carvão do jeito certo e o truque para a tenda ficar silenciosa.',
      summary: 'Truque do silêncio: compre um exaustor um tamanho acima e use a 40–60% da força.',
      hw: 'acinfinity-cloudline-t6',
      html: `
        <p>Quem cultiva em apartamento tem duas preocupações: <strong>não deixar o cheiro escapar</strong> e <strong>não ter um motor zumbindo a noite inteira</strong>.</p>
        <h3>1. Pressão negativa: o segredo do cheiro zero</h3>
        <p>Quando o exaustor puxa o ar de dentro da tenda através do <strong>filtro de carvão ativado</strong> e joga para fora, as paredes da tenda ficam levemente “chupadas” para dentro. É sinal de que o ar só sai depois de passar pelo carvão.</p>
        <h3>2. Por que um exaustor de 150 mm é mais silencioso que um de 100 mm</h3>
        <p>Um exaustor pequeno a 100% faz barulho de vento. Um de <strong>150 mm a 40 ou 50%</strong> move o mesmo ar fazendo menos barulho que um ventilador de mesa. Confira o tamanho certo na <a href="#ar" data-close>calculadora de exaustão</a>.</p>`
    },
    {
      id: 'marcas-2026',
      calc: { href: '#kit', label: 'Calculadora do kit' },
      cluster: 'equipamentos',
      clusterLabel: 'Equipamentos',
      readTime: '5 min',
      title: 'Vivosun, Spider Farmer ou AC Infinity: onde vale gastar em 2026',
      excerpt: 'Três marcas comparadas em construção, consumo, preço e facilidade de uso.',
      summary: 'Automação e exaustão: AC Infinity. Custo-benefício em LED e kits: Vivosun e Spider Farmer.',
      hw: 'spiderfarmer-se5000',
      html: `
        <p>Não é preciso pagar caro em lojas antigas para ter equipamento de primeira linha. Três marcas dominam as recomendações, e cada uma se destaca num ponto.</p>
        <h3>1. AC Infinity: exaustão e automação</h3>
        <p>Para a tenda se cuidar sozinha pelo aplicativo, o conjunto <strong>Cloudline Pro + controlador 69 Pro</strong> é referência em acabamento e silêncio.</p>
        <h3>2. Vivosun e Spider Farmer: custo-benefício em LED</h3>
        <p>Para um painel com chips <strong>Samsung LM301H Evo</strong> ou um kit completo gastando menos, as duas entregam a mesma luz útil por um preço menor.</p>`
    },
    {
      id: 'terra-coco-hidro',
      calc: { href: '#kit', label: 'Lista do primeiro cultivo' },
      cluster: 'substratos',
      clusterLabel: 'Substrato',
      readTime: '5 min',
      title: 'Terra orgânica, fibra de coco ou hidroponia: por onde começar',
      excerpt: 'Prós e contras sinceros de cada método antes de comprar os vasos.',
      summary: 'Quer menos trabalho e menos erro? Terra orgânica viva. Quer velocidade máxima? Coco ou hidroponia.',
      hw: 'buildasoil-living-soil',
      html: `
        <p>Antes de ligar a tenda, decida onde as raízes vão morar. São três caminhos, do mais fácil ao mais técnico.</p>
        <h3>1. Terra orgânica viva: o mais fácil</h3>
        <p>Na terra viva completa, a comida dos 3 a 4 meses já está misturada de forma natural. <strong>Você só rega com água.</strong> Sem medir pH todo dia, sem garrafinhas de fertilizante.</p>
        <h3>2. Fibra de coco e hidroponia: para quem gosta de controle</h3>
        <p>No coco ou na água (DWC), a planta cresce até 30% mais rápido no início, mas depende de você misturar os nutrientes e conferir pH e EC toda semana.</p>`
    },
    {
      id: 'apartamento-120x60',
      calc: { href: '#kit', label: 'Calculadora do kit' },
      cluster: 'luz',
      clusterLabel: 'Espaço',
      readTime: '4 min',
      title: 'Cultivo discreto em apartamento: 2 a 3 plantas em 120×60 cm',
      excerpt: 'Por que a tenda retangular, que cabe no canto do quarto, virou a mais vendida do mundo.',
      summary: 'Tenda de 120×60 cm + LED de 240–300 W + exaustor silencioso: colheita boa no espaço de uma cômoda.',
      hw: 'clickandgrow-sg9',
      html: `
        <p>Não é preciso um quarto vazio para cultivar bem. O formato que mais cresce hoje é a <strong>tenda de 120 cm de largura por 60 cm de fundo</strong>.</p>
        <h3>1. Por que 120×60 é mais prática que uma tenda quadrada grande</h3>
        <p>Com <strong>60 cm de fundo</strong>, a mesma profundidade de um guarda-roupa, ela não atrapalha a passagem e todas as plantas ficam ao alcance quando você abre o zíper.</p>
        <h3>2. E na bancada da cozinha?</h3>
        <p>Para temperos, pimentas ou mudas sem tenda, hortas automáticas como a <strong>Click & Grow Smart Garden 9</strong> fazem tudo sozinhas.</p>`
    }
  ]
};
