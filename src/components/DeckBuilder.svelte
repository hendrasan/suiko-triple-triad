<script lang="ts">
  import { OPPONENT_BY_ID } from '../data/opponents';
  import { go } from '../stores/nav.svelte';
  import { CONFIG } from '../core/config';
  import { RUNES, type BoardSize, type Rune, type Tier } from '../core/types';
  import { BONDS } from '../data/bonds';
  import { CARD_BY_ID, starKind } from '../data/cards';
  import { SLOTS, defaultDeck } from '../stores/saveData';
  import { deckCost, deckProblem, persist, save } from '../stores/save.svelte';
  import { cap, matchesCard } from '../lib/text';
  import { SHAPES, UNITE_TEXT } from '../data/formations';
  import Card from './Card.svelte';
  import ShapeIcon from './ShapeIcon.svelte';
  import RuneIcon from './RuneIcon.svelte';

  let { initialMode, back }: { initialMode?: BoardSize; back?: string } = $props();
  // svelte-ignore state_referenced_locally
  let mode = $state<BoardSize>(initialMode ?? 3);
  let rune = $state<Rune | 'all'>('all');
  let star = $state<'heavenly' | 'earthly' | 'all'>('all');
  let tier = $state<Tier | 'all'>('all');
  const TIERS: Tier[] = ['legend', 'elite', 'fighter', 'support', 'boss'];
  let sort = $state<'power' | 'star' | 'name'>('power');
  let query = $state('');

  const slot = $derived(save.activeSlot[mode]);
  const deck = $derived(save.decks[mode][slot]);
  const size = $derived(CONFIG.deckSize[mode]);
  const cost = $derived(deckCost(deck));
  const problem = $derived(deckProblem(deck, mode));
  const sum = (id: string) => CARD_BY_ID[id].values.reduce((a, v) => a + v, 0);

  const pool = $derived(
    save.owned
      .map((id) => CARD_BY_ID[id])
      .filter((c) => (rune === 'all' || c.rune === rune) && (star === 'all' || starKind(c) === star) && (tier === 'all' || c.tier === tier) && matchesCard(c, query))
      .sort((a, b) =>
        sort === 'power' ? sum(b.id) - sum(a.id) : sort === 'name' ? a.name.localeCompare(b.name) : (a.starNo ?? 999) - (b.starNo ?? 999),
      ),
  );

  const bonds = $derived(
    BONDS.map((b) => ({ b, have: b.members.filter((m) => deck.includes(m)) })).filter((x) => x.have.length >= 2),
  );
  /** Names of the deck cards that this pool card has a bond with (empty when it is in the deck). */
  const deckPartners = (id: string) =>
    deck.includes(id) ? [] : [...new Set(BONDS.filter((b) => b.members.includes(id)).flatMap((b) => b.members.filter((m) => m !== id && deck.includes(m))))]
      .map((m) => CARD_BY_ID[m].name);
  const runeCounts = $derived(RUNES.map((r) => [r, deck.filter((id) => CARD_BY_ID[id].rune === r).length] as const));

  function toggle(id: string) {
    const d = save.decks[mode][slot];
    const i = d.indexOf(id);
    if (i >= 0) d.splice(i, 1);
    else if (d.length < size) d.push(id);
    persist();
  }
  function setSlot(i: number) {
    save.activeSlot[mode] = i;
    persist();
  }
  function autoFill() {
    save.decks[mode][slot] = defaultDeck(save.owned, mode);
    persist();
  }
  function clear() {
    save.decks[mode][slot] = [];
    persist();
  }
</script>

