// Pure data types shared by the engine, the AI, the data files, and the UI.

export type Rune = 'fire' | 'water' | 'wind' | 'earth' | 'lightning';
export const RUNES: Rune[] = ['fire', 'water', 'wind', 'earth', 'lightning'];

/** Card abilities. Teleport is Viki's own: a random jump at the start of her owner's turn. */
export type Ability = 'steadfast' | 'rally' | 'sabotage' | 'runeborn' | 'teleport';

/** Power tier: sets the cost and the stat budget. Heavenly / Earthly is only flavor (see starKind). */
export type Tier = 'support' | 'fighter' | 'elite' | 'legend' | 'boss';

/** [top, right, bottom, left]. 1..10, 10 is shown as "A". */
export type Values = [number, number, number, number];

export type BoardSize = 3 | 4;
/** 0 = player, 1 = opponent. */
export type Side = 0 | 1;

export interface CardDef {
  id: string;
  name: string;
  /** Stone Tablet position 1..108. Absent for non-Star cards (Jowy, Luca). */
  starNo?: number;
  starName?: string;
  /** Number 109+ for extra cards that are not one of the 108 (Kasumi, Sigfried, ...). */
  extraNo?: number;
  tier: Tier;
  values: Values;
  rune: Rune;
  ability?: Ability;
  /** One-line flavour shown on the card detail. */
  blurb: string;
  /** Set when the roster entry needs a human check. */
  flag?: string;
  /** Phase 2: explicit art path. When absent the portrait loader looks up src/assets/portraits/<id>.* */
  art?: string;
}

/** A bond is a pair or group. Any two members that sit next to each other (same owner) get the bond bonus.
 *  Groups of 3 or 4 with a `shape` are also formations that can trigger a Unite Attack. */
export interface BondDef {
  id: string;
  name: string;
  members: string[];
  shape?: 'line' | 'connected' | 'square';
}

export interface Rules {
  same: boolean;
  plus: boolean;
  combo: boolean;
  runes: boolean;
  bonds: boolean;
  unite: boolean;
  /** Phase 2 variants. Data can set them; the engine ignores them for now. */
  open?: boolean;
  random?: boolean;
  suddenDeath?: boolean;
}

export interface HandCard {
  uid: string;
  id: string;
  values: Values;
  rune: Rune | null;
  /** Pre-duel boost (handicap). Added to all four sides. */
  boost: number;
  ability?: Ability;
  /** True for the AI's stand-in for cards it cannot see. */
  hidden?: boolean;
}

export interface PlacedCard {
  card: HandCard;
  owner: Side;
  /** Lasting penalty per side from Sabotage. Stays when the card changes sides. */
  wound?: number[];
}

export interface Formation {
  id: string;
  members: string[];
  shape: 'line' | 'connected' | 'square';
}

export interface GameState {
  size: BoardSize;
  rules: Rules;
  /** Length size*size. Row-major. */
  tiles: (Rune | null)[];
  board: (PlacedCard | null)[];
  hands: [HandCard[], HandCard[]];
  turn: Side;
  first: Side;
  moveNo: number;
  /** cardId -> ids of bond partners. */
  bondMap: Record<string, string[]>;
  formations: Formation[];
  uniteUsed: [boolean, boolean];
  /** Duel seed for the Teleport roll. Without it, nothing teleports (AI search, tests, tutorial). */
  seed?: number;
}

export interface Move {
  hand: number;
  cell: number;
}

export type FlipCause = 'basic' | 'same' | 'plus' | 'combo' | 'unite';

export interface FlipEvent {
  cell: number;
  cause: FlipCause;
  /** 1 = direct result of the placement. Higher numbers are later combo links. */
  step: number;
  to: Side;
}

export interface MoveResult {
  state: GameState;
  flips: FlipEvent[];
  /** Bond ids that became active (partners touching) with this move. */
  bonds: string[];
  unite: string | null;
  /** The cell and side that Sabotage weakened, if any. */
  sabotage: { cell: number; side: number } | null;
}

/** A Teleport jump at the start of `owner`'s turn, and the basic flips it made on arrival. */
export interface Teleport {
  from: number;
  to: number;
  owner: Side;
  flips: FlipEvent[];
}
