import type { Ability } from '../core/types';

export const ABILITIES: Record<Ability, { name: string; text: string }> = {
  steadfast: { name: 'Steadfast', text: 'Same, Plus, and Combo cannot flip this card. Normal flips can.' },
  rally: { name: 'Rally', text: 'Allied cards next to this card get +1 on the side that touches it. If it flips, the bonus goes to its new owner.' },
  sabotage: { name: 'Sabotage', text: 'When placed, the strongest enemy card next to it loses 1 on the side that faces it, before attacks. The −1 lasts all game.' },
  runeborn: { name: 'Rune-born', text: 'On a matching rune tile: +2 instead of +1. On another rune: no penalty.' },
};
