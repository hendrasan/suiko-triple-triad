<script lang="ts">
  import { CONFIG } from '../core/config';
  import { hintFor, secretsOpen } from '../core/progress';
  import { REPORTS } from '../data/reports';
  import { cap, matchesCard } from '../lib/text';
  import { ABILITIES } from '../data/abilities';
  import { BONDS } from '../data/bonds';
  import type { CardDef } from '../core/types';
  import { CARDS, starKind as kind } from '../data/cards';
  import { openRegions, save } from '../stores/save.svelte';
  import { SHAPES, UNITE_TEXT } from '../data/formations';
  import Card from './Card.svelte';
  import ShapeIcon from './ShapeIcon.svelte';
  import RuneIcon from './RuneIcon.svelte';

  let filter = $state<'all' | 'heavenly' | 'earthly'>('all');
  let query = $state('');
  let open = $state<CardDef | null>(null);
  let dialog = $state<HTMLDialogElement | undefined>();

  const owned = $derived(new Set(save.owned));
  const regions = $derived(openRegions());
  const list = $derived(
    CARDS.filter((c) => (filter === 'all' || kind(c) === filter) && matchesCard(c, query, owned.has(c.id))),
  );
  const count = (k: 'heavenly' | 'earthly') => {
    const all = CARDS.filter((c) => kind(c) === k);
    return { have: all.filter((c) => owned.has(c.id)).length, total: all.length };
  };
  const heavenly = $derived(count('heavenly'));
  const earthly = $derived(count('earthly'));
  const FILTERS = $derived([
    { k: 'all', label: 'All', n: CARDS.length },
    { k: 'heavenly', label: 'Heavenly', n: heavenly.total },
    { k: 'earthly', label: 'Earthly', n: earthly.total },
  ] as const);
  const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);
  const hasRichmond = $derived(owned.has('richmond'));
  const wins = (id: string) => save.cardWins[id] ?? 0;
  const secretsTotal = CARDS.reduce((a, c) => a + REPORTS[c.id].secrets.length, 0);
  const secretsFound = $derived(
    save.owned.reduce((a, id) => a + secretsOpen(REPORTS[id]?.secrets.length ?? 0, wins(id), hasRichmond), 0),
  );
  const VIA: Record<string, string> = { starter: 'Starter', prize: 'Duel prize', quest: 'Recruit quest', bond: 'Bond recruit', story: 'Story' };

  function show(c: CardDef) {
    open = c;
    dialog?.showModal();
  }
</script>

