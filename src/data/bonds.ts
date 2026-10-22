import type { BondDef } from '../core/types';

// Pairs give +1 to each card while the partners touch.
// Groups with a shape are formations: complete the shape for a once-per-duel Unite Attack.
export const BONDS: BondDef[] = [
  { id: 'siblings', name: 'Siblings', members: ['hero', 'nanami'] },
  { id: 'sworn-friends', name: 'Sworn Friends', members: ['hero', 'jowy'] },
  { id: 'kyaro-trio', name: 'Childhood of Kyaro', members: ['hero', 'nanami', 'jowy'], shape: 'connected' },
  { id: 'mercenaries', name: 'Mercenary Fortress', members: ['viktor', 'flik'] },
  { id: 'matilda-knights', name: 'Red and Blue Knights', members: ['camus', 'miklotov'] },
  { id: 'warrior-village', name: 'Warrior Village Couple', members: ['hix', 'tengaar'] },
  { id: 'archer-wolf', name: 'Archer and Wolf', members: ['kinnison', 'shiro'] },
  { id: 'yamamotos', name: 'The Yamamotos', members: ['freed', 'yoshino'] },
  { id: 'kuskus-boatmen', name: 'Kuskus Boatmen', members: ['tai-ho', 'yam-koo'] },
  { id: 'innkeepers', name: 'Innkeepers', members: ['alex', 'hilda'] },
  { id: 'trick-show', name: 'Trick Show', members: ['meg', 'gadget'] },
  { id: 'father-son', name: 'Father and Son', members: ['kiba', 'klaus'] },
  { id: 'dragon-knight', name: 'Dragon Knight\'s Escort', members: ['humphrey', 'futch'] },
  { id: 'greenhill-guard', name: 'Greenhill\'s Guard', members: ['teresa', 'shin'] },
  { id: 'rokkaku', name: 'Rokkaku Ninja', members: ['kasumi', 'mondo', 'sasuke'], shape: 'connected' },
  { id: 'spearfolk', name: 'Spear of the Family', members: ['tsai', 'tomo'] },
  { id: 'bandits', name: 'Bandit Brothers', members: ['gijimu', 'koyu'] },
  { id: 'noble-rose', name: 'Rose and Servant', members: ['simone', 'vincent'] },
  { id: 'doctors', name: 'Doctor and Apprentice', members: ['huan', 'tuta'] },
  { id: 'martial-school', name: 'Martial School', members: ['wakaba', 'lc-chan'] },
  { id: 'kobold-friends', name: 'Kobold Friends', members: ['gengen', 'gabocha'] },
  { id: 'travelling-family', name: 'Travelling Family', members: ['rina', 'eilie', 'bolgan'], shape: 'connected' },
  { id: 'mine-family', name: 'Tinto Mine Family', members: ['abizboah', 'rulodia', 'chuchara'], shape: 'connected' },
  { id: 'musicians', name: 'Wandering Musicians', members: ['annallee', 'pico', 'alberto'], shape: 'line' },
  { id: 'vampire-hunters', name: 'Vampire Hunters', members: ['viktor', 'kahn', 'sierra'], shape: 'connected' },
  { id: 'kobold-army', name: 'Kobold Army', members: ['ridley', 'gengen', 'gabocha'], shape: 'line' },
  { id: 'strategists', name: 'Council of Strategists', members: ['shu', 'apple', 'klaus', 'fitcher'], shape: 'square' },
  { id: 'liberation-veterans', name: 'Liberation Army Veterans', members: ['flik', 'viktor', 'luc', 'valeria'], shape: 'square' },
];
