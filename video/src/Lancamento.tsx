// "Do grão à colheita em 30 segundos" · 1080×1920 · 30 fps · 900 quadros
import React from 'react';
import { AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { CycleScene, lightAt, STAGES } from './scene';
import { FD, FM } from './fonts';

const K = { night: '#0f110b', ink: '#eef0e6', muted: '#9fa492', line: '#2e3326', accent: '#d4f25a', card: '#16190f' };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const END = 810;

const FLASK = {
  liquid: 'M29.8 73.2H70.2L72.6 77.2C74 79.6 74.6 81.6 74.6 84C74.6 88.4 71 91.8 66.4 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2Z',
  glass: 'M40.8 47C40.8 44.5 37.4 44 37.4 40.5C37.4 38.5 38.8 37.3 41 37.3H59.4C61.6 37.3 63 38.5 63 40.5C63 44 59.6 44.5 59.6 47V54.6L73 77.2C74.4 79.6 75 81.6 75 84C75 88.4 71.4 91.8 66.8 91.8H33.6C29 91.8 25.4 88.4 25.4 84C25.4 81.6 26 79.6 27.4 77.2L40.8 54.6Z',
  sprout: 'M50.2 26.8C49.6 21 47 15 42 11.5C37.5 8.6 31 8.6 27.2 9.4C26 9.7 25.8 10.8 26 12.2C26.6 18 30 24 36 26.8C39.5 28.3 43 27.6 45.5 28.6C47.2 29.4 47.8 31 47.8 33V73.2H52.6V33.4C52.6 31.4 53.8 29.9 56.5 29.7C60 29.4 64.5 29.4 68.4 26.4C71.6 24 73.4 19 73.6 14.6C73.7 13.4 73 12.7 72 12.6C67.5 12 61 12.4 56.5 15.4C52.6 18 50.6 22.4 50.2 26.8Z'
};
const Flask: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="5 6 90 90">
    <path d={FLASK.liquid} fill={K.accent} />
    <path d={FLASK.glass} fill="none" stroke={K.ink} strokeWidth={5.6} strokeLinejoin="round" />
    <path d={FLASK.sprout} fill={K.ink} />
  </svg>
);
export const Brand: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.3, color: K.ink, fontFamily: FD, fontSize: size, letterSpacing: '-0.02em' }}>
    <Flask size={size * 1.2} />
    <span><b style={{ fontWeight: 700 }}>Grow</b><span style={{ fontWeight: 300 }}>metria</span></span>
  </div>
);

// entra e sai com deslize curto
const inOut = (f: number, from: number, to: number) => {
  const a = interpolate(f, [from, from + 14], [0, 1], { ...clamp, easing: ease });
  const b = interpolate(f, [to - 10, to], [1, 0], clamp);
  return Math.min(a, b);
};

