import React from 'react';
import { Composition } from 'remotion';
import { Lancamento } from './Lancamento';
import { LancamentoReal } from './LancamentoReal';

export const Root: React.FC = () => (
  <>
    <Composition id="Lancamento" component={Lancamento} durationInFrames={900} fps={30} width={1080} height={1920} />
    <Composition id="LancamentoReal" component={LancamentoReal} durationInFrames={900} fps={30} width={1080} height={1920} />
  </>
);