<div class="stack">
  {#if back}
    <button class="btn small back" data-sfx="back" onclick={() => go({ name: 'prep', opponent: back, mode })}>← Back to {OPPONENT_BY_ID[back]?.name ?? 'duel'}</button>
  {/if}
  <div class="row" role="radiogroup" aria-label="Mode">
    <button class="btn" class:primary={mode === 3} role="radio" aria-checked={mode === 3} onclick={() => (mode = 3)}>Triple Triad · 5</button>
    <button class="btn" class:primary={mode === 4} role="radio" aria-checked={mode === 4} onclick={() => (mode = 4)}>Quad Quartet · 8</button>
  </div>

  <div class="panel stack">
    <div class="row">
      <span class="muted small">Slot</span>
      {#each Array(SLOTS) as _, i}
        <button class="btn small" class:primary={slot === i} onclick={() => setSlot(i)} aria-pressed={slot === i}>{i + 1}</button>
      {/each}
      <span class="spacer"></span>
      <button class="btn small" onclick={autoFill}>Auto</button>
      <button class="btn small" onclick={clear}>Clear</button>
    </div>

    <div class="deck s{mode}">
      {#each Array(size) as _, i}
        {#if deck[i]}
          <button class="slotcard" data-sfx="remove" onclick={() => toggle(deck[i])} aria-label="Remove {CARD_BY_ID[deck[i]].name}">
            <Card id={deck[i]} showName />
          </button>
        {:else}
          <div class="empty" aria-hidden="true"></div>
        {/if}
      {/each}
    </div>

    <div class="stats row small">
      <span class="chip" class:on={!problem}>{deck.length}/{size} cards</span>
      {#if mode === 4}
        <span class="chip" class:bad={cost > CONFIG.costCap}>Cost {cost}/{CONFIG.costCap}</span>
      {/if}
      {#each runeCounts as [r, n]}
        <span class="chip"><RuneIcon rune={r} size={12} /> {n}</span>
      {/each}
    </div>
    {#if problem}<p class="warn small">{problem}</p>{/if}

    {#if bonds.length}
      <div class="bonds">
        {#each bonds as { b, have }}
          {@const ready = have.length === b.members.length}
          {@const missing = b.members.filter((m) => !have.includes(m))}
          <div class="bond small" class:inactive={!ready}>
            <div class="bond-head">
              <span class="link">⛓</span> <strong>{b.name}</strong>
              {#if b.shape}<span class="muted">· Formation <ShapeIcon shape={b.shape} /> {SHAPES[b.shape].name} {have.length}/{b.members.length}</span>{/if}
              <span class="status" class:ok={ready}>{ready ? 'Ready' : 'Not ready'}</span>
            </div>
            <div class="muted form-help">
              {#if !b.shape}
                +1 on all sides while these cards touch on the board.
              {:else if ready}
                {SHAPES[b.shape].text} {UNITE_TEXT}
              {:else}
                Add {missing.map((m) => (save.owned.includes(m) ? CARD_BY_ID[m].name : 'an unknown Star')).join(' and ')} to enable the Unite Attack.
                Members in the deck still get +1 when they touch. Shape: {SHAPES[b.shape].text}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="muted small">No bonds in this deck. Bonded cards get +1 when they touch.</p>
    {/if}
  </div>

  <input class="search" type="search" bind:value={query} placeholder="Search name or Star no." aria-label="Search cards" />
  <div class="row filters">
    <label class="small">Rune
      <select bind:value={rune}><option value="all">All</option>{#each RUNES as r}<option value={r}>{cap(r)}</option>{/each}</select>
    </label>
    <label class="small">Star
      <select bind:value={star}><option value="all">All</option><option value="heavenly">Heavenly</option><option value="earthly">Earthly</option></select>
    </label>
    <label class="small">Tier
      <select bind:value={tier}><option value="all">All</option>{#each TIERS as t}<option value={t}>{cap(t)}</option>{/each}</select>
    </label>
    <label class="small">Sort
      <select bind:value={sort}><option value="power">Power</option><option value="star">Star no.</option><option value="name">Name</option></select>
    </label>
  </div>

  <div class="pool">
    {#each pool as c (c.id)}
      {@const inDeck = deck.includes(c.id)}
      {@const partners = deckPartners(c.id)}
      <button class="poolcard" class:in={inDeck} class:partner={partners.length > 0} data-sfx={inDeck ? 'remove' : 'add'} onclick={() => toggle(c.id)} aria-pressed={inDeck}
        aria-label="{inDeck ? 'Remove' : 'Add'} {c.name}{partners.length ? `, bond with ${partners.join(', ')}` : ''}" title={partners.length ? `Bond with ${partners.join(', ')}` : undefined}>
        <Card id={c.id} showName />
        <span class="cost">{CONFIG.costs[c.tier]}</span>
        {#if partners.length}<span class="bondtag" aria-hidden="true">⛓ Bond</span>{/if}
        {#if inDeck}<span class="check">✓</span>{/if}
      </button>
    {/each}
  </div>
  {#if !pool.length}<p class="muted small none">No cards match.</p>{/if}
</div>

<style>
  .back { align-self: flex-start; }
  .spacer { flex: 1; }
  /* minmax(0, 1fr): columns stay equal and never grow wider than the panel. */
  .deck { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; align-items: start; }
  .deck.s4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (min-width: 720px) { .deck.s4 { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
  /* width: 100% — a button shrinks to its content, and the card inside sizes to the button. */
  .slotcard, .poolcard { width: 100%; padding: 0; border: 0; background: none; position: relative; }
  .empty { aspect-ratio: 1; border: 2px dashed var(--line); border-radius: 10px; }
  .chip.bad { color: var(--danger); border-color: var(--danger); }
  .warn { color: var(--danger); margin: 0; }
  .bonds { display: grid; gap: 4px; }
  .link { color: var(--gold-2); }
  .bond-head { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .form-help { margin: 2px 0 4px 1.4em; font-size: 0.8rem; }
  .status {
    margin-left: auto; padding: 1px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
    border: 1px solid var(--line); color: var(--muted);
  }
  .status.ok { border-color: var(--ok); color: var(--ok); }
  .bond.inactive strong { color: var(--muted); }
  .bond.inactive .link { color: var(--muted); }
  /* Four equal columns, so the selects stay on one line on phones. */
  .filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: 560px; }
  .filters label { display: flex; flex-direction: column; gap: 2px; color: var(--muted); }
  select {
    width: 100%; min-height: 40px; border-radius: 8px; background: var(--panel); color: var(--text);
    border: 1px solid var(--line); padding: 0 8px; font: inherit;
  }
  .none { margin: 0; text-align: center; }
  .pool { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 10px; }
  .poolcard.in :global(.card) { opacity: 0.45; }
  /* Bond partner of a deck card: gold ring + a tag on the top edge (the corners hold cost and rune). */
  .poolcard.partner :global(.card) { box-shadow: 0 0 0 2px var(--gold-2), 0 0 12px rgb(243 217 142 / 0.45); }
  .bondtag {
    position: absolute; z-index: 1; top: -8px; left: 50%; transform: translateX(-50%); white-space: nowrap;
    padding: 0 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 600;
    background: var(--gold-2); color: #2a1d0b;
  }
  .cost {
    position: absolute; top: -4px; left: -4px; width: 20px; height: 20px; border-radius: 50%;
    display: grid; place-items: center; font-size: 0.7rem; font-weight: 800;
    background: var(--gold); color: #2a1d0b;
  }
  .check {
    position: absolute; top: 30%; left: 50%; transform: translateX(-50%);
    font-size: 1.6rem; font-weight: 900; color: var(--ok); text-shadow: 0 0 4px #000;
  }
</style>
