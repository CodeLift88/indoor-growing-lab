# Vídeos do Growmetria

Projeto em [Remotion](https://www.remotion.dev/). A planta é a mesma do ciclo do site (`src/plant.tsx` é o desenho do `app.js` portado).

| Composição | Arquivo | O que é |
|---|---|---|
| `Lancamento` | `src/Lancamento.tsx` | "Do grão à colheita em 30 segundos", ilustrado (o mesmo desenho do site) |
| `LancamentoMotion` | `src/LancamentoMotion.tsx` | Versão motion: cena ilustrada (`src/scene.tsx`) + tipografia animada da HyperFrames por cima, tudo na área segura das redes |
| `LancamentoReal` | `src/LancamentoReal.tsx` | O mesmo roteiro com fotos realistas (`public/real/`), trocando como timelapse e mergulhando nos tricomas |

## Rodar

```bash
npm install
npm run studio   # editor no navegador, para ajustar tempos e textos
npm run render   # gera out/lancamento.mp4
npx remotion render src/index.ts LancamentoReal out/lancamento-real.mp4
```

As fontes ficam em `public/fonts`, então o render não depende de internet.
O `remotion.config.ts` aponta para o Chromium desta máquina; em outro computador, apague a linha `setBrowserExecutable`.

## Série "Sem chute" (HyperFrames)

Cada episódio é uma página HTML com animação em GSAP, em `hyperframes/epNN/`. Fontes e GSAP ficam dentro da pasta do episódio.

```bash
cd hyperframes && npm install
npx hyperframes telemetry disable
npx hyperframes snapshot ep01 --at 1,5,10,15   # fotos para conferir
npx hyperframes render ep01 -o sem-chute-01.mp4 --quality delivery
```

| Episódio | Tema |
|---|---|
| `ep01` | O LED de 1000 W que puxa 100 W da tomada |

## Versão motion: Remotion + HyperFrames

1. A tipografia é uma composição da HyperFrames com fundo transparente: `hyperframes/tipografia/index.html`.
   Os textos ficam nas variáveis do topo do arquivo (`hook`, `stages`, `cta1`, `cta2`, `pill`).
   `{18}` vira um número que conta; `*texto*` vira destaque em verde.
2. Gere a camada:
   ```bash
   cd hyperframes && npx hyperframes render tipografia -o ../public/camadas/tipografia.webm --format webm --quality delivery
   ```
   Para trocar textos sem editar o arquivo: `--variables '{"cta1":"Monte o seu grow."}'`.
3. Monte o vídeo final (os números da ficha são parâmetros da composição):
   ```bash
   npx remotion render src/index.ts LancamentoMotion out/lancamento-motion.mp4
   npx remotion render src/index.ts LancamentoMotion out/ficha-120.mp4 --props='{"grow":"120×120","plantas":"4 a 6 plantas","watts":500,"luz":"12/12","conta":185}'
   ```

Área segura das redes (Reels, TikTok, Shorts): nada importante fora de x 72–940 e y 260–1420.

## Som

- Efeitos em `public/sfx/` (originais) e `public/sfx/norm/` (cortados e com volume igualado). Cada efeito tem o instante em que "bate" dentro do arquivo (`golpe`) e o quadro em que deve bater no vídeo (`em`), em `src/LancamentoMotion.tsx`.
- A trilha fica em `public/musica/` e **não vai para o repositório** (ele é público). O trecho usado (`trecho.wav`) foi cortado para a virada cair em 16 s, desacelerado de 93,9 para 90 BPM e ganhou um filtro de 24 a 27,3 s (luz apagada).

| Composição | Arquivo final | Para onde |
|---|---|---|
| `LancamentoMotion` | `growmetria-lancamento-instagram-tiktok.mp4` | Instagram e TikTok: só efeitos, a música entra pelo app |
| `LancamentoMotionMusica` | `growmetria-lancamento-youtube.mp4` | YouTube Shorts e site: com a trilha, normalizado para −15 LUFS |
