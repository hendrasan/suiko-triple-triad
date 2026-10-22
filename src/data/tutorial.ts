import { createGame } from '../core/engine';
import type { Ability, FlipCause, GameState, HandCard, Rules, Rune, Side, Values } from '../core/types';
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
  /** The ability this lesson teaches. The test checks that the goal needs it. */
  teaches?: Ability;
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
    text: 'Bonded Stars get +1 on all sides while they touch an ally partner (⛓). The Hero and Nanami are siblings. Place Nanami next to the Hero, under the enemy card.',
    rules: { bonds: true },
    board: [[3, 'hero', [5, 5, 5, 5], 0], [1, 'zamza', [6, 6, 6, 6], 1]],
    hand: [['nanami', [6, 3, 3, 3]]],
    goal: 'basic',
    success: 'With her brother beside her, Nanami\'s 6 became 7. Bonds cost deck slots, so choose them with care.',
  },
  {
    title: 'Formations: Unite Attack',
    text: 'Some bonds are groups of 3 or 4 Stars with a shape: a Line (one straight row or column), a Group (all touching, any shape), or a Square (2×2). Complete the shape on the board for a Unite Attack: once per duel, it flips the weakest enemy card that touches the formation. Gengen and Gabocha are yours. Ridley completes the Kobold Army line.',
    rules: { bonds: true, unite: true },
    board: [[0, 'gengen', [3, 3, 3, 3], 0], [1, 'gabocha', [3, 3, 3, 3], 0], [3, 'zamza', [9, 9, 9, 9], 1], [4, 'rikimaru', [9, 9, 9, 9], 1], [5, 'anita', [3, 9, 9, 9], 1]],
    hand: [['ridley', [1, 1, 1, 1]]],
    goal: 'unite',
    success: 'Unite Attack! The formation flipped the enemy card with the weakest touching side (Anita\'s 3), even though Ridley\'s values are low.',
  },
  {
    title: 'Abilities: Steadfast',
    text: 'Some Earthly Stars have an ability. Its icon is in the bottom-left corner of the card. Steadfast (shield) cannot be flipped by Same, Plus, or Combo. Hans is Steadfast. Use Same in the center and see who stands firm.',
    rules: { same: true },
    board: [[1, 'hans', [8, 8, 6, 8], 1], [3, 'gilbert', [8, 4, 8, 8], 1]],
    hand: [['flik', [6, 2, 2, 4]]],
    goal: 'same',
    teaches: 'steadfast',
    success: 'Same flipped Gilbert, but Hans did not move. Only a higher value can flip a Steadfast card.',
  },
  {
    title: 'Abilities: Rally',
    text: 'Rally (banner): your cards next to a Rally card get +1 on all sides. Leona is yours and has Rally. Nanami\'s 6 ties with the enemy\'s 6… unless she stands next to Leona.',
    rules: {},
    board: [[3, 'leona', [3, 3, 3, 3], 0], [1, 'zamza', [6, 6, 6, 6], 1]],
    hand: [['nanami', [6, 3, 3, 3]]],
    goal: 'basic',
    teaches: 'rally',
    success: 'Leona rallied Nanami to 7. Careful: if a Rally card is flipped, its bonus helps its new owner.',
  },
  {
    title: 'Abilities: Sabotage',
    text: 'Sabotage (dagger): when placed, the strongest enemy card next to it loses 1 on the side that faces it, before the attack. The −1 lasts all game. Hoi\'s top is 5, the same as the enemy\'s bottom. Place him below it.',
    rules: {},
    board: [[1, 'zamza', [5, 5, 5, 5], 1]],
    hand: [['hoi', [5, 2, 2, 2]]],
    goal: 'basic',
    teaches: 'sabotage',
    success: 'Hoi\'s trick dropped the enemy\'s 5 to 4, and then his 5 won.',
  },
  {
    title: 'Abilities: Rune-born',
    text: 'Rune-born (spark): +2 on a matching rune tile, and no −1 on other runes. Mazus is Fire and Rune-born. A normal card would get only +1 on the Fire tile and tie with the 6 above it.',
    rules: { runes: true },
    tiles: { 4: 'fire', 3: 'water' },
    board: [[1, 'zamza', [6, 6, 6, 6], 1]],
    hand: [['mazus', [5, 2, 2, 2]]],
    goal: 'basic',
    teaches: 'runeborn',
    success: 'On the Fire tile Mazus became 7 and won. That is the whole tutorial. Good luck, Hero!',
  },
];

const OFF: Rules = { same: false, plus: false, combo: false, runes: false, bonds: false, unite: false };

export function buildLesson(l: Lesson): GameState {
  const hc = (id: string, values: Values, uid: string): HandCard => ({
    uid, id, values, rune: CARD_BY_ID[id].rune, boost: 0, ability: CARD_BY_ID[id].ability,
  });
  const hand = l.hand.map(([id, v], i) => hc(id, v, `h${i}`));
  const pre = l.board.map(([, id, v], i) => hc(id, v, `b${i}`));
  const tiles: (Rune | null)[] = new Array(9).fill(null);
  for (const [c, r] of Object.entries(l.tiles ?? {})) tiles[+c] = r;
  const g = createGame({ size: 3, rules: { ...OFF, ...l.rules }, tiles, hands: [[...hand, ...pre], []], first: 0, bonds: BONDS });
  g.hands[0] = hand;
  l.board.forEach(([cell, , , owner], i) => (g.board[cell] = { card: pre[i], owner }));
  return g;
}
