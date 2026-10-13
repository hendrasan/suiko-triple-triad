import { describe, expect, it } from 'vitest';
import { newLog, setupGame, summarize, type MatchSummary } from '../src/core/match';
import { bondRecruits, prizeOptions, recruitsFromMatch } from '../src/core/progress';
import { OPPONENT_BY_ID } from '../src/data/opponents';
import { STARTERS } from '../src/data/recruits';
import { migrate, newSave, SAVE_VERSION } from '../src/stores/saveData';

const summary = (over: Partial<MatchSummary>): MatchSummary => ({
  opponent: 'shepherd', mode: 3, deck: [], won: true, draw: false, games: [], flawless: false, flipsMax: 0,
  same: false, plus: false, comboMax: 0, unite: false, bonds: [], runeTiles: [], second: false, score: 6, seed: 1, ...over,
});

describe('match setup', () => {
  it('is deterministic for a seed', () => {
    const o = OPPONENT_BY_ID.rowd;
    expect(setupGame(o, 3, STARTERS.slice(0, 5), 42, 0)).toEqual(setupGame(o, 3, STARTERS.slice(0, 5), 42, 0));
  });

  it('switches the first player in game two', () => {
    const o = OPPONENT_BY_ID.rowd;
    const g1 = setupGame(o, 4, STARTERS.slice(0, 8), 9, 0);
    const g2 = setupGame(o, 4, STARTERS.slice(0, 8), 9, 1, g1.first);
    expect(g2.first).toBe(1 - g1.first);
  });

  it('gives the casual handicap to the second player on 3x3 and the first on 4x4', () => {
    const o = OPPONENT_BY_ID.shepherd;
    const a = setupGame(o, 3, STARTERS.slice(0, 5), 5, 0);
    expect(a.handicap).toBe(1 - a.first);
    const b = setupGame(o, 4, STARTERS.slice(0, 8), 5, 0);
    expect(b.handicap).toBe(b.first);
    expect(setupGame(OPPONENT_BY_ID.rowd, 3, STARTERS.slice(0, 5), 5, 0).handicap).toBeNull();
  });

  it('best of two: total cards break a 1-1 tie', () => {
    const l1 = { ...newLog(0), score: [6, 4] as [number, number] };
    const l2 = { ...newLog(1), score: [3, 7] as [number, number] };
    const s = summarize(OPPONENT_BY_ID.rowd, 3, [], [l1, l2], 1);
    expect(s.won).toBe(false); // 9 vs 11
    const l3 = { ...newLog(1), score: [4, 6] as [number, number] };
    expect(summarize(OPPONENT_BY_ID.rowd, 3, [], [l1, l3], 1).draw).toBe(true); // 10 vs 10
  });
});

describe('recruiting', () => {
  it('completes a quest on a matching win', () => {
    const r = recruitsFromMatch(new Set(STARTERS), summary({ deck: ['nanami'] }));
    expect(r).toContainEqual({ id: 'zamza', via: 'quest' });
  });

  it('gives nothing on a loss', () => {
    expect(recruitsFromMatch(new Set(STARTERS), summary({ won: false, deck: ['nanami'] }))).toEqual([]);
  });

  it('respects mode tags', () => {
    const r3 = recruitsFromMatch(new Set(STARTERS), summary({ mode: 3, score: 12 }));
    const r4 = recruitsFromMatch(new Set(STARTERS), summary({ mode: 4, score: 12 }));
    expect(r3.some((r) => r.id === 'amada')).toBe(true); // 3x3 needs 7
    expect(r4.some((r) => r.id === 'amada')).toBe(true); // 4x4 needs 12
    expect(recruitsFromMatch(new Set(STARTERS), summary({ mode: 4, score: 11 })).some((r) => r.id === 'amada')).toBe(false);
  });

  it('unlocks story cards from bosses', () => {
    expect(recruitsFromMatch(new Set(STARTERS), summary({ opponent: 'luca' }))).toContainEqual({ id: 'luca', via: 'story' });
  });

  it('chains bond recruits', () => {
    const r = bondRecruits(new Set(['annallee']));
    expect(r.map((x) => x.id)).toEqual(expect.arrayContaining(['pico', 'alberto']));
  });

  it('prize options skip owned cards', () => {
    const o = OPPONENT_BY_ID.innkeeper;
    const p = prizeOptions(o, ['rikimaru', 'tuta'], new Set(['tuta']), () => 0);
    expect(p.cards).toEqual(['rikimaru']);
  });
});

describe('save data', () => {
  it('round-trips and repairs', () => {
    const s = newSave();
    expect(migrate(JSON.parse(JSON.stringify(s)))).toEqual(s);
    const broken = { owned: ['hero', 'not-a-card'], decks: { 3: [['hero', 'nanami']] } };
    const fixed = migrate(broken);
    expect(fixed.owned).toEqual(['hero']);
    expect(fixed.decks[3]).toEqual([['hero'], [], []]);
    expect(fixed.version).toBe(SAVE_VERSION);
  });

  it('rejects newer versions and non-saves', () => {
    expect(() => migrate({ ...newSave(), version: 999 })).toThrow();
    expect(() => migrate({ hello: 1 })).toThrow();
  });
});
