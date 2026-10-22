// Content types for regions, opponents, and recruiting. The engine does not need these.
import type { BoardSize, Rules, Rune } from '../core/types';

export type Mode = BoardSize;
export type Difficulty = 'easy' | 'normal' | 'hard' | 'boss';
export type Personality = 'balanced' | 'aggressive' | 'defensive' | 'bond' | 'rune';
export type PrizeRule = 'choose' | 'random';

/** Short player-facing label for each prize rule. */
export const PRIZE_LABEL: Record<PrizeRule, string> = { choose: 'Reward: Choose 1', random: 'Reward: Random' };
/** [cell index, rune]. Cells are row-major for that board size. */
export type RuneTile = [number, Rune];

export interface RegionDef {
  id: string;
  name: string;
  blurb: string;
  /** Open when this boss is beaten OR the player owns this many cards. Null = always open. */
  unlock: { boss: string; cards: number } | null;
}

export interface OpponentDef {
  id: string;
  name: string;
  title: string;
  region: string;
  intro: string;
  /** 8 cards. Triple Triad uses 5 of them (seeded pick). */
  deck: string[];
  rules: Rules;
  /** 'bo2' = best of two with first player switching. Used for bosses. */
  format: 'single' | 'bo2';
  prize: PrizeRule;
  difficulty: Difficulty;
  personality: Personality;
  tiles: Record<Mode, RuneTile[]>;
  faction?: 'highland' | 'city-states' | 'neutral';
  general?: boolean;
  boss?: boolean;
  /** File name in public/portraits (no extension). */
  portrait?: string;
}

// ---------- Recruiting ----------

/** All conditions in a quest must be true at the end of a won duel. */
export type Cond =
  | { t: 'withCard'; id: string }
  | { t: 'withRune'; rune: Rune; n: number }
  | { t: 'allCommon' }
  | { t: 'flawless' }
  | { t: 'flips'; n: number }
  | { t: 'same' }
  | { t: 'plus' }
  | { t: 'combo'; n: number }
  | { t: 'unite' }
  | { t: 'bond'; id?: string }
  | { t: 'runeTile'; rune?: Rune }
  | { t: 'score'; n: number }
  | { t: 'second' }
  | { t: 'opponent'; id: string }
  | { t: 'region'; id: string }
  | { t: 'faction'; f: 'highland' | 'city-states' }
  | { t: 'general' };

export interface QuestDef {
  card: string;
  hint: string;
  conds: Cond[];
  /** Restrict to one board size. Absent = either mode. */
  mode?: Mode;
}

export interface BondRecruitDef {
  card: string;
  requires: string[];
  hint: string;
}

export interface StoryGateDef {
  card: string;
  boss: string;
  hint: string;
}
