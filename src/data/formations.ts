import type { BondDef } from '../core/types';

export type Shape = NonNullable<BondDef['shape']>;

/** Player-facing names and rules for formation shapes. `example` cells are on a 3x3 grid (row-major). */
export const SHAPES: Record<Shape, { name: string; text: string; example: number[] }> = {
  line: { name: 'Line', text: 'All members side by side in one straight row or column.', example: [3, 4, 5] },
  connected: { name: 'Group', text: 'All members touch each other in one block, in any shape (a line or an L).', example: [1, 4, 5] },
  square: { name: 'Square', text: 'Four members in a 2×2 block.', example: [0, 1, 3, 4] },
};

export const UNITE_TEXT =
  'Complete the formation on the board for a Unite Attack: once per duel, it flips the weakest enemy card that touches the formation.';
