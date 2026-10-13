import { describe, expect, it } from 'vitest';
import { chooseMove, DIFFICULTIES, PERSONALITIES, redact } from '../src/ai/search';
import { applyMove, createGame, isOver, score } from '../src/core/engine';
import { ALL_RULES, BASE_RULES } from '../src/core/config';
import { makeRng } from '../src/core/rng';
import type { BoardSize, GameState, HandCard, Values } from '../src/core/types';

let n = 0;
const card = (v: Values): HandCard => ({ uid: `u${n++}`, id: `c${n}`, values: v, rune: null, boost: 0 });

function randomHand(rng: () => number, k: number): HandCard[] {
  return Array.from({ length: k }, () => card([1, 2, 3, 4].map(() => 1 + Math.floor(rng() * 9)) as Values));
}

const opts = (depth: number, timeMs = 400) => ({ depth, noise: 0, weights: PERSONALITIES.balanced, timeMs, seed: 1 });

describe('AI', () => {
  it('takes an obvious capture', () => {
    const s = createGame({
      size: 3, rules: BASE_RULES, tiles: new Array(9).fill(null),
      hands: [[card([1, 1, 1, 1])], [card([9, 9, 9, 9]), card([1, 1, 1, 1])]], first: 1, bonds: [],
    });
    s.board[0] = { card: card([2, 2, 2, 2]), owner: 0 };
    s.hands[0] = [];
    const m = chooseMove(redact(s, 1), opts(2));
    expect(m.hand).toBe(0);
    expect([1, 3]).toContain(m.cell);
  });

  it('never sees the real cards of the other side', () => {
    const s = createGame({
      size: 3, rules: BASE_RULES, tiles: new Array(9).fill(null),
      hands: [[card([9, 9, 9, 9])], [card([1, 1, 1, 1])]], first: 1, bonds: [],
    });
    const v = redact(s, 1);
    expect(v.hands[0][0].hidden).toBe(true);
    expect(v.hands[0][0].values).toEqual([5, 5, 5, 5]);
    expect(v.hands[1]).toBe(s.hands[1]);
  });

  it('keeps a 4x4 opening move inside the time budget', () => {
    const rng = makeRng(7);
    const s = createGame({
      size: 4, rules: ALL_RULES, tiles: new Array(16).fill(null),
      hands: [randomHand(rng, 8), randomHand(rng, 8)], first: 1, bonds: [],
    });
    const t = Date.now();
    chooseMove(redact(s, 1), { ...DIFFICULTIES.boss, weights: PERSONALITIES.aggressive, timeMs: 350, seed: 3 });
    expect(Date.now() - t).toBeLessThan(600);
  });

  it('a deep AI beats a depth-1 AI more often than not on 3x3', () => {
    let wins = 0;
    let losses = 0;
    for (let g = 0; g < 20; g++) {
      const rng = makeRng(100 + g);
      const hands: [HandCard[], HandCard[]] = [randomHand(rng, 5), randomHand(rng, 5)];
      const size: BoardSize = 3;
      let s: GameState = createGame({ size, rules: BASE_RULES, tiles: new Array(9).fill(null), hands, first: (g % 2) as 0 | 1, bonds: [] });
      while (!isOver(s)) {
        const strong = s.turn === 0;
        const m = chooseMove(redact(s, s.turn), opts(strong ? 4 : 1, 200));
        s = applyMove(s, m).state;
      }
      const [a, b] = score(s);
      if (a > b) wins++; else if (a < b) losses++;
    }
    expect(wins).toBeGreaterThan(losses);
  });
});
