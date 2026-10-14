// Content checks: stat budgets, references, and that every card is reachable in each mode.
// Used by scripts/validate.ts and tests/data.test.ts.
import { CONFIG } from '../core/config';
import type { BoardSize } from '../core/types';
import { BONDS } from './bonds';
import { CARD_BY_ID, CARDS } from './cards';
import { OPPONENT_BY_ID, OPPONENTS, REGIONS } from './opponents';
import { BOND_RECRUITS, QUESTS, STARTERS, STORY_GATES } from './recruits';
import type { Cond, OpponentDef } from './schema';

export function checkBudgets(): string[] {
  const errs: string[] = [];
  for (const c of CARDS) {
    const b = CONFIG.budgets[c.rarity];
    const cut = c.ability ? CONFIG.abilityStatCost : 0;
    const sum = c.values.reduce((a, v) => a + v, 0);
    const [lo, hi] = [b.min - cut, b.max - cut];
    if (sum < lo || sum > hi) errs.push(`${c.id}: sum ${sum} outside ${c.rarity}${cut ? ' + ability' : ''} budget ${lo}-${hi}`);
    if (c.ability && c.rarity !== 'common') errs.push(`${c.id}: abilities are for Earthly Stars only`);
    if (c.values.some((v) => v < 1 || v > b.maxSide)) errs.push(`${c.id}: a value is outside 1-${b.maxSide}`);
  }
  return errs;
}

export function checkIntegrity(): string[] {
  const errs: string[] = [];
  const has = (id: string) => !!CARD_BY_ID[id];
  if (new Set(CARDS.map((c) => c.id)).size !== CARDS.length) errs.push('Duplicate card ids');
  const stars = CARDS.filter((c) => c.starNo);
  if (stars.length !== 108) errs.push(`Expected 108 Stars, found ${stars.length}`);
  const nos = new Set(stars.map((c) => c.starNo));
  for (let i = 1; i <= 108; i++) if (!nos.has(i)) errs.push(`Missing star number ${i}`);
  const heavenly = stars.filter((c) => c.starNo! <= 36);
  if (heavenly.some((c) => c.rarity === 'common')) errs.push('A Heavenly Star is common');
  if (stars.filter((c) => c.starNo! > 36).some((c) => c.rarity !== 'common')) errs.push('An Earthly Star is not common');

  for (const b of BONDS) for (const m of b.members) if (!has(m)) errs.push(`Bond ${b.id}: unknown card ${m}`);
  for (const b of BONDS) if (b.shape && (b.members.length < 3 || b.members.length > 4)) errs.push(`Bond ${b.id}: formations need 3-4 members`);
  for (const b of BONDS) if (b.shape === 'square' && b.members.length !== 4) errs.push(`Bond ${b.id}: square needs 4 members`);

  const regionIds = new Set(REGIONS.map((r) => r.id));
  const gated = new Set(STORY_GATES.map((g) => g.card));
  for (const r of REGIONS) if (r.unlock && !OPPONENT_BY_ID[r.unlock.boss]) errs.push(`Region ${r.id}: unknown boss`);
  for (const r of REGIONS) {
    if (!OPPONENTS.some((o) => o.region === r.id && o.boss)) errs.push(`Region ${r.id}: no boss`);
  }
  for (const o of OPPONENTS) {
    if (!regionIds.has(o.region)) errs.push(`${o.id}: unknown region`);
    if (o.deck.length !== 8) errs.push(`${o.id}: deck must have 8 cards`);
    if (new Set(o.deck).size !== o.deck.length) errs.push(`${o.id}: duplicate deck card`);
    for (const id of o.deck) {
      if (!has(id)) errs.push(`${o.id}: unknown card ${id}`);
      if (gated.has(id)) errs.push(`${o.id}: story card ${id} in deck`);
    }
    for (const size of [3, 4] as BoardSize[]) {
      const tiles = o.tiles[size];
      const [lo, hi] = CONFIG.runeTileCount[size];
      if (tiles.length < lo || tiles.length > hi) errs.push(`${o.id}: ${size}x${size} needs ${lo}-${hi} rune tiles`);
      if (tiles.some(([c]) => c < 0 || c >= size * size)) errs.push(`${o.id}: tile outside ${size}x${size} board`);
      if (new Set(tiles.map(([c]) => c)).size !== tiles.length) errs.push(`${o.id}: duplicate tile cell`);
    }
  }
  for (const id of STARTERS) if (!has(id)) errs.push(`Starter ${id} unknown`);
  for (const q of QUESTS) {
    if (!has(q.card)) errs.push(`Quest for unknown card ${q.card}`);
    for (const c of q.conds) {
      if (c.t === 'withCard' && !has(c.id)) errs.push(`Quest ${q.card}: unknown card ${c.id}`);
      if (c.t === 'opponent' && !OPPONENT_BY_ID[c.id]) errs.push(`Quest ${q.card}: unknown opponent ${c.id}`);
      if (c.t === 'region' && !regionIds.has(c.id)) errs.push(`Quest ${q.card}: unknown region ${c.id}`);
      if (c.t === 'bond' && c.id && !BONDS.some((b) => b.id === c.id)) errs.push(`Quest ${q.card}: unknown bond ${c.id}`);
    }
  }
  for (const b of BOND_RECRUITS) for (const id of [b.card, ...b.requires]) if (!has(id)) errs.push(`Bond recruit: unknown ${id}`);
  for (const g of STORY_GATES) if (!has(g.card) || !OPPONENT_BY_ID[g.boss]) errs.push(`Story gate ${g.card} broken`);
  return errs;
}

