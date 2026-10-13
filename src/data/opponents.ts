import { ALL_RULES, BASE_RULES } from '../core/config';
import type { Rules } from '../core/types';
import type { OpponentDef, RegionDef } from './schema';

const rules = (extra: Partial<Rules> = {}): Rules => ({ ...BASE_RULES, ...extra });

export const REGIONS: RegionDef[] = [
  { id: 'toto', name: 'Toto Village', blurb: 'A quiet village on the Jowston border. Where it all begins.', unlock: null },
  { id: 'muse', name: 'Muse', blurb: 'The great city-state. Mercenaries, merchants, and a betrayal.', unlock: { boss: 'rowd', cards: 15 } },
  { id: 'two-river', name: 'South Window & Two River', blurb: 'Kobolds, sewers, and the first Highland general.', unlock: { boss: 'jowy-muse', cards: 30 } },
  { id: 'rockaxe', name: 'Matilda & Rockaxe', blurb: 'Knights in red and blue, and a lord who will not help.', unlock: { boss: 'solon', cards: 45 } },
  { id: 'tinto', name: 'Tinto & Gregminster', blurb: 'Mines, vampires, and old friends from the Toran Republic.', unlock: { boss: 'gorudo', cards: 60 } },
  { id: 'luca-court', name: 'Luca\'s Court', blurb: 'The White Wolf\'s generals. Every rule is in play.', unlock: { boss: 'neclord', cards: 75 } },
];

