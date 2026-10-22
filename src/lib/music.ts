// Battle music: one looping track. "Funked Up" by Joth (CC0), opengameart.org/content/funked-up
import { save } from '../stores/save.svelte';

const SRC = `${import.meta.env.BASE_URL}music/funked-up.mp3`;
const VOLUME = 0.35;

let audio: HTMLAudioElement | null = null;
let wanted = false;

function el(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    // Pause in a hidden tab, and continue when the player comes back.
    document.addEventListener('visibilitychange', () => {
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (wanted && save.settings.music) audio.play().catch(() => {});
    });
  }
  return audio;
}

/** Start (or continue) the battle music. Browsers allow this only after a click or tap. */
export function playMusic(): void {
  wanted = true;
  if (!save.settings.music || typeof Audio === 'undefined') return;
  el().play().catch(() => {});
}

export function stopMusic(): void {
  wanted = false;
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

/** Apply the Music setting at once (used by the toggles). */
export function syncMusic(): void {
  if (save.settings.music && wanted) playMusic();
  else audio?.pause();
}
