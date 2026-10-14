import { describe, expect, it } from 'vitest';
import { applyMove, createGame, isOver, score, sideValue } from '../src/core/engine';
import { BASE_RULES, CONFIG } from '../src/core/config';
import type { BondDef, BoardSize, GameState, HandCard, Rules, Rune, Side, Values } from '../src/core/types';

const OFF: Rules = { same: false, plus: false, combo: false, runes: false, bonds: false, unite: false };
let n = 0;
const card = (v: Values, id = `c${n++}`, rune: Rune | null = null): HandCard => ({ uid: `u${n++}`, id, values: v, rune, boost: 0 });
const flat = (x: number): Values => [x, x, x, x];

/** Build a game and put pre-placed cards on the board directly. */
function setup(opts: {
  size?: BoardSize; rules?: Partial<Rules>; tiles?: (Rune | null)[]; bonds?: BondDef[];
  board?: Record<number, [HandCard, Side]>; hand0?: HandCard[]; hand1?: HandCard[]; turn?: Side;
}): GameState {
  const size = opts.size ?? 3;
  const pre = Object.values(opts.board ?? {}).map(([c]) => c);
  const s = createGame({
    size,
    rules: { ...OFF, ...opts.rules },
    tiles: opts.tiles ?? new Array(size * size).fill(null),
    hands: [[...(opts.hand0 ?? []), ...pre], opts.hand1 ?? []],
    first: opts.turn ?? 0,
    bonds: opts.bonds ?? [],
  });
  s.hands[0] = opts.hand0 ?? [];
  for (const [cell, [c, owner]] of Object.entries(opts.board ?? {})) s.board[+cell] = { card: c, owner };
  return s;
}

describe('basic flips', () => {
  it('flips a weaker adjacent enemy and not a stronger one', () => {
    // Board 3x3. Enemy at cell 1 (top-middle) and cell 3 (middle-left). Place at 4 (center).
    const s = setup({ board: { 1: [card(flat(3)), 1], 3: [card(flat(9)), 1] }, hand0: [card(flat(5))] });
    const r = applyMove(s, { hand: 0, cell: 4 });
    expect(r.flips.map((f) => f.cell)).toEqual([1]);
    expect(r.state.board[1]!.owner).toBe(0);
    expect(r.state.board[3]!.owner).toBe(1);
  });

  it('ignores equal values and own cards, and never flips diagonally', () => {
    const s = setup({
      board: { 1: [card(flat(5)), 1], 3: [card(flat(1)), 0], 0: [card(flat(1)), 1] },
      hand0: [card(flat(5))],
    });
    const r = applyMove(s, { hand: 0, cell: 4 });
    expect(r.flips).toEqual([]);
  });

  it('uses facing values (top of placed vs bottom of neighbor)', () => {
    // Placed at 4, neighbor above at 1. Compare placed top (index 0) vs neighbor bottom (index 2).
    const s = setup({ board: { 1: [card([1, 1, 4, 1]), 1] }, hand0: [card([5, 1, 1, 1])] });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips).toHaveLength(1);
    const t = setup({ board: { 1: [card([1, 1, 6, 1]), 1] }, hand0: [card([5, 1, 1, 1])] });
    expect(applyMove(t, { hand: 0, cell: 4 }).flips).toHaveLength(0);
  });

  it('does not change the input state', () => {
    const s = setup({ board: { 1: [card(flat(3)), 1] }, hand0: [card(flat(5))] });
    applyMove(s, { hand: 0, cell: 4 });
    expect(s.board[4]).toBeNull();
    expect(s.board[1]!.owner).toBe(1);
  });
});

