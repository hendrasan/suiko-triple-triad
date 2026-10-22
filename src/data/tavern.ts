// Who tells each rumor in Leona's Tavern. Picked from the card id, so a rumor keeps its speaker.
export const SPEAKERS = [
  'Drunk Merchant', 'Mercenary', 'Old Fisherman', 'Traveling Bard', 'Retired Soldier', 'Gossiping Maid',
  'Kobold Peddler', 'Highland Deserter', 'Toto Farmer', 'Wandering Monk', 'Card Shark', 'Kuskus Sailor',
  'Muse Guard', 'Tired Courier', 'Fortune Teller', 'Shady Trader',
];

export function speakerFor(cardId: string): string {
  let h = 0;
  for (const ch of cardId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SPEAKERS[h % SPEAKERS.length];
}