/** Simulate progress with every route open. Returns the set of card ids a player can reach in `mode`. */
export function reachable(mode: BoardSize): Set<string> {
  const owned = new Set(STARTERS);
  const beaten = new Set<string>();
  const deckSize = CONFIG.deckSize[mode];

  const regionOpen = (id: string) => {
    const r = REGIONS.find((x) => x.id === id)!;
    return !r.unlock || beaten.has(r.unlock.boss) || owned.size >= r.unlock.cards;
  };
  const openOpps = () => OPPONENTS.filter((o) => regionOpen(o.region));

  const condOk = (c: Cond, opps: OpponentDef[]): boolean => {
    const ownedCards = [...owned].map((id) => CARD_BY_ID[id]);
    switch (c.t) {
      case 'withCard': return owned.has(c.id);
      case 'withRune': return c.n <= deckSize && ownedCards.filter((x) => x.rune === c.rune).length >= c.n;
      case 'allCommon': return ownedCards.filter((x) => x.rarity === 'common').length >= deckSize;
      case 'runeTile': return opps.some((o) => o.tiles[mode].some(([, r]) => !c.rune || r === c.rune))
        && ownedCards.some((x) => !c.rune || x.rune === c.rune);
      case 'score': return c.n <= mode * mode + (mode === 3 ? 1 : 0);
      default: return true;
    }
  };

  let changed = true;
  while (changed) {
    changed = false;
    const add = (id: string) => { if (!owned.has(id)) { owned.add(id); changed = true; } };
    const opps = openOpps();
    for (const o of opps) {
      o.deck.forEach(add);
      if (o.boss && !beaten.has(o.id)) { beaten.add(o.id); changed = true; }
    }
    for (const g of STORY_GATES) if (beaten.has(g.boss)) add(g.card);
    for (const b of BOND_RECRUITS) if (b.requires.every((id) => owned.has(id))) add(b.card);
    for (const q of QUESTS) {
      if (q.mode && q.mode !== mode) continue;
      // Narrow the opponent pool by opponent/region/faction/general conditions.
      let pool = opps;
      for (const c of q.conds) {
        if (c.t === 'opponent') pool = pool.filter((o) => o.id === c.id);
        if (c.t === 'region') pool = pool.filter((o) => o.region === c.id);
        if (c.t === 'faction') pool = pool.filter((o) => o.faction === c.f);
        if (c.t === 'general') pool = pool.filter((o) => o.general);
        if (c.t === 'same') pool = pool.filter((o) => o.rules.same);
        if (c.t === 'plus') pool = pool.filter((o) => o.rules.plus);
        if (c.t === 'combo') pool = pool.filter((o) => o.rules.combo && (o.rules.same || o.rules.plus));
      }
      if (pool.length && q.conds.every((c) => condOk(c, pool))) add(q.card);
    }
  }
  return owned;
}

export function checkReachability(): string[] {
  const errs: string[] = [];
  for (const mode of [3, 4] as BoardSize[]) {
    const r = reachable(mode);
    for (const c of CARDS) if (!r.has(c.id)) errs.push(`${c.id}: not reachable in ${mode}x${mode}`);
  }
  return errs;
}

/** How many routes lead to each card. For the report only. */
export function routeCounts(): Record<string, { prize: number; quest: number; bond: number; story: number }> {
  const out: Record<string, { prize: number; quest: number; bond: number; story: number }> = {};
  for (const c of CARDS) out[c.id] = { prize: 0, quest: 0, bond: 0, story: 0 };
  for (const o of OPPONENTS) for (const id of o.deck) out[id].prize++;
  for (const q of QUESTS) out[q.card].quest++;
  for (const b of BOND_RECRUITS) out[b.card].bond++;
  for (const g of STORY_GATES) out[g.card].story++;
  return out;
}
