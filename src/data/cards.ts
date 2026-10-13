import type { CardDef, Rarity, Rune, Values } from '../core/types';

// The 108 Stars of Destiny (Suikoden II), plus Jowy and Luca Blight as story cards.
// Roster checked against gensopedia.org/w/108_Stars and the RPGSite recruitment guide.
// Stars 1-36 are Heavenly (rare). Stars 37-108 are Earthly (common). The Hero is 'special'.
// Values are "top right bottom left". Rune affinities are game design, not canon.

type Row = [no: number, star: string, id: string, name: string, values: string, rune: Rune, blurb: string, flag?: string];

const F: Rune = 'fire', W: Rune = 'water', Wi: Rune = 'wind', E: Rune = 'earth', L: Rune = 'lightning';

const STARS: Row[] = [
  // ---- Heavenly Stars ----
  [1, 'Tenkai', 'hero', 'Hero', '9 6 7 6', E, 'Bearer of the Bright Shield Rune. Leader of the new alliance.'],
  [2, 'Tengou', 'ridley', 'Ridley', '7 6 6 5', E, 'Kobold general of Two River. Steady and proud.', 'Boris Wizen can take this star instead. Ridley is used here.'],
  [3, 'Tenki', 'shu', 'Shu', '8 5 4 8', W, 'Cold, brilliant strategist from Radat.'],
  [4, 'Tenkan', 'luc', 'Luc', '9 4 3 9', Wi, 'Leknaat\'s apprentice. Bearer of the True Wind Rune.'],
  [5, 'Tenyuu', 'humphrey', 'Humphrey', '9 3 8 4', E, 'Silent swordsman with a heavy blade.'],
  [6, 'Tenyuu', 'hauser', 'Hauser', '7 6 7 5', F, 'Tinto\'s general. Solid in every direction.'],
  [7, 'Tenmou', 'kiba', 'Kiba', '8 4 8 4', F, 'Highland general of iron honor.'],
  [8, 'Teni', 'pesmerga', 'Pesmerga', '9 2 9 5', E, 'The black knight. Few words, crushing force.'],
  [9, 'Tenei', 'sierra', 'Sierra', '6 9 3 8', W, 'Ancestress of vampires. Graceful and deadly.'],
  [10, 'Tenki', 'teresa', 'Teresa', '5 6 6 6', W, 'Acting mayor of Greenhill. Calm under pressure.'],
  [11, 'Tenfu', 'nina', 'Nina', '4 7 5 6', F, 'New Leaf Academy student. Chases Flik everywhere.'],
  [12, 'Tenman', 'feather', 'Feather', '6 8 2 7', Wi, 'Griffin saved in the Forest Village.', 'Tenman/Tentai go to two of Feather, Siegfried, Abizboah. Feather + Abizboah used here.'],
  [13, 'Tenko', 'viktor', 'Viktor', '9 6 3 7', E, 'Bear of a mercenary. Hits hard, laughs loud.'],
  [14, 'Tensho', 'valeria', 'Valeria', '7 7 6 5', F, 'Falcon swordswoman of the Toran Republic.', 'Valeria or Kasumi is a player choice. Valeria used here; Tomo takes Chikyuu.'],
  [15, 'Tenritsu', 'fitcher', 'Fitcher', '3 7 7 5', Wi, 'Diplomat of Matilda. Talks his way through.'],
  [16, 'Tensho', 'clive', 'Clive', '9 2 4 8', F, 'Gunner of the Howling Voice Guild. Long reach.'],
  [17, 'Tenan', 'flik', 'Flik', '7 6 5 7', L, 'The Blue Lightning. Balanced and reliable.'],
  [18, 'Tenyuu', 'tsai', 'Tsai', '6 7 4 6', L, 'Veteran spearman who trains the young.'],
  [19, 'Tenku', 'jess', 'Jess', '5 5 7 5', W, 'Muse official. Grudges, then grows.'],
  [20, 'Tensoku', 'stallion', 'Stallion', '4 9 3 6', L, 'Fastest man alive, by his own account.'],
  [21, 'Teni', 'georg', 'Georg Prime', '8 8 4 6', L, 'Legendary swordsman with a sweet tooth.'],
  [22, 'Tensatsu', 'hanna', 'Hanna', '6 5 6 5', E, 'Toto\'s fierce swordswoman.'],
  [23, 'Tenbi', 'killey', 'Killey', '7 4 6 7', L, 'Wanderer who seeks the True Runes.'],
  [24, 'Tenkyuu', 'anita', 'Anita', '8 5 5 4', F, 'Sword-for-hire who drinks with anyone.'],
  [25, 'Tentai', 'abizboah', 'Abizboah', '8 3 9 2', W, 'Giant beast of the Tinto Mines pool.', 'See Tenman note.'],
  [26, 'Tenjuu', 'nanami', 'Nanami', '7 6 5 6', Wi, 'The Hero\'s sister. Fast, brave, and loud.'],
  [27, 'Tenken', 'rina', 'Rina', '5 7 6 5', W, 'Fortune teller of the travelling family.'],
  [28, 'Tenhei', 'tai-ho', 'Tai Ho', '7 5 6 5', W, 'Gambler and boatman of Kuskus.'],
  [29, 'Tenzai', 'eilie', 'Eilie', '4 8 5 6', F, 'Knife thrower of the travelling family.'],
  [30, 'Tenson', 'yam-koo', 'Yam Koo', '6 5 5 5', W, 'Tai Ho\'s partner. Never far behind.'],
  [31, 'Tenpai', 'bolgan', 'Bolgan', '8 3 8 3', F, 'Gentle giant who breathes fire.'],
  [32, 'Tenrou', 'hix', 'Hix', '5 6 7 5', E, 'Shy warrior of the Warrior Village.'],
  [33, 'Tensui', 'tengaar', 'Tengaar', '6 6 4 6', F, 'Hix\'s fiancee. The one in charge.'],
  [34, 'Tenbou', 'freed', 'Freed Y.', '5 4 7 6', W, 'Loyal aide of Greenhill. Never gives up.'],
  [35, 'Tenkoku', 'yoshino', 'Yoshino', '4 6 6 6', W, 'Freed\'s wife. Kind, steady, quietly strong.'],
  [36, 'Tenkou', 'chaco', 'Chaco', '6 5 4 7', Wi, 'Winged boy and quick-fingered thief.'],
  // ---- Earthly Stars ----
  [37, 'Chikai', 'klaus', 'Klaus', '4 6 5 5', Wi, 'Kiba\'s son. A gentle strategist.'],
  [38, 'Chisatsu', 'gilbert', 'Gilbert', '6 5 5 3', E, 'Highland soldier who changes sides.'],
  [39, 'Chiyuu', 'tetsu', 'Tetsu', '3 5 5 4', W, 'Bath master. Hot water, high standards.'],
  [40, 'Chiketsu', 'jeane', 'Jeane', '6 3 3 7', L, 'Mysterious rune master.'],
  [41, 'Chiyuu', 'wakaba', 'Wakaba', '5 6 4 5', Wi, 'Young martial artist from the mountains.'],
  [42, 'Chii', 'maximillian', 'Maximillian', '7 3 6 3', E, 'Old knight. Still charges first.'],
  [43, 'Chiei', 'genshu', 'Genshu', '8 3 3 6', L, 'Master swordsman of few words.'],
  [44, 'Chiki', 'camus', 'Camus', '6 5 4 5', F, 'Red Knight of Matilda.'],
  [45, 'Chimou', 'miklotov', 'Miklotov', '5 5 6 4', W, 'Blue Knight of Matilda.'],
  [46, 'Chibun', 'jude', 'Jude', '3 5 6 4', E, 'Sculptor who carves the castle statues.'],
  [47, 'Chisei', 'lebrante', 'Lebrante', '4 4 5 4', E, 'Appraiser with an eye for urns.'],
  [48, 'Chikatsu', 'lorelai', 'Lorelai', '6 4 3 6', F, 'Treasure hunter. Fire runes, no fear.'],
  [49, 'Chitou', 'tony', 'Tony', '3 4 6 4', E, 'Farmer of the Forest Village.'],
  [50, 'Chikyou', 'gijimu', 'Gijimu', '7 4 4 4', E, 'Bandit chief with a big axe.'],
  [51, 'Chian', 'rikimaru', 'Rikimaru', '7 5 3 4', F, 'Broke swordsman with a big bill at the inn.'],
  [52, 'Chijiku', 'gantetsu', 'Gantetsu', '8 2 6 3', E, 'Monk who tests your strength.'],
  [53, 'Chikai', 'simone', 'Simone', '4 5 4 5', Wi, 'Self-styled noble with a rose.'],
  [54, 'Chisa', 'connell', 'Connell', '4 4 4 5', L, 'Musician who knows every sound.'],
  [55, 'Chiyuu', 'hans', 'Hans', '3 4 5 4', E, 'Armor smith. Opens a shop at the castle.'],
  [56, 'Chirei', 'huan', 'Huan', '4 5 6 4', W, 'Doctor of the alliance.'],
  [57, 'Chijuu', 'tuta', 'Tuta', '3 4 5 4', W, 'Huan\'s apprentice. Runs everywhere.'],
  [58, 'Chibi', 'futch', 'Futch', '6 5 3 5', Wi, 'Dragon knight without a dragon.'],
  [59, 'Chikyuu', 'tomo', 'Tomo', '5 5 4 5', Wi, 'Tsai\'s daughter. Wind runes and a spear.', 'Kasumi takes this star if chosen instead of Valeria.'],
  [60, 'Chibaku', 'badeaux', 'Badeaux', '4 3 6 5', E, 'Beast tamer of the forest.'],
  [61, 'Chizen', 'mazus', 'Mazus', '8 2 2 7', F, 'Sorcerer of the Tinto Mines. Dangerous.'],
  [62, 'Chikou', 'mondo', 'Mondo', '5 5 4 4', L, 'Rokkaku ninja. Patient.'],
  [63, 'Chikyou', 'sasuke', 'Sasuke', '4 6 3 5', Wi, 'Young Rokkaku ninja. Impatient.'],
  [64, 'Chihi', 'leona', 'Leona', '3 5 5 4', F, 'Keeper of the tavern and its secrets.'],
  [65, 'Chisou', 'adlai', 'Adlai', '4 3 5 5', L, 'Inventor. Every device explodes once.'],
  [66, 'Chikou', 'raura', 'Raura', '4 4 4 4', Wi, 'Tinto artist. Draws your portrait.'],
  [67, 'Chimei', 'sheena', 'Sheena', '5 6 3 4', L, 'Son of President Lepant. Charmer.'],
  [68, 'Chishin', 'kinnison', 'Kinnison', '4 6 4 5', Wi, 'Archer of Ryube Forest.'],
  [69, 'Chitai', 'shiro', 'Shiro', '5 5 3 5', E, 'Kinnison\'s wolf. Loyal to the end.'],
  [70, 'Chiman', 'amada', 'Amada', '6 3 6 3', W, 'Boatman. Wrestles before he talks.'],
  [71, 'Chisui', 'emilia', 'Emilia', '3 4 6 5', W, 'Librarian of Greenhill.'],
  [72, 'Chishuu', 'zamza', 'Zamza', '7 4 4 3', F, 'Hot-headed fighter with a fire temper.'],
  [73, 'Chiin', 'karen', 'Karen', '4 6 3 5', Wi, 'Dancer of Kuskus.'],
  [74, 'Chii', 'lo-wen', 'Lo Wen', '6 4 4 4', L, 'Tinto mercenary captain.'],
  [75, 'Chiri', 'tenkou', 'Tenkou', '3 4 4 5', Wi, 'Builds window frames in Crom.'],
  [76, 'Chishun', 'gadget', 'Gadget', '6 3 6 3', L, 'Clockwork guardian built by Meg\'s uncle.'],
  [77, 'Chiraku', 'annallee', 'Annallee', '3 5 4 5', Wi, 'Singer whose voice fills the hall.'],
  [78, 'Chitatsu', 'viki', 'Viki', '7 2 2 7', Wi, 'Teleporter. Sneezes at bad times.'],
  [79, 'Chisoku', 'koyu', 'Koyu', '4 5 4 5', F, 'Gijimu\'s bandit lieutenant.'],
  [80, 'Chichin', 'vincent', 'Vincent', '5 3 3 5', W, 'Dandy who serves Simone.'],
  [81, 'Chikei', 'meg', 'Meg', '4 5 3 5', L, 'Trick-show girl with a robot.'],
  [82, 'Chima', 'mukumuku', 'Mukumuku', '5 4 3 4', Wi, 'Flying squirrel with a red cape.'],
  [83, 'Chiyou', 'marlowe', 'Marlowe', '3 3 5 5', W, 'Writer of the alliance\'s story.'],
  [84, 'Chiyuu', 'richmond', 'Richmond', '4 5 4 4', E, 'Detective. Finds anyone for a fee.'],
  [85, 'Chifuku', 'apple', 'Apple', '4 4 5 5', W, 'Shu\'s junior. Strategist with a heart.'],
  [86, 'Chihi', 'lc-chan', 'L.C. Chan', '6 5 3 5', Wi, 'Old master of Wakaba\'s school.'],
  [87, 'Chiku', 'millie', 'Millie', '4 4 3 5', Wi, 'Girl looking for her pet Bonaparte.'],
  [88, 'Chikou', 'tessai', 'Tessai', '5 4 5 3', F, 'Blacksmith who sharpens every blade.'],
  [89, 'Chizen', 'taki', 'Taki', '3 4 4 4', E, 'Kind old woman of Lakewest.'],
  [90, 'Chitan', 'gengen', 'Gengen', '5 4 4 3', E, 'Kobold who wants to be a hero.'],
  [91, 'Chikaku', 'gabocha', 'Gabocha', '4 4 4 4', E, 'Gengen\'s little kobold friend.'],
  [92, 'Chishuu', 'yuzu', 'Yuzu', '2 4 4 4', E, 'Shepherd girl. Counts sheep, not foes.'],
  [93, 'Chizou', 'hai-yo', 'Hai Yo', '4 4 4 5', F, 'Chef who duels with dishes.'],
  [94, 'Chihei', 'kahn', 'Kahn Marley', '6 4 4 4', L, 'Vampire hunter on Neclord\'s trail.'],
  [95, 'Chison', 'barbara', 'Barbara', '4 4 6 3', E, 'Keeper of the castle warehouse.'],
  [96, 'Chido', 'sid', 'Sid', '5 3 3 6', L, 'Lives in the Two River sewers.'],
  [97, 'Chisatsu', 'shin', 'Shin', '6 5 3 4', L, 'Teresa\'s silent guard.'],
  [98, 'Chiaku', 'oulan', 'Oulan', '7 4 4 3', F, 'Bodyguard with heavy fists.'],
  [99, 'Chishuu', 'shilo', 'Shilo', '3 4 4 5', W, 'Dice gambler of Lakewest.'],
  [100, 'Chisuu', 'alex', 'Alex', '4 5 4 3', F, 'Treasure seeker. Runs an inn with Hilda.'],
  [101, 'Chiin', 'hilda', 'Hilda', '3 4 5 4', W, 'Innkeeper and Alex\'s wife.'],
  [102, 'Chikei', 'bob', 'Bob', '6 4 3 4', E, 'Werewolf of the Kobold District.'],
  [103, 'Chisou', 'ayda', 'Ayda', '4 5 4 5', Wi, 'Elf of the forest. Sharp eyes.'],
  [104, 'Chiretsu', 'pico', 'Pico', '3 4 4 5', Wi, 'Musician who follows Annallee.'],
  [105, 'Chiken', 'alberto', 'Alberto', '4 3 4 5', Wi, 'Musician. Third of the trio.'],
  [106, 'Chimou', 'templeton', 'Templeton', '3 5 4 4', Wi, 'Boy who maps the whole world.'],
  [107, 'Chizoku', 'hoi', 'Hoi', '4 3 4 4', W, 'Con man of Radat.'],
  [108, 'Chikou', 'gordon', 'Gordon', '3 4 4 4', E, 'Merchant who loves profit.'],
];

const parse = (s: string) => s.split(' ').map(Number) as Values;

function rarityOf(no: number, id: string): Rarity {
  if (id === 'hero') return 'special';
  return no <= 36 ? 'rare' : 'common';
}

export const CARDS: CardDef[] = [
  ...STARS.map(([no, star, id, name, v, rune, blurb, flag]): CardDef => ({
    id, name, starNo: no, starName: star, rarity: rarityOf(no, id), values: parse(v), rune, blurb,
    flag,
  })),
  { id: 'jowy', name: 'Jowy', rarity: 'special', values: [8, 6, 7, 7], rune: L, blurb: 'The Hero\'s best friend. Bearer of the Black Sword Rune.', flag: 'Not one of the 108. Story card.' },
  { id: 'luca', name: 'Luca Blight', rarity: 'boss', values: [10, 9, 3, 8], rune: F, blurb: 'Mad prince of Highland. Pure destruction.', flag: 'Not one of the 108. Story card.' },
];

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export const STAR_COUNT = STARS.length;
