// Pure rules engine. No UI imports. Used by the duel UI, the AI worker, and the tests.
import { CONFIG } from './config';
import { makeRng } from './rng';
import type {
  BoardSize, BondDef, FlipCause, FlipEvent, Formation, GameState, HandCard, Move, MoveResult,
  PlacedCard, Rune, Rules, Side, Teleport,
} from './types';

/** Directions: 0 top, 1 right, 2 bottom, 3 left. */
export const DIRS = [0, 1, 2, 3] as const;
const opposite = (d: number) => (d + 2) % 4;

export function neighbor(size: number, cell: number, d: number): number {
  const r = Math.floor(cell / size);
  const c = cell % size;
  if (d === 0) return r > 0 ? cell - size : -1;
  if (d === 1) return c < size - 1 ? cell + 1 : -1;
  if (d === 2) return r < size - 1 ? cell + size : -1;
  return c > 0 ? cell - 1 : -1;
}

export interface NewGame {
  size: BoardSize;
  rules: Rules;
  tiles: (Rune | null)[];
  hands: [HandCard[], HandCard[]];
  first: Side;
  bonds: BondDef[];
  /** Duel seed. Only needed for Teleport. */
  seed?: number;
}

export function createGame(g: NewGame): GameState {
  const ids = new Set([...g.hands[0], ...g.hands[1]].map((c) => c.id));
  const bondMap: Record<string, string[]> = {};
  const formations: Formation[] = [];
  for (const b of g.bonds) {
    const present = b.members.filter((m) => ids.has(m));
    if (present.length < 2) continue;
    for (const a of present) {
      for (const o of present) {
        if (a !== o) (bondMap[a] ??= []).push(o);
      }
    }
    if (b.shape && b.members.length >= 3 && present.length === b.members.length) {
      formations.push({ id: b.id, members: b.members, shape: b.shape });
    }
  }
  return {
    size: g.size,
    rules: g.rules,
    tiles: g.tiles.slice(),
    board: new Array(g.size * g.size).fill(null),
    hands: [g.hands[0].slice(), g.hands[1].slice()],
    turn: g.first,
    first: g.first,
    moveNo: 0,
    bondMap,
    formations,
    uniteUsed: [false, false],
    seed: g.seed,
  };
}

export function clone(s: GameState): GameState {
  return {
    ...s,
    board: s.board.map((p) => (p ? { ...p } : null)),
    hands: [s.hands[0].slice(), s.hands[1].slice()],
    uniteUsed: [s.uniteUsed[0], s.uniteUsed[1]],
  };
}

const clamp = (v: number) => (v < 1 ? 1 : v > 10 ? 10 : v);

export function runeMod(rune: Rune | null, tile: Rune | null, ability?: HandCard['ability']): number {
  if (!tile || !rune) return 0;
  if (ability === 'runeborn') return rune === tile ? CONFIG.runeBornMatch : 0;
  return rune === tile ? CONFIG.runeMatch : CONFIG.runeMismatch;
}

/** Steadfast cards cannot be flipped by Same, Plus, or Combo. */
export function isSteadfast(s: GameState, cell: number): boolean {
  return s.board[cell]?.card.ability === 'steadfast';
}

export function isBonded(s: GameState, a: string, b: string): boolean {
  const list = s.bondMap[a];
  return !!list && list.includes(b);
}

/** True when the card at `cell` touches an allied bond partner. */
export function hasBondPartner(s: GameState, cell: number): boolean {
  const p = s.board[cell];
  if (!p) return false;
  for (const d of DIRS) {
    const n = neighbor(s.size, cell, d);
    const q = n >= 0 ? s.board[n] : null;
    if (q && q.owner === p.owner && isBonded(s, p.card.id, q.card.id)) return true;
  }
  return false;
}

/** True when an allied Rally card touches the card at `cell`. Follows the Rally card's current owner. */
export function hasRally(s: GameState, cell: number): boolean {
  const p = s.board[cell];
  if (!p) return false;
  for (const d of DIRS) {
    const n = neighbor(s.size, cell, d);
    const q = n >= 0 ? s.board[n] : null;
    if (q && q.owner === p.owner && q.card.ability === 'rally') return true;
  }
  return false;
}

