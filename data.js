/* ==========================================================================
   Indoor Growing Lab — conteúdo (estufas, fases, equipamentos, guias)
   Editar aqui não exige mexer no app.js.
   ========================================================================== */

window.IGL_DATA = {

  /* Tamanhos de estufa. volM3 considera a altura usual de cada modelo. */
  tents: {
    '40x40':   { label: '40×40 cm',   w: 40,  d: 40,  h: 140, plants: [1, 1], areaM2: 0.16, volM3: 0.224, wattsVeg: 45,  wattsBloom: 65,  ppf: 180,  duct: '100 mm (4")' },
    '60x60':   { label: '60×60 cm',   w: 60,  d: 60,  h: 160, plants: [1, 2], areaM2: 0.36, volM3: 0.576, wattsVeg: 100, wattsBloom: 150, ppf: 410,  duct: '100 mm (4")' },
    '80x80':   { label: '80×80 cm',   w: 80,  d: 80,  h: 180, plants: [2, 3], areaM2: 0.64, volM3: 1.152, wattsVeg: 180, wattsBloom: 250, ppf: 700,  duct: '100 mm (4")' },
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
    { id: 'estufa',   item: 'Estufa de cultivo (grow box)', why: 'Isola luz, cheiro e clima. O tamanho define todo o resto.' },
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

  /* Diagnóstico: sintomas que a pessoa reconhece pela imagem.
     where: baixo | topo | toda | solo   illo: desenho em app.js */
  diagnoses: [
    {
      id: 'n', illo: 'n', where: ['baixo'],
      label: 'Amarelo por inteiro, começando pelas folhas de baixo',
      cause: 'Falta de nitrogênio',
      why: 'O nitrogênio circula dentro da planta. Quando falta, ela tira das folhas velhas para alimentar o topo, e as de baixo amarelam por inteiro.',
      steps: ['No vegetativo, aumente aos poucos a dose do adubo de crescimento.', 'Na reta final da floração, é normal: a planta está usando as reservas.', 'Confira o pH antes de adubar. Com pH errado, adubo extra não resolve.'],
      notThis: 'Se o amarelo fica entre as nervuras e elas continuam verdes, é magnésio.',
      tech: 'Nutriente móvel: a clorose uniforme começa nas folhas basais e sobe.',
      guides: ['folhas-amarelas'], calc: null
    },
    {
      id: 'mg', illo: 'mg', where: ['baixo'],
      label: 'Amarelo entre as nervuras, que continuam verdes',
      cause: 'Falta de magnésio',
      why: 'O magnésio fica no centro da clorofila. Sob LED e em fibra de coco a planta costuma pedir mais do que o adubo entrega.',
      steps: ['Adicione CalMag na rega, na dose do rótulo.', 'Confira o pH: abaixo de 6,0 em terra, o magnésio fica preso.', 'Observe as folhas novas em 3 a 5 dias. As antigas não voltam a ficar verdes.'],
      notThis: 'Se o mesmo padrão aparece nas folhas novas do topo, pense em ferro e pH.',
      tech: 'Móvel no floema: clorose internerval em folhas medianas e basais.',
      guides: ['folhas-amarelas'], calc: null
    },
    {
      id: 'k', illo: 'k', where: ['baixo'],
      label: 'Bordas secando de fora para dentro',
      cause: 'Falta de potássio',
      why: 'O potássio controla a água dentro da folha. Na floração a planta pede mais, e as bordas das folhas velhas secam e enrolam.',
      steps: ['Confira o pH primeiro.', 'Na floração, use o adubo de floração, que tem mais potássio, na dose do rótulo.', 'Remova só as folhas muito danificadas.'],
      notThis: 'Se só as pontinhas queimam, é excesso de adubo, não falta.',
      tech: 'Móvel: necrose marginal começando pelas folhas mais velhas.',
      guides: ['folhas-amarelas'], calc: null
    },
    {
      id: 'ca', illo: 'ca', where: ['topo', 'toda'],
      label: 'Manchas marrons, cor de ferrugem',
      cause: 'Falta de cálcio',
      why: 'O cálcio não circula dentro da planta: só chega às folhas pela água que ela transpira. Ar úmido demais ou pH errado travam esse caminho.',
      steps: ['Adicione CalMag na rega, na dose do rótulo.', 'Confira o pH: 6,0–7,0 em terra, 5,5–6,5 em coco.', 'Confira o clima. Com VPD baixo, a planta transpira pouco e o cálcio não sobe.'],
      notThis: 'Muitos pontinhos claros e teias finas no verso da folha são ácaros.',
      tech: 'Imóvel, transportado pelo xilema: depende da transpiração.',
      guides: ['folhas-amarelas'], calc: { href: '#clima', label: 'Calculadora de clima' }
    },
    {
      id: 'fe', illo: 'fe', where: ['topo'],
      label: 'Folhas novas quase brancas, com nervuras verdes',
      cause: 'pH alto bloqueando o ferro',
      why: 'O ferro não circula dentro da planta, então a falta aparece nas folhas novas. Quase sempre o ferro está no vaso, mas o pH alto impede a absorção.',
      steps: ['Meça o pH da água e do que escorre pelo fundo do vaso.', 'Corrija para 6,0–6,5 em terra ou 5,8–6,2 em coco.', 'Não adicione adubo até o pH estar certo.'],
      notThis: 'Se o desbotado aparece só bem perto do LED, é luz demais.',
      tech: 'Imóvel: clorose internerval nas folhas apicais. Disponibilidade cai acima de pH 6,5–7.',
      guides: ['folhas-amarelas', 'rega'], calc: null
    },
    {
      id: 'light', illo: 'light', where: ['topo'],
      label: 'Topo desbotado, só perto do LED',
      cause: 'Luz demais',
      why: 'Perto do LED a luz passa do que a folha consegue usar e a clorofila se degrada. O topo desbota enquanto as folhas de baixo continuam verdes.',
      steps: ['Suba o LED de 10 a 15 cm ou baixe o dimmer.', 'Confira na calculadora de luz se você passou do alvo da fase.', 'Meça a temperatura no topo das plantas: calor junto piora.'],
      notThis: 'Se o topo desbota mesmo longe da luz, confira o pH (ferro).',
      tech: 'Fotoinibição: excesso de PPFD no dossel, geralmente acima de ~1000–1200 µmol/m²/s sem CO₂.',
      guides: ['led-watts-reais'], calc: { href: '#luz', label: 'Calculadora de luz' }
    },
    {
      id: 'burn', illo: 'burn', where: ['toda'],
      label: 'Só as pontinhas queimadas',
      cause: 'Excesso de adubo',
      why: 'Sais demais no substrato queimam as pontas das folhas, por onde a água sai.',
      steps: ['Reduza a dose do adubo pela metade.', 'Em coco ou com adubo líquido, regue só com água até escorrer bem pelo fundo.', 'Em terra viva, não adicione nada e deixe a planta consumir o que tem.'],
      notThis: 'Bordas inteiras secando em folhas velhas é falta de potássio.',
      tech: 'EC alta na zona da raiz: acúmulo de sais e estresse osmótico.',
      guides: ['folhas-amarelas', 'terra-coco-hidro'], calc: null
    },
    {
      id: 'claw', illo: 'claw', where: ['toda', 'topo'],
      label: 'Verde-escuro, pontas viradas para baixo como garras',
      cause: 'Nitrogênio ou rega em excesso',
      why: 'Folha muito escura e brilhante, com as pontas viradas para baixo, indica nitrogênio sobrando. É comum no começo da floração com adubo de crescimento.',
      steps: ['Reduza o adubo, principalmente o de crescimento.', 'Espace as regas.', 'Na floração, troque para o adubo de floração.'],
      notThis: 'Garra com folhas amarelando e vaso pesado aponta mais para rega do que para adubo.',
      tech: 'Excesso de N: folhas escuras com pontas em garra.',
      guides: ['rega', 'folhas-amarelas'], calc: null
    },
    {
      id: 'over', illo: 'over', where: ['toda'],
      label: 'Folhas caídas, mas firmes; vaso pesado',
      cause: 'Excesso de água',
      why: 'Raiz encharcada não respira. A planta murcha mesmo com água sobrando no vaso.',
      steps: ['Pare de regar até o vaso ficar leve.', 'Esvazie o prato embaixo do vaso.', 'Aumente a ventilação para o substrato secar mais rápido.', 'Daqui em diante, use o teste do peso do vaso.'],
      notThis: 'Folhas moles e finas com o vaso leve é falta de água.',
      tech: 'Hipóxia na raiz: menos absorção e mais risco de patógenos de raiz.',
      guides: ['rega'], calc: null
    },
    {
      id: 'under', illo: 'under', where: ['toda'],
      label: 'Folhas murchas e moles; vaso leve',
      cause: 'Falta de água',
      why: 'Sem água, as folhas perdem a firmeza. A planta se recupera em poucas horas depois da rega.',
      steps: ['Regue devagar até molhar toda a terra.', 'Se a água escorre pela lateral sem molhar, regue em etapas, com pausas.', 'Acima de 30 °C a planta bebe mais: confira o clima.'],
      notThis: 'Folhas caídas, mas duras e cheias, com o vaso pesado, é excesso de água.',
      tech: 'Perda de turgor por déficit hídrico.',
      guides: ['rega'], calc: { href: '#clima', label: 'Calculadora de clima' }
    },
    {
      id: 'oidio', illo: 'oidio', where: ['toda'],
      label: 'Pó branco sobre as folhas',
      cause: 'Oídio (mofo branco)',
      why: 'Um fungo que adora ar úmido e parado. Começa em manchinhas brancas e se espalha rápido.',
      steps: ['Remova as folhas mais atacadas e descarte fora da estufa.', 'Melhore a circulação com ventilador interno e exaustão.', 'Baixe a umidade e confira o clima.', 'No vegetativo, há produtos à base de bicarbonato de potássio ou enxofre. Nunca aplique nos buds.'],
      notThis: 'Se sai com um pano úmido e não volta, pode ser só poeira ou resíduo de água.',
      tech: 'Fungo de superfície favorecido por umidade alta, pouca circulação e variação de temperatura.',
      guides: ['pragas-mofo'], calc: { href: '#clima', label: 'Calculadora de clima' }
    },
    {
      id: 'acaros', illo: 'acaros', where: ['toda'],
      label: 'Muitos pontinhos claros e teias finas',
      cause: 'Ácaro-rajado',
      why: 'Ácaros minúsculos sugam a folha pelo verso. Gostam de calor e ar seco e se multiplicam em poucos dias.',
      steps: ['Olhe o verso das folhas com a lupa: pontinhos que andam e teias confirmam.', 'Lave as folhas com jato de água e remova as mais atacadas.', 'No vegetativo, use óleo de neem ou sabão potássico. Na floração, prefira ácaros predadores.', 'Suba a umidade: ar seco favorece o ácaro.'],
      notThis: 'Manchas marrons maiores, sem teia, são cálcio.',
      tech: 'Tetranychus urticae. Ciclo de cerca de uma semana a 27 °C.',
      guides: ['pragas-mofo'], calc: null
    },
    {
      id: 'gnats', illo: 'gnats', where: ['solo'],
      label: 'Mosquinhas voando sobre a terra',
      cause: 'Mosquinha-do-fungo',
      why: 'As larvas vivem na terra úmida e comem matéria orgânica e raízes finas. São sinal de rega em excesso.',
      steps: ['Deixe a camada de cima da terra secar entre as regas.', 'Coloque armadilhas adesivas amarelas perto do vaso.', 'Contra as larvas, use Bti (Bacillus thuringiensis israelensis) na água de rega.', 'Uma camada de areia sobre a terra impede novos ovos.'],
      notThis: 'Insetos parados no verso das folhas, sugando, são pulgões ou tripes.',
      tech: 'Família Sciaridae. Larvas no primeiro centímetro do substrato úmido.',
      guides: ['pragas-mofo', 'rega'], calc: null
    },
    {
      id: 'botrytis', illo: 'botrytis', where: ['solo'],
      label: 'Mofo cinza dentro dos buds',
      cause: 'Mofo cinza (botrytis)',
      why: 'Um fungo que apodrece o bud por dentro, em buds densos com umidade alta. Às vezes começa como uma folhinha seca no meio do bud.',
      steps: ['Corte a parte afetada com folga, com tesoura limpa, e descarte fora da estufa. Não dá para aproveitar.', 'Baixe a umidade para menos de 50% e aumente a ventilação.', 'Confira os outros buds todos os dias até a colheita.'],
      notThis: 'Pistilos alaranjados e secos são normais no fim da floração.',
      tech: 'Botrytis cinerea: favorecido por umidade acima de 60% e pouca circulação nos buds.',
      guides: ['pragas-mofo'], calc: { href: '#clima', label: 'Calculadora de clima' }
    }
  ],

  /* Equipamentos.
     Quando tiver links de afiliado: troque officialUrl/amazonUrl/mlUrl pelo
     link e marque officialAffiliate/amazonAffiliate/mlAffiliate como true.
     Cupom real vai em coupon: 'CODIGO'. Preço em reais (opcional) vai em
     priceBRL: 'R$ 1.200 – 1.500'. O aviso de afiliado aparece sozinho. */
  hardware: [
    {
      id: 'vivosun-vsfd6500',
      category: 'luz',
      categoryLabel: 'Luz LED + ventilação',
      brand: 'Vivosun',
      model: 'AeroLight Wing / kit de estufa inteligente',
      tentFit: ['120x60', '120x120'],
      why: 'Gasta pouca energia e esquenta pouco.',
      specs: [['Potência', '400 a 450 W reais'], ['Cobertura', 'Estufas de 120×60 e 120×120 cm'], ['Destaque', 'Chips Samsung e ventilador embutido no centro da luz']],
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://vivosun.com/',
      amazonUrl: 'https://www.amazon.com.br/s?k=Vivosun+AeroLight+LED+Grow+Light',
      mlUrl: 'https://lista.mercadolivre.com.br/vivosun-aerolight-led-grow-light'
    },
    {
      id: 'spiderfarmer-se5000',
      category: 'luz',
      categoryLabel: 'Luz LED em barras',
      brand: 'Spider Farmer',
      model: 'SE5000 480 W (6 barras Samsung)',
      tentFit: ['120x120'],
      why: 'Espalha a luz por igual, até nos cantos da estufa.',
      specs: [['Potência', '480 W reais, com dimmer'], ['Cobertura', 'Estufa de 120×120 cm'], ['Destaque', 'Chips Samsung LM301H Evo']],
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://www.spider-farmer.com/',
      amazonUrl: 'https://www.amazon.com.br/s?k=Spider+Farmer+SE5000',
      mlUrl: 'https://lista.mercadolivre.com.br/spider-farmer-se5000'
    },
    {
      id: 'acinfinity-cloudline-t6',
      category: 'ar',
      categoryLabel: 'Exaustor silencioso',
      brand: 'AC Infinity',
      model: 'Cloudline Pro T6 + controlador 69 Pro',
      tentFit: ['90x90', '120x120', '150x150'],
      why: 'Silencioso o bastante para dormir no mesmo quarto.',
      specs: [['Potência', '40 W, até 683 m³/h'], ['Cobertura', 'Estufas de 90×90 a 150×150 cm'], ['Destaque', 'Acelera sozinho quando a estufa esquenta']],
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://acinfinity.com/',
      amazonUrl: 'https://www.amazon.com.br/s?k=AC+Infinity+Cloudline+Pro+T6',
      mlUrl: 'https://lista.mercadolivre.com.br/ac-infinity-cloudline-pro-t6'
    },
    {
      id: 'pulse-pro-monitor',
      category: 'sensores',
      categoryLabel: 'Monitor pelo celular',
      brand: 'Pulse Grow',
      model: 'Pulse One / Pulse Pro (Wi-Fi)',
      tentFit: ['40x40', '60x60', '80x80', '120x60', '90x90', '120x120', '150x150'],
      why: 'Avisa no celular se a luz falhar ou a estufa esquentar.',
      specs: [['Conexão', 'Wi-Fi, com bateria para quedas de energia'], ['Cobertura', 'Qualquer tamanho de estufa'], ['Destaque', 'Mostra o VPD pronto na tela']],
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://pulsegrow.com/',
      amazonUrl: 'https://www.amazon.com.br/s?k=Pulse+One+Grow+Room+Monitor',
      mlUrl: 'https://lista.mercadolivre.com.br/pulse-one-grow-room-monitor'
    },
    {
      id: 'buildasoil-living-soil',
      category: 'substratos',
      categoryLabel: 'Terra orgânica viva',
      brand: 'BuildASoil',
      model: 'Kit terra viva 3.0 + Craft Blend',
      tentFit: ['40x40', '60x60', '80x80', '120x60', '90x90', '120x120', '150x150'],
      why: 'Só regar com água: sem medir pH nem misturar fertilizante.',
      specs: [['Tipo', 'Terra com vida microbiana que alimenta a planta'], ['Uso', 'Vasos grandes de feltro ou canteiros'], ['Destaque', 'Orgânico: difícil queimar a planta por excesso']],
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://buildasoil.com/',
      amazonUrl: 'https://www.amazon.com.br/s?k=BuildASoil+Craft+Blend',
      mlUrl: 'https://lista.mercadolivre.com.br/buildasoil-craft-blend'
    },
    {
      id: 'clickandgrow-sg9',
      category: 'substratos',
      categoryLabel: 'Horta automática',
      brand: 'Click & Grow',
      model: 'Smart Garden 9 Pro',
      tentFit: ['40x40', '60x60'],
      why: 'Rega e ilumina sozinha. Água uma vez a cada 3 semanas.',
      specs: [['Potência', '13 W'], ['Capacidade', '9 mudas (ervas, pimentas, tomates)'], ['Destaque', 'Liga e desliga a luz automaticamente']],
      coupon: null,
      officialAffiliate: false,
      amazonAffiliate: false,
      officialUrl: 'https://www.clickandgrow.com/',
      amazonUrl: 'https://www.amazon.com.br/s?k=Click+and+Grow+Smart+Garden+9',
      mlUrl: 'https://lista.mercadolivre.com.br/click-and-grow-smart-garden-9'
    }
  ],

  guides: [
    {
      id: 'auto-ou-foto',
      cluster: 'cuidados',
      clusterLabel: 'Cuidados',
      readTime: '5 min',
      title: 'Autoflorescente ou fotoperiódica: qual escolher para começar',
      excerpt: 'Uma floresce sozinha, a outra só quando você muda a luz. Veja a diferença em tempo, tamanho, luz e tolerância a erro.',
      summary: 'Autos são mais rápidas e simples na luz, mas não se recuperam bem de erros no começo. Fotoperiódicas levam mais tempo e perdoam mais.',
      calc: { href: '#luz', label: 'Calculadora de luz' },
      hw: 'spiderfarmer-se5000',
      html: `
        <p>A primeira decisão do cultivo não é a luz nem a estufa: é o tipo de planta. A diferença está em <strong>quem decide a hora de florescer</strong>.</p>

        <h3>1. A diferença em uma frase</h3>
        <ul>
          <li><strong>Fotoperiódica:</strong> floresce quando você reduz a luz para 12 horas por dia. Até lá, fica no vegetativo pelo tempo que você quiser.</li>
          <li><strong>Autoflorescente:</strong> floresce sozinha, pela idade, umas 3 a 5 semanas depois de germinar, não importa quantas horas de luz receba.</li>
        </ul>

        <h3>2. Lado a lado</h3>
        <table>
          <thead><tr><th>Aspecto</th><th>Autoflorescente</th><th>Fotoperiódica</th></tr></thead>
          <tbody>
            <tr><td>Tempo total</td><td>8 a 11 semanas da semente à colheita</td><td>3 a 5 meses, conforme o vegetativo</td></tr>
            <tr><td>Luz</td><td>18 a 20 h por dia, a vida toda</td><td>18 h no vegetativo, 12 h na floração</td></tr>
            <tr><td>Tamanho</td><td>Menor e previsível, 50 cm a 1 m</td><td>Você controla pelo tempo de vegetativo</td></tr>
            <tr><td>Tolerância a erro</td><td>Baixa: estresse no começo encolhe a planta para sempre</td><td>Alta: dá para esticar o vegetativo até ela se recuperar</td></tr>
            <tr><td>Treinamento</td><td>Só o leve (LST), sem podas fortes</td><td>Qualquer técnica, inclusive poda apical</td></tr>
            <tr><td>Clones</td><td>Não dá para fazer</td><td>Dá para manter uma planta-mãe</td></tr>
          </tbody>
        </table>

        <h3>3. Qual escolher</h3>
        <p><strong>Escolha autoflorescente se</strong> o espaço é pequeno (até 60×60 ou 120×60 cm), você quer um primeiro resultado rápido e prefere não mexer no timer.</p>
        <p><strong>Escolha fotoperiódica se</strong> quer aprender com calma, ter margem para corrigir erros e controlar o tamanho da planta.</p>

        <h3>4. Cuidados com autos</h3>
        <ul>
          <li><strong>Plante direto no vaso definitivo.</strong> Transplante é um estresse que a auto não tem tempo de superar.</li>
          <li><strong>Pegue leve no adubo</strong> nas primeiras semanas.</li>
          <li><strong>Na calculadora de luz</strong>, use a fase de floração com 18 a 20 h. O aviso de fotoperíodo vale só para fotoperiódicas.</li>
        </ul>

        <h3>Erros comuns</h3>
        <ul>
          <li><strong>Misturar as duas na mesma estufa.</strong> Quando a foto precisar de 12 h, a auto perde luz.</li>
          <li><strong>Podar a auto como se fosse foto.</strong> Ela não tem tempo de se recuperar e rende menos.</li>
        </ul>`
    },
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
          <li><strong>Regar por calendário</strong> (“toda segunda e quinta”). A sede muda com o tamanho da planta, a fase e o clima da estufa.</li>
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
      id: 'pragas-mofo',
      cluster: 'cuidados',
      clusterLabel: 'Cuidados',
      readTime: '6 min',
      title: 'Pragas e mofo: como prevenir e o que fazer quando aparecem',
      excerpt: 'Ácaros, mosquinhas, oídio e mofo cinza. Como reconhecer cada um e por que prevenir dá muito menos trabalho do que tratar.',
      summary: 'Prevenção é clima certo, ar circulando, estufa limpa e uma olhada semanal no verso das folhas. Na floração, nada de spray nos buds.',
      calc: { href: '#clima', label: 'Calculadora de clima' },
      hw: 'pulse-pro-monitor',
      html: `
        <p>Numa estufa fechada, uma praga encontra calor, comida e nenhum predador. Por isso ela se multiplica rápido. A boa notícia: quase todas dependem de um <strong>clima errado</strong> para explodir, e isso você controla.</p>

        <h3>1. Prevenção: os cinco hábitos</h3>
        <ol>
          <li><strong>Clima na faixa certa.</strong> Ar úmido e parado traz fungo; ar quente e seco traz ácaro. Use a <a href="#clima">calculadora de clima</a>.</li>
          <li><strong>Ar sempre circulando</strong>, com um ventilador interno mexendo as folhas e o exaustor renovando o ar.</li>
          <li><strong>Estufa limpa.</strong> Recolha folhas caídas e não deixe água parada no chão nem nos pratos.</li>
          <li><strong>Inspeção semanal</strong> com a lupa, no verso das folhas. É ali que ácaros e tripes se escondem.</li>
          <li><strong>Quarentena.</strong> Planta que vem de fora fica uma semana longe da estufa. Plantas do jardim também trazem pragas.</li>
        </ol>

        <h3>2. As mais comuns</h3>
        <table>
          <thead><tr><th>Praga</th><th>Como reconhecer</th><th>O que fazer</th></tr></thead>
          <tbody>
            <tr><td><strong>Ácaro-rajado</strong></td><td>Pontinhos claros nas folhas, teias finas, bichinhos que andam no verso.</td><td>Lavar as folhas, óleo de neem no vegetativo, ácaros predadores na floração. Subir a umidade.</td></tr>
            <tr><td><strong>Tripes</strong></td><td>Riscos prateados nas folhas e pontinhos pretos (fezes).</td><td>Armadilha adesiva azul, óleo de neem ou sabão potássico no vegetativo.</td></tr>
            <tr><td><strong>Mosquinha-do-fungo</strong></td><td>Mosquinhas pretas voando sobre a terra.</td><td>Deixar a terra secar, armadilha amarela e Bti na rega contra as larvas.</td></tr>
            <tr><td><strong>Pulgões</strong></td><td>Insetos verdes ou pretos agrupados nos brotos, folhas melando.</td><td>Jato de água, sabão potássico, joaninhas.</td></tr>
            <tr><td><strong>Oídio</strong></td><td>Pó branco sobre as folhas, como farinha.</td><td>Remover folhas, ventilar, baixar a umidade. Bicarbonato de potássio só no vegetativo.</td></tr>
            <tr><td><strong>Mofo cinza</strong></td><td>Parte do bud cinza ou marrom, mole por dentro.</td><td>Cortar com folga e descartar. Umidade abaixo de 50% na floração.</td></tr>
          </tbody>
        </table>

        <h3>3. A regra de ouro da floração</h3>
        <p>A partir da segunda ou terceira semana de floração, <strong>não pulverize nada sobre a planta</strong>. Óleos e sprays ficam presos nos buds, deixam gosto e cheiro e podem fazer mal ao ser consumidos. Nessa fase as armas são clima, limpeza e, se preciso, predadores naturais vendidos para controle biológico.</p>

        <h3>4. Na dúvida, compare</h3>
        <p>Use o <a href="#diagnostico">diagnóstico por sintoma</a>: escolha o que você está vendo e veja a causa provável e o que fazer.</p>

        <h3>Erros comuns</h3>
        <ul>
          <li><strong>Tratar uma vez e parar.</strong> Ovos eclodem depois. Repita a aplicação de 3 em 3 ou de 5 em 5 dias, conforme o produto, por duas semanas.</li>
          <li><strong>Misturar vários produtos.</strong> Pode queimar a planta. Um de cada vez.</li>
          <li><strong>Esconder o problema podando.</strong> Tirar as folhas atacadas ajuda, mas sem corrigir o clima a praga volta.</li>
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
      summary: 'Regra de bolso: de 30 a 35 W reais na tomada para cada 30×30 cm de estufa.',
      hw: 'vivosun-vsfd6500',
      html: `
        <p>Ao procurar uma luz de cultivo, é comum achar anúncios de <strong>“LED 1000 W” ou “LED 2000 W” por um preço baixo</strong>. Nas letras miúdas, a lâmpada puxa só 80 W da tomada, e as plantas crescem esticadas, fracas e sem peso.</p>
        <h3>1. Olhe sempre o consumo real na tomada</h3>
        <p>Ignore o número do nome comercial. Procure na descrição a <strong>potência real</strong> (em inglês, <em>power draw</em> ou <em>true watts</em>):</p>
        <ul>
          <li><strong>Estufa de 60×60 cm:</strong> 100 a 150 W reais.</li>
          <li><strong>Estufa de 120×60 cm:</strong> 240 a 300 W reais.</li>
          <li><strong>Estufa de 120×120 cm:</strong> 450 a 500 W reais.</li>
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
        <p>Muita gente gasta com fertilizante achando que a planta está com fome, quando na verdade <strong>o clima da estufa está impedindo a planta de beber água</strong>.</p>
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
      title: 'Como segurar o cheiro e o calor da estufa sem barulho',
      excerpt: 'Como ligar o filtro de carvão do jeito certo e o truque para a estufa ficar silenciosa.',
      summary: 'Truque do silêncio: compre um exaustor um tamanho acima e use a 40–60% da força.',
      hw: 'acinfinity-cloudline-t6',
      html: `
        <p>Quem cultiva em apartamento tem duas preocupações: <strong>não deixar o cheiro escapar</strong> e <strong>não ter um motor zumbindo a noite inteira</strong>.</p>
        <h3>1. Pressão negativa: o segredo do cheiro zero</h3>
        <p>Quando o exaustor puxa o ar de dentro da estufa através do <strong>filtro de carvão ativado</strong> e joga para fora, as paredes da estufa ficam levemente “chupadas” para dentro. É sinal de que o ar só sai depois de passar pelo carvão.</p>
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
        <p>Para a estufa se cuidar sozinha pelo aplicativo, o conjunto <strong>Cloudline Pro + controlador 69 Pro</strong> é referência em acabamento e silêncio.</p>
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
        <p>Antes de ligar a estufa, decida onde as raízes vão morar. São três caminhos, do mais fácil ao mais técnico.</p>
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
      excerpt: 'Por que a estufa retangular, que cabe no canto do quarto, virou a mais vendida do mundo.',
      summary: 'Estufa de 120×60 cm + LED de 240–300 W + exaustor silencioso: colheita boa no espaço de uma cômoda.',
      hw: 'clickandgrow-sg9',
      html: `
        <p>Não é preciso um quarto vazio para cultivar bem. O formato que mais cresce hoje é a <strong>estufa de 120 cm de largura por 60 cm de fundo</strong>.</p>
        <h3>1. Por que 120×60 é mais prática que uma estufa quadrada grande</h3>
        <p>Com <strong>60 cm de fundo</strong>, a mesma profundidade de um guarda-roupa, ela não atrapalha a passagem e todas as plantas ficam ao alcance quando você abre o zíper.</p>
        <h3>2. E na bancada da cozinha?</h3>
        <p>Para temperos, pimentas ou mudas sem estufa, hortas automáticas como a <strong>Click & Grow Smart Garden 9</strong> fazem tudo sozinhas.</p>`
    }
  ]
};
