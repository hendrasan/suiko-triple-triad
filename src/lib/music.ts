// Background music. Two looping tracks, both CC0 from OpenGameArt:
//   battle: "Funked Up" by Joth          https://opengameart.org/content/funked-up
//   menu:   "Etirwer" by Kistol          https://opengameart.org/content/etirwer
import { save } from '../stores/save.svelte';

export type Track = 'menu' | 'battle';

const BASE = `${import.meta.env.BASE_URL}music/`;
const TRACKS: Record<Track, { files: string[]; volume: number }> = {
  battle: { files: ['funked-up.mp3'], volume: 0.35 },
  // OGG loops cleanly; the AAC copy is for browsers without Vorbis (Safari).
  menu: { files: ['etirwer.ogg', 'etirwer.m4a'], volume: 0.3 },
};
const FADE_MS = 600;

const players: Partial<Record<Track, HTMLAudioElement>> = {};
let current: Track | null = null;

function player(t: Track): HTMLAudioElement {
  let a = players[t];
  if (!a) {
    a = new Audio();
    const ogg = a.canPlayType('audio/ogg; codecs="vorbis"');
    const file = TRACKS[t].files.find((f) => !f.endsWith('.ogg') || ogg) ?? TRACKS[t].files[0];
    a.src = BASE + file;
    a.loop = true;
    a.volume = 0;
    players[t] = a;
  }
  return a;
}

// A new fade on the same track cancels the old one.
const fades = new WeakMap<HTMLAudioElement, number>();

function fade(a: HTMLAudioElement, to: number, then?: () => void) {
  const id = (fades.get(a) ?? 0) + 1;
  fades.set(a, id);
  const from = a.volume;
  const start = performance.now();
  const step = (now: number) => {
    if (fades.get(a) !== id) return;
    const k = Math.min(1, (now - start) / FADE_MS);
    a.volume = Math.min(1, Math.max(0, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step);
    else then?.();
  };
  requestAnimationFrame(step);
}

function start(t: Track) {
  const a = player(t);
  if (!a.paused) return fade(a, TRACKS[t].volume);
  a.play().then(() => fade(a, TRACKS[t].volume)).catch(() => {});
}

function stop(t: Track, rewind: boolean) {
  const a = players[t];
  if (!a || a.paused) return;
  fade(a, 0, () => {
    a.pause();
    if (rewind) a.currentTime = 0;
  });
}

/** Choose the track for the current screen. Null = silence. */
export function setTrack(t: Track | null): void {
  if (t !== current && current) stop(current, current === 'battle');
  current = t;
  if (t && save.settings.music && typeof Audio !== 'undefined') start(t);
}

/** Apply the Music setting at once (used by the toggles). */
export function syncMusic(): void {
  if (!current) return;
  if (save.settings.music) start(current);
  else stop(current, false);
}

if (typeof window !== 'undefined') {
  // Browsers block audio until the first click or key press. Try again then.
  const unlock = () => {
    if (current && save.settings.music && players[current]?.paused !== false) start(current);
  };
  window.addEventListener('pointerdown', unlock, { once: true, capture: true });
  window.addEventListener('keydown', unlock, { once: true, capture: true });
  // Pause in a hidden tab, and continue when the player comes back.
  document.addEventListener('visibilitychange', () => {
    if (!current) return;
    if (document.hidden) players[current]?.pause();
    else if (save.settings.music) start(current);
  });
}
