// "Do grão à colheita em 30 segundos", versão com fotos · 1080×1920 · 30 fps · 900 quadros
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FD, FM } from './fonts';
import { Brand, Ending } from './Lancamento';

const K = { night: '#0a0c07', ink: '#eef0e6', muted: '#b9bcae', line: 'rgba(238,240,230,.22)', accent: '#d4f25a' };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const PHOTOS = [
  { src: 'real/germinacao.jpg', from: 0 },
  { src: 'real/muda.jpg', from: 180 },
  { src: 'real/vegetativo.jpg', from: 300 },
  { src: 'real/floracao.jpg', from: 450 }
];
const MACRO = 600;   // mergulho nos tricomas
const END = 735;     // ficha e chamada
const XF = 24;       // duração da troca entre fotos (quadros)

type Stage = { from: number; to: number; day: number; kicker: string; line: string; extra?: 'timer' | 'trichomes' };
const STAGES: Stage[] = [
  { from: 60, to: 180, day: 1, kicker: 'Germinação', line: 'Só água e calor. Luz forte, ainda não.' },
  { from: 180, to: 300, day: 8, kicker: 'Muda', line: '18 horas de luz por dia e pouca água.' },
  { from: 300, to: 450, day: 22, kicker: 'Vegetativo', line: '24 °C e 60% de umidade. Hora de crescer.' },
  { from: 450, to: 600, day: 50, kicker: 'Floração', line: 'Vire o timer para', extra: 'timer' },
  { from: 600, to: END, day: 113, kicker: 'Colheita', line: 'Colha pelos tricomas, não pela data.', extra: 'trichomes' }
];

const inOut = (f: number, from: number, to: number) =>
  Math.min(interpolate(f, [from, from + 14], [0, 1], { ...clamp, easing: ease }), interpolate(f, [to - 10, to], [1, 0], clamp));

