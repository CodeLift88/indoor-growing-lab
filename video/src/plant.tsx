// Planta do ciclo, portada do app.js do site (mesmo desenho, mesmas proporções).
import React from 'react';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// caule: M200 438 C205 360 194 250 200 112, amostrado por comprimento
const P0 = [200, 438], P1 = [205, 360], P2 = [194, 250], P3 = [200, 112];
const bez = (t: number) => {
  const u = 1 - t;
  return [0, 1].map(i => u * u * u * P0[i] + 3 * u * u * t * P1[i] + 3 * u * t * t * P2[i] + t * t * t * P3[i]);
};
const SAMPLES = (() => {
  const pts: { len: number; p: number[] }[] = [];
  let len = 0, prev = bez(0);
  for (let i = 0; i <= 200; i++) {
    const p = bez(i / 200);
    len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    pts.push({ len, p }); prev = p;
  }
  return pts;
})();
export const STEM_LEN = SAMPLES[SAMPLES.length - 1].len;
const pointAt = (f: number) => {
  const target = clamp(f) * STEM_LEN;
  const s = SAMPLES.find(x => x.len >= target) || SAMPLES[SAMPLES.length - 1];
  return { x: s.p[0], y: s.p[1] };
};

function leafletPath(len: number, wid: number, teeth = 16) {
  const left: number[][] = [], right: number[][] = [];
  for (let i = 0; i <= teeth; i++) {
    const u = i / teeth;
    const w = wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.9) * (i % 2 ? 0.78 : 1);
    left.push([-w, -len * u]); right.push([w, -len * u]);
  }
  return 'M' + left.concat(right.reverse()).map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
}

export const C = {
  leafFill: '#263219', line: '#cfdcae', coty: '#2f3d1f', seed: '#6d5a3c', root: '#b9ab8a'
};

