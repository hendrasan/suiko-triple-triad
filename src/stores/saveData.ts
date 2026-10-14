// Versioned save format. Pure functions; the reactive store wraps them.
import { CONFIG } from '../core/config';
import type { BoardSize } from '../core/types';
import { CARD_BY_ID } from '../data/cards';
import { STARTERS } from '../data/recruits';

export const SAVE_VERSION = 2;
export const SLOTS = 3;

export interface Settings {
  skipAnimations: boolean;
  sound: boolean;
  reducedMotion: 'auto' | 'on' | 'off';
}

export interface LastDuel { opponent: string; mode: BoardSize; seed: number; moves: { hand: number; cell: number }[][] }

export interface SaveData {
  version: number;
  owned: string[];
  /** How each card joined, for the collection screen. */
  via: Record<string, string>;
  decks: Record<BoardSize, string[][]>;
  activeSlot: Record<BoardSize, number>;
  /** Opponent id -> wins per mode. */
  beaten: Record<string, Record<BoardSize, number>>;
  stats: { duels: number; wins: number };
  tutorialDone: boolean;
  settings: Settings;
  lastDuel: LastDuel | null;
  /** Phase 2 hooks. Not used yet. */
  castle?: Record<string, unknown>;
  cardBack?: string;
}

export function defaultDeck(owned: string[], mode: BoardSize): string[] {
  // Starters sorted by strength, kept under the cost cap for 4x4.
  const sum = (id: string) => CARD_BY_ID[id].values.reduce((a, v) => a + v, 0);
  const sorted = [...owned].sort((a, b) => sum(b) - sum(a));
  const deck: string[] = [];
  let cost = 0;
  for (const id of sorted) {
    if (deck.length >= CONFIG.deckSize[mode]) break;
    const c = CONFIG.costs[CARD_BY_ID[id].rarity];
    if (mode === 4 && cost + c > CONFIG.costCap) continue;
    deck.push(id);
    cost += c;
  }
  return deck;
}

export function newSave(): SaveData {
  return {
    version: SAVE_VERSION,
    owned: [...STARTERS],
    via: Object.fromEntries(STARTERS.map((id) => [id, 'starter'])),
    decks: {
      3: [defaultDeck(STARTERS, 3), [], []],
      4: [defaultDeck(STARTERS, 4), [], []],
    },
    activeSlot: { 3: 0, 4: 0 },
    beaten: {},
    stats: { duels: 0, wins: 0 },
    tutorialDone: false,
    settings: { skipAnimations: false, sound: true, reducedMotion: 'auto' },
    lastDuel: null,
  };
}

/** migrations[n] upgrades a version-n save to version n+1. Add one per format change. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MIGRATIONS: Record<number, (s: any) => any> = {
  // v2: sound effects are on by default. Turn them on once for older saves.
  1: (s) => ({ ...s, version: 2, settings: { ...s.settings, sound: true } }),
};

/** Parse, upgrade, and repair a save. Throws on data that is not a save. */
export function migrate(raw: unknown): SaveData {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as SaveData).owned)) throw new Error('Not a save file');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s: any = raw;
  let v = typeof s.version === 'number' ? s.version : 1;
  if (v > SAVE_VERSION) throw new Error(`Save is from a newer version (${v})`);
  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`No migration from version ${v}`);
    s = step(s);
    v++;
  }
  // Fill missing fields from defaults and drop unknown card ids.
  const base = newSave();
  const out: SaveData = { ...base, ...s, version: SAVE_VERSION, settings: { ...base.settings, ...s.settings } };
  out.owned = [...new Set<string>(out.owned.filter((id: string) => CARD_BY_ID[id]))];
  for (const m of [3, 4] as BoardSize[]) {
    const slots = Array.isArray(out.decks?.[m]) ? out.decks[m] : base.decks[m];
    out.decks = { ...out.decks, [m]: Array.from({ length: SLOTS }, (_, i) => (slots[i] ?? []).filter((id: string) => out.owned.includes(id))) };
  }
  return out;
}
