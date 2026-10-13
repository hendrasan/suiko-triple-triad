// Main-thread side of the AI. Redacts hidden information before the state leaves this file.
import { CONFIG } from '../core/config';
import type { GameState, Move } from '../core/types';
import type { Difficulty, Personality } from '../data/schema';
import { DIFFICULTIES, PERSONALITIES, chooseMove, redact, type SearchOpts } from './search';

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, (m: Move) => void>();

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; move: Move }>) => {
      pending.get(e.data.id)?.(e.data.move);
      pending.delete(e.data.id);
    };
  }
  return worker;
}

export function askAI(state: GameState, difficulty: Difficulty, personality: Personality, seed: number): Promise<Move> {
  const d = DIFFICULTIES[difficulty];
  const opts: SearchOpts = { ...d, weights: PERSONALITIES[personality], timeMs: CONFIG.aiTimeMs, seed };
  // Svelte state proxies cannot be cloned to a worker. JSON makes a plain copy.
  const view = JSON.parse(JSON.stringify(redact(state, state.turn))) as GameState;
  const w = getWorker();
  if (!w) return Promise.resolve(chooseMove(view, opts));
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    w.postMessage({ id, state: view, opts });
  });
}