export const Lancamento: React.FC = () => {
  const f = useCurrentFrame();
  const stageIdx = STAGES.findIndex(s => f >= s.from && f < s.to);

  const { glow, lampOn } = lightAt(f);
  const flash = interpolate(f, [34, 37, 48], [0, 0.18, 0], clamp);
  // fim: a cena recua e entra a ficha
  const endT = interpolate(f, [END, END + 24], [0, 1], { ...clamp, easing: ease });
  const sceneOp = 1 - endT * 0.82;

  const day = Math.round(interpolate(f, [60, 180, 300, 450, 600, 720], [1, 8, 22, 50, 113, 114], clamp));
  const railP = interpolate(f, [60, END], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: K.night, fontFamily: FD, color: K.ink }}>
      {/* brilho ambiente da fase */}
      <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 50% 34%, ${glow}, transparent 70%)`, opacity: 0.14 * lampOn * (1 - endT) }} />

      {/* cena */}
      <div style={{ position: 'absolute', left: 90, top: 250, width: 900, height: 1170, opacity: sceneOp, transform: `scale(${1 - endT * 0.08})` }}>
        <CycleScene f={f} width={900} height={1170} />
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />

      {/* topo: marca e contador de dias */}
      <div style={{ position: 'absolute', left: 72, right: 72, top: 84, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Brand size={44} />
        <div style={{ fontFamily: FM, fontSize: 30, color: K.muted, opacity: interpolate(f, [56, 70], [0, 1], clamp) * (1 - endT) }}>
          DIA <span style={{ color: K.ink }}>{String(day).padStart(3, '0')}</span>
        </div>
      </div>

      {/* abertura */}
      {f < 66 && (
        <div style={{ position: 'absolute', left: 72, right: 72, top: 1300, opacity: inOut(f, 6, 66) }}>
          <div style={{ fontWeight: 800, fontSize: 128, lineHeight: 0.95, letterSpacing: '-0.035em' }}>Do grão à colheita</div>
          <div style={{ fontWeight: 300, fontSize: 96, lineHeight: 1.05, letterSpacing: '-0.03em', marginTop: 12 }}>em 30 segundos.</div>
        </div>
      )}

      {/* texto de cada fase */}
      {STAGES.map((s, i) => {
        if (f < s.from - 2 || f >= s.to) return null;
        const o = inOut(f, s.from, s.to);
        const y = (1 - interpolate(f, [s.from, s.from + 16], [0, 1], { ...clamp, easing: ease })) * 30;
        const isFlor = i === 3;
        return (
          <div key={s.kicker} style={{ position: 'absolute', left: 72, right: 72, top: 1440, opacity: o, transform: `translateY(${y}px)` }}>
            <div style={{ fontFamily: FM, fontSize: 34, color: K.accent, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Dia {s.day} · {s.kicker}
            </div>
            <div style={{ fontWeight: 700, fontSize: 76, lineHeight: 1.05, letterSpacing: '-0.025em', marginTop: 18, maxWidth: 930 }}>
              {s.line}
            </div>
            {isFlor && (
              <div style={{ fontWeight: 800, fontSize: 200, lineHeight: 0.9, letterSpacing: '-0.04em', color: K.accent, marginTop: 6,
                transform: `scale(${interpolate(f, [s.from + 18, s.from + 30], [0.8, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })})`, transformOrigin: 'left center',
                opacity: interpolate(f, [s.from + 18, s.from + 26], [0, 1], clamp) }}>
                12/12
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

      {/* fim: ficha do grow + chamada */}
      {f >= END && <Ending f={f - END} />}
    </AbsoluteFill>
  );
};

const ROWS: { k: string; v: number; pre?: string; mid?: string; u: string }[] = [
  { k: 'Grow', v: 80, mid: '×80', u: 'cm · 2 a 3 plantas' },
  { k: 'LED', v: 250, u: 'W reais' },
  { k: 'Luz', v: 12, mid: '/12', u: 'horas na floração' },
  { k: 'Conta', v: 111, pre: 'R$ ', u: 'por mês' }
];

export const Ending: React.FC<{ f: number }> = ({ f }) => {
  const card = interpolate(f, [8, 30], [0, 1], { ...clamp, easing: ease });
  const count = interpolate(f, [20, 50], [0, 1], { ...clamp, easing: ease });
  const cta = interpolate(f, [44, 60], [0, 1], { ...clamp, easing: ease });
  return (
    <>
      <div style={{ position: 'absolute', left: 72, right: 72, top: 360, opacity: card, transform: `translateY(${(1 - card) * 60}px)` }}>
        <div style={{ background: K.card, border: `2px solid ${K.line}`, borderRadius: 40, padding: '44px 48px 30px', boxShadow: '0 60px 120px -40px rgba(0,0,0,.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FM, fontSize: 28, marginBottom: 18 }}>
            <span style={{ color: K.accent }}>● Ficha do seu grow</span>
            <span style={{ color: K.muted }}>estimativa</span>
          </div>
          {ROWS.map((r, i) => {
            const v = Math.round(r.v * interpolate(count, [i * 0.12, i * 0.12 + 0.6], [0, 1], clamp));
            return (
              <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'baseline', padding: '26px 0', borderTop: `2px solid ${K.line}` }}>
                <span style={{ fontFamily: FM, fontSize: 26, color: K.muted, textTransform: 'uppercase' }}>{r.k}</span>
                <span>
                  <span style={{ fontWeight: 700, fontSize: 92, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{r.pre || ''}{v}{r.mid || ''}</span>
                  <span style={{ fontFamily: FM, fontSize: 26, color: K.muted, marginLeft: 18 }}>{r.u}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 72, right: 72, top: 1290, opacity: cta, transform: `translateY(${(1 - cta) * 30}px)` }}>
        <div style={{ fontWeight: 800, fontSize: 104, lineHeight: 0.98, letterSpacing: '-0.035em' }}>Calcule o seu grow.</div>
        <div style={{ fontWeight: 300, fontSize: 84, lineHeight: 1.05, letterSpacing: '-0.03em', marginTop: 8 }}>É grátis, <span style={{ color: K.accent, fontWeight: 700 }}>sem chute.</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 70, paddingTop: 36, borderTop: `2px solid ${K.ink}` }}>
          <Brand size={52} />
          <span style={{ fontFamily: FM, fontSize: 30, color: K.night, background: K.accent, padding: '14px 26px', borderRadius: 999 }}>link na bio</span>
        </div>
      </div>
    </>
  );
};
