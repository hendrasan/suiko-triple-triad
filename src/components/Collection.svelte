<script lang="ts">
  import { CONFIG } from '../core/config';
  import { hintFor } from '../core/progress';
  import { cap } from '../lib/text';
  import { ABILITIES } from '../data/abilities';
  import { BONDS } from '../data/bonds';
  import type { CardDef } from '../core/types';
  import { CARDS } from '../data/cards';
  import { openRegions, save } from '../stores/save.svelte';
  import { SHAPES, UNITE_TEXT } from '../data/formations';
  import Card from './Card.svelte';
  import ShapeIcon from './ShapeIcon.svelte';
  import RuneIcon from './RuneIcon.svelte';

  let filter = $state<'all' | 'heavenly' | 'earthly' | 'missing'>('all');
  let open = $state<CardDef | null>(null);
  let dialog = $state<HTMLDialogElement | undefined>();

  const owned = $derived(new Set(save.owned));
  const regions = $derived(openRegions());
  const list = $derived(
    CARDS.filter((c) =>
      filter === 'all' ? true
      : filter === 'missing' ? !owned.has(c.id)
      : filter === 'heavenly' ? (c.starNo ?? 99) <= 36
      : (c.starNo ?? 0) > 36,
    ),
  );
  const VIA: Record<string, string> = { starter: 'Starter', prize: 'Duel prize', quest: 'Recruit quest', bond: 'Bond recruit', story: 'Story' };

  function show(c: CardDef) {
    open = c;
    dialog?.showModal();
  }
</script>

<div class="stack">
  <div class="row">
    <h1 style="margin:0; flex:1">The 108 Stars</h1>
    <span class="muted small">{save.owned.length} of {CARDS.length}</span>
  </div>
  <div class="row" role="radiogroup" aria-label="Filter">
    {#each [['all', 'All'], ['heavenly', 'Heavenly'], ['earthly', 'Earthly'], ['missing', 'Missing']] as [k, label]}
      <button class="btn small" class:primary={filter === k} role="radio" aria-checked={filter === k} onclick={() => (filter = k as typeof filter)}>{label}</button>
    {/each}
  </div>

  <div class="grid">
    {#each list as c (c.id)}
      {@const have = owned.has(c.id)}
      <button class="cell" data-sfx="open" onclick={() => show(c)} aria-label={have ? c.name : `Unknown Star ${c.starNo ?? ''}`}>
        <span class="no">{c.starNo ?? '✦'}</span>
        <Card id={c.id} silhouette={!have} showName />
      </button>
    {/each}
  </div>
</div>

<dialog bind:this={dialog} onclick={(e) => e.target === dialog && dialog?.close()}>
  {#if open}
    {@const have = owned.has(open.id)}
    <div class="detail stack">
      <div class="big"><Card id={open.id} silhouette={!have} /></div>
      {#if have}
        <h2>{open.name}</h2>
        <p class="muted small">
          {open.starNo ? `Star ${open.starNo} · ${open.starName} Star · ${open.starNo <= 36 ? 'Heavenly' : 'Earthly'}` : 'Story card'}
        </p>
        <p>{open.blurb}</p>
        <div class="row small">
          <span class="chip"><RuneIcon rune={open.rune} size={12} /> {cap(open.rune)}</span>
          <span class="chip">{cap(open.rarity)}</span>
          <span class="chip">Cost {CONFIG.costs[open.rarity]}</span>
          <span class="chip">Total {open.values.reduce((a, v) => a + v, 0)}</span>
          {#if save.via[open.id]}<span class="chip">{VIA[save.via[open.id]] ?? save.via[open.id]}</span>{/if}
        </div>
        {#if open.ability}
          <div class="ability small">
            <strong>{ABILITIES[open.ability].name}</strong> — {ABILITIES[open.ability].text}
          </div>
        {/if}
        {@const bonds = BONDS.filter((b) => b.members.includes(open!.id))}
        {#if bonds.length}
          <div class="small">
            <strong>Bonds</strong>
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
        {#if open.flag}<p class="flag small">Roster note: {open.flag}</p>{/if}
      {:else}
        <h2>{open.starNo ? `Star ${open.starNo}` : 'Unknown Star'}</h2>
        <p class="muted">{hintFor(open.id, regions)}</p>
      {/if}
      <button class="btn" onclick={() => dialog?.close()}>Close</button>
    </div>
  {/if}
</dialog>

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 10px; }
  .cell { padding: 0; border: 0; background: none; position: relative; }
  .no {
    position: absolute; z-index: 1; top: -6px; left: -4px; font-size: 0.65rem; font-weight: 800;
    background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 0 4px; color: var(--muted);
  }
  dialog {
    border: 1px solid var(--line); border-radius: 16px; background: var(--panel); color: var(--text);
    width: min(92vw, 400px); padding: 20px;
  }
  dialog::backdrop { background: rgb(0 0 0 / 0.7); }
  .big { width: 180px; margin: 0 auto; }
  .detail h2 { margin: 0; }
  .detail p { margin: 0; }
  .detail ul { margin: 4px 0 0; padding-left: 1.2em; }
  .ability { border-left: 3px solid #c8a6ff; padding-left: 8px; }
  .flag { color: var(--gold); border-left: 3px solid var(--gold); padding-left: 8px; }
</style>
