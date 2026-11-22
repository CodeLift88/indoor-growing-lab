// Cena do ciclo (lâmpada, planta, vaso, lupa, secagem, pote), dirigida pelo quadro do vídeo.
import React from 'react';
import { Easing, interpolate, interpolateColors } from 'remotion';
import { Plant, HangingBranch } from './plant';

const K = { ink: '#eef0e6' };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type Stage = { from: number; to: number; glow: string; day: number; kicker: string; line: string; cone: number };
export const STAGES: Stage[] = [
  { from: 60, to: 180, glow: '#6b5a3c', day: 1, kicker: 'Germinação', line: 'Só água e calor. Luz forte, ainda não.', cone: 0.25 },
  { from: 180, to: 300, glow: '#bcd3f5', day: 8, kicker: 'Muda', line: '18 horas de luz por dia e pouca água.', cone: 1 },
  { from: 300, to: 450, glow: '#e6f0ff', day: 22, kicker: 'Vegetativo', line: '24 °C e 60% de umidade. Hora de crescer.', cone: 1 },
  { from: 450, to: 600, glow: '#ffb45e', day: 50, kicker: 'Floração', line: 'Vire o timer para', cone: 1 },
  { from: 600, to: 720, glow: '#ff8f4d', day: 113, kicker: 'Colheita', line: 'Colha pelos tricomas, não pela data.', cone: 1 },
  { from: 720, to: 810, glow: '#3a2e22', day: 114, kicker: 'Secagem e cura', line: 'Pendure no escuro de 7 a 14 dias.', cone: 0 }
];

// cor e estado da luz num quadro
export function lightAt(f: number) {
  let glow = STAGES[0].glow;
  STAGES.forEach((s, i) => { if (f >= s.from) glow = interpolateColors(f, [s.from, s.from + 20], [i ? STAGES[i - 1].glow : s.glow, s.glow]); });
  const lampOn = interpolate(f, [34, 38], [0, 1], clamp);
  return { glow, lampOn };
}

