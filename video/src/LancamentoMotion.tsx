// "Do grão à colheita em 30 segundos", versão motion: cena ilustrada (Remotion)
// + tipografia animada com fundo transparente (HyperFrames, public/camadas/tipografia.webm).
// Tudo que importa fica na área segura das redes: x 72–940, y 260–1420.
import React from 'react';
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FD, FM } from './fonts';
import { Brand } from './Lancamento';
import { CycleScene, lightAt, STAGES } from './scene';

export type FichaProps = { grow: string; plantas: string; watts: number; luz: string; conta: number; musica?: boolean };
export const fichaPadrao: FichaProps = { grow: '80×80', plantas: '2 a 3 plantas', watts: 250, luz: '12/12', conta: 111 };

const K = { night: '#0f110b', card: '#16190f', ink: '#eef0e6', muted: '#9fa492', line: '#2e3326', accent: '#d4f25a' };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const END = 810;

// Efeitos sonoros: "golpe" é o instante (s) em que o som bate dentro do arquivo,
// "em" é o quadro do vídeo em que ele deve bater. Assim o início é calculado.
const FPS = 30;
const SFX: { file: string; golpe: number; em: number; vol: number }[] = [
  { file: '01-clique-lampada.wav', golpe: 0.032, em: 34, vol: 0.72 },       // lâmpada acende (flash)
  { file: '06-subida.wav', golpe: 1.843, em: 480, vol: 0.85 },            // sobe até o 12/12
  { file: '07-impacto-12-12.wav', golpe: 0.235, em: 480, vol: 0.62 },    // 12/12 pousa
  { file: '08-lampada-desliga.wav', golpe: 0.774, em: 720, vol: 0.72 },     // secagem: luz apaga
  { file: '09-ficha.wav', golpe: 0.03, em: END + 8, vol: 0.9 }           // ficha aparece
];
const SAFE = { left: 72, right: 140, top: 240 };

const WHOOSH = [0.35, 2.3, 6.3, 10.3, 20.3, 24.35, 27.75];
// trilha: abaixa quando um efeito importante toca (clique, 12/12, luz apagando, ficha)
const DUCK = [34, 480, 720, END + 8];
const trilhaVol = (f: number) => {
  const d = DUCK.reduce((m, x) => Math.min(m, interpolate(f, [x - 6, x, x + 10, x + 26], [1, 0.5, 0.5, 1], clamp)), 1);
  return 0.78 * d;
};
// zumbido do grow: liga com a lâmpada, apaga com ela na secagem
const zumbidoVol = (f: number) => interpolate(f, [36, 60, 712, 724], [0, 1, 1, 0], clamp) * 0.9;