/** The value a placed card shows on side d, with all modifiers. */
export function sideValue(s: GameState, cell: number, d: number): number {
  const p = s.board[cell] as PlacedCard;
  let v = p.card.values[d] + p.card.boost - (p.wound?.[d] ?? 0);
  if (s.rules.runes) v += runeMod(p.card.rune, s.tiles[cell], p.card.ability);
  if (s.rules.bonds && hasBondPartner(s, cell)) v += CONFIG.bondBonus;
  if (hasRally(s, cell)) v += CONFIG.rallyBonus;
  return clamp(v);
}

/** The four values a hand card would show if placed on `cell` right now (for previews). */
export function previewValues(s: GameState, card: HandCard, cell: number, owner: Side): number[] {
  const t = clone(s);
  t.board[cell] = { card, owner };
  return DIRS.map((d) => sideValue(t, cell, d));
}

export function emptyCells(s: GameState): number[] {
  const out: number[] = [];
  s.board.forEach((p, i) => { if (!p) out.push(i); });
  return out;
}

export function legalMoves(s: GameState): Move[] {
  const moves: Move[] = [];
  const cells = emptyCells(s);
  s.hands[s.turn].forEach((_, h) => cells.forEach((cell) => moves.push({ hand: h, cell })));
  return moves;
}

export function isOver(s: GameState): boolean {
  return s.board.every((p) => p !== null);
}

/** Cards owned on the board plus cards left in hand. */
export function score(s: GameState): [number, number] {
  const out: [number, number] = [s.hands[0].length, s.hands[1].length];
  for (const p of s.board) if (p) out[p.owner]++;
  return out;
}

export function activeBondPairs(s: GameState, side: Side): number {
  let n = 0;
  s.board.forEach((p, cell) => {
    if (!p || p.owner !== side) return;
    for (const d of [1, 2]) {
      const m = neighbor(s.size, cell, d);
      const q = m >= 0 ? s.board[m] : null;
      if (q && q.owner === side && isBonded(s, p.card.id, q.card.id)) n++;
    }
  });
  return n;
}

function bondIdsFor(s: GameState, bonds: BondDef[] | undefined, a: string, b: string): string[] {
  if (!bonds) return [];
  const both = bonds.filter((x) => x.members.includes(a) && x.members.includes(b));
  // Prefer the pair bond. A formation only counts here when no pair covers these two cards.
  const pairs = both.filter((x) => !x.shape);
  return (pairs.length ? pairs : both).map((x) => x.id);
}

// ---------- Formations ----------

function coords(size: number, cell: number) {
  return [Math.floor(cell / size), cell % size] as const;
}

export function shapeMatches(size: number, cells: number[], shape: Formation['shape']): boolean {
  const pts = cells.map((c) => coords(size, c));
  const rows = pts.map((p) => p[0]);
  const cols = pts.map((p) => p[1]);
  const rSpan = Math.max(...rows) - Math.min(...rows);
  const cSpan = Math.max(...cols) - Math.min(...cols);
  if (shape === 'square') return cells.length === 4 && rSpan === 1 && cSpan === 1;
  if (shape === 'line') {
    return (rSpan === 0 && cSpan === cells.length - 1) || (cSpan === 0 && rSpan === cells.length - 1);
  }
  // connected: flood fill
  const set = new Set(cells);
  const seen = new Set([cells[0]]);
  const stack = [cells[0]];
  while (stack.length) {
    const c = stack.pop() as number;
    for (const d of DIRS) {
      const n = neighbor(size, c, d);
      if (n >= 0 && set.has(n) && !seen.has(n)) { seen.add(n); stack.push(n); }
    }
  }
  return seen.size === cells.length;
}