describe('Same', () => {
  it('flips enemies when 2+ sides match', () => {
    // top neighbor bottom=5, left neighbor right=5, placed top=5 left=5
    const s = setup({
      rules: { same: true },
      board: { 1: [card([9, 9, 5, 9]), 1], 3: [card([9, 5, 9, 9]), 1] },
      hand0: [card([5, 1, 1, 5])],
    });
    const r = applyMove(s, { hand: 0, cell: 4 });
    expect(r.flips.map((f) => [f.cell, f.cause])).toEqual([[1, 'same'], [3, 'same']]);
  });

  it('does not trigger with a single match or with edges', () => {
    const s = setup({ rules: { same: true }, board: { 1: [card([9, 9, 5, 9]), 1] }, hand0: [card([5, 1, 1, 5])] });
    expect(applyMove(s, { hand: 0, cell: 0 + 4 }).flips).toEqual([]);
    // Corner cell 0: top and left are edges, never count.
    const t = setup({ rules: { same: true }, board: { 1: [card([9, 9, 9, 5]), 1] }, hand0: [card([10, 5, 1, 10])] });
    expect(applyMove(t, { hand: 0, cell: 0 }).flips).toEqual([]);
  });

  it('counts own cards as matches but only flips enemies', () => {
    const s = setup({
      rules: { same: true },
      board: { 1: [card([9, 9, 5, 9]), 0], 3: [card([9, 5, 9, 9]), 1] },
      hand0: [card([5, 1, 1, 5])],
    });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips.map((f) => f.cell)).toEqual([3]);
  });

  it('respects the threshold config', () => {
    const old = CONFIG.sameThreshold;
    CONFIG.sameThreshold = 3;
    const s = setup({
      rules: { same: true },
      board: { 1: [card([9, 9, 5, 9]), 1], 3: [card([9, 5, 9, 9]), 1] },
      hand0: [card([5, 1, 1, 5])],
    });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips).toEqual([]);
    CONFIG.sameThreshold = old;
  });
});

describe('Plus', () => {
  it('flips when two sums are equal', () => {
    // top: 3 + 7 = 10, left: 6 + 4 = 10
    const s = setup({
      rules: { plus: true },
      board: { 1: [card([9, 9, 7, 9]), 1], 3: [card([9, 4, 9, 9]), 1] },
      hand0: [card([3, 1, 1, 6])],
    });
    const r = applyMove(s, { hand: 0, cell: 4 });
    expect(r.flips.map((f) => [f.cell, f.cause])).toEqual([[1, 'plus'], [3, 'plus']]);
  });

  it('does not trigger on different sums', () => {
    const s = setup({
      rules: { plus: true },
      board: { 1: [card([9, 9, 7, 9]), 1], 3: [card([9, 7, 9, 9]), 1] },
      hand0: [card([3, 1, 1, 6])],
    });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips).toEqual([]);
  });
});

describe('Combo', () => {
  const build = (combo: boolean) => setup({
    rules: { same: true, combo },
    board: {
      1: [card([9, 9, 5, 9]), 1], // flipped by Same
      3: [card([9, 5, 9, 9]), 1], // flipped by Same
      0: [card([1, 1, 1, 1]), 1], // right of 0 faces 1's left (9 > 1) -> combo step 2
      6: [card([1, 1, 1, 1]), 1], // below 3: 3's bottom 9 > 6's top 1 -> combo
    },
    hand0: [card([5, 1, 1, 5])],
  });

  it('chains flips from Same/Plus cards', () => {
    const r = applyMove(build(true), { hand: 0, cell: 4 });
    const combos = r.flips.filter((f) => f.cause === 'combo');
    expect(combos.map((f) => f.cell).sort()).toEqual([0, 6]);
    expect(combos.every((f) => f.step === 2)).toBe(true);
    expect(score(r.state)).toEqual([5, 0]);
  });

  it('does not chain when Combo is off', () => {
    const r = applyMove(build(false), { hand: 0, cell: 4 });
    expect(r.flips.some((f) => f.cause === 'combo')).toBe(false);
  });

  it('does not chain from basic flips', () => {
    const s = setup({
      rules: { combo: true },
      board: { 1: [card(flat(2)), 1], 0: [card(flat(1)), 1] },
      hand0: [card(flat(5))],
    });
    const r = applyMove(s, { hand: 0, cell: 4 });
    expect(r.flips.map((f) => f.cell)).toEqual([1]);
  });
});

describe('rune tiles', () => {
  const tiles = (r: Rune) => { const t: (Rune | null)[] = new Array(9).fill(null); t[4] = r; return t; };

  it('gives +1 on a matching tile', () => {
    const s = setup({ rules: { runes: true }, tiles: tiles('fire'), board: { 1: [card(flat(5)), 1] }, hand0: [card(flat(5), 'x', 'fire')] });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips).toHaveLength(1);
  });

  it('gives -1 on a mismatched tile', () => {
    const s = setup({ rules: { runes: true }, tiles: tiles('water'), board: { 1: [card(flat(4)), 1] }, hand0: [card(flat(5), 'x', 'fire')] });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips).toHaveLength(0);
  });

  it('clamps to 1..10', () => {
    const s = setup({ rules: { runes: true }, tiles: tiles('fire'), board: { 4: [card(flat(10), 'x', 'fire'), 0] } });
    expect(sideValue(s, 4, 0)).toBe(10);
  });
});

