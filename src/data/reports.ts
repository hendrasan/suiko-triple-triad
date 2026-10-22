// Richmond's Investigations. One report per card: a profile and 1-3 secrets.
// Rewritten in our own words from the Suikoden II investigation reports (facts only, no new facts).
// `flag` marks entries that still need a check.

export interface Report {
  age: string;
  from: string;
  position: string;
  note?: string;
  /** Opened one per won duel with the card in the deck, once Richmond has joined. */
  secrets: string[];
  flag?: string;
}


export const REPORTS: Record<string, Report> = {
  hero: {
    age: '16', from: 'Kyaro, Highland Kingdom', position: 'Leader', note: 'Bearer of the Bright Shield Rune',
    secrets: [
      'Old Genkaku raised this kid and Nanami at his dojo in Kyaro. Neither of them is his blood, but try telling them that.',
      'He and Jowy split one True Rune between them: the Bright Shield for him, the Black Sword for Jowy. Two halves of the Rune of Beginning, they say.',
      'A report on yourself? Kid, this whole castle chose you to lead it, and they\'ve followed you this far. That\'s the only file on you I need.',
    ],
  },
  jowy: {
    age: '16', from: 'Kyaro, Highland Kingdom', position: 'Unknown', note: 'Bearer of the Black Sword Rune',
    secrets: [
      'He comes from the Atreides family, nobles of Kyaro. But he spent his best days at Genkaku\'s dojo with you and Nanami.',
      'His rune is the Black Sword, the other half of the Rune of Beginning. Whatever that rune wants from him, it isn\'t peace.',
      'He married Jillia Blight, the princess of Highland. A Kyaro boy marrying into the royal family... I smell a plan.',
    ],
  },
  luca: {
    age: '27', from: 'Highland Kingdom', position: 'Prince of Highland', note: 'The Mad Prince',
    secrets: [
      'Son of King Agares Blight. Folks on both sides of the border call him the Mad Prince, and they don\'t say it as a joke.',
      'The Unicorn Brigade didn\'t die by accident. That massacre was the spark he wanted for his war.',
      'He killed his own father, King Agares. General Kiba changed sides after that. Draw your own conclusions.',
    ],
  },
  flik: {
    age: '27', from: 'Warrior\'s Village, Toran Republic', position: 'Archer Captain', note: 'Original member of the Toran Liberation Army',
    secrets: [
      'In Warrior\'s Village, every young man goes on a journey to prove his manhood. Flik is still on his, and he has no plans to go home.',
      'On that journey he met Odessa. She founded the Toran Liberation Army, and Flik stood beside her as her right hand.',
      'He and Odessa were in love. She was assassinated early in the war, and some nights you can still see it on his face.',
    ],
  },
  viktor: {
    age: '32', from: 'North Window', position: 'Infantry Captain', note: 'Seeking revenge on Neclord',
    secrets: [
      'Neclord wiped out his hometown while he was away on an errand in South Window. He was the only one who lived. That\'s why he never stays put.',
      'When he got back, his whole village had turned into the hungry dead. Not a story for the dinner table.',
      'Somebody named Daisy. A sister, a sweetheart? Nobody is left alive to ask, and Viktor isn\'t talking.',
    ],
  },
  viki: {
    age: '16', from: 'Anywhere', position: 'Magic Unit', note: 'Watch out for her teleport!',
    secrets: [
      'I\'m pretty sure she isn\'t even from this continent. One bad teleport, and here she is.',
      'She says she was just at the party for the birth of the Toran Republic. Kid, that was three years ago.',
      'She talks in her sleep. Mostly one word: "Waffu." Don\'t ask me.',
    ],
  },
  sheena: {
    age: '19', from: 'Kouan, Toran Republic', position: 'Royal Guard', note: 'Son of President Lepant',
    secrets: [
      'His chasing after women has embarrassed President Lepant more than once. He\'ll never change.',
      'Word is the President was quite the ladies\' man himself back in the day. Hard to scold your son for your own habits.',
      'He\'s soft on his mother, Eileen. I bet she spoiled him rotten.',
    ],
  },
  clive: {
    age: '27', from: 'Howling Voice Guild', position: 'Archer', note: 'In pursuit of a "woman"',
    secrets: [
      'He belongs to the Howling Voice Guild out of Harmonia, a secret order built around those "guns".',
      'A gun is a tool of steel, sure. But they say each one carries a soul of its own.',
      'His gun is called Storm, and people say it really is alive. A True Rune inside? Your guess is as good as mine.',
    ],
  },
  hix: {
    age: '20', from: 'Warrior\'s Village, Toran Republic', position: 'Infantry Soldier', note: 'Trying to become a warrior',
    secrets: [
      'He left Warrior\'s Village on his journey of manhood, but between you and me, he doesn\'t much want to be a warrior.',
      'Tengaar bosses him around something awful. Still, the two of them balance out.',
      'His sword is named Tengaar. Back home, you name your blade after the most important thing in your life.',
    ],
  },
  tengaar: {
    age: '18', from: 'Warrior\'s Village, Toran Republic', position: 'Infantry Soldier', note: 'Traveling with Hix',
    secrets: [
      'She\'s the chief\'s daughter in Warrior\'s Village. She and Hix grew up together. And she has crossed paths with Neclord before.',
      'Cute girl, but a born worrier. She thinks everything she does is for Hix\'s sake.',
      'The day Hix\'s journey ends, she wants to go home and get married. Right away.',
    ],
  },
  futch: {
    age: '14', from: 'Goya, Domain of the Dragon Caves', position: 'Infantry Soldier', note: 'Former Dragon Knight',
    secrets: [
      'He was a real Dragon Knight once. They threw him out of the order after he lost his dragon, Black.',
      'Black died protecting him. The boy hasn\'t been the same since.',
      'He was heading for the Great Shrine in Crystal Valley to find a way to get a new dragon.',
    ],
  },
  humphrey: {
    age: '35', from: 'Toran Republic', position: 'Infantry Captain', note: 'Former Commander of the Scarlet Moon Empire Elite Guard',
    secrets: [
      'He led the Scarlet Moon Empire\'s Elite Guard, until they forced him out for trying to save a village from a massacre. He won\'t talk about it.',
      'In the Toran Liberation Army, he fought side by side with Flik.',
    ],
  },
  georg: {
    age: '41', from: 'Unknown', position: 'Infantry Captain', note: 'Once one of the 6 Generals of the Scarlet Moon Empire',
    secrets: [
      'One of the 6 Generals of the Scarlet Moon Empire. An Ebony Moon Knight in the Grasslands. A Royal Knight in Falena. He walked away from all of it.',
      'Don\'t let the scowl fool you. I watched him put away three pieces of cheesecake in five minutes.',
      'He can never go back to Falena. They want him there for the murder of the Queen. What happened back there...',
    ],
  },
  pesmerga: {
    age: 'Unknown', from: 'Unknown', position: 'Infantry Captain',
    secrets: [
      'Nobody in this castle has ever seen him eat or sleep. Not once.',
      'All that armor, and he moves without a sound. Gives me the creeps.',
      'I still don\'t know what he is. Some say he\'s a shadow from another world.',
    ],
  },
  lorelai: {
    age: '28', from: 'Queendom of Falena', position: 'Archer',
    secrets: [
      'She hunts the secrets of the Sindar. Three years ago she fought in the Toran Liberation War, too. Word is she only goes for strong men.',
      'The Sindar came from the north, left ruins everywhere they went, then went south and vanished.',
      'Plenty of rivals want to crack the Sindar riddle before her. She has crushed more than a few of them.',
    ],
  },
  shin: {
    age: '27', from: 'The Southlands', position: 'Archer Captain', note: 'Teresa\'s bodyguard',
    secrets: [
      'I thought he was asleep. One second later his sword was at my throat. I\'m done investigating that guy.',
      'He\'s from the south. That\'s all I got. You know how he is.',
    ],
  },
  rikimaru: {
    age: '25', from: 'Seika, Toran Republic', position: 'Infantry Captain',
    secrets: [
      'Big eater. Once in Gregminster he ate for two days straight, couldn\'t pay, and slipped out in the night.',
      'His idea of a perfect day: eat until he nearly bursts, then sleep for the next one.',
      'He says he\'s out for revenge. I have my doubts.',
    ],
  },
  tomo: {
    age: '14', from: 'Ryube, Muse Principality', position: 'Infantry Soldier', note: 'Tsai\'s daughter',
    secrets: [
      'She\'s trying so hard to get her parents back together. With a father that stubborn, good luck, kid.',
      'Her dad taught her the spear. Her looks, thank goodness, come from her mom.',
    ],
  },
  nanami: {
    age: '16', from: 'Kyaro, Highland Kingdom', position: 'Royal Guard',
    secrets: [
      'You grew up eating her cooking? Kid, you have my sympathy.',
      'She misses Kyaro. Lots of memories there.',
      'Does she have to train all night? The soldiers keep complaining about the racket.',
    ],
  },
  eilie: {
    age: '17', from: 'Grasslands', position: 'Royal Guard',
    secrets: [
      'She has been on the road since she left the Grasslands. Her knife-throwing is the real deal.',
      'She feels small next to her big sister. Can\'t blame her: Rina turns heads.',
      'She worries about you every time you go into battle. You lucky dog.',
    ],
  },
  rina: {
    age: '18', from: 'Grasslands', position: 'Royal Guard',
    secrets: [
      'She and Eilie are sisters, but they\'re cat and dog. Rina is poised and grown-up. You\'d never guess they\'re only a year apart.',
      'She says she\'s from the Grasslands. Who knows? She has been traveling since she could walk.',
      'She can hold her drink. She even beat Viktor in a drinking contest.',
    ],
  },
  bolgan: {
    age: '16', from: 'Zexen', position: 'Royal Guard',
    secrets: [
      'He\'s from Zexen, not the Grasslands like the sisters. He ran away from a circus, and that\'s when he met them.',
      'He learned to breathe fire in that circus. What kind of circus uses runes, anyway?',
      'Lately he studies in the library. I think he wants to get into the Greenhill Academy.',
    ],
  },
  tuta: {
    age: '11', from: 'Muse City', position: 'Rear Guard',
    secrets: [
      'His folks are friends of Dr. Huan. At his age, he probably still calls for his mom when it gets dark.',
      'He carries a Medicine Rune that hands out medicine to whoever needs it. Handy kid.',
    ],
  },
  hanna: {
    age: '29', from: 'Nameless Lands', position: 'Infantry Captain',
    secrets: [
      'She wandered all the way here from the Nameless Lands. Why? Nobody knows.',
      'Wild one. Loves her meat. Why am I even writing this down?',
      'She doesn\'t talk much. I bet she\'d get along with Oulan the bodyguard.',
    ],
  },
  millie: {
    age: '14', from: 'Unknown', position: 'Special Forces',
    secrets: [
      'She takes that pet of hers, Bonaparte, everywhere. She thinks it\'s cute. I don\'t see it.',
      'Cute? That bug-eyed thing? I tried, kid. I really tried.',
      'I saw her climb INSIDE Bonaparte and take a nap. I am not making this up.',
    ],
  },
  karen: {
    age: '17', from: 'Kuskus', position: 'Special Forces',
    secrets: [
      'When she dances, she becomes a different person. Like a twin sister swaps in.',
      'She learned to dance in the Toran Republic, from a teacher named Mina.',
    ],
  },
  shiro: {
    age: '9', from: 'Forest near Ryube', position: '—',
    secrets: [
      'He has been with Kinnison a long time. And I\'m investigating a dog now. Great.',
      'Half dog, half wolf. Smart, for a mutt.',
      'The other day I saw him running around with Gengen riding on his back.',
    ],
  },
  zamza: {
    age: '29', from: 'Unknown', position: 'Magic Unit Captain',
    secrets: [
      'I asked him a few questions. He talked about himself for five hours straight. I never got a word in.',
      'His Fire Dragon Rune burns him a little every time he uses it. Maybe that\'s why he\'s so hot-headed.',
    ],
  },
  gengen: {
    age: '17', from: 'Kobold Village near Two River City', position: 'Infantry Captain',
    secrets: [
      'Tail up means he\'s happy.',
      'Tail down means he\'s sad.',
      'Ears straight up means he has found something good to eat.',
    ],
  },
  gabocha: {
    age: '13', from: 'Two River City', position: 'Infantry Soldier',
    secrets: [
      'He fights best right next to Gengen. The two of them have a special move together.',
      'He looks up to Gengen so much he followed him all the way here. It\'s "Captain Gengen" this, "Captain Gengen" that.',
      'Every now and then, that kobold move of theirs does something amazing.',
    ],
  },
  kinnison: {
    age: '18', from: 'Forest near Ryube', position: 'Archer Captain',
    secrets: [
      'He and Shiro lived alone in the forest as hunters. Castle life is a hard change for them.',
      'He fought with Shiro to protect the forest from Highland, but one archer can only do so much.',
    ],
  },
  shilo: {
    age: '24', from: 'Lakewest', position: 'Special Forces',
    secrets: [
      'That guy must cheat! He has taken all my money!',
      'Again! How does he DO it?',
      'I\'m broke. This investigation is costing me a fortune. I quit.',
    ],
  },
  miklotov: {
    age: 'Unknown', from: 'Rockaxe', position: 'Cavalry Captain', note: 'Former Captain of the Blue Knights of Matilda',
    secrets: [
      'He says whatever is on his mind. That\'s why the ladies don\'t warm to him.',
      'Up early every morning, two hours of training before breakfast. That\'s how his Blue Knights got so good. Poor guys.',
    ],
  },
  camus: {
    age: '27', from: 'Grasslands', position: 'Cavalry Captain', note: 'Former member of the Red Knights of Matilda',
    secrets: [
      'Put him in a fight next to Miklotov, and the two of them pull off a real knights\' charge.',
      'Born in the Grasslands, he moved to Matilda young and passed the knight\'s test the same day as Miklotov.',
      'Rough manners, but a knight to the bone. Tough as nails.',
    ],
  },
  hauser: {
    age: '43', from: 'Muse City', position: 'General', note: 'Former Commander of the Muse City Army',
    secrets: [
      'Best military commander in all of the City-States of Jowston. Believe me.',
      'Anabelle ran Muse\'s civic affairs, and Hauser ran its army. Both were excellent, and Muse thrived.',
      'Most devoted man to his job I ever met. Never even cracks a smile.',
    ],
  },
  freed: {
    age: '25', from: 'Radat, South Window Principality', position: 'Infantry Captain',
    secrets: [
      'He has a house in Radat where he lives with his wife. A regular love nest. I can\'t stand it.',
      'He worshipped old Granmeyer. Without that war, Granmeyer might have gone down as one of the great mayors.',
      'He glows when Yoshino is around. I can\'t even look.',
    ],
  },
  kahn: {
    age: '32', from: 'Crystal Valley', position: 'Special Forces', note: 'Vampire hunter',
    secrets: [
      'The Marley family has hunted vampires for 300 years. Neclord has been their worst enemy all along.',
      'Three centuries of vampire-killing know-how, and none of it seems to work on Neclord.',
      'When the hunting is done, he wants to become a mineralogist. Strange guy.',
    ],
  },
  amada: {
    age: '26', from: 'Island Nations', position: '—',
    secrets: [
      'He can\'t start his day without fermented soybeans on rice. Natto. I\'m a fan myself.',
      'The Island Nations are a string of small islands far to the south, famous for their sailors.',
      'Stand him next to Rikimaru and you get one very "manly" pair.',
    ],
  },
  'tai-ho': {
    age: '37', from: 'Kaku, Toran Republic', position: 'Navy Captain', note: 'Original member of the Toran Liberation Army',
    secrets: [
      'He was a fisherman on Lake Toran, but he had a hunger to see more of the world, if you get me.',
      'He says he came to Jowston to work for a man named Kun Tze. Truth is, he was running from his wife.',
      'He\'s Yam Koo\'s brother-in-law, and they\'ve been friends since they were kids.',
    ],
  },
  anita: {
    age: '29', from: 'Nameless country', position: 'Cavalry',
    secrets: [
      'She trained under a famous swordmaster from the south, and got her Falcon Rune when she finished.',
      'She drinks too much, and other women can\'t stand her for what she does once she\'s drunk.',
    ],
  },
  bob: {
    age: '25', from: 'Grasslands', position: '—',
    secrets: [
      'He was born in a village of werewolves. One day a sorceress named Windy burned it to the ground and killed everyone.',
      'The change is his own nature. His rune doesn\'t make him transform: it helps him stay human.',
      'When he\'s run down, he changes more easily. He sneezed too hard the other day and, well...',
    ],
  },
  meg: {
    age: '16', from: 'Lenankamp, Toran Republic', position: 'Special Forces',
    secrets: [
      'She set out after an old man named Juppo, who was teaching her the lost art of gadgetry. She lost his trail. Maybe he didn\'t want to be followed.',
      'I saw Gadget in pieces all over her room. And she put it back together. Amazing.',
      'This girl acts first and thinks later. She had no real reason to chase Juppo either.',
    ],
  },
  gadget: {
    age: '3', from: 'Juppo\'s Workshop', position: '—',
    secrets: [
      'When it fights beside Meg, the two of them pull a trick attack.',
      'Being Meg\'s partner can\'t be easy. It hid from her by pretending to be a barrel of pickled radish.',
      'It hates water. Meg wants to waterproof it. It wants no part of that.',
    ],
  },
  ayda: {
    age: '17', from: 'Deep in the forest near Greenhill', position: 'Archer Captain', note: 'Guardian of the Forest',
    secrets: [
      'In the forest she moves like it\'s open ground. You\'ll never keep up with her in the trees.',
      'Born in the forest, lives to protect it, and says she\'ll die there.',
    ],
  },
  killey: {
    age: '30', from: 'Queendom of Falena', position: '—',
    secrets: [
      'He chases the secrets of the Sindar. Before he met you, he spent years as a prisoner in Falena.',
      'That look of his is a custom where he was born, something to do with the legendary Crimson Bird.',
    ],
  },
  sierra: {
    age: 'Unknown', from: 'Blue Moon Village', position: 'Special Forces', note: 'Inheritor of the Moon Rune',
    secrets: [
      'With the power of the Moon Rune, she founded a whole coven of lesser vampires.',
      'Vampires live a long time, but even they die in the end. All except their mistress, Sierra.',
      'She\'s in no hurry to go home. Nobody is left alive in her village. Only the undead.',
    ],
  },
  oulan: {
    age: '27', from: 'Holy Kingdom of Harmonia', position: 'Royal Guard',
    secrets: [
      'One tough bodyguard. Nobody she protects dies on her watch, even when everything around them falls apart.',
      'She has her own fan club. All girls.',
      'I found a note of hers: "90 60 89". Some kind of code, I guess.',
    ],
  },
  genshu: {
    age: '37', from: 'Unknown', position: 'Infantry',
    secrets: [
      'All he ever talks about is swords. He and Shin would get along great.',
      'He used to sell his sword to anyone who could pay. He got tired of that life.',
      'You should see his eyes when he\'s near the Star Dragon Sword. It\'s like he worships it.',
    ],
  },
  mukumuku: {
    age: '6', from: 'Greenhill Forest', position: 'Special Forces',
    secrets: [
      'The cape has nothing to do with the flying. And why am I investigating a flying squirrel?',
      'He lived in the forest around Greenhill, but now and then he visits Kyaro.',
      'He\'s the leader of his tribe. Brave, with a real sense of honor.',
    ],
  },
  feather: {
    age: '23', from: 'Unknown', position: 'Special Forces',
    secrets: [
      'Scary thing. I heard it came from some place called "Something Valley".',
      'How am I supposed to question something that doesn\'t speak our language? Give me a break.',
    ],
  },
  badeaux: {
    age: '38', from: 'Grasslands', position: 'Special Forces', note: 'Beastmaster',
    secrets: [
      'He talks to animals with a Rune of Mindfulness. People, on the other hand, he\'s not so good with.',
      'Sometimes he feeds the pigeons up on the castle roof.',
    ],
  },
  tsai: {
    age: '37', from: 'Ryube, Muse Principality', position: '—',
    secrets: [
      'He has a daughter and a wife he lives apart from. His daughter still visits friends in Ryube now and then.',
      'Great with a spear, hopeless with women. His daughter wants him back with his wife, but he cares more about work.',
      'He once drove his spear clean through a steel helmet. They\'ve called him Tsai of the Divine Spear ever since.',
    ],
  },
  luc: {
    age: '17', from: 'Unknown', position: 'Magic Unit Captain',
    secrets: [
      'His teacher, the sorceress Leknaat, keeps the Gate Rune, one of the 27 True Runes.',
      'He keeps his past close. I\'m pretty sure something happened to him in the Holy Kingdom of Harmonia.',
      'Ten years ago there was some trouble at a shrine. I don\'t know the details, but somebody told him to keep quiet about it.',
    ],
  },
  chaco: {
    age: '14', from: 'Two River City', position: 'Infantry Captain',
    secrets: [
      'Those Winger wings are handy for jumping down from high places. Not really flying, though.',
      'His girlfriend dumped him recently. He\'ll bounce back. Boys like him always do.',
    ],
  },
  nina: {
    age: '16', from: 'Greenhill City', position: 'Strategist\'s Retinue',
    secrets: [
      'The way she tails Flik, she could teach me a few things about investigating.',
      'Stubborn little firecracker. Nothing stands in her way.',
      'She knows Flik goes up to the roof at night. She\'s waiting for her chance to catch him alone.',
    ],
  },
  sid: {
    age: '21', from: 'Two River City', position: 'Infantry',
    secrets: [
      'I peeked in on him and he was walking around upside down on his hands. Training? I have no idea.',
      'He gathered a bunch of kids and told them a horror story so scary that one of them had an accident.',
      'He makes a little grave for every fish he eats. He\'s past 100 graves already.',
    ],
  },
  yoshino: {
    age: '23', from: 'South Window', position: 'Infantry', note: 'Freed\'s wife',
    secrets: [
      'Granmeyer introduced her to Freed. I don\'t know what she sees in him, but they\'ve been married five years.',
      'She fights side by side with her husband, and she makes a mean meat-and-potatoes. I prefer the second.',
      'She made Freed promise that after the war, they\'d go back to Radat and live quietly. Lovely woman.',
    ],
  },
  gijimu: {
    age: '39', from: 'Tinto Principality', position: 'Infantry Captain',
    secrets: [
      'A born bandit. To be fair, he mostly robbed greedy merchants.',
    ],
  },
  koyu: {
    age: '16', from: 'Tinto Principality', position: 'Infantry',
    secrets: [
      'He fights best in a trio with Gijimu and Lo Wen. Bandits stick together.',
      'He and Marlowe are good friends. Each has exactly what the other one wants.',
      'Gijimu, his brother-in-law, and Lo Wen are the only family he has left. Hard times.',
    ],
  },
  'lo-wen': {
    age: '28', from: 'Two River Principality', position: 'Infantry',
    secrets: [
      'She was skimming money from a member of the Three Houses in Two River. She got caught and left town fast.',
      'She\'s hardest on the guys she likes.',
      'Her dream is to open a little diner someday. I can\'t picture it.',
    ],
  },
  mazus: {
    age: '87', from: 'Unknown', position: 'Magic Unit Captain',
    secrets: [
      'His arch-rival in Toran is a man named Crowley, who supposedly has over 100 runes in his body.',
      'Long ago, Mazus and Crowley had a showdown on a mountaintop. It rained for a week and the mountain was flattened.',
      'Lately the girls around here ask him for love potions. That grumpy old goat, making love potions!',
    ],
  },
  sasuke: {
    age: '13', from: 'Rokkaku Hamlet', position: 'Infantry',
    secrets: [
      'He used to be close to Kasumi of Rokkaku. Now he avoids her. Boys and girls, eh?',
      'He says Hanzo ordered him here. Truth is, he likes being out in the real world.',
    ],
  },
  mondo: {
    age: '35', from: 'Rokkaku Hamlet', position: 'Infantry',
    secrets: [
      'They say he used to practice special techniques with Kasumi.',
      'Every morning he ties a long cloth around his waist and runs in circles. Ninja training?',
      'I caught him planting strange seeds in the courtyard and jumping around. Also training, I suppose.',
    ],
  },
  vincent: {
    age: '39', from: 'Gregminster', position: 'Cavalry', note: 'Former Scarlet Moon Empire noble',
    secrets: [
      'He used to be Scarlet Moon nobility, but he doesn\'t stand on ceremony now. Strong sense of duty, though.',
      'He calls Simone a dear friend. He seems to have an awful lot of "dearest friends".',
      'He and Simone take tea in the flower garden. Those two live in a world of their own.',
    ],
  },
  simone: {
    age: '32', from: 'Gregminster', position: 'Cavalry', note: 'Former Scarlet Moon Empire noble',
    secrets: [
      'Former Scarlet Moon nobility, but he\'d rather travel now. A classy guy.',
      'Where does he buy those clothes? Even I, Richmond, couldn\'t find out.',
    ],
  },
  'hai-yo': {
    age: '27', from: 'Black Dragon Island', position: 'Rearguard',
    secrets: [
      'He\'s on the run from something called the "Group". I don\'t know more.',
      'His secret Blue Moon Bird recipe is supposed to make anyone who eats it happy. Don\'t ask me how.',
      'He was engaged to a girl who was killed. Before she died, he made her a promise.',
    ],
  },
  stallion: {
    age: '28', from: 'Toran Republic', position: 'Strategist\'s Retinue', note: 'Original member of the Toran Liberation Army',
    secrets: [
      'He comes from the Elf village in Toran, but he left to train as the fastest man alive.',
      'He has a True Holy Rune, whatever that is. He sure runs fast outside the city.',
      'From what I see, he doesn\'t act much like an elf at all.',
    ],
  },
  wakaba: {
    age: '15', from: 'The Southlands', position: 'Infantry',
    secrets: [
      'She fell in love with the martial arts at a dojo in her neighborhood, and she has trained ever since.',
      'Yesterday: 200 squats, 50 pull-ups, 200 sit-ups. Before breakfast.',
      'She gives everything 100%. She stayed up all night on a borrowed jigsaw puzzle, got frustrated, and smashed it.',
    ],
  },
  'lc-chan': {
    age: '33', from: 'The Southlands', position: 'Infantry',
    secrets: [
      'Master and pupil fight best together. You should see it.',
      'He invented the Dragon style of fighting all by himself. Tough little guy.',
      'Wakaba is his only student now, but he dreams of a dojo with a thousand.',
    ],
  },
  gantetsu: {
    age: '45', from: 'Qlon, Toran Republic', position: 'Infantry',
    secrets: [
      'He trained at the temple in Qlon, until they threw him out for being too violent.',
      'Never met a priest like him. Looks more like a mobster in a priest\'s robe.',
    ],
  },
  hoi: {
    age: '16', from: 'Kanakan', position: 'Special Forces',
    secrets: [
      'Watch out. I saw him sneak into your room a couple of times.',
      'Interesting guy. He spends his days copying your moves, over and over.',
      'He was hanging around in front of the bathhouse. I wonder why.',
    ],
  },
  apple: {
    age: '18', from: 'Seika, Toran Republic', position: 'Vice-Strategist',
    secrets: [
      'Her parents died in the war between the Scarlet Moon Empire and Jowston. She got a scholarship to study under the great Mathiu, along with Shu.',
      'When the Liberation War began, she was studying in Crystal Valley. She left at once to help her master, Mathiu.',
      'She met Shu at 11, with no parents of her own. A schoolgirl crush, if you ask me.',
    ],
  },
  templeton: {
    age: '14', from: 'Kanakan', position: 'Strategist\'s Retinue', note: 'Mapmaker',
    secrets: [
      'Born in Kanakan, far south of Toran. He worked his way north, drawing that map of his.',
      'When the war is over, he plans to stay at Toran Castle for a while.',
    ],
  },
  kiba: {
    age: '37', from: 'Highland Kingdom', position: 'General', note: 'Former General of Highland\'s 3rd Army',
    secrets: [
      'For a man of his rank, Highland paid him peanuts, if you know what I mean.',
      'His first battle was the defense of Fort Retto. With 100 men he held off 3,000 State veterans.',
      'He swore loyalty to King Agares Blight. When Luca killed his own father, Kiba came over to us. Complicated man.',
    ],
  },
  fitcher: {
    age: '32', from: 'Coronet, Muse Principality', position: 'Strategist\'s Retinue',
    secrets: [
      'By Muse law, he\'s the mayor of Muse now. If you ask me, he doesn\'t have the guts for it.',
      'Half that fool act is on purpose, so people underestimate him. It\'s his strategy.',
      'He can sleep with his eyes wide open. Great trick for long, boring speeches.',
    ],
  },
  shu: {
    age: '26', from: 'Unknown', position: 'Army Strategist',
    secrets: [
      'He studied tactics under Mathiu, but was expelled for using what he learned for his own gain. He never saw Mathiu again.',
      'He thinks of Apple like a little sister. Mr. Cool never lets it show.',
    ],
  },
  tetsu: {
    age: '42', from: 'Lakewest', position: 'Infantry',
    secrets: [
      'Never met a man who loves baths more. He heats the water himself so he can be the first one in.',
      'He\'s really into bath design. He has come up with several styles.',
      'I saw him put an octopus urn in each corner of the tub. What for? No idea.',
    ],
  },
  leona: {
    age: '32', from: 'Toto Village, Muse Principality', position: 'Rearguard',
    secrets: [
      'She\'s from Toto. When it burned, it broke her heart, but she never let the customers see.',
      'She grumbles, but it\'s all show. She loves looking after kids.',
    ],
  },
  huan: {
    age: 'Unknown', from: 'Muse City', position: 'Rearguard',
    secrets: [
      'He learned medicine in the Toran Republic, from Liukan the Healer. Everything he knows came from that man.',
    ],
  },
  jess: {
    age: '24', from: 'Muse City', position: 'Strategist\'s Retinue', note: 'Vice-Mayor of Muse City',
    secrets: [
      'He was deeply in love with Anabelle. As her aide, he kept it to himself.',
      'His whole breakfast is one croissant. Weirdo.',
      'He hates bugs. One fell on him from a tree and he screamed like a baby who lost his bottle.',
    ],
  },
  hilda: {
    age: '33', from: 'Muse City', position: 'Rearguard',
    secrets: [
      'Before she married Alex, she was a nurse who made house calls. Love is blind, they say.',
      'She met Alex at the Muse Harvest Festival, and they married six months later. Happy couple.',
      'She worries about her son, Pete. He can\'t make friends, after living out in the country and then fleeing the war.',
    ],
  },
  alex: {
    age: '36', from: 'Muse City', position: 'Rearguard',
    secrets: [
      'He thought there was gold in those Sindar ruins. Tough luck.',
      'He wanted to make life easier for Hilda, but all that adventuring made it harder. That\'s his way of showing love, I guess.',
      'He still hasn\'t given up on Sindar treasure. He\'s following new leads right now.',
    ],
  },
  emilia: {
    age: '29', from: 'Greenhill City', position: 'Strategist\'s Retinue',
    secrets: [
      'Smart lady. But in matters of love she\'s a beginner, which is why she reads so many romance novels.',
      'The latest bestseller on her desk: "For Love of the Empire", by Millich the Flower General.',
    ],
  },
  tenkou: {
    age: '67', from: 'Crom, Tinto Principality', position: 'Rearguard', note: 'Windowmaker',
    secrets: [
      'He\'s crazy about Window Sets. Rumor is someone found one on the mountain path to Toran.',
      'He begged me: if anyone sees a Window Set in Greenhill, buy it for him. He sounded desperate.',
    ],
  },
  barbara: {
    age: '36', from: 'North Window', position: 'Rearguard',
    secrets: [
      'She\'s from North Window too, but she had just moved to Ryube when the Neclord business happened.',
      'She was married once, long ago. They didn\'t get along, so she left.',
    ],
  },
  richmond: {
    age: '35', from: 'South Window', position: 'Special Forces',
    secrets: [
      'You want to know about me, besides that I\'m handsome, wise, and brave? Careful, kid. Get too close to the fire and you\'ll get burned.',
    ],
  },
  'yam-koo': {
    age: '28', from: 'Seika, Toran Republic', position: 'Navy',
    secrets: [
      'He and Tai Ho have been brothers-in-law a long time. They met in a brawl over a gambling game.',
      'Tai Ho\'s wife, Kimberley, has a secret crush on Yam Koo.',
    ],
  },
  teresa: {
    age: '27', from: 'Greenhill City', position: 'General',
    secrets: [
      'After her father Alec died, the people wanted her as mayor. She said no, so they made her "acting mayor" instead.',
      'Being the mayor\'s daughter at school was hard. Everybody talking, everybody staring. I know the feeling.',
      'Everybody knows she loves Shin. But they\'re both too stubborn.',
    ],
  },
  yuzu: {
    age: '10', from: 'Forest Village, Muse Principality', position: 'Rearguard',
    secrets: [
      'The sheep that follows her is named Taro. That one is NOT for eating.',
      'She brands names on her animals. I saw "Hamburger", "Pork Cutlet", and "Genghis Khan".',
      'I got close to Taro and she yelled, "That one\'s not for eating! Back off!" I couldn\'t believe my ears.',
    ],
  },
  taki: {
    age: '72', from: 'Lakewest', position: 'Strategist\'s Retinue',
    secrets: [
      'She has lots of great stories. But what was that about making cats sniff orange peel?',
      'She has married sons in Two River, but she couldn\'t leave Lakewest. When this is over, she\'s going back.',
    ],
  },
  tony: {
    age: '19', from: 'Matilda Knights\' Domain', position: 'Rearguard',
    secrets: [
      'He spends all his time on his farm. The man loves dirt.',
      'He hates moles. Can\'t blame him: they eat the vegetables he raised so carefully.',
    ],
  },
  adlai: {
    age: '42', from: 'South Window City', position: 'Special Forces',
    secrets: [
      'His neighbors in South Window hated him. Strange experiments in his cellar, they said.',
      'He calls himself a genius, but apart from that elevator, he hasn\'t made anything truly useful.',
    ],
  },
  gordon: {
    age: '38', from: 'Rockland, Toran Republic', position: 'Rearguard',
    secrets: [
      'I found one of his secret trade memos: flutes to Forest Village, deer antlers back. Riveting.',
      'Memo two: furs to South Window, antlers and soy sauce from Rokkaku, wine from Gregminster.',
      'Memo three: holly berries to Crom, pearls from Rockaxe... and a "Peeing Boy" statue to Rockaxe. A what?',
    ],
  },
  hans: {
    age: '33', from: 'Zexen', position: 'Rearguard',
    secrets: [
      'Born in Zexen, and his family wasn\'t rich. He had just enough money to set up shop here in Jowston.',
      'He has saved up a fortune. Where he hides it, I have no idea.',
    ],
  },
  connell: {
    age: '12', from: 'Forest Village, Greenhill', position: 'Rearguard', note: 'Phonologist',
    secrets: [
      'His father was a musician too, so he went to study in the Holy Kingdom of Harmonia to follow in his footsteps.',
      'He worries about the little sister he left in Forest Village. The villagers promised to look after her, but still.',
      'He swears the Doremi elves carry music around with them. Kids.',
    ],
  },
  lebrante: {
    age: '40', from: 'Zexen', position: 'Rearguard',
    secrets: [
      'Prickly old man, but give him a couple of cups of sake and he\'ll sing your ears off.',
      'He shaves his head so no hair falls on his antiques.',
      'Why does he collect all those Celadon Urns? I\'d love to know.',
    ],
  },
  tessai: {
    age: '37', from: 'Kuskus, South Window Principality', position: 'Rearguard',
    secrets: [
      'He dreams of the legendary smith\'s hammers. Rumor puts an Iron Hammer somewhere in Forest Village.',
      'A Copper Hammer is supposed to be in Gregminster, they say.',
      'And a Silver Hammer somewhere in Greenhill. There\'s even talk of a Golden one.',
    ],
  },
  raura: {
    age: 'Unknown', from: 'Unknown', position: 'Magic Unit', note: 'Scroll maker',
    secrets: [
      'She and Jeane seem to know each other well, but I can\'t find out where they met.',
      'Scroll-making is a mystery. She takes the power of crystals and binds it into vellum. Amazing.',
    ],
  },
  annallee: {
    age: '17', from: 'Holy Kingdom of Harmonia', position: 'Special Forces',
    secrets: [
      'When she sings, tired soldiers find the strength to fight on.',
      'She was born in Harmonia. Her parents were killed under strange circumstances, and it took her a long time to open up.',
      'She met Pico and Alberto at a friend\'s house, and it changed her life. She seems happy now.',
    ],
  },
  pico: {
    age: '24', from: 'Muse City', position: 'Special Forces',
    secrets: [
      'He takes good care of Annallee, and not the way he "takes care" of other girls.',
      'He has broken plenty of hearts on the road with the band. He doesn\'t mean to. It just happens.',
    ],
  },
  alberto: {
    age: '31', from: 'Rockaxe', position: 'Special Forces',
    secrets: [
      'He was apprenticed to a barrel maker, but quit for a life in music.',
      'He sees Annallee more as a daughter than a little sister. He watches her like a proud papa.',
    ],
  },
  jude: {
    age: '22', from: 'Forest Village, Greenhill Principality', position: 'Special Forces',
    secrets: [
      'He\'s making some kind of Guardian Deity. What happens when he finishes it? What IS it?',
      'He has been studying who lands the finishing blow most often in battle. Looking for a model, maybe?',
    ],
  },
  jeane: {
    age: 'Unknown', from: 'Unknown', position: 'Magic Unit',
    secrets: [
      'Sorry. Tough lady. I couldn\'t get past her guard.',
      'I... I think I\'m in love. Forgive me.',
      'I c-can\'t say anything. That\'s all I can say. What a woman...',
    ],
  },
  ridley: {
    age: '39', from: 'Two River City', position: 'General', note: 'Commander of the Kobold Army of Two River City',
    secrets: [
      'I always wondered, so I checked. However famous he gets, he still has a tail.',
      'His son Boris is the spitting image of him. He\'s training in the Nameless Countries right now.',
    ],
  },
  klaus: {
    age: '19', from: 'Highland Kingdom', position: 'Vice-Strategist', note: 'Former strategist of Highland\'s 3rd Army',
    secrets: [
      'For now he takes after his mother. Give him a few years, though, and he may turn out like his dad.',
      'He worries his father drinks so much he\'ll ruin his liver.',
    ],
  },
  maximillian: {
    age: '65', from: 'Toran Republic', position: 'Cavalry Captain', note: 'Former commander of the Maximillian Knights',
    secrets: [
      'His knights belonged to the Scarlet Moon Empire, until they were disbanded for helping Jowston in its war with Highland.',
      'His squire, Sancho, went back home when he heard there was a war there. Ran all the way.',
    ],
  },
  marlowe: {
    age: '19', from: 'Crom, Tinto Principality', position: 'Strategist\'s Retinue',
    secrets: [
      'The mayor of Tinto called him in to tutor his daughter, but you impressed him so much he came here instead.',
      'He really wants to finish writing your chronicles. At his pace, he\'ll be with us a while.',
    ],
  },
  gilbert: {
    age: '36', from: 'Zexen', position: 'Infantry Captain',
    secrets: [
      'He was a mercenary in Zexen, west of the Grasslands, and came here looking for a war.',
      'He has a wife and kids back in Zexen. He wrote them a letter.',
    ],
  },
  valeria: {
    age: '29', from: 'Toran Republic', position: 'Volunteer Army General', note: 'One of the 6 Generals of the Toran Republic',
    secrets: [
      'She studied the sword for three years under a famous master in the south. She went home after that, but her mind is still only on the blade.',
      'Her Falcon Rune came from that swordmaster. Proof of her rank, I guess.',
      'She grew up in a poor village and worked hard to get where she is. It burned while she was away, and all her childhood friends died.',
    ],
  },
  abizboah: {
    age: '76', from: 'Mining cavern in Tinto City', position: 'Navy',
    secrets: [
      'C-come on, give me a break. If I get too close, that thing\'ll get me.',
      'Our ugly friend has a wife. If you can call it that.',
      'He bothered Viki on the docks the other day. She teleported him into the middle of the lake.',
    ],
  },
};
