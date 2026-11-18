// Fontes do site, servidas de public/fonts (o render não depende de internet)
import { continueRender, delayRender, staticFile } from 'remotion';

export const FD = '"Bricolage Grotesque", system-ui, sans-serif';
export const FM = '"Martian Mono", ui-monospace, monospace';

const handle = delayRender('Carregando fontes');
Promise.all([
  new FontFace('Bricolage Grotesque', `url(${staticFile('fonts/bricolage.woff2')}) format("woff2")`, { weight: '200 800' }),
  new FontFace('Martian Mono', `url(${staticFile('fonts/martian.woff2')}) format("woff2")`, { weight: '500' })
].map(ff => ff.load().then(f => { document.fonts.add(f); })))
  .then(() => continueRender(handle))
  .catch(err => { console.error(err); continueRender(handle); });
