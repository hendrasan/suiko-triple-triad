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
    intro: '“Easy now, young one. I play slow and I play fair. Show me what you have.”',
    deck: ['tony', 'taki', 'hans', 'yuzu', 'gabocha', 'millie', 'kinnison', 'apple'],
    rules: rules(), format: 'single', prize: 'random', difficulty: 'easy', personality: 'balanced',
    tiles: { 3: [[4, 'earth']], 4: [[5, 'earth'], [10, 'earth'], [0, 'wind']] }, faction: 'neutral',
  },
  {
    id: 'innkeeper', name: 'Ryube Innkeeper', title: 'Ryube', region: 'toto',
    intro: '“A room is 50 potch. A lost game costs one card. Fair is fair.”',
    deck: ['rikimaru', 'zamza', 'shiro', 'kinnison', 'leona', 'tetsu', 'tuta', 'apple'],
    rules: rules(), format: 'single', prize: 'choose', difficulty: 'easy', personality: 'aggressive',
    tiles: { 3: [[0, 'fire'], [8, 'water']], 4: [[0, 'fire'], [15, 'water'], [6, 'fire']] }, faction: 'neutral',
  },
  {
    id: 'rowd', portrait: 'rowd', name: 'Captain Rowd', title: 'Unicorn Brigade', region: 'toto', boss: true,
    intro: '“Ah, look at that sunset. It\'s the last sunset you\'ll see. Orders are orders, boy. Nothing personal.”',
    deck: ['hanna', 'tsai', 'zamza', 'rikimaru', 'gilbert', 'anita', 'templeton', 'tuta'],
    rules: rules({ same: true }), format: 'bo2', prize: 'choose', difficulty: 'normal', personality: 'aggressive',
    tiles: { 3: [[1, 'fire'], [7, 'fire']], 4: [[1, 'fire'], [2, 'fire'], [13, 'earth'], [14, 'earth']] },
    faction: 'highland', general: true,
  },
  // ---- Muse ----
  {
    id: 'muse-guard', name: 'Muse City Guard', title: 'Muse Gate', region: 'muse',
    intro: '“Halt! State your business in Muse. Papers first. Then your deck.”',
    deck: ['freed', 'anita', 'hai-yo', 'barbara', 'yoshino', 'huan', 'shin', 'jess'],
    rules: rules({ same: true }), format: 'single', prize: 'random', difficulty: 'normal', personality: 'defensive',
    tiles: { 3: [[4, 'water']], 4: [[5, 'water'], [6, 'water'], [9, 'earth']] }, faction: 'city-states',
  },
  {
    id: 'fisherman', name: 'Coronet Fisherman', title: 'Coronet Port', region: 'muse',
    intro: '“The lake gives, and the lake takes. Same with cards. Sit down, the fish aren\'t biting today.”',
    deck: ['tai-ho', 'yam-koo', 'bolgan', 'eilie', 'rina', 'amada', 'tuta', 'huan'],
    rules: rules({ same: true }), format: 'single', prize: 'choose', difficulty: 'normal', personality: 'rune',
    tiles: { 3: [[3, 'water'], [5, 'water']], 4: [[4, 'water'], [7, 'water'], [8, 'water'], [11, 'water']] }, faction: 'neutral',
  },
  {
    id: 'jowy-muse', portrait: 'jowy_boss', name: 'Jowy Atreides', title: 'Muse City Hall', region: 'muse', boss: true,
    intro: '“Do you remember our promise? I haven\'t forgotten it. But tonight, I play for Highland. Don\'t hold back.”',
    deck: ['flik', 'viktor', 'eilie', 'rina', 'bolgan', 'freed', 'anita', 'hanna'],
    rules: rules({ same: true, plus: true }), format: 'bo2', prize: 'choose', difficulty: 'normal', personality: 'bond',
    tiles: { 3: [[0, 'lightning'], [8, 'lightning']], 4: [[0, 'lightning'], [15, 'lightning'], [5, 'wind'], [10, 'wind']] },
    faction: 'highland',
  },
  // ---- South Window & Two River ----
  {
    id: 'merchant', name: 'South Window Merchant', title: 'South Window', region: 'two-river',
    intro: '“Everything in South Window has a price, friend. Your cards too.”',
    deck: ['alex', 'hilda', 'clive', 'tengaar', 'richmond', 'oulan', 'chaco', 'amada'],
    rules: rules({ plus: true }), format: 'single', prize: 'choose', difficulty: 'normal', personality: 'balanced',
    tiles: { 3: [[2, 'earth']], 4: [[3, 'earth'], [12, 'earth'], [6, 'fire']] }, faction: 'city-states',
  },
  {
    id: 'kobold-captain', name: 'Kobold Captain', title: 'Two River, Kobold District', region: 'two-river',
    intro: '“A kobold never fights alone! My pack will show you!”',
    deck: ['gengen', 'gabocha', 'ridley', 'chaco', 'fitcher', 'sid', 'bob', 'hix'],
    rules: rules({ same: true, plus: true }), format: 'single', prize: 'choose', difficulty: 'normal', personality: 'bond',
    tiles: { 3: [[4, 'earth'], [0, 'wind']], 4: [[5, 'earth'], [6, 'earth'], [9, 'earth'], [10, 'earth']] }, faction: 'city-states',
  },
  {
    id: 'solon', portrait: 'solon_jhee', name: 'Solon Jhee', title: 'Highland General', region: 'two-river', boss: true,
    intro: '“I am Solon Jhee, general of Highland! Ha. Today is just a greeting. Tomorrow, your cards will decorate my walls.”',
    deck: ['luc', 'shu', 'stallion', 'tengaar', 'jeane', 'hai-yo', 'wakaba', 'oulan'],
    rules: rules({ plus: true, combo: true }), format: 'bo2', prize: 'choose', difficulty: 'hard', personality: 'rune',
    tiles: { 3: [[0, 'fire'], [4, 'fire']], 4: [[0, 'fire'], [5, 'fire'], [10, 'fire'], [15, 'fire']] },
    faction: 'highland', general: true,
  },
  // ---- Matilda & Rockaxe ----
  {
    id: 'matilda-knight', name: 'Matilda Knight', title: 'Rockaxe Castle', region: 'rockaxe',
    intro: '“A knight of Matilda keeps his oath, on the field and at the table. Draw your cards.”',
    deck: ['camus', 'miklotov', 'maximillian', 'humphrey', 'futch', 'teresa', 'shin', 'nina'],
    rules: rules({ same: true, plus: true }), format: 'single', prize: 'random', difficulty: 'hard', personality: 'defensive',
    tiles: { 3: [[1, 'fire'], [7, 'water']], 4: [[1, 'fire'], [2, 'water'], [13, 'water'], [14, 'fire']] }, faction: 'city-states',
  },
  {
    id: 'forest-elder', name: 'Forest Village Elder', title: 'Forest Village', region: 'rockaxe',
    intro: '“The birds told me you were coming. Mind the wind in these woods.”',
    deck: ['wakaba', 'badeaux', 'connell', 'ayda', 'feather', 'sigfried', 'simone', 'jude'],
    rules: rules({ same: true, combo: true }), format: 'single', prize: 'choose', difficulty: 'hard', personality: 'rune',
    tiles: { 3: [[3, 'wind'], [5, 'wind']], 4: [[4, 'wind'], [7, 'wind'], [9, 'earth']] }, faction: 'neutral',
  },
  {
    id: 'gorudo', portrait: 'gorudo', name: 'Gorudo', title: 'Lord of Matilda', region: 'rockaxe', boss: true,
    intro: '“Refugees, rebels, they are all the same to me. No one passes my border. But a game? Oh, we\'re going to enjoy this.”',
    deck: ['kiba', 'klaus', 'camus', 'miklotov', 'humphrey', 'sheena', 'lorelai', 'futch'],
    rules: rules({ same: true, plus: true, combo: true }), format: 'bo2', prize: 'choose', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[4, 'lightning']], 4: [[5, 'lightning'], [6, 'lightning'], [9, 'lightning'], [10, 'lightning']] },
    faction: 'city-states',
  },
  // ---- Tinto & Gregminster ----
  {
    id: 'miner', name: 'Tinto Miner', title: 'Tinto Mines', region: 'tinto',
    intro: '“Watch your step. Something big lives in the mine pool, and it\'s hungry.”',
    deck: ['gijimu', 'koyu', 'lo-wen', 'marlowe', 'kahn', 'rulodia', 'abizboah', 'mazus'],
    rules: rules({ same: true, plus: true, combo: true }), format: 'single', prize: 'random', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[6, 'earth'], [8, 'earth']], 4: [[12, 'earth'], [13, 'earth'], [14, 'earth'], [15, 'water']] }, faction: 'neutral',
  },
  {
    id: 'trader', name: 'Gregminster Trader', title: 'Gregminster', region: 'tinto',
    intro: '“Old Toran coin always wins. Let\'s see what your cards are worth.”',
    deck: ['valeria', 'lorelai', 'mondo', 'sasuke', 'karen', 'bob', 'annallee', 'kasumi'],
    rules: rules({ same: true, plus: true }), format: 'single', prize: 'choose', difficulty: 'hard', personality: 'balanced',
    tiles: { 3: [[0, 'wind'], [8, 'lightning']], 4: [[0, 'wind'], [3, 'lightning'], [12, 'lightning'], [15, 'wind']] }, faction: 'neutral',
  },
  {
    id: 'neclord', portrait: 'neclord', name: 'Neclord', title: 'Lord of the Undead', region: 'tinto', boss: true,
    intro: '“Ah, guests! Play a little game for me. I do so love the face of despair when the last card turns. Lose? You make it sound as if I could lose.”',
    deck: ['sierra', 'hauser', 'killey', 'georg', 'gantetsu', 'pico', 'alberto', 'kahn'],
    rules: ALL_RULES, format: 'bo2', prize: 'choose', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[2, 'water'], [6, 'water']], 4: [[0, 'water'], [3, 'water'], [12, 'water'], [15, 'water']] }, faction: 'neutral',
  },
  // ---- Luca's Court ----
  {
    id: 'white-wolf', name: 'White Wolf Captain', title: 'Highland Army', region: 'luca-court',
    intro: '“By order of Prince Luca: no prisoners. Not on the field, not on the board.”',
    deck: ['vincent', 'genshu', 'pesmerga', 'killey', 'hoi', 'lc-chan', 'kiba', 'hauser'],
    rules: ALL_RULES, format: 'single', prize: 'choose', difficulty: 'hard', personality: 'aggressive',
    tiles: { 3: [[4, 'fire'], [1, 'fire']], 4: [[5, 'fire'], [6, 'fire'], [1, 'fire'], [2, 'earth']] }, faction: 'highland',
  },
  {
    id: 'seed-culgan', portrait: 'seed', name: 'Seed & Culgan', title: 'Highland Generals', region: 'luca-court', general: true,
    intro: 'Seed: “Enough talk. Let\'s fight!” Culgan: “Patience, Seed. Formation first. Then we fight.”',
    deck: ['valeria', 'genshu', 'georg', 'meg', 'gadget', 'kasumi', 'mondo', 'sasuke'],
    rules: ALL_RULES, format: 'single', prize: 'choose', difficulty: 'hard', personality: 'bond',
    tiles: { 3: [[3, 'fire'], [5, 'earth']], 4: [[4, 'fire'], [7, 'earth'], [8, 'earth'], [11, 'fire']] }, faction: 'highland',
  },
  {
    id: 'luca', portrait: 'luca_blight', name: 'Luca Blight', title: 'Prince of Highland', region: 'luca-court', boss: true,
    intro: '“Squeal, pig! Squeal for me! Cards or swords, it\'s all the same. I will crush you like the pig you are!”',
    deck: ['kiba', 'klaus', 'pesmerga', 'georg', 'sierra', 'luc', 'viktor', 'flik'],
    rules: ALL_RULES, format: 'bo2', prize: 'choose', difficulty: 'boss', personality: 'aggressive',
    tiles: { 3: [[0, 'fire'], [8, 'fire']], 4: [[0, 'fire'], [5, 'fire'], [10, 'fire'], [15, 'fire']] },
    faction: 'highland', general: true,
  },
];

export const OPPONENT_BY_ID: Record<string, OpponentDef> = Object.fromEntries(OPPONENTS.map((o) => [o.id, o]));