/** Returns the cells of a complete formation owned by `side`, or null. */
export function findFormation(s: GameState, side: Side): { id: string; cells: number[] } | null {
  for (const f of s.formations) {
    const cells: number[] = [];
    for (const m of f.members) {
      const cell = s.board.findIndex((p) => p !== null && p.owner === side && p.card.id === m);
      if (cell < 0) break;
      cells.push(cell);
    }
    if (cells.length === f.members.length && shapeMatches(s.size, cells, f.shape)) {
      return { id: f.id, cells };
    }
  }
  return null;
}

/** Enemy cards next to the formation, weakest touching value first. */
function uniteTargets(s: GameState, side: Side, cells: number[]): number[] {
  const best = new Map<number, number>();
  for (const c of cells) {
    for (const d of DIRS) {
      const n = neighbor(s.size, c, d);
      const q = n >= 0 ? s.board[n] : null;
      if (!q || q.owner === side) continue;
      const v = sideValue(s, n, opposite(d));
      best.set(n, Math.min(best.get(n) ?? 99, v));
    }
  }
  const total = (n: number) => DIRS.reduce((a: number, d) => a + sideValue(s, n, d), 0);
  return [...best.keys()].sort((a, b) => best.get(a)! - best.get(b)! || total(a) - total(b) || a - b);
}

// ---------- Teleport (Viki) ----------

/** A roll in [0, 1) from the duel seed, the move number, and a salt. The same duel gives the same rolls. */
const roll = (seed: number, moveNo: number, salt: number) => makeRng(seed + moveNo * 7919 + salt * 104729)();

/**
 * Start of a turn: a Teleport card of the side to move may jump to a random empty cell
 * (CONFIG.teleportChance). On arrival it flips weaker neighbors with the basic rule only.
 * Returns null when nothing happens. Needs `state.seed`, so the AI search never sees a jump.
 */
export function teleport(state: GameState): { state: GameState; teleport: Teleport } | null {
  if (state.seed === undefined) return null;
  const me = state.turn;
  const from = state.board.findIndex((p) => p !== null && p.owner === me && p.card.ability === 'teleport');
  const empty = emptyCells(state);
  if (from < 0 || !empty.length || roll(state.seed, state.moveNo, 1) >= CONFIG.teleportChance) return null;
  const to = empty[Math.floor(roll(state.seed, state.moveNo, 2) * empty.length)];

  const s = clone(state);
  s.board[to] = s.board[from];
  s.board[from] = null;
  // Compare every side first, then flip, the same as a placement.
  const targets = DIRS.map((d) => neighbor(s.size, to, d)).filter((n, d) => {
    const q = n >= 0 ? s.board[n] : null;
    return !!q && q.owner !== me && sideValue(s, to, d) > sideValue(s, n, opposite(d));
  });
  const flips: FlipEvent[] = targets.map((cell) => {
    (s.board[cell] as PlacedCard).owner = me;
    return { cell, cause: 'basic', step: 1, to: me };
  });
  return { state: s, teleport: { from, to, owner: me, flips } };
}

// ---------- Placement ----------

/**
 * Place a card and resolve every flip. Returns a new state; the input is not changed.
 * `bonds` is optional and only used to report which bond ids became active.
 */