describe('bonds', () => {
  const bonds: BondDef[] = [{ id: 'b', name: 'Pair', members: ['a', 'b'] }];

  it('gives +1 when touching an allied partner', () => {
    // a at 3 (ours). Place b at 4: b gets +1, beats enemy 5 at 1.
    const s = setup({ rules: { bonds: true }, bonds, board: { 3: [card(flat(1), 'a'), 0], 1: [card(flat(5)), 1] }, hand0: [card(flat(5), 'b')] });
    const r = applyMove(s, { hand: 0, cell: 4 }, bonds);
    expect(r.flips).toHaveLength(1);
    expect(r.bonds).toEqual(['b']);
  });

  it('gives no bonus when the partner is an enemy', () => {
    const s = setup({ rules: { bonds: true }, bonds, board: { 3: [card(flat(9), 'a'), 1], 1: [card(flat(5)), 1] }, hand0: [card(flat(5), 'b')] });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips).toHaveLength(0);
  });
});

describe('formations (Unite Attack)', () => {
  const trio: BondDef[] = [{ id: 'trio', name: 'Trio', members: ['a', 'b', 'c'], shape: 'line' }];

  it('triggers once when a line forms and flips the weakest touching enemy', () => {
    const s = setup({
      rules: { unite: true },
      bonds: trio,
      board: { 0: [card(flat(1), 'a'), 0], 1: [card(flat(1), 'b'), 0], 3: [card(flat(9)), 1], 4: [card([9, 9, 9, 9]), 1], 5: [card([3, 9, 9, 9]), 1] },
      hand0: [card(flat(1), 'c')],
    });
    // c at 2 completes the line 0-1-2. Touching enemies: 3 (top 9), 4 (top 9), 5 (top 3). Weakest = 5.
    const r = applyMove(s, { hand: 0, cell: 2 });
    expect(r.unite).toBe('trio');
    expect(r.flips.filter((f) => f.cause === 'unite').map((f) => f.cell)).toEqual([5]);
    expect(r.state.uniteUsed[0]).toBe(true);
  });

  it('does not trigger for a bent shape when the bond needs a line', () => {
    const s = setup({
      rules: { unite: true }, bonds: trio,
      board: { 0: [card(flat(1), 'a'), 0], 1: [card(flat(1), 'b'), 0], 5: [card(flat(1)), 1] },
      hand0: [card(flat(1), 'c')],
    });
    expect(applyMove(s, { hand: 0, cell: 4 }).unite).toBeNull();
  });

  it('accepts a 2x2 square on 4x4', () => {
    const sq: BondDef[] = [{ id: 'sq', name: 'Square', members: ['a', 'b', 'c', 'd'], shape: 'square' }];
    const s = setup({
      size: 4, rules: { unite: true }, bonds: sq,
      board: { 5: [card(flat(1), 'a'), 0], 6: [card(flat(1), 'b'), 0], 9: [card(flat(1), 'c'), 0], 1: [card(flat(2)), 1] },
      hand0: [card(flat(1), 'd')],
    });
    const r = applyMove(s, { hand: 0, cell: 10 });
    expect(r.unite).toBe('sq');
    expect(r.flips.map((f) => f.cell)).toEqual([1]);
  });
});

describe('end of game', () => {
  function playOut(size: BoardSize) {
    const per = size === 3 ? 5 : 8;
    let s = createGame({
      size, rules: BASE_RULES, tiles: new Array(size * size).fill(null),
      hands: [Array.from({ length: per }, () => card(flat(5))), Array.from({ length: per }, () => card(flat(5)))],
      first: 0, bonds: [],
    });
    let cell = 0;
    while (!isOver(s)) s = applyMove(s, { hand: 0, cell: cell++ }).state;
    return s;
  }

  it('3x3: first player places 5, second keeps one card; leftover counts', () => {
    const s = playOut(3);
    expect(s.hands[0].length).toBe(0);
    expect(s.hands[1].length).toBe(1);
    expect(score(s)).toEqual([5, 5]);
  });

  it('4x4: both players place all 8 cards', () => {
    const s = playOut(4);
    expect(s.hands).toEqual([[], []]);
    expect(score(s)).toEqual([8, 8]);
  });
});

