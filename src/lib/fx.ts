// Sound (Web Audio, generated, no files) and motion helpers.
import { save } from '../stores/save.svelte';

let ctx: AudioContext | null = null;

type Sfx = 'select' | 'place' | 'flip' | 'special' | 'win' | 'lose';

const NOTES: Record<Sfx, [number, number, OscillatorType][]> = {
  select: [[660, 0.05, 'triangle']],
  place: [[220, 0.08, 'square'], [330, 0.06, 'triangle']],
  flip: [[520, 0.07, 'triangle'], [780, 0.07, 'triangle']],
  special: [[523, 0.08, 'sawtooth'], [659, 0.08, 'sawtooth'], [784, 0.12, 'sawtooth']],
  win: [[523, 0.12, 'triangle'], [659, 0.12, 'triangle'], [784, 0.12, 'triangle'], [1047, 0.25, 'triangle']],
  lose: [[392, 0.15, 'triangle'], [330, 0.15, 'triangle'], [262, 0.3, 'triangle']],
};

export function sfx(kind: Sfx): void {
  if (!save.settings.sound || typeof AudioContext === 'undefined') return;
  ctx ??= new AudioContext();
  let t = ctx.currentTime;
  for (const [freq, dur, type] of NOTES[kind]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    t += dur * 0.8;
  }
}

export function reducedMotion(): boolean {
  const s = save.settings.reducedMotion;
  if (s !== 'auto') return s === 'on';
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