export const LancamentoMotion: React.FC<FichaProps> = ({ musica, ...props }) => {
  const f = useCurrentFrame();
  const { glow, lampOn } = lightAt(f);
  const flash = interpolate(f, [34, 37, 52], [0, 0.12, 0], clamp); // flash suave, sem piscar
  const endT = interpolate(f, [END, END + 24], [0, 1], { ...clamp, easing: ease });
  const day = Math.round(interpolate(f, [60, 180, 300, 450, 600, 720], [1, 8, 22, 50, 113, 114], clamp));
  const railP = interpolate(f, [60, END], [0, 1], clamp);
  const stageIdx = STAGES.findIndex(s => f >= s.from && f < s.to);
  const chrome = interpolate(f, [56, 72], [0, 1], clamp) * (1 - endT);
  // leve respiração da câmera
  const breathe = 1 + Math.sin(f / 45) * 0.006;

  return (
    <AbsoluteFill style={{ background: K.night, fontFamily: FD, color: K.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(75% 40% at 50% 62%, ${glow}, transparent 70%)`, opacity: 0.16 * lampOn * (1 - endT) }} />

      {/* cena: abaixo do bloco de texto, dentro da área segura */}
      <div style={{ position: 'absolute', left: 194, top: 560, width: 692, height: 900,
        opacity: 1 - endT * 0.88, transform: `scale(${breathe * (1 - endT * 0.06)})`, transformOrigin: '50% 60%' }}>
        <CycleScene f={f} width={692} height={900} />
      </div>
      {/* véu no topo para o texto respirar sobre a lâmpada */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(15,17,11,.85) 0px, rgba(15,17,11,.55) 520px, rgba(15,17,11,0) 760px)' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />

      {/* marca, contador e trilho */}
      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: SAFE.top, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Brand size={40} />
        <div style={{ fontFamily: FM, fontSize: 28, color: K.muted, opacity: chrome }}>
          DIA <span style={{ color: K.ink }}>{String(day).padStart(3, '0')}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: 306, display: 'flex', gap: 8, opacity: chrome }}>
        {STAGES.map((s, i) => {
          const p = Math.min(1, Math.max(0, railP * STAGES.length - i));
          return (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: K.line, overflow: 'hidden' }}>
              <div style={{ width: `${p * 100}%`, height: '100%', background: i === stageIdx ? K.accent : K.ink }} />
            </div>
          );
        })}
      </div>

      {f >= END && <FichaCard f={f - END} {...props} />}

      <Sequence from={36} durationInFrames={80} name="02-led-liga">
        <Audio src={staticFile('sfx/norm/02-led-liga.wav')} volume={0.9} />
      </Sequence>
      <Audio src={staticFile('sfx/norm/03-zumbido-fundo.wav')} volume={zumbidoVol} />
      {WHOOSH.map((t, i) => (
        <Sequence key={'w' + i} from={Math.round((t - 0.356) * FPS)} durationInFrames={50} name={`04-whoosh ${t}s`}>
          {/* alterna o tom levemente para não soar repetido */}
          <Audio src={staticFile('sfx/norm/04-whoosh.wav')} volume={0.8} playbackRate={i % 2 ? 1.08 : 0.94} />
        </Sequence>
      ))}
      {musica && <Audio src={staticFile('musica/trecho.wav')} volume={trilhaVol} />}
      {SFX.map(x => (
        <Sequence key={x.file} from={Math.round(x.em - x.golpe * FPS)} durationInFrames={120} name={x.file}>
          <Audio src={staticFile('sfx/norm/' + x.file)} volume={x.vol} />
        </Sequence>
      ))}

      {/* tipografia animada (HyperFrames), por cima de tudo */}
      <AbsoluteFill>
        <OffthreadVideo src={staticFile('camadas/tipografia.webm')} transparent muted style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FichaCard: React.FC<FichaProps & { f: number }> = ({ f, grow, plantas, watts, luz, conta }) => {
  const card = interpolate(f, [6, 30], [0, 1], { ...clamp, easing: ease });
  const count = interpolate(f, [16, 52], [0, 1], { ...clamp, easing: ease });
  const rows: { k: string; v: string; u: string }[] = [
    { k: 'Grow', v: grow, u: `cm · ${plantas}` },
    { k: 'LED', v: String(Math.round(watts * count)), u: 'W reais' },
    { k: 'Luz', v: luz, u: 'h na floração' },
    { k: 'Conta', v: `R$ ${Math.round(conta * count)}`, u: 'por mês' }
  ];
  return (
    <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: 330, opacity: card, transform: `translateY(${(1 - card) * 60}px) scale(${0.96 + card * 0.04})`, transformOrigin: '50% 0' }}>
      <div style={{ background: K.card, border: `2px solid ${K.line}`, borderRadius: 40, padding: '36px 44px 20px', boxShadow: '0 60px 120px -40px rgba(0,0,0,.85)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FM, fontSize: 26, marginBottom: 12 }}>
          <span style={{ color: K.accent }}>● Ficha do seu grow</span>
          <span style={{ color: K.muted }}>estimativa</span>
        </div>
        {rows.map((r, i) => {
          const o = interpolate(f, [14 + i * 5, 30 + i * 5], [0, 1], { ...clamp, easing: ease });
          return (
            <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'baseline', padding: '22px 0', borderTop: `2px solid ${K.line}`, opacity: o, transform: `translateX(${(1 - o) * -24}px)` }}>
              <span style={{ fontFamily: FM, fontSize: 24, color: K.muted, textTransform: 'uppercase' }}>{r.k}</span>
              <span>
                <span style={{ fontWeight: 800, fontSize: 84, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums' }}>{r.v}</span>
                <span style={{ fontFamily: FM, fontSize: 24, color: K.muted, marginLeft: 16 }}>{r.u}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
