# Vídeos do Growmetria

Projeto em [Remotion](https://www.remotion.dev/). A planta é a mesma do ciclo do site (`src/plant.tsx` é o desenho do `app.js` portado).

| Composição | Arquivo | O que é |
|---|---|---|
| `Lancamento` | `src/Lancamento.tsx` | "Do grão à colheita em 30 segundos", ilustrado (o mesmo desenho do site) |
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
