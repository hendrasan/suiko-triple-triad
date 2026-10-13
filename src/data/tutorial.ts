import { createGame } from '../core/engine';
import type { FlipCause, GameState, HandCard, Rules, Rune, Side, Values } from '../core/types';
import { BONDS } from './bonds';
import { CARD_BY_ID } from './cards';

export interface Lesson {
  title: string;
  text: string;
  rules: Partial<Rules>;
  tiles?: Record<number, Rune>;
  /** [cell, card id, values, owner]. Real ids for the portraits; values are set for the lesson. */
  board: [number, string, Values, Side][];
  hand: [string, Values][];
  goal: FlipCause;
  success: string;
}

// 3x3 cells:  0 1 2 / 3 4 5 / 6 7 8
export const LESSONS: Lesson[] = [
  {
    title: 'Flip a card',
    text: 'Each card has four values: top, right, bottom, left. When you place a card, it attacks each enemy card it touches. A higher value on your side flips the enemy card to you. Select Nanami, then place her below the enemy card.',
    rules: {},
    board: [[1, 'zamza', [4, 4, 3, 4], 1]],
    hand: [['nanami', [7, 2, 2, 2]]],
    goal: 'basic',
    success: 'Nanami\'s top 7 beats the 3 above her. The card is yours. At the end, the side that owns more cards wins.',
  },
  {
    title: 'Same',
    text: 'Same: when your card\'s values equal the touching values on two or more sides, those enemy cards flip. Board edges never count. Find the cell where 6 meets 6 and 4 meets 4.',
    rules: { same: true },
    board: [[1, 'rikimaru', [8, 8, 6, 8], 1], [3, 'gilbert', [8, 4, 8, 8], 1]],
    hand: [['flik', [6, 2, 2, 4]]],
    goal: 'same',
    success: 'Both sides matched, so both enemy cards flipped, even though Flik\'s values were not higher.',
  },
  {
    title: 'Plus',
    text: 'Plus: add your value to each touching enemy value. If two or more sums are equal, those cards flip. Try the center cell: 5 + 3 = 8 and 3 + 5 = 8.',
    rules: { plus: true },
    board: [[1, 'anita', [9, 9, 3, 9], 1], [5, 'hanna', [9, 9, 9, 5], 1]],
    hand: [['viktor', [5, 3, 1, 1]]],
    goal: 'plus',
    success: 'Equal sums on two sides: Plus flipped both cards.',
  },
  {
    title: 'Combo',
    text: 'Combo: a card flipped by Same or Plus attacks its own neighbors with normal rules. Chains can sweep the board. Use Same in the center again, and watch the chain.',
    rules: { same: true, combo: true },
    board: [[1, 'rikimaru', [8, 8, 6, 9], 1], [3, 'gilbert', [8, 4, 8, 8], 1], [0, 'zamza', [3, 2, 3, 3], 1]],
    hand: [['flik', [6, 2, 2, 4]]],
    goal: 'combo',
    success: 'The card flipped by Same turned its left 9 on the corner card. That is a Combo.',
  },
  {
    title: 'Rune tiles',
    text: 'Some cells carry a rune. A card on a matching rune gets +1 on all sides. A card on a different rune gets −1. Anita is Fire. Her 4 cannot beat the 4 above the Fire tile… unless she stands on it.',
    rules: { runes: true },
    tiles: { 4: 'fire', 3: 'water' },
    board: [[1, 'zamza', [4, 4, 4, 4], 1]],
    hand: [['anita', [4, 4, 4, 4]]],
    goal: 'basic',
    success: 'On the Fire tile Anita\'s values became 5. Green values are raised, red values are lowered.',
  },
  {
    title: 'Bonds',
    text: 'Bonded Stars get +1 on all sides while they touch an ally partner (⛓). The Hero and Nanami are siblings. Place Nanami next to the Hero, under the enemy card. Three or four bonded cards in the right shape trigger a Unite Attack once per duel: a free flip of the weakest touching enemy.',
    rules: { bonds: true },
    board: [[3, 'hero', [5, 5, 5, 5], 0], [1, 'zamza', [6, 6, 6, 6], 1]],
    hand: [['nanami', [6, 3, 3, 3]]],
    goal: 'basic',
    success: 'With her brother beside her, Nanami\'s 6 became 7. Bonds cost deck slots, so choose them with care.',
  },
];

const OFF: Rules = { same: false, plus: false, combo: false, runes: false, bonds: false, unite: false };

export function buildLesson(l: Lesson): GameState {
  const hc = (id: string, values: Values, uid: string): HandCard => ({ uid, id, values, rune: CARD_BY_ID[id].rune, boost: 0 });
  const hand = l.hand.map(([id, v], i) => hc(id, v, `h${i}`));
  const pre = l.board.map(([, id, v], i) => hc(id, v, `b${i}`));
  const tiles: (Rune | null)[] = new Array(9).fill(null);
  for (const [c, r] of Object.entries(l.tiles ?? {})) tiles[+c] = r;
  const g = createGame({ size: 3, rules: { ...OFF, ...l.rules }, tiles, hands: [[...hand, ...pre], []], first: 0, bonds: BONDS });
  g.hands[0] = hand;
  l.board.forEach(([cell, , , owner], i) => (g.board[cell] = { card: pre[i], owner }));
  return g;
}