describe('bond reporting', () => {
  it('reports the pair bond, not a formation that also contains both cards', () => {
    const bonds: BondDef[] = [
      { id: 'pair', name: 'Pair', members: ['a', 'b'] },
      { id: 'trio', name: 'Trio', members: ['a', 'b', 'c'], shape: 'line' },
    ];
    const s = setup({ rules: { bonds: true }, bonds, board: { 3: [card(flat(1), 'a'), 0] }, hand0: [card(flat(1), 'b')] });
    expect(applyMove(s, { hand: 0, cell: 4 }, bonds).bonds).toEqual(['pair']);
  });
});

describe('abilities', () => {
  const withAbility = (c: HandCard, ability: HandCard['ability']): HandCard => ({ ...c, ability });

  it('Steadfast blocks Same but not normal flips', () => {
    const s = setup({
      rules: { same: true },
      board: { 1: [withAbility(card([9, 9, 5, 9]), 'steadfast'), 1], 3: [card([9, 5, 9, 9]), 1] },
      hand0: [card([5, 1, 1, 5])],
    });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips.map((f) => f.cell)).toEqual([3]);
    const t = setup({ board: { 1: [withAbility(card(flat(2)), 'steadfast'), 1] }, hand0: [card(flat(5))] });
    expect(applyMove(t, { hand: 0, cell: 4 }).flips.map((f) => f.cell)).toEqual([1]);
  });

  it('Steadfast blocks Combo', () => {
    const s = setup({
      rules: { same: true, combo: true },
      board: {
        1: [card([9, 9, 5, 9]), 1], 3: [card([9, 5, 9, 9]), 1],
        0: [withAbility(card(flat(1)), 'steadfast'), 1],
      },
      hand0: [card([5, 1, 1, 5])],
    });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips.some((f) => f.cell === 0)).toBe(false);
  });

  it('Rally gives +1 on all sides of adjacent allies, max +1, and follows the owner', () => {
    const s = setup({
      board: { 4: [withAbility(card(flat(1)), 'rally'), 0], 0: [withAbility(card(flat(1)), 'rally'), 0], 3: [card(flat(5)), 0] },
    });
    expect([0, 1, 2, 3].map((d) => sideValue(s, 3, d))).toEqual([6, 6, 6, 6]);
    s.board[4]!.owner = 1;
    s.board[0]!.owner = 1;
    expect(sideValue(s, 3, 0)).toBe(5);
  });

  it('Rally helps a placed card win a fight', () => {
    const s = setup({ board: { 3: [withAbility(card(flat(1)), 'rally'), 0], 1: [card(flat(6)), 1] }, hand0: [card([6, 1, 1, 1])] });
    expect(applyMove(s, { hand: 0, cell: 4 }).flips.map((f) => f.cell)).toEqual([1]);
  });

  it('Sabotage weakens the strongest adjacent enemy before attacks', () => {
    // Enemy above (bottom 5) and left (right 3). Placed card has top 5: a tie, so no flip without Sabotage.
    const s = setup({
      board: { 1: [card([9, 9, 5, 9]), 1], 3: [card([9, 3, 9, 9]), 1] },
      hand0: [withAbility(card([5, 1, 1, 1]), 'sabotage')],
    });
    const r = applyMove(s, { hand: 0, cell: 4 });
    expect(r.sabotage).toEqual({ cell: 1, side: 2 });
    expect(r.flips.map((f) => f.cell)).toEqual([1]);
    // The wound stays after the card changes sides.
    expect(sideValue(r.state, 1, 2)).toBe(4);
  });

  it('Rune-born gets +2 on a matching tile and no penalty on others', () => {
    const tiles: (Rune | null)[] = new Array(9).fill(null);
    tiles[4] = 'fire';
    tiles[0] = 'water';
    const s = setup({
      rules: { runes: true }, tiles,
      board: { 4: [withAbility(card(flat(5), 'x', 'fire'), 'runeborn'), 0], 0: [withAbility(card(flat(5), 'y', 'fire'), 'runeborn'), 0] },
    });
    expect(sideValue(s, 4, 0)).toBe(7);
    expect(sideValue(s, 0, 0)).toBe(5);
  });
});
