// Reactive save store. Mutate through the functions here; each one persists.
import { CONFIG } from '../core/config';
import type { BoardSize } from '../core/types';
import { CARD_BY_ID } from '../data/cards';
import { REGIONS } from '../data/opponents';
import { regionOpen } from '../core/progress';
import { migrate, newSave, type SaveData } from './saveData';

const KEY = 'suiko-tt-save';

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {
    console.warn('Save could not be loaded. Starting fresh.', e);
  }
  return newSave();
}

export const save: SaveData = $state(load());

export function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

export function replaceSave(next: SaveData): void {
  Object.assign(save, next);
  persist();
}

export function exportSave(): string {
  return JSON.stringify(save, null, 2);
}

export function importSave(text: string): void {
  replaceSave(migrate(JSON.parse(text)));
}

export function resetSave(): void {
  replaceSave(newSave());
}

export function addCard(id: string, via: string): boolean {
  if (save.owned.includes(id)) return false;
  save.owned.push(id);
  save.via[id] = via;
  return true;
}

export function ownedSet(): Set<string> {
  return new Set(save.owned);
}

export function openRegions(): Set<string> {
  return new Set(REGIONS.filter((r) => regionOpen(r, save.owned.length, save.beaten)).map((r) => r.id));
}

export function activeDeck(mode: BoardSize): string[] {
  return save.decks[mode][save.activeSlot[mode]];
}

export function deckCost(deck: string[]): number {
  return deck.reduce((a, id) => a + CONFIG.costs[CARD_BY_ID[id].tier], 0);
}

/** Null when the deck is legal, otherwise the reason. */
export function deckProblem(deck: string[], mode: BoardSize): string | null {
  const need = CONFIG.deckSize[mode];
  if (deck.length !== need) return `Needs ${need} cards (has ${deck.length}).`;
  if (mode === 4 && deckCost(deck) > CONFIG.costCap) return `Cost ${deckCost(deck)} is over the cap of ${CONFIG.costCap}.`;
  return null;
}
