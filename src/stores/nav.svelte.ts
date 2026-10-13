// Screen navigation. One screen at a time; params carry the selection.
import type { BoardSize } from '../core/types';

export type Screen =
  | { name: 'map' }
  | { name: 'prep'; opponent: string }
  | { name: 'duel'; opponent: string; mode: BoardSize; seed: number }
  | { name: 'decks'; mode?: BoardSize }
  | { name: 'collection' }
  | { name: 'tavern' }
  | { name: 'tutorial' }
  | { name: 'settings' };

export const nav: { screen: Screen } = $state({ screen: { name: 'map' } });

export function go(screen: Screen): void {
  nav.screen = screen;
  if (typeof window !== 'undefined') window.scrollTo(0, 0);
}
