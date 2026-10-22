// Sound effects (ZzFX: generated, no audio files) and motion helpers.
import { save } from '../stores/save.svelte';

export type Sfx = 'select' | 'place' | 'flip' | 'same' | 'plus' | 'combo' | 'unite' | 'sabotage' | 'win' | 'lose' | 'draw'
  | 'click' | 'nav' | 'open' | 'back' | 'add' | 'remove';

type Params = (number | undefined)[];
// ZzFX parameters: volume, randomness, frequency, attack, sustain, release, shape, shapeCurve,
// slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush, delay, sustainVolume, decay.
const SOUNDS: Record<Exclude<Sfx, 'win' | 'lose' | 'draw'>, Params> = {
  // Menu sounds: short and quiet.
  click: [0.3, 0.05, 900, , 0.01, 0.02, 1, 2, , , , , , , , , , 0.5],
  nav: [0.3, 0.02, 520, , 0.02, 0.05, 1, 1.4, , , 260, 0.025],
  open: [0.3, 0.02, 440, 0.01, 0.03, 0.1, 0, 1.5, , , 220, 0.035],
  back: [0.3, 0.02, 660, , 0.02, 0.06, 0, 1.5, , , -220, 0.03],
  add: [0.35, 0.02, 600, , 0.03, 0.07, 1, 1.6, 9],
  remove: [0.35, 0.02, 520, , 0.03, 0.07, 1, 1.6, -9],
  select: [0.5, 0.05, 700, , 0.02, 0.05, 1, 1.6, , , 300, 0.02],
  place: [1.2, 0.05, 160, 0.005, 0.03, 0.12, 4, 1.4, -6, , , , , 0.4, , , , 0.6, 0.04],
  flip: [0.7, 0.05, 480, 0.01, 0.04, 0.1, 1, 1.8, 4, , 220, 0.04],
  same: [0.9, 0.03, 520, 0.02, 0.12, 0.35, 1, 1.5, , , 260, 0.08, , , , , 0.06, 0.8],
  plus: [0.9, 0.03, 392, 0.02, 0.12, 0.35, 1, 1.5, , , 392, 0.08, , , , , 0.06, 0.8],
  combo: [0.8, 0.03, 600, 0.01, 0.06, 0.18, 2, 1.4, 6, , 300, 0.05, , , , , 0.04, 0.7],
  sabotage: [0.8, 0.05, 300, 0.01, 0.05, 0.2, 3, 2, -12, , , , , 0.6, , 0.1],
  unite: [1.3, 0.05, 110, 0.04, 0.3, 0.6, 2, 1.2, 3, , 165, 0.12, 0.08, , , , 0.12, 0.7, 0.1],
};
const JINGLES: Record<'win' | 'lose' | 'draw', number[]> = {
  win: [523, 659, 784, 1047],
  lose: [392, 330, 262],
  draw: [440, 440],
};

let lib: Promise<typeof import('zzfx')> | null = null;

/** Play a sound. `step` raises the pitch (used for combo chains). */
export function sfx(kind: Sfx, step = 0): void {
  if (!save.settings.sound || typeof AudioContext === 'undefined') return;
  lib ??= import('zzfx');
  lib.then(({ zzfx, ZZFX }) => {
    if (ZZFX.audioContext.state === 'suspended') ZZFX.audioContext.resume();
    if (kind === 'win' || kind === 'lose' || kind === 'draw') {
      JINGLES[kind].forEach((f, i) => setTimeout(() => zzfx(0.8, 0, f, 0.01, 0.12, 0.25, 0, 1.5), i * 130));
      return;
    }
    const p = [...SOUNDS[kind]];
    if (step > 1) p[2] = (p[2] ?? 220) * 2 ** ((step - 1) * 3 / 12);
    zzfx(...p);
  });
}

/**
 * Menu sounds for every button and checkbox, from one listener.
 * A `data-sfx` attribute picks the sound ("none" = silent). Hand cards and board cells have game sounds.
 */
export function installUiSounds(): void {
  window.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('button, input[type="checkbox"], [data-sfx]');
    if (!el || (el as HTMLButtonElement).disabled || el.closest('[data-cell], .hand-card, .hc')) return;
    const kind = el.closest<HTMLElement>('[data-sfx]')?.dataset.sfx ?? 'click';
    if (kind !== 'none') sfx(kind as Sfx);
  }, true);
}

export function reducedMotion(): boolean {
  const s = save.settings.reducedMotion;
  if (s !== 'auto') return s === 'on';
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