export const OPPONENTS: OpponentDef[] = [
  // ---- Toto Village: base rules only ----
  {
    id: 'shepherd', name: 'Old Shepherd', title: 'Toto Village', region: 'toto',
    intro: 'Plays slow, plays fair. A good first duel.',
    deck: ['tony', 'taki', 'hans', 'yuzu', 'gabocha', 'millie', 'kinnison', 'apple'],
    rules: rules(), format: 'single', prize: 'random', difficulty: 'easy', personality: 'balanced',
    tiles: { 3: [[4, 'earth']], 4: [[5, 'earth'], [10, 'earth'], [0, 'wind']] }, faction: 'neutral',
  },
  {
    id: 'innkeeper', name: 'Ryube Innkeeper', title: 'Ryube', region: 'toto',
    intro: 'Collects card debts as well as room fees.',
    deck: ['rikimaru', 'zamza', 'shiro', 'kinnison', 'leona', 'tetsu', 'tuta', 'apple'],
    rules: rules(), format: 'single', prize: 'choose', difficulty: 'easy', personality: 'aggressive',
    tiles: { 3: [[0, 'fire'], [8, 'water']], 4: [[0, 'fire'], [15, 'water'], [6, 'fire']] }, faction: 'neutral',
  },
  {
    id: 'rowd', name: 'Captain Rowd', title: 'Unicorn Brigade', region: 'toto', boss: true,
    intro: 'The man who sold out the Unicorn Brigade. Uses the Same rule.',
    deck: ['hanna', 'tsai', 'zamza', 'rikimaru', 'gilbert', 'anita', 'templeton', 'tuta'],
    rules: rules({ same: true }), format: 'bo2', prize: 'choose', difficulty: 'normal', personality: 'aggressive',
    tiles: { 3: [[1, 'fire'], [7, 'fire']], 4: [[1, 'fire'], [2, 'fire'], [13, 'earth'], [14, 'earth']] },
    faction: 'highland', general: true,
  },
  // ---- Muse ----
  {
    id: 'muse-guard', name: 'Muse City Guard', title: 'Muse Gate', region: 'muse',
    intro: 'Checks papers. Checks cards. Checks everything twice.',
    deck: ['templeton', 'anita', 'hai-yo', 'barbara', 'gilbert', 'huan', 'leona', 'jess'],
    rules: rules({ same: true }), format: 'single', prize: 'random', difficulty: 'normal', personality: 'defensive',
    tiles: { 3: [[4, 'water']], 4: [[5, 'water'], [6, 'water'], [9, 'earth']] }, faction: 'city-states',
  },
  {
    id: 'fisherman', name: 'Coronet Fisherman', title: 'Coronet Port', region: 'muse',
    intro: 'Smells of the lake. Loves the water tiles.',
    deck: ['tai-ho', 'yam-koo', 'bolgan', 'eilie', 'rina', 'amada', 'tuta', 'huan'],
    rules: rules({ same: true }), format: 'single', prize: 'choose', difficulty: 'normal', personality: 'rune',
    tiles: { 3: [[3, 'water'], [5, 'water']], 4: [[4, 'water'], [7, 'water'], [8, 'water'], [11, 'water']] }, faction: 'neutral',
  },
  {
    id: 'jowy-muse', name: 'Jowy Atreides', title: 'Muse City Hall', region: 'muse', boss: true,
    intro: 'Your best friend. Tonight, he plays for Highland.',
    deck: ['flik', 'viktor', 'eilie', 'rina', 'bolgan', 'freed', 'anita', 'hanna'],
    rules: rules({ same: true, plus: true }), format: 'bo2', prize: 'choose', difficulty: 'normal', personality: 'bond',
    tiles: { 3: [[0, 'lightning'], [8, 'lightning']], 4: [[0, 'lightning'], [15, 'lightning'], [5, 'wind'], [10, 'wind']] },
    faction: 'highland',
  },
  // ---- South Window & Two River ----
  {
    id: 'merchant', name: 'South Window Merchant', title: 'South Window', region: 'two-river',
    intro: 'Every card has a price. Plays the Plus rule.',
    deck: ['alex', 'hilda', 'clive', 'adlai', 'richmond', 'oulan', 'barbara', 'amada'],
    rules: rules({ plus: true }), format: 'single', prize: 'highest', difficulty: 'normal', personality: 'balanced',
    tiles: { 3: [[2, 'earth']], 4: [[3, 'earth'], [12, 'earth'], [6, 'fire']] }, faction: 'city-states',
  },
  {
    id: 'kobold-captain', name: 'Kobold Captain', title: 'Two River, Kobold District', region: 'two-river',
    intro: 'Kobolds fight in packs. So do their cards.',
    deck: ['gengen', 'gabocha', 'ridley', 'chaco', 'fitcher', 'sid', 'shilo', 'hix'],
    rules: rules({ same: true, plus: true }), format: 'single', prize: 'choose', difficulty: 'normal', personality: 'bond',
    tiles: { 3: [[4, 'earth'], [0, 'wind']], 4: [[5, 'earth'], [6, 'earth'], [9, 'earth'], [10, 'earth']] }, faction: 'city-states',
  },
  {
    id: 'solon', name: 'Solon Jhee', title: 'Highland General', region: 'two-river', boss: true,
    intro: 'A Highland general who burns what he cannot take. Fire tiles everywhere.',
    deck: ['luc', 'shu', 'stallion', 'tengaar', 'jeane', 'hai-yo', 'huan', 'leona'],
    rules: rules({ plus: true, combo: true }), format: 'bo2', prize: 'choose', difficulty: 'hard', personality: 'rune',
    tiles: { 3: [[0, 'fire'], [4, 'fire']], 4: [[0, 'fire'], [5, 'fire'], [10, 'fire'], [15, 'fire']] },
    faction: 'highland', general: true,
  },
  // ---- Matilda & Rockaxe ----
  {
    id: 'matilda-knight', name: 'Matilda Knight', title: 'Rockaxe Castle', region: 'rockaxe',
    intro: 'Honor first, cards second. Keeps a tight defense.',
    deck: ['camus', 'miklotov', 'maximillian', 'humphrey', 'futch', 'teresa', 'shin', 'nina'],
    rules: rules({ same: true, plus: true }), format: 'single', prize: 'random', difficulty: 'hard', personality: 'defensive',
    tiles: { 3: [[1, 'fire'], [7, 'water']], 4: [[1, 'fire'], [2, 'water'], [13, 'water'], [14, 'fire']] }, faction: 'city-states',
  },
  {
    id: 'forest-elder', name: 'Forest Village Elder', title: 'Forest Village', region: 'rockaxe',
    intro: 'Knows every beast and every bird in the woods.',
    deck: ['wakaba', 'badeaux', 'connell', 'ayda', 'feather', 'lebrante', 'simone', 'jude'],
    rules: rules({ same: true, combo: true }), format: 'single', prize: 'choose', difficulty: 'hard', personality: 'rune',
    tiles: { 3: [[3, 'wind'], [5, 'wind']], 4: [[4, 'wind'], [7, 'wind'], [9, 'earth']] }, faction: 'neutral',
  },
  {
    id: 'gorudo', name: 'Gorudo', title: 'Lord of Matilda', region: 'rockaxe', boss: true,
    intro: 'Cruel, vain, and very good at cards. Same, Plus, and Combo.',
    deck: ['kiba', 'klaus', 'camus', 'miklotov', 'viki', 'sheena', 'lorelai', 'gordon'],
    rules: rules({ same: true, plus: true, combo: true }), format: 'bo2', prize: 'choose', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[4, 'lightning']], 4: [[5, 'lightning'], [6, 'lightning'], [9, 'lightning'], [10, 'lightning']] },
    faction: 'city-states',
  },
  // ---- Tinto & Gregminster ----
  {
    id: 'miner', name: 'Tinto Miner', title: 'Tinto Mines', region: 'tinto',
    intro: 'Rough hands, rough deck. Something lives in the mine pool.',
    deck: ['gijimu', 'koyu', 'lo-wen', 'marlowe', 'kahn', 'raura', 'abizboah', 'mazus'],
    rules: rules({ same: true, plus: true, combo: true }), format: 'single', prize: 'random', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[6, 'earth'], [8, 'earth']], 4: [[12, 'earth'], [13, 'earth'], [14, 'earth'], [15, 'water']] }, faction: 'neutral',
  },
  {
    id: 'trader', name: 'Gregminster Trader', title: 'Gregminster', region: 'tinto',
    intro: 'Old Toran money. Plays for profit.',
    deck: ['gordon', 'lorelai', 'mondo', 'sasuke', 'tomo', 'bob', 'annallee', 'karen'],
    rules: rules({ same: true, plus: true }), format: 'single', prize: 'highest', difficulty: 'hard', personality: 'balanced',
    tiles: { 3: [[0, 'wind'], [8, 'lightning']], 4: [[0, 'wind'], [3, 'lightning'], [12, 'lightning'], [15, 'wind']] }, faction: 'neutral',
  },
  {
    id: 'neclord', name: 'Neclord', title: 'Lord of the Undead', region: 'tinto', boss: true,
    intro: 'The vampire returns. His chains of Combo never end.',
    deck: ['sierra', 'hauser', 'jess', 'georg', 'gantetsu', 'pico', 'alberto', 'kahn'],
    rules: ALL_RULES, format: 'bo2', prize: 'highest', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[2, 'water'], [6, 'water']], 4: [[0, 'water'], [3, 'water'], [12, 'water'], [15, 'water']] }, faction: 'neutral',
  },
  // ---- Luca's Court ----
  {
    id: 'white-wolf', name: 'White Wolf Captain', title: 'Highland Army', region: 'luca-court',
    intro: 'Luca\'s elite. Merciless, fast, and well trained.',
    deck: ['vincent', 'genshu', 'pesmerga', 'killey', 'hoi', 'lc-chan', 'tessai', 'emilia'],
    rules: ALL_RULES, format: 'single', prize: 'choose', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[4, 'fire'], [1, 'fire']], 4: [[5, 'fire'], [6, 'fire'], [1, 'fire'], [2, 'earth']] }, faction: 'highland',
  },
  {
    id: 'seed-culgan', name: 'Seed & Culgan', title: 'Highland Generals', region: 'luca-court', general: true,
    intro: 'Two generals, one plan. They love formations.',
    deck: ['valeria', 'stallion', 'georg', 'meg', 'gadget', 'jude', 'hoi', 'karen'],
    rules: ALL_RULES, format: 'single', prize: 'choose', difficulty: 'hard', personality: 'bond',
    tiles: { 3: [[3, 'fire'], [5, 'earth']], 4: [[4, 'fire'], [7, 'earth'], [8, 'earth'], [11, 'fire']] }, faction: 'highland',
  },
  {
    id: 'luca', name: 'Luca Blight', title: 'Prince of Highland', region: 'luca-court', boss: true,
    intro: 'The mad prince. Every rule. No mercy. Best of two.',
    deck: ['kiba', 'klaus', 'pesmerga', 'georg', 'sierra', 'luc', 'viktor', 'flik'],
    rules: ALL_RULES, format: 'bo2', prize: 'choose', difficulty: 'boss', personality: 'aggressive',
    tiles: { 3: [[0, 'fire'], [8, 'fire']], 4: [[0, 'fire'], [5, 'fire'], [10, 'fire'], [15, 'fire']] },
    faction: 'highland', general: true,
  },
];

export const OPPONENT_BY_ID: Record<string, OpponentDef> = Object.fromEntries(OPPONENTS.map((o) => [o.id, o]));