export const CycleScene: React.FC<{ f: number; width: number; height: number }> = ({ f, width, height }) => {
  // planta
  const g = interpolate(f, [60, 180, 300, 450, 600], [0.004, 0.1, 0.32, 0.68, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const b = interpolate(f, [470, 600], [0, 1], { ...clamp, easing: ease });
  const bud = interpolateColors(f, [590, 640], ['#7f9c55', '#a39a5a']);
  const pistil = interpolateColors(f, [590, 640], ['#f3f4ee', '#d9772b']);
  const plantOp = interpolate(f, [720, 752], [1, 0], clamp);

  // luz
  let glow = STAGES[0].glow;
  STAGES.forEach((s, i) => {
    if (f >= s.from) glow = interpolateColors(f, [s.from, s.from + 20], [i ? STAGES[i - 1].glow : s.glow, s.glow]);
  });
  const lampOn = interpolate(f, [34, 38], [0, 1], clamp);
  let coneV = STAGES[0].cone;
  STAGES.forEach((s, i) => {
    if (f >= s.from) coneV = interpolate(f, [s.from, s.from + 20], [i ? STAGES[i - 1].cone : s.cone, s.cone], clamp);
  });
  const cone = lampOn * coneV;
  const flash = interpolate(f, [34, 37, 48], [0, 0.18, 0], clamp);
  const lampOp = interpolate(f, [720, 760], [1, 0.2], clamp);

  // extras de cena
  const loupe = interpolate(f, [612, 630, 708, 720], [0, 1, 1, 0], clamp);
  const hang = interpolate(f, [728, 760], [0, 1], { ...clamp, easing: ease });
  const jar = interpolate(f, [760, 784], [0, 1], clamp);
  const potOp = interpolate(f, [720, 752], [1, 0.35], clamp);

  return (
        <svg viewBox="0 0 400 520" width={width} height={height}>
          <defs>
            <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={glow} stopOpacity={0.55} />
              <stop offset="1" stopColor={glow} stopOpacity={0} />
            </linearGradient>
            <radialGradient id="halo" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor={glow} stopOpacity={0.9} />
              <stop offset="1" stopColor={glow} stopOpacity={0} />
            </radialGradient>
            <clipPath id="loupe-clip"><circle cx="318" cy="158" r="54" /></clipPath>
          </defs>
          <g opacity={lampOp}>
            <line x1="140" y1="0" x2="140" y2="30" stroke="#3c4233" />
            <line x1="260" y1="0" x2="260" y2="30" stroke="#3c4233" />
            <ellipse cx="200" cy="40" rx="150" ry="34" fill="url(#halo)" opacity={cone} />
            <polygon points="112,42 288,42 372,500 28,500" fill="url(#cone)" opacity={cone} />
            <rect x="104" y="30" width="192" height="12" rx="2" fill="#23271d" stroke="#3c4233" />
            {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={116 + i * 15.3} cy={42} r={1.6} fill={glow} opacity={0.25 + lampOn * 0.75} />)}
          </g>
          <Plant g={g} b={b} bud={bud} pistil={pistil} opacity={plantOp} />
          <g opacity={potOp}>
            <path d="M114 436 Q200 428 286 436 L276 500 Q200 508 124 500 Z" fill="#1d2117" stroke="#4a5040" strokeWidth={1.2} />
            <path d="M118 438 Q200 430 282 438" fill="none" stroke="#4a5040" strokeWidth={1.2} />
            <path d="M120 452 Q200 446 280 452" fill="none" stroke="#33382b" strokeDasharray="3 4" />
          </g>
          {/* lupa nos tricomas */}
          <g opacity={loupe} transform={`translate(0 ${(1 - loupe) * 10})`}>
            <circle cx="318" cy="158" r="54" fill="#10130c" />
            <g clipPath="url(#loupe-clip)">
              {Array.from({ length: 11 }, (_, i) => {
                const x = 276 + i * 8 + (i % 3) * 2, h = 26 + ((i * 37) % 22), y0 = 214, dx = i % 2 ? 2 : -2;
                const fill = (i === 3 || i === 8 || i === 5) ? '#d08a2e' : i === 6 ? 'rgba(230,236,240,.25)' : '#ece6d6';
                return <g key={i}><line x1={x} y1={y0} x2={x + dx} y2={y0 - h} stroke="#d9d3c0" strokeWidth={2.4} strokeLinecap="round" /><circle cx={x + dx} cy={y0 - h - 4} r={5} fill={fill} stroke="#d9d3c0" strokeWidth={0.8} /></g>;
              })}
            </g>
            <circle cx="318" cy="158" r="54" fill="none" stroke={K.ink} strokeWidth={2} />
            <line x1="279" y1="197" x2="252" y2="226" stroke={K.ink} strokeWidth={2} />
          </g>
          {/* secagem */}
          <g opacity={hang} transform={`translate(0 ${(1 - hang) * -16})`}>
            <path d="M92 0 V74 M308 0 V74 M86 74 H314" fill="none" stroke="#8f9383" strokeWidth={1.4} opacity={0.75} />
            <HangingBranch transform="translate(165 74)" sway={Math.sin(f / 18) * 1.5} />
            <HangingBranch transform="translate(238 74) rotate(3) scale(.86)" sway={Math.sin(f / 18 + 2) * 1.5} />
          </g>
          <g opacity={jar}>
            <rect x="286" y="372" width="68" height="14" rx="3" fill="#3a3f31" />
            <path d="M290 386 h60 a8 8 0 0 1 8 8 v96 a10 10 0 0 1 -10 10 h-56 a10 10 0 0 1 -10 -10 v-96 a8 8 0 0 1 8 -8Z" fill="rgba(220,230,210,.05)" stroke="#8f9383" strokeWidth={1.4} />
            {[[306, 476, 11], [330, 482, 12], [318, 456, 10], [342, 458, 9], [304, 438, 8], [328, 432, 9]].map(([cx, cy, r]) => (
              <ellipse key={cx + '-' + cy} cx={cx} cy={cy} rx={r} ry={r * 0.82} fill="#8a8f4f" stroke="#cfdcae" strokeWidth={0.8} />
            ))}
          </g>
        </svg>
  );
};