export function applyMove(state: GameState, move: Move, bonds?: BondDef[]): MoveResult {
  const s = clone(state);
  const me = s.turn;
  const card = s.hands[me][move.hand];
  if (!card || s.board[move.cell]) throw new Error('Illegal move');
  s.hands[me].splice(move.hand, 1);
  s.board[move.cell] = { card, owner: me };
  s.moveNo++;

  const flips: FlipEvent[] = [];
  const flipped = new Set<number>();
  const flip = (cell: number, cause: FlipCause, step: number) => {
    (s.board[cell] as PlacedCard).owner = me;
    flipped.add(cell);
    flips.push({ cell, cause, step, to: me });
  };

  const P = move.cell;
  const nbrs = DIRS.map((d) => neighbor(s.size, P, d));

  // Sabotage acts first: the adjacent enemy with the highest facing value loses 1 on that side.
  let sabotage: MoveResult['sabotage'] = null;
  if (card.ability === 'sabotage') {
    let best = -1;
    for (const d of DIRS) {
      const n = nbrs[d];
      const q = n >= 0 ? s.board[n] : null;
      if (!q || q.owner === me) continue;
      const v = sideValue(s, n, opposite(d));
      if (v > best) { best = v; sabotage = { cell: n, side: opposite(d) }; }
    }
    if (sabotage) {
      const q = s.board[sabotage.cell] as PlacedCard;
      const wound = [...(q.wound ?? [0, 0, 0, 0])];
      wound[sabotage.side] += CONFIG.sabotagePenalty;
      s.board[sabotage.cell] = { ...q, wound };
    }
  }

  const mine = DIRS.map((d) => (nbrs[d] >= 0 && s.board[nbrs[d]] ? sideValue(s, P, d) : 0));
  const theirs = DIRS.map((d) => (nbrs[d] >= 0 && s.board[nbrs[d]] ? sideValue(s, nbrs[d], opposite(d)) : 0));
  const isEnemy = (cell: number) => cell >= 0 && !!s.board[cell] && s.board[cell]!.owner !== me;
  const special: number[] = [];

  if (s.rules.same) {
    const match = DIRS.filter((d) => nbrs[d] >= 0 && s.board[nbrs[d]] && mine[d] === theirs[d]);
    if (match.length >= CONFIG.sameThreshold) {
      for (const d of match) {
        const n = nbrs[d];
        if (isEnemy(n) && !flipped.has(n) && !isSteadfast(s, n)) { flip(n, 'same', 1); special.push(n); }
      }
    }
  }
  if (s.rules.plus) {
    const groups = new Map<number, number[]>();
    for (const d of DIRS) {
      if (nbrs[d] < 0 || !s.board[nbrs[d]]) continue;
      const sum = mine[d] + theirs[d];
      groups.set(sum, [...(groups.get(sum) ?? []), d]);
    }
    for (const ds of groups.values()) {
      if (ds.length < CONFIG.plusThreshold) continue;
      for (const d of ds) {
        const n = nbrs[d];
        if (isEnemy(n) && !flipped.has(n) && !isSteadfast(s, n)) { flip(n, 'plus', 1); special.push(n); }
      }
    }
  }
  for (const d of DIRS) {
    const n = nbrs[d];
    if (isEnemy(n) && !flipped.has(n) && mine[d] > theirs[d]) flip(n, 'basic', 1);
  }

  const last = s.board.every((p) => p !== null);
  if (s.rules.combo && !(last && CONFIG.noComboOnLast)) {
    const queue = special.map((cell) => ({ cell, step: 1 }));
    while (queue.length) {
      const { cell, step } = queue.shift()!;
      for (const d of DIRS) {
        const n = neighbor(s.size, cell, d);
        if (!isEnemy(n) || isSteadfast(s, n)) continue;
        if (sideValue(s, cell, d) > sideValue(s, n, opposite(d))) {
          flip(n, 'combo', step + 1);
          queue.push({ cell: n, step: step + 1 });
        }
      }
    }
  }

  let unite: string | null = null;
  if (s.rules.unite && !s.uniteUsed[me]) {
    const f = findFormation(s, me);
    if (f) {
      s.uniteUsed[me] = true;
      unite = f.id;
      const step = flips.reduce((a, e) => Math.max(a, e.step), 0) + 1;
      for (const t of uniteTargets(s, me, f.cells).slice(0, CONFIG.uniteFlips[s.size])) flip(t, 'unite', step);
    }
  }

  // Report bonds that touch the placed card or any card that changed sides.
  const bondIds = new Set<string>();
  if (s.rules.bonds) {
    for (const cell of [P, ...flipped]) {
      const p = s.board[cell] as PlacedCard;
      for (const d of DIRS) {
        const n = neighbor(s.size, cell, d);
        const q = n >= 0 ? s.board[n] : null;
        if (q && q.owner === me && isBonded(s, p.card.id, q.card.id)) {
          bondIdsFor(s, bonds, p.card.id, q.card.id).forEach((id) => bondIds.add(id));
        }
      }
    }
  }

  s.turn = (1 - me) as Side;
  return { state: s, flips, bonds: [...bondIds], unite, sabotage };
}
