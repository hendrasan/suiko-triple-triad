// Match flow: hands, coin flip, handicap, best-of-two, and the per-game log used by recruit quests.
import { CARD_BY_ID } from '../data/cards';
import type { OpponentDef } from '../data/schema';
import { CONFIG } from './config';
import { makeRng, shuffle } from './rng';
import type { BoardSize, GameState, HandCard, Move, MoveResult, Rune, Side } from './types';

export function toHand(ids: string[], side: Side): HandCard[] {
  return ids.map((id, i) => {
    const c = CARD_BY_ID[id];
    return { uid: `${side}-${i}-${id}`, id, values: [...c.values], rune: c.rune, boost: 0 };
  });
}

export function tilesFor(opp: OpponentDef, mode: BoardSize): (Rune | null)[] {
  const t: (Rune | null)[] = new Array(mode * mode).fill(null);
  for (const [cell, rune] of opp.tiles[mode]) t[cell] = rune;
  return t;
}

/** The opponent always brings the same cards to one match (seeded). */
export function opponentDeck(opp: OpponentDef, mode: BoardSize, seed: number): string[] {
  return mode === 4 ? opp.deck.slice() : shuffle(makeRng(seed), opp.deck).slice(0, CONFIG.deckSize[3]);
}

export interface GameSetup {
  first: Side;
  hands: [HandCard[], HandCard[]];
  /** Side that may boost one card (casual duels only), or null. */
  handicap: Side | null;
}

export function setupGame(opp: OpponentDef, mode: BoardSize, playerDeck: string[], seed: number, gameNo: number, prevFirst?: Side): GameSetup {
  const rng = makeRng(seed + 7919 * (gameNo + 1));
  const first: Side = gameNo === 0 || prevFirst === undefined ? (rng() < 0.5 ? 0 : 1) : ((1 - prevFirst) as Side);
  const who = opp.format === 'single' ? CONFIG.handicapSide[mode] : null;
  const handicap: Side | null = who === 'first' ? first : who === 'second' ? ((1 - first) as Side) : null;
  return { first, hands: [toHand(playerDeck, 0), toHand(opponentDeck(opp, mode, seed), 1)], handicap };
}

export function boostCard(hand: HandCard[], index: number): HandCard[] {
  return hand.map((c, i) => (i === index ? { ...c, boost: c.boost + CONFIG.handicapBonus } : c));
}

/** AI handicap choice: boost its strongest card. */
export function aiBoostPick(hand: HandCard[]): number {
  const sum = (c: HandCard) => c.values.reduce((a, v) => a + v, 0);
  return hand.reduce((best, c, i) => (sum(c) > sum(hand[best]) ? i : best), 0);
}

// ---------- Game log ----------

export interface GameLog {
  first: Side;
  moves: Move[];
  /** Player stats only. */
  flipsMax: number;
  same: boolean;
  plus: boolean;
  /** Highest combo step reached (a first combo flip is step 2). */
  comboMax: number;
  unite: boolean;
  bonds: string[];
  runeTiles: Rune[];
  /** Player cards flipped by the opponent. */
  lost: number;
  score: [number, number];
}

export function newLog(first: Side): GameLog {
  return { first, moves: [], flipsMax: 0, same: false, plus: false, comboMax: 0, unite: false, bonds: [], runeTiles: [], lost: 0, score: [0, 0] };
}

export function record(log: GameLog, before: GameState, move: Move, r: MoveResult): void {
  log.moves.push(move);
  const mover = before.turn;
  if (mover === 1) {
    log.lost += r.flips.length;
    return;
  }
  const card = before.hands[0][move.hand];
  log.flipsMax = Math.max(log.flipsMax, r.flips.length);
  log.same ||= r.flips.some((f) => f.cause === 'same');
  log.plus ||= r.flips.some((f) => f.cause === 'plus');
  for (const f of r.flips) if (f.cause === 'combo') log.comboMax = Math.max(log.comboMax, f.step);
  log.unite ||= !!r.unite;
  for (const b of r.bonds) if (!log.bonds.includes(b)) log.bonds.push(b);
  const tile = before.tiles[move.cell];
  if (before.rules.runes && tile && tile === card.rune && !log.runeTiles.includes(tile)) log.runeTiles.push(tile);
}

// ---------- Match summary ----------

export interface MatchSummary {
  opponent: string;
  mode: BoardSize;
  deck: string[];
  won: boolean;
  draw: boolean;
  games: { score: [number, number]; first: Side }[];
  flawless: boolean;
  flipsMax: number;
  same: boolean;
  plus: boolean;
  comboMax: number;
  unite: boolean;
  bonds: string[];
  runeTiles: Rune[];
  /** Won at least one game while moving second. */
  second: boolean;
  /** Best single-game player score. */
  score: number;
  seed: number;
}

export function summarize(opp: OpponentDef, mode: BoardSize, deck: string[], logs: GameLog[], seed: number): MatchSummary {
  const gameWins = logs.map((l) => Math.sign(l.score[0] - l.score[1]));
  const wins = gameWins.filter((w) => w > 0).length;
  const losses = gameWins.filter((w) => w < 0).length;
  const total = logs.reduce((a, l) => [a[0] + l.score[0], a[1] + l.score[1]], [0, 0]);
  // Best of two: game wins first, total cards owned break ties.
  const outcome = wins !== losses ? Math.sign(wins - losses) : Math.sign(total[0] - total[1]);
  const won = outcome > 0;
  return {
    opponent: opp.id, mode, deck, won, draw: outcome === 0, seed,
    games: logs.map((l) => ({ score: l.score, first: l.first })),
    flawless: logs.every((l) => l.lost === 0),
    flipsMax: Math.max(...logs.map((l) => l.flipsMax)),
    same: logs.some((l) => l.same),
    plus: logs.some((l) => l.plus),
    comboMax: Math.max(...logs.map((l) => l.comboMax)),
    unite: logs.some((l) => l.unite),
    bonds: [...new Set(logs.flatMap((l) => l.bonds))],
    runeTiles: [...new Set(logs.flatMap((l) => l.runeTiles))],
    second: logs.some((l, i) => l.first === 1 && gameWins[i] > 0),
    score: Math.max(...logs.map((l) => l.score[0])),
  };
}