{#snippet missingTile(c: CardDef)}
  <div class="missing" aria-hidden="true"></div>
{/snippet}

<div class="stars">
  <header class="head rise" style="--i:0">
    <div class="title">
      <h1>Stars of Destiny</h1>
      <span class="total"><strong>{save.owned.length}</strong> / {CARDS.length}</span>
    </div>
    <div class="meters">
      {#each [['Heavenly', heavenly, 'gold'], ['Earthly', earthly, 'bronze']] as const as [label, c, tone]}
        <div class="meter">
          <div class="meter-label small"><span>{label}</span><span>{c.have}/{c.total}</span></div>
          <div class="bar {tone}"><span style="width:{pct(c.have, c.total)}%"></span></div>
        </div>
      {/each}
      {#if hasRichmond}
        <div class="meter">
          <div class="meter-label small"><span>🔍 Richmond's Investigations</span><span>{secretsFound}/{secretsTotal}</span></div>
          <div class="bar blue"><span style="width:{pct(secretsFound, secretsTotal)}%"></span></div>
        </div>
      {/if}
    </div>
  </header>

  <div class="tools rise" style="--i:1">
    <div class="filters" role="radiogroup" aria-label="Filter">
      {#each FILTERS as f}
        <button class="seg" class:on={filter === f.k} role="radio" aria-checked={filter === f.k} onclick={() => (filter = f.k)}>
          {f.label} <span class="n">{f.n}</span>
        </button>
      {/each}
    </div>
    <input class="search" type="search" bind:value={query} placeholder="Search name or Star no." aria-label="Search Stars" />
  </div>

  <div class="grid rise" style="--i:2">
    {#each list as c (c.id)}
      {@const have = owned.has(c.id)}
      {@const total = REPORTS[c.id].secrets.length}
      {@const found = secretsOpen(total, wins(c.id), hasRichmond)}
      <button class="cell" class:have data-sfx="open" onclick={() => show(c)}
        aria-label={have ? `${c.name}${hasRichmond ? `, ${found} of ${total} investigations` : ''}` : `Unknown Star ${c.starNo ?? c.extraNo ?? ''}`}>
        <span class="no">{c.starNo ?? c.extraNo ?? '✦'}</span>
        {#if have}
          <Card id={c.id} showName />
          <!-- One dot per secret: filled = found. Only after Richmond joins. -->
          {#if hasRichmond}
            <span class="pips" aria-hidden="true">{#each Array(total) as _, i}<span class:on={i < found}></span>{/each}</span>
          {/if}
        {:else}
          {@render missingTile(c)}
          <div class="name">???</div>
        {/if}
      </button>
    {/each}
  </div>
  {#if !list.length}<p class="muted small none">No Stars match.</p>{/if}
</div>

<dialog bind:this={dialog} onclick={(e) => e.target === dialog && dialog?.close()}>
  {#if open}
    {@const have = owned.has(open.id)}
    <div class="detail">
      {#if have}
        <div class="detail-head">
          <div class="big"><Card id={open.id} /></div>
          <div class="detail-id">
            <p class="eyebrow">
              {open.starNo ? `Star ${open.starNo} · ${open.starName} Star · ${kind(open) === 'heavenly' ? 'Heavenly' : 'Earthly'}`
                : open.extraNo ? `No. ${open.extraNo} · Extra card · ${kind(open) === 'heavenly' ? 'Heavenly' : 'Earthly'}` : 'Story card'}
            </p>
            <h2>{open.name}</h2>
            <p class="blurb">{open.blurb}</p>
            <div class="row small">
              <span class="chip"><RuneIcon rune={open.rune} size={12} /> {cap(open.rune)}</span>
              <span class="chip">{cap(open.rarity)}</span>
              <span class="chip">Cost {CONFIG.costs[open.rarity]}</span>
              <span class="chip">Total {open.values.reduce((a, v) => a + v, 0)}</span>
              {#if save.via[open.id]}<span class="chip">{VIA[save.via[open.id]] ?? save.via[open.id]}</span>{/if}
            </div>
          </div>
        </div>
        {#if open.ability}
          <div class="ability small">
            <strong>{ABILITIES[open.ability].name}</strong> — {ABILITIES[open.ability].text}
          </div>
        {/if}
        {@const bonds = BONDS.filter((b) => b.members.includes(open!.id))}
        {#if bonds.length}
          <div class="small section">
            <h3>Bonds</h3>
            <ul>
              {#each bonds as b}
                <li>
                  {b.name}: {b.members.filter((m) => m !== open!.id).map((m) => (owned.has(m) ? CARDS.find((x) => x.id === m)?.name : '???')).join(', ')}
                  {#if b.shape}
                    <div class="muted">Formation <ShapeIcon shape={b.shape} /> {SHAPES[b.shape].name}: {SHAPES[b.shape].text} {UNITE_TEXT}</div>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
        <section class="report">
          <h3>🔍 Richmond's Investigations</h3>
          {#if !hasRichmond}
            <p class="muted small">Recruit Richmond, the detective of South Window, and he will investigate your Stars.</p>
          {:else}
            {@const r = REPORTS[open.id]}
            {@const n = secretsOpen(r.secrets.length, wins(open.id), true)}
            <dl class="profile small">
              <dt>Age</dt><dd>{r.age}</dd>
              <dt>From</dt><dd>{r.from}</dd>
              <dt>Position</dt><dd>{r.position}</dd>
              {#if r.note}<dt>Note</dt><dd>{r.note}</dd>{/if}
            </dl>
            <ol class="secrets small">
              {#each r.secrets as text, i}
                {#if i < n}
                  <li>“{text}”</li>
                {:else}
                  {@const need = i + 1 - wins(open.id)}
                  <li class="locked">🔒 Win {need} more {need === 1 ? 'duel' : 'duels'} with {open.name} in your deck.</li>
                {/if}
              {/each}
            </ol>
            {#if r.flag}<p class="flag small">Report note: {r.flag}</p>{/if}
          {/if}
        </section>
        {#if open.flag}<p class="flag small">Roster note: {open.flag}</p>{/if}
      {:else}
        <div class="big">{@render missingTile(open)}</div>
        <h2 class="center">{open.starNo ? `Star ${open.starNo}` : open.extraNo ? `No. ${open.extraNo}` : 'Unknown Star'}</h2>
        <p class="hint">{hintFor(open.id, regions)}</p>
      {/if}
      <button class="btn close" onclick={() => dialog?.close()}>Close</button>
    </div>
  {/if}
</dialog>

<style>
  .stars { display: flex; flex-direction: column; gap: 14px; }

  /* Header with progress */
  .head { display: grid; gap: 12px; }
  .title { display: flex; align-items: baseline; gap: 12px; }
  .title h1 { margin: 0; flex: 1; }
  .total { font-size: 0.95rem; color: var(--muted); font-variant-numeric: tabular-nums; }
  .total strong { font-size: 1.5rem; color: var(--gold-2); }
  .meters { display: grid; gap: 10px 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .meter:nth-child(3) { grid-column: 1 / -1; }
  @media (min-width: 720px) { .meters { grid-template-columns: repeat(3, minmax(0, 1fr)); } .meter:nth-child(3) { grid-column: auto; } }
  .meter-label { display: flex; justify-content: space-between; color: var(--muted); margin-bottom: 5px; font-variant-numeric: tabular-nums; }
  .bar { height: 6px; border-radius: 999px; background: rgb(255 255 255 / 0.08); overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: inherit; transition: width 400ms var(--ease-out); }
  .bar.gold span { background: linear-gradient(90deg, var(--gold), var(--gold-2)); }
  .bar.bronze span { background: linear-gradient(90deg, #8a6a46, #c49a6c); }
  .bar.blue span { background: linear-gradient(90deg, #4d7fb3, #8fb3d9); }

  /* Filter + search: one row on wide screens, stacked on phones */
  .tools { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .tools .search { flex: 1 1 220px; }
  .none { margin: 0; text-align: center; }

  /* Segmented filter */
  .filters {
    display: flex; gap: 4px; padding: 4px; border-radius: 999px; align-self: flex-start; max-width: 100%; overflow-x: auto;
    background: rgb(0 0 0 / 0.3); border: 1px solid var(--line);
  }
  .seg {
    min-height: 36px; padding: 0 14px; border-radius: 999px; border: 0; background: transparent; color: var(--muted);
    font-weight: 700; font-size: 0.86rem; white-space: nowrap;
    transition: background-color 160ms ease, color 160ms ease, transform 160ms var(--ease-out);
  }
  .seg:active { transform: scale(0.97); }
  .seg.on { background: linear-gradient(180deg, var(--gold-2), var(--gold)); color: #2a1d0b; }
  .n { font-weight: 600; opacity: 0.65; margin-left: 2px; font-variant-numeric: tabular-nums; }
  /* Narrow screens: the meters above already show the counts. */
  @media (max-width: 479px) { .n { display: none; } .seg { padding: 0 12px; } }

  /* Grid */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 14px 10px; padding-top: 6px; }
  @media (min-width: 720px) { .grid { grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); } }
  .cell { padding: 0; border: 0; background: none; position: relative; transition: transform 160ms var(--ease-out); }
  .cell:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) {
    .cell.have:hover { transform: translateY(-3px); }
    .cell.have:hover :global(.card) { box-shadow: 0 10px 20px rgb(0 0 0 / 0.55); }
  }
  .no {
    position: absolute; z-index: 1; top: -8px; left: 50%; transform: translateX(-50%); /* top center: the values are in the top-left corner */
    font-size: 0.65rem; font-weight: 800; font-variant-numeric: tabular-nums;
    background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 0 5px; color: var(--muted);
  }
  .have .no { color: var(--gold-2); border-color: #6d5420; }
  .pips { display: flex; justify-content: center; gap: 3px; margin-top: 3px; }
  .pips span { width: 5px; height: 5px; border-radius: 50%; box-shadow: inset 0 0 0 1px #6b7f95; }
  .pips span.on { background: #8fb3d9; box-shadow: none; }
  .missing { width: 100%; aspect-ratio: 1; border-radius: 10px; background: #000; border: 2px solid #3d3227; }
  .name { margin-top: 4px; text-align: center; font-size: 0.75rem; font-weight: 600; color: rgb(255 255 255 / 0.25); }

  /* Detail dialog: scales in from 0.96 with a fade (modals stay centered). */
  dialog {
    border: 1px solid var(--line); border-radius: 16px; background: var(--panel); color: var(--text);
    width: min(92vw, 560px); padding: 20px; max-height: 90dvh; overflow: auto;
    /* Closed state. The exit uses these transitions: a little faster than the entrance. */
    opacity: 0; transform: scale(0.96);
    transition: opacity 150ms var(--ease-out), transform 150ms var(--ease-out), overlay 150ms allow-discrete, display 150ms allow-discrete;
  }
  dialog[open] {
    opacity: 1; transform: none;
    transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out), overlay 200ms allow-discrete, display 200ms allow-discrete;
  }
  @starting-style { dialog[open] { opacity: 0; transform: scale(0.96); } }
  dialog:focus-visible { outline: none; } /* the dialog box itself; controls inside keep their focus ring */
  dialog::backdrop { background: rgb(0 0 0 / 0); transition: background-color 150ms ease, overlay 150ms allow-discrete, display 150ms allow-discrete; }
  dialog[open]::backdrop { background: rgb(0 0 0 / 0.7); transition: background-color 200ms ease, overlay 200ms allow-discrete, display 200ms allow-discrete; }
  @starting-style { dialog[open]::backdrop { background: rgb(0 0 0 / 0); } }
  .detail { display: flex; flex-direction: column; gap: 14px; }
  .detail-head { display: grid; gap: 14px; justify-items: center; text-align: center; }
  .detail-head .row { justify-content: center; }
  @media (min-width: 560px) {
    .detail-head { grid-template-columns: 160px 1fr; justify-items: start; text-align: left; align-items: center; }
    .detail-head .row { justify-content: flex-start; }
  }
  .big { width: 160px; }
  .detail > .big { margin: 0 auto; }
  .eyebrow { margin: 0 0 2px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold); }
  .detail h2 { margin: 0 0 6px; }
  .center { text-align: center; }
  .blurb { margin: 0 0 10px; font-family: var(--font-title); font-style: italic; }
  .hint { margin: 0; text-align: center; font-family: var(--font-title); font-style: italic; color: var(--muted); }
  .detail h3 { margin: 0 0 6px; font-size: 0.8rem; color: var(--muted); font-family: var(--font); text-transform: uppercase; letter-spacing: 0.08em; }
  .detail ul { margin: 0; padding-left: 1.2em; }
  .ability { border-left: 3px solid #c8a6ff; padding-left: 10px; }
  .report { border-top: 1px solid var(--line); padding-top: 12px; }
  .profile { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px; margin: 0 0 10px; }
  .profile dt { color: var(--muted); }
  .profile dd { margin: 0; }
  .secrets { margin: 0; padding-left: 1.4em; display: grid; gap: 8px; font-family: var(--font-title); font-style: italic; }
  .secrets .locked { color: var(--muted); list-style: none; margin-left: -1.4em; font-family: var(--font); font-style: normal; }
  .flag { margin: 0; color: var(--gold); border-left: 3px solid var(--gold); padding-left: 8px; }
  .close { align-self: stretch; }
</style>
