<script lang="ts">
  import { CONFIG } from '../core/config';
  import { RUNES, type BoardSize, type Rarity, type Rune } from '../core/types';
  import { BONDS } from '../data/bonds';
  import { CARD_BY_ID } from '../data/cards';
  import { SLOTS, defaultDeck } from '../stores/saveData';
  import { deckCost, deckProblem, persist, save } from '../stores/save.svelte';
  import { cap } from '../lib/text';
  import Card from './Card.svelte';
  import RuneIcon from './RuneIcon.svelte';

  let { initialMode }: { initialMode?: BoardSize } = $props();
  // svelte-ignore state_referenced_locally
  let mode = $state<BoardSize>(initialMode ?? 3);
  let rune = $state<Rune | 'all'>('all');
  let rarity = $state<Rarity | 'all'>('all');
  let sort = $state<'power' | 'star' | 'name'>('power');

  const slot = $derived(save.activeSlot[mode]);
  const deck = $derived(save.decks[mode][slot]);
  const size = $derived(CONFIG.deckSize[mode]);
  const cost = $derived(deckCost(deck));
  const problem = $derived(deckProblem(deck, mode));
  const sum = (id: string) => CARD_BY_ID[id].values.reduce((a, v) => a + v, 0);

  const pool = $derived(
    save.owned
      .map((id) => CARD_BY_ID[id])
      .filter((c) => (rune === 'all' || c.rune === rune) && (rarity === 'all' || c.rarity === rarity))
      .sort((a, b) =>
        sort === 'power' ? sum(b.id) - sum(a.id) : sort === 'name' ? a.name.localeCompare(b.name) : (a.starNo ?? 999) - (b.starNo ?? 999),
      ),
  );

  const bonds = $derived(
    BONDS.map((b) => ({ b, have: b.members.filter((m) => deck.includes(m)) })).filter((x) => x.have.length >= 2),
  );
  const partnerOfDeck = (id: string) => !deck.includes(id) && BONDS.some((b) => b.members.includes(id) && b.members.some((m) => m !== id && deck.includes(m)));
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
          <button class="slotcard" onclick={() => toggle(deck[i])} aria-label="Remove {CARD_BY_ID[deck[i]].name}">
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
          <div class="bond small">
            <span class="link">⛓</span> <strong>{b.name}</strong>
            {#if b.shape}
              <span class="muted">· Formation ({b.shape}) {have.length}/{b.members.length}{have.length === b.members.length ? ' ✓' : ''}</span>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <p class="muted small">No bonds in this deck. Bonded cards get +1 when they touch.</p>
    {/if}
  </div>

  <div class="row filters">
    <label class="small">Rune
      <select bind:value={rune}><option value="all">All</option>{#each RUNES as r}<option value={r}>{cap(r)}</option>{/each}</select>
    </label>
    <label class="small">Rarity
      <select bind:value={rarity}>
        <option value="all">All</option><option value="common">Common</option><option value="rare">Rare</option>
        <option value="special">Special</option><option value="boss">Boss</option>
      </select>
    </label>
    <label class="small">Sort
      <select bind:value={sort}><option value="power">Power</option><option value="star">Star no.</option><option value="name">Name</option></select>
    </label>
  </div>

  <div class="pool">
    {#each pool as c (c.id)}
      {@const inDeck = deck.includes(c.id)}
      <button class="poolcard" class:in={inDeck} onclick={() => toggle(c.id)} aria-pressed={inDeck} aria-label="{inDeck ? 'Remove' : 'Add'} {c.name}">
        <Card id={c.id} showName bond={partnerOfDeck(c.id)} />
        <span class="cost">{CONFIG.costs[c.rarity]}</span>
        {#if inDeck}<span class="check">✓</span>{/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .spacer { flex: 1; }
  .deck { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .deck.s4 { grid-template-columns: repeat(4, 1fr); }
  @media (min-width: 720px) { .deck.s4 { grid-template-columns: repeat(8, 1fr); } }
  .slotcard, .poolcard { padding: 0; border: 0; background: none; position: relative; }
  .empty { aspect-ratio: 1; border: 2px dashed var(--line); border-radius: 10px; }
  .chip.bad { color: var(--danger); border-color: var(--danger); }
  .warn { color: var(--danger); margin: 0; }
  .bonds { display: grid; gap: 4px; }
  .link { color: var(--gold-2); }
  .filters label { display: flex; flex-direction: column; gap: 2px; color: var(--muted); }
  select {
    min-height: 40px; border-radius: 8px; background: var(--panel); color: var(--text);
    border: 1px solid var(--line); padding: 0 8px; font: inherit;
  }
  .pool { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 10px; }
  .poolcard.in :global(.card) { opacity: 0.45; }
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