export const FanLeaf: React.FC<{ count: number; transform: string }> = ({ count, transform }) => {
  const P = 18, L = 58;
  const spread = count >= 7 ? 82 : count === 5 ? 64 : count === 3 ? 42 : 0;
  return (
    <g transform={transform}>
      <line x1={0} y1={0} x2={0} y2={-P} stroke={C.line} strokeWidth={0.8} opacity={0.7} />
      {Array.from({ length: count }, (_, k) => {
        const rel = count === 1 ? 0 : (k / (count - 1)) * 2 - 1;
        const len = L * (1 - 0.48 * Math.pow(Math.abs(rel), 1.5));
        return (
          <g key={k} transform={`translate(0 ${-P}) rotate(${(rel * spread).toFixed(1)})`}>
            <path d={leafletPath(len, len * 0.13)} fill={C.leafFill} stroke={C.line} strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <line x1={0} y1={0} x2={0} y2={-len * 0.92} stroke={C.line} strokeWidth={0.8} opacity={0.7} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </g>
  );
};

export const BudCluster: React.FC<{ big?: boolean; transform: string; bud: string; pistil: string }> = ({ big, transform, bud, pistil }) => {
  const n = big ? 6 : 3, step = big ? 9 : 7;
  return (
    <g transform={transform}>
      {Array.from({ length: n }, (_, i) => {
        const rx = (big ? 11 : 8) * (1 - i / (n * 1.6));
        return <ellipse key={i} cx={i % 2 ? 2 : -2} cy={-i * step} rx={rx} ry={rx * 0.8} fill={bud} stroke={C.line} strokeWidth={0.9} vectorEffect="non-scaling-stroke" />;
      })}
      {Array.from({ length: n * 2 }, (_, i) => {
        const y = -(i / 2) * step - 2, side = i % 2 ? 1 : -1;
        return <path key={'p' + i} d={`M${side * 3} ${y} q${side * 6} -2 ${side * 9} -7`} fill="none" stroke={pistil} strokeWidth={1.1} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
      })}
    </g>
  );
};

const NODES = [
  { f: 0.12, n: 1, s: 0.5 }, { f: 0.24, n: 3, s: 0.72 }, { f: 0.37, n: 5, s: 0.95 },
  { f: 0.5, n: 7, s: 1.05 }, { f: 0.62, n: 7, s: 1.0 }, { f: 0.73, n: 5, s: 0.86 }, { f: 0.83, n: 5, s: 0.7 }
];

// g: crescimento 0..1 · b: botões 0..1
export const Plant: React.FC<{ g: number; b: number; bud: string; pistil: string; opacity: number }> = ({ g, b, bud, pistil, opacity }) => {
  const rootLen = 60;
  const base = pointAt(0.035);
  const cs = easeOut(clamp((g - 0.02) / 0.05)) * (1 - clamp((g - 0.4) / 0.2) * 0.5);
  const tip = pointAt(g);
  const as = easeOut(clamp((g - 0.06) / 0.08)) * (1 - easeOut(b) * 0.5);
  return (
    <g opacity={opacity}>
      {/* semente e raiz */}
      <g opacity={1 - clamp((g - 0.06) / 0.05)} transform="translate(200 444) scale(1.35) translate(-200 -444)">
        <path d="M200 446 q-3 14 2 26 q3 10 -2 20 M201 458 q7 6 9 14 M199 466 q-8 5 -10 12" fill="none" stroke={C.root} strokeWidth={1.2} strokeLinecap="round"
          strokeDasharray={rootLen} strokeDashoffset={rootLen * (1 - clamp(g / 0.06))} />
        <ellipse cx={200} cy={444} rx={6} ry={4.2} fill={C.seed} stroke={C.line} strokeWidth={1} transform="rotate(-20 200 444)" />
      </g>
      <path d="M200 438 C205 360 194 250 200 112" fill="none" stroke={C.line} strokeLinecap="round"
        strokeWidth={1.6 + 4.2 * g} strokeDasharray={STEM_LEN} strokeDashoffset={STEM_LEN * (1 - clamp(g))} />
      {[-1, 1].map(side => (
        <g key={side} transform={`translate(${base.x} ${base.y - 4}) rotate(${side * -18}) scale(${cs.toFixed(3)})`}>
          <ellipse cx={side * 10} cy={0} rx={10} ry={4.5} fill={C.coty} stroke={C.line} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
      {NODES.map((nd, i) => {
        const pt = pointAt(nd.f);
        const grow = easeOut(clamp((g - nd.f - 0.01) / 0.13));
        const tilt = 62 - i * 4;
        return (
          <g key={i}>
            {[-1, 1].map(side => (
              <FanLeaf key={side} count={nd.n} transform={`translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${side * tilt}) scale(${(nd.s * grow).toFixed(3)})`} />
            ))}
            {i >= 3 && [-1, 1].map(side => {
              const s = easeOut(clamp(b * 1.15 - (i - 3) * 0.05)) * (0.6 + i * 0.08);
              return <BudCluster key={'b' + side} bud={bud} pistil={pistil}
                transform={`translate(${(pt.x + side * 16).toFixed(1)} ${(pt.y - 8).toFixed(1)}) rotate(${side * 24}) scale(${s.toFixed(3)})`} />;
            })}
          </g>
        );
      })}
      <FanLeaf count={3} transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(-28) scale(${(0.42 * as).toFixed(3)})`} />
      <FanLeaf count={3} transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(28) scale(${(0.42 * as).toFixed(3)})`} />
      <BudCluster big bud={bud} pistil={pistil} transform={`translate(${tip.x.toFixed(1)} ${(tip.y + 14).toFixed(1)}) scale(${(easeOut(b) * 1.15).toFixed(3)})`} />
    </g>
  );
};

// galho pendurado de cabeça para baixo (secagem)
export const HangingBranch: React.FC<{ transform: string; sway: number }> = ({ transform, sway }) => (
  <g transform={transform}>
    <g transform={`rotate(${sway})`}>
      <line x1={0} y1={0} x2={0} y2={12} stroke="#8f9383" strokeWidth={1.4} opacity={0.75} />
      <path d="M0 12 C3 70 -3 130 0 196" fill="none" stroke="#8f9a62" strokeWidth={3} strokeLinecap="round" />
      {['M1 40 q16 6 22 22', 'M-1 58 q-18 4 -24 20', 'M1 92 q15 8 18 24', 'M-1 120 q-14 8 -16 24'].map(d => (
        <path key={d} d={d} fill="none" stroke="#7c8456" strokeWidth={2} strokeLinecap="round" />
      ))}
      {[[-9, 66, 0.85], [9, 96, 0.95], [-8, 126, 1], [8, 150, 1.05]].map(([x, y, k]) => (
        <BudCluster key={y} bud="#8a8f4f" pistil="#b8682c" transform={`translate(${x} ${y}) rotate(180) scale(${k})`} />
      ))}
      <BudCluster big bud="#8a8f4f" pistil="#b8682c" transform="translate(0 168) rotate(180)" />
    </g>
  </g>
);