export const LancamentoReal: React.FC = () => {
  const f = useCurrentFrame();

  // câmera: aproximação lenta e contínua, igual para todas as fotos (mantém o vaso no lugar)
  const cam = interpolate(f, [0, MACRO], [1, 1.07], clamp);
  // abertura: grow escuro até a lâmpada acender
  const bright = interpolate(f, [0, 34, 40, 64], [0.1, 0.1, 0.85, 1], clamp);
  const flash = interpolate(f, [34, 37, 50], [0, 0.22, 0], clamp);
  // mergulho: a floração aproxima no topo da planta e dá lugar ao macro
  const dive = interpolate(f, [MACRO - 6, MACRO + 22], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const macroIn = interpolate(f, [MACRO + 4, MACRO + 26], [0, 1], { ...clamp, easing: ease });
  const macroZoom = interpolate(f, [MACRO, END + 40], [1.28, 1.05], { ...clamp, easing: Easing.out(Easing.quad) });
  // fim
  const endT = interpolate(f, [END, END + 24], [0, 1], { ...clamp, easing: ease });

  const day = Math.round(interpolate(f, [60, 180, 300, 450, 600], [1, 8, 22, 50, 113], clamp));
  const railP = interpolate(f, [60, END], [0, 1], clamp);
  const stageIdx = STAGES.findIndex(s => f >= s.from && f < s.to);

  return (
    <AbsoluteFill style={{ background: K.night, fontFamily: FD, color: K.ink }}>
      {/* fotos, trocando como um timelapse */}
      <AbsoluteFill style={{
        filter: `brightness(${bright})`,
        transform: `scale(${cam * (1 + dive * 0.9)})`,
        transformOrigin: dive > 0 ? '50% 14%' : '50% 72%',
        opacity: 1 - interpolate(f, [MACRO + 8, MACRO + 26], [0, 1], clamp)
      }}>
        {PHOTOS.map((p, i) => {
          const op = i === 0 ? 1 : interpolate(f, [p.from - XF / 2, p.from + XF / 2], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
          if (op <= 0) return null;
          // a foto que entra começa um pouco maior e assenta: sensação de crescimento
          const settle = i === 0 ? 1 : interpolate(f, [p.from - XF / 2, p.from + XF], [1.025, 1], { ...clamp, easing: ease });
          return <Img key={p.src} src={staticFile(p.src)} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', opacity: op, transform: `scale(${settle})`, transformOrigin: '50% 80%' }} />;
        })}
      </AbsoluteFill>

      {/* macro dos tricomas */}
      {f >= MACRO - 2 && (
        <AbsoluteFill style={{ opacity: macroIn * (1 - endT * 0.78), filter: `blur(${endT * 14}px)` }}>
          <Img src={staticFile('real/tricomas.jpg')} style={{ position: 'absolute', left: -420, top: 0, width: 1920, height: 1920, transform: `scale(${macroZoom})`, transformOrigin: '50% 45%' }} />
          {/* aro da lupa */}
          <div style={{ position: 'absolute', left: 90, top: 330, width: 900, height: 900, borderRadius: '50%', border: '4px solid rgba(238,240,230,.55)',
            boxShadow: '0 0 0 2000px rgba(10,12,7,.42)', opacity: interpolate(f, [MACRO + 24, MACRO + 40], [0, 1], clamp) * (1 - endT),
            transform: `scale(${interpolate(f, [MACRO + 24, MACRO + 44], [1.15, 1], { ...clamp, easing: ease })})` }} />
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      {/* sombras para ler o texto: topo e base */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,12,7,.7) 0px, rgba(10,12,7,0) 280px, rgba(10,12,7,0) 1420px, rgba(10,12,7,.9) 1700px)' }} />

      {/* topo */}
      <div style={{ position: 'absolute', left: 72, right: 72, top: 96, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Brand size={44} />
        <div style={{ fontFamily: FM, fontSize: 30, color: K.muted, opacity: interpolate(f, [56, 70], [0, 1], clamp) * (1 - endT) }}>
          DIA <span style={{ color: K.ink }}>{String(day).padStart(3, '0')}</span>
        </div>
      </div>

      {/* abertura */}
      {f < 66 && (
        <div style={{ position: 'absolute', left: 72, right: 72, top: 560, opacity: inOut(f, 6, 66) }}>
          <div style={{ fontWeight: 800, fontSize: 124, lineHeight: 0.95, letterSpacing: '-0.035em' }}>Do grão à colheita</div>
          <div style={{ fontWeight: 300, fontSize: 92, lineHeight: 1.05, letterSpacing: '-0.03em', marginTop: 10 }}>em 30 segundos.</div>
        </div>
      )}

      {/* textos das fases */}
      {STAGES.map(s => {
        if (f < s.from - 2 || f >= s.to) return null;
        const o = inOut(f, s.from + 6, s.to);
        const y = (1 - interpolate(f, [s.from + 6, s.from + 22], [0, 1], { ...clamp, easing: ease })) * 30;
        return (
          <div key={s.kicker} style={{ position: 'absolute', left: 72, right: 72, top: s.extra === 'timer' ? 1390 : 1500, opacity: o, transform: `translateY(${y}px)` }}>
            <div style={{ fontFamily: FM, fontSize: 34, color: K.accent, letterSpacing: '0.02em', textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>
              Dia {s.day} · {s.kicker}
            </div>
            <div style={{ fontWeight: 700, fontSize: 74, lineHeight: 1.05, letterSpacing: '-0.025em', marginTop: 16, maxWidth: 940, textShadow: '0 2px 24px rgba(0,0,0,.55)' }}>
              {s.line}
            </div>
            {s.extra === 'timer' && (
              <div style={{ fontWeight: 800, fontSize: 200, lineHeight: 0.9, letterSpacing: '-0.04em', color: K.accent, marginTop: 4, textShadow: '0 4px 40px rgba(0,0,0,.5)',
                transform: `scale(${interpolate(f, [s.from + 24, s.from + 36], [0.8, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })})`, transformOrigin: 'left center',
                opacity: interpolate(f, [s.from + 24, s.from + 32], [0, 1], clamp) }}>
                12/12
              </div>
            )}
            {s.extra === 'trichomes' && (
              <div style={{ display: 'flex', gap: 14, marginTop: 26, fontFamily: FM, fontSize: 26, opacity: interpolate(f, [s.from + 40, s.from + 52], [0, 1], clamp) }}>
                <span style={{ padding: '10px 18px', borderRadius: 999, background: 'rgba(238,240,230,.14)' }}>leitosos · no ponto</span>
                <span style={{ padding: '10px 18px', borderRadius: 999, background: 'rgba(224,150,60,.3)', color: '#ffd9a8' }}>âmbar · passando</span>
              </div>
            )}
          </div>
        );
      })}

      {/* trilho das fases */}
      <div style={{ position: 'absolute', left: 72, right: 72, bottom: 84, display: 'flex', gap: 10, opacity: interpolate(f, [56, 70], [0, 1], clamp) * (1 - endT) }}>
        {STAGES.map((s, i) => {
          const p = Math.min(1, Math.max(0, railP * STAGES.length - i));
          return (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: K.line, overflow: 'hidden' }}>
              <div style={{ width: `${p * 100}%`, height: '100%', background: i === stageIdx ? K.accent : K.ink }} />
            </div>
          );
        })}
      </div>

      {f >= END && <Ending f={f - END} />}
    </AbsoluteFill>
  );
};
