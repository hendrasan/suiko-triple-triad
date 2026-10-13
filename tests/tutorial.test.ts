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

  it('the rune lesson needs the matching tile', () => {
    const l = LESSONS.find((x) => x.title === 'Rune tiles')!;
    const g = buildLesson(l);
    const winning = legalMoves(g).filter((m) => applyMove(g, m, BONDS).flips.length > 0).map((m) => m.cell);
    expect(winning).toEqual([4]);
  });
});
