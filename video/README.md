# Vídeos do Growmetria

Projeto em [Remotion](https://www.remotion.dev/). A planta é a mesma do ciclo do site (`src/plant.tsx` é o desenho do `app.js` portado).

| Composição | Arquivo | O que é |
|---|---|---|
| `Lancamento` | `src/Lancamento.tsx` | "Do grão à colheita em 30 segundos", 1080×1920, 30 fps |

## Rodar

```bash
npm install
npm run studio   # editor no navegador, para ajustar tempos e textos
npm run render   # gera out/lancamento.mp4
```

As fontes ficam em `public/fonts`, então o render não depende de internet.
O `remotion.config.ts` aponta para o Chromium desta máquina; em outro computador, apague a linha `setBrowserExecutable`.
