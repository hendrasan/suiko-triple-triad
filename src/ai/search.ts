// Negamax search with alpha-beta pruning, iterative deepening, and a time budget.
// Pure: no DOM. Runs in the web worker and in tests.
import {
  DIRS, activeBondPairs, applyMove, isOver, legalMoves, neighbor, runeMod, score, sideValue,
} from '../core/engine';
import { makeRng } from '../core/rng';
import type { GameState, HandCard, Move, Side } from '../core/types';
import type { Difficulty, Personality } from '../data/schema';

export interface Weights { own: number; exposure: number; bond: number; rune: number }

export const PERSONALITIES: Record<Personality, Weights> = {
  balanced: { own: 1, exposure: 0.15, bond: 0.2, rune: 0.2 },
  aggressive: { own: 1.3, exposure: 0.05, bond: 0.1, rune: 0.1 },
  defensive: { own: 1, exposure: 0.35, bond: 0.1, rune: 0.1 },
  bond: { own: 1, exposure: 0.15, bond: 0.6, rune: 0.1 },
  rune: { own: 1, exposure: 0.15, bond: 0.1, rune: 0.6 },
};

/** depth = max plies. noise = random points added to each root move score. */
export const DIFFICULTIES: Record<Difficulty, { depth: number; noise: number }> = {
  easy: { depth: 1, noise: 1.5 },
  normal: { depth: 2, noise: 0.6 },
  hard: { depth: 4, noise: 0.15 },
  boss: { depth: 9, noise: 0 },
};

export interface SearchOpts {
  depth: number;
  noise: number;
  weights: Weights;
  timeMs: number;
  seed: number;
}

/** Replace the other side's hand with face-down stand-ins, so the AI cannot peek. */
export function redact(s: GameState, ai: Side): GameState {
  const other = (1 - ai) as Side;
  const hidden = s.hands[other].map((_, i): HandCard => ({
    uid: `hidden-${i}`, id: '?', values: [5, 5, 5, 5], rune: null, boost: 0, hidden: true,
  }));
  const hands: [HandCard[], HandCard[]] = ai === 0 ? [s.hands[0], hidden] : [hidden, s.hands[1]];
  return { ...s, hands };
}

/** Static evaluation from the point of view of `me`. */
export function evaluate(s: GameState, me: Side, w: Weights): number {
  const sc = score(s);
  const own = sc[me] - sc[1 - me];
  if (isOver(s)) return (own > 0 ? 100 : own < 0 ? -100 : 0) + own;
  let exposure = 0;
  let rune = 0;
  s.board.forEach((p, cell) => {
    if (!p) return;
    const sign = p.owner === me ? 1 : -1;
    if (s.rules.runes) rune += sign * runeMod(p.card.rune, s.tiles[cell]);
    for (const d of DIRS) {
      const n = neighbor(s.size, cell, d);
      if (n >= 0 && !s.board[n]) exposure += sign * (10 - sideValue(s, cell, d)) / 10;
    }
  });
  const bond = activeBondPairs(s, me) - activeBondPairs(s, (1 - me) as Side);
  return w.own * own - w.exposure * exposure + w.bond * bond + w.rune * rune;
}

/** Moves with duplicate hidden cards removed (all hidden cards are the same). */
function movesOf(s: GameState): Move[] {
  const hand = s.hands[s.turn];
  const firstHidden = hand.findIndex((c) => c.hidden);
  return legalMoves(s).filter((m) => !hand[m.hand].hidden || m.hand === firstHidden);
}

class Timeout extends Error {}

export function chooseMove(state: GameState, opts: SearchOpts): Move {
  const me = state.turn;
  const rng = makeRng(opts.seed);
  const deadline = Date.now() + opts.timeMs;
  let nodes = 0;

  const negamax = (s: GameState, depth: number, alpha: number, beta: number): number => {
    if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout();
    if (depth === 0 || isOver(s)) {
      const v = evaluate(s, me, opts.weights);
      return s.turn === me ? v : -v;
    }
    let best = -Infinity;
    for (const m of movesOf(s)) {
      const v = -negamax(applyMove(s, m).state, depth - 1, -beta, -alpha);
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  };

  const rootMoves = movesOf(state);
  const noise = rootMoves.map(() => rng() * opts.noise);
  let order = rootMoves.map((_, i) => i);
  let bestIdx = order[0];
  const maxDepth = Math.min(opts.depth, state.board.filter((p) => !p).length);

  for (let depth = 1; depth <= maxDepth; depth++) {
    try {
      const scores = new Map<number, number>();
      let alpha = -Infinity;
      for (const i of order) {
        // Full window when noise is on, so every root score is exact.
        const a = opts.noise > 0 ? -Infinity : alpha;
        const v = -negamax(applyMove(state, rootMoves[i]).state, depth - 1, -Infinity, -a) + noise[i];
        scores.set(i, v);
        if (v > alpha) alpha = v;
      }
      order = [...order].sort((a, b) => scores.get(b)! - scores.get(a)!);
      bestIdx = order[0];
    } catch (e) {
      if (e instanceof Timeout) break;
      throw e;
    }
  }
  return rootMoves[bestIdx];
}
