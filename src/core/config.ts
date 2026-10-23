import type { BoardSize, Rules, Tier } from './types';

// All tunable numbers live here. Change values, not code.
export const CONFIG = {
  /** Minimum matching sides to trigger Same / Plus. Board edges never match. */
  sameThreshold: 2,
  plusThreshold: 2,
  /** Number of free flips from one Unite Attack, per board size. */
  uniteFlips: { 3: 1, 4: 1 } as Record<BoardSize, number>,
  /** When true, the last placement of a game cannot start Combo chains. */
  noComboOnLast: false,
  /** Bonus that the side with the parity handicap gives to one card in casual duels. */
  handicapBonus: 1,
  /** Which side gets the handicap in casual duels, per board size.
   *  3x3: none. The first player gets the last placement, but the second player keeps one card that
   *  counts and cannot be flipped, so the two cancel out.
   *  4x4: the first player. Nobody keeps a card, and the second player gets the last move. */
  handicapSide: { 3: null, 4: 'first' } as Record<BoardSize, 'first' | 'second' | null>,
  /** Bonus to each side of a card that touches an allied bond partner. Max one bonus per card. */
  bondBonus: 1,
  runeMatch: 1,
  runeMismatch: -1,
  /** Abilities. Rune-born: bonus on a matching tile, and no penalty on other runes. */
  runeBornMatch: 2,
  /** Rally: bonus to all sides of allied cards next to a Rally card (max one bonus per card). */
  rallyBonus: 1,
  /** Sabotage: lasting penalty on one side of the strongest adjacent enemy card. */
  sabotagePenalty: 1,
  /** A card with an ability has this many fewer stat points in its budget. */
  abilityStatCost: 2,
  deckSize: { 3: 5, 4: 8 } as Record<BoardSize, number>,
  /** Quad Quartet deck cost cap. Triple Triad has no cap. */
  costCap: 30,
  costs: { support: 2, fighter: 3, elite: 4, legend: 5, boss: 5 } as Record<Tier, number>,
  /** Stat budget per tier: sum of the four values, and the highest single value. */
  budgets: {
    support: { min: 14, max: 17, maxSide: 7 },
    fighter: { min: 17, max: 20, maxSide: 8 },
    elite: { min: 21, max: 23, maxSide: 9 },
    legend: { min: 24, max: 28, maxSide: 10 },
    boss: { min: 28, max: 31, maxSide: 10 },
  } as Record<Tier, { min: number; max: number; maxSide: number }>,
  runeTileCount: { 3: [1, 2], 4: [3, 4] } as Record<BoardSize, [number, number]>,
  /** AI time budget per move, ms. */
  aiTimeMs: 350,
};

export const BASE_RULES: Rules = {
  same: false,
  plus: false,
  combo: false,
  runes: true,
  bonds: true,
  unite: true,
};

export const ALL_RULES: Rules = { ...BASE_RULES, same: true, plus: true, combo: true };
