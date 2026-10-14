import { describe, expect, it } from 'vitest';
import { applyMove, legalMoves } from '../src/core/engine';
import { BONDS } from '../src/data/bonds';
import { LESSONS, buildLesson } from '../src/data/tutorial';

describe('tutorial', () => {
  for (const l of LESSONS) {
    it(`lesson "${l.title}" can reach its goal`, () => {
      const g = buildLesson(l);
      const ok = legalMoves(g).some((m) => applyMove(g, m, BONDS).flips.some((f) => f.cause === l.goal));
      expect(ok).toBe(true);
    });
  }

  // Rally, Sabotage, Rune-born: the goal flip is impossible without the ability.
  for (const l of LESSONS.filter((x) => x.teaches && x.teaches !== 'steadfast')) {
    it(`lesson "${l.title}" cannot be solved without the ability`, () => {
      const g = buildLesson(l);
      for (const p of g.board) if (p) p.card = { ...p.card, ability: undefined };
      g.hands[0] = g.hands[0].map((c) => ({ ...c, ability: undefined }));
      expect(legalMoves(g).some((m) => applyMove(g, m, BONDS).flips.length > 0)).toBe(false);
    });
  }

  it('the steadfast lesson keeps Hans unflipped', () => {
    const l = LESSONS.find((x) => x.teaches === 'steadfast')!;
    const g = buildLesson(l);
    const r = applyMove(g, { hand: 0, cell: 4 }, BONDS);
    expect(r.flips.map((f) => f.cell)).toEqual([3]);
  });

  it('the rune lesson needs the matching tile', () => {
    const l = LESSONS.find((x) => x.title === 'Rune tiles')!;
    const g = buildLesson(l);
    const winning = legalMoves(g).filter((m) => applyMove(g, m, BONDS).flips.length > 0).map((m) => m.cell);
    expect(winning).toEqual([4]);
  });
});
