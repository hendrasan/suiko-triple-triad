// Recruiting and progression rules. Pure: takes the owned set and returns what changes.
import { CARD_BY_ID } from '../data/cards';
import { OPPONENT_BY_ID, OPPONENTS } from '../data/opponents';
import { BOND_RECRUITS, QUESTS, STORY_GATES } from '../data/recruits';
import type { Cond, OpponentDef, RegionDef } from '../data/schema';
import type { MatchSummary } from './match';

export type Via = 'prize' | 'quest' | 'bond' | 'story' | 'starter';

export interface Recruit { id: string; via: Via }

export function condMet(c: Cond, s: MatchSummary, opp: OpponentDef): boolean {
  const deck = s.deck.map((id) => CARD_BY_ID[id]);
  switch (c.t) {
    case 'withCard': return s.deck.includes(c.id);
    case 'withRune': return deck.filter((d) => d.rune === c.rune).length >= c.n;
    case 'allCommon': return deck.every((d) => d.rarity === 'common');
    case 'flawless': return s.flawless;
    case 'flips': return s.flipsMax >= c.n;
    case 'same': return s.same;
    case 'plus': return s.plus;
    case 'combo': return s.comboMax >= c.n;
    case 'unite': return s.unite;
    case 'bond': return c.id ? s.bonds.includes(c.id) : s.bonds.length > 0;
    case 'runeTile': return c.rune ? s.runeTiles.includes(c.rune) : s.runeTiles.length > 0;
    case 'score': return s.score >= c.n;
    case 'second': return s.second;
    case 'opponent': return opp.id === c.id;
    case 'region': return opp.region === c.id;
    case 'faction': return opp.faction === c.f;
    case 'general': return !!opp.general;
  }
}

/** Story gates and quests completed by a won match. Prizes are handled by the caller. */
export function recruitsFromMatch(owned: Set<string>, s: MatchSummary): Recruit[] {
  if (!s.won) return [];
  const opp = OPPONENT_BY_ID[s.opponent];
  const out: Recruit[] = [];
  const add = (id: string, via: Recruit['via']) => {
    if (!owned.has(id) && !out.some((r) => r.id === id)) out.push({ id, via });
  };
  for (const g of STORY_GATES) if (g.boss === opp.id) add(g.card, 'story');
  for (const q of QUESTS) {
    if (q.mode && q.mode !== s.mode) continue;
    if (q.conds.every((c) => condMet(c, s, opp))) add(q.card, 'quest');
  }
  return out;
}

/** Cards that join because the player owns all of their requirements. Repeats until stable. */
export function bondRecruits(owned: Set<string>): Recruit[] {
  const have = new Set(owned);
  const out: Recruit[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const b of BOND_RECRUITS) {
      if (!have.has(b.card) && b.requires.every((id) => have.has(id))) {
        have.add(b.card);
        out.push({ id: b.card, via: 'bond' });
        changed = true;
      }
    }
  }
  return out;
}

export function regionOpen(r: RegionDef, ownedCount: number, beaten: Record<string, unknown>): boolean {
  return !r.unlock || !!beaten[r.unlock.boss] || ownedCount >= r.unlock.cards;
}

/** Prize choices after a win. 'choose' lists every unowned card; the others pick one. */
export function prizeOptions(opp: OpponentDef, oppDeck: string[], owned: Set<string>, rng: () => number): { rule: OpponentDef['prize']; cards: string[] } {
  const fresh = oppDeck.filter((id) => !owned.has(id));
  if (!fresh.length) return { rule: opp.prize, cards: [] };
  if (opp.prize === 'choose') return { rule: 'choose', cards: fresh };
  if (opp.prize === 'random') return { rule: 'random', cards: [fresh[Math.floor(rng() * fresh.length)]] };
  const sum = (id: string) => CARD_BY_ID[id].values.reduce((a, v) => a + v, 0);
  return { rule: 'highest', cards: [fresh.reduce((a, b) => (sum(b) > sum(a) ? b : a))] };
}

/** Hint text for a missing card on the collection screen. */
export function hintFor(id: string, openRegions: Set<string>): string {
  const story = STORY_GATES.find((g) => g.card === id);
  if (story) return story.hint;
  const quest = QUESTS.find((q) => q.card === id && q.conds.every((c) => c.t !== 'region' || openRegions.has(c.id)));
  if (quest) return quest.hint;
  const bond = BOND_RECRUITS.find((b) => b.card === id);
  if (bond) return bond.hint;
  const holder = OPPONENTS.find((o) => o.deck.includes(id) && openRegions.has(o.region));
  if (holder) return `Rumor says ${holder.name} carries this card.`;
  return 'Nobody has heard of this Star yet. Travel further.';
}

/** Rumors for the tavern: quest and bond hints for missing cards in open regions. */
export function rumors(owned: Set<string>, openRegions: Set<string>): { id: string; text: string; kind: 'quest' | 'bond' }[] {
  const out: { id: string; text: string; kind: 'quest' | 'bond' }[] = [];
  for (const q of QUESTS) {
    if (owned.has(q.card)) continue;
    const regionOk = q.conds.every((c) => c.t !== 'region' || openRegions.has(c.id));
    const oppOk = q.conds.every((c) => c.t !== 'opponent' || openRegions.has(OPPONENT_BY_ID[c.id].region));
    if (regionOk && oppOk && !out.some((r) => r.text === q.hint)) {
      const tag = q.mode ? ` (${q.mode}x${q.mode} only)` : '';
      out.push({ id: q.card, text: q.hint + tag, kind: 'quest' });
    }
  }
  for (const b of BOND_RECRUITS) {
    if (!owned.has(b.card) && b.requires.some((id) => owned.has(id))) out.push({ id: b.card, text: b.hint, kind: 'bond' });
  }
  return out;
}
