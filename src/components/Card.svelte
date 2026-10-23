<script lang="ts">
  import type { FlipCause, Side } from '../core/types';
  import { ABILITIES } from '../data/abilities';
  import { CARD_BY_ID } from '../data/cards';
  import AbilityIcon from './AbilityIcon.svelte';
  import Portrait from './Portrait.svelte';
  import RuneIcon from './RuneIcon.svelte';

  let {
    id,
    values,
    base,
    boost = 0,
    owner = null,
    faceDown = false,
    silhouette = false,
    showName = false,
    selected = false,
    bond = false,
    mark = null,
    ghost = false,
  }: {
    id: string;
    values?: number[];
    /** Values to compare against for the up/down color. Defaults to the card's printed values. */
    base?: number[];
    boost?: number;
    owner?: Side | null;
    faceDown?: boolean;
    silhouette?: boolean;
    showName?: boolean;
    selected?: boolean;
    bond?: boolean;
    mark?: FlipCause | null;
    ghost?: boolean;
  } = $props();

  const def = $derived(CARD_BY_ID[id]);
  const shown = $derived(values ?? def?.values.map((v) => Math.min(10, v + boost)) ?? [0, 0, 0, 0]);
  const fmt = (v: number) => (v >= 10 ? 'A' : String(v));
  const delta = (d: number) => (def ? shown[d] - (base ?? def.values)[d] : 0);
  const POS = ['top', 'right', 'bottom', 'left'];
  const SIDE = ['Top', 'Right', 'Bottom', 'Left'];
  const label = $derived(
    faceDown || !def
      ? 'Face-down card'
      : `${def.name}, ${shown.map((v, i) => `${SIDE[i]} ${fmt(v)}`).join(', ')}, ${def.rune}` +
        (def.ability ? `, ${ABILITIES[def.ability].name}` : '') +
        (owner === 0 ? ', yours' : owner === 1 ? ', opponent' : ''),
  );
</script>

<div class="wrap" class:named={showName}>
  <div
    class="card {def?.tier ?? ''}"
    class:p0={owner === 0}
    class:p1={owner === 1}
    class:back={faceDown}
    class:sil={silhouette}
    class:selected
    class:ghost
    role="img"
    aria-label={label}
  >
    {#if faceDown}
      <div class="back-art" aria-hidden="true"><span>✦</span></div>
    {:else if def}
      <div class="portrait"><Portrait card={def} /></div>
      {#if !silhouette}
        {#if owner !== null}
          <div class="tint" aria-hidden="true"></div>
          <span class="owner" aria-hidden="true">{owner === 0 ? '●' : '◆'}</span>
        {/if}
        <span class="runeslot"><RuneIcon rune={def.rune} size={14} /></span>
        <div class="vals" aria-hidden="true">
          {#each shown as v, d}
            <span class="v {POS[d]}" class:up={delta(d) > 0} class:down={delta(d) < 0}>{fmt(v)}</span>
          {/each}
        </div>
        {#if def.ability}<span class="ability"><AbilityIcon ability={def.ability} /></span>{/if}
        {#if bond}<span class="bond" title="Bond active" aria-hidden="true">⛓</span>{/if}
        {#if boost}<span class="boost" aria-hidden="true">+{boost}</span>{/if}
      {/if}
      {#if mark}<span class="mark {mark}">{mark === 'basic' ? 'FLIP' : mark.toUpperCase()}</span>{/if}
    {/if}
  </div>
  {#if showName && def}
    <div class="name">{silhouette ? '???' : def.name}</div>
  {/if}
</div>

<style>
  .wrap { width: 100%; }
  .card {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    container-type: inline-size;
    background: #0d0b09;
    border: 2px solid #5a4a3a;
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.5);
    user-select: none;
  }
  /* Tier frames: bronze, silver, gold, bright gold, red */
  .card.support { border-color: #7a6450; }
  .card.fighter { border-color: #c9cfd8; box-shadow: 0 0 0 1px #6c7480, 0 2px 8px rgb(0 0 0 / 0.5); }
  .card.elite { border-color: var(--gold); box-shadow: 0 0 0 1px #6d5420, 0 2px 8px rgb(0 0 0 / 0.5); }
  .card.legend { border-color: var(--gold-2); box-shadow: 0 0 0 1px #6d5420, 0 0 10px rgb(217 180 91 / 0.45); }
  .card.boss { border-color: #b3261e; box-shadow: 0 0 0 1px #3a0d0a, 0 0 12px rgb(179 38 30 / 0.45); }
  .card.elite::after, .card.legend::after, .card.boss::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(115deg, transparent 35%, rgb(255 255 255 / 0.22) 50%, transparent 65%);
    background-size: 250% 100%;
    animation: shine 4.5s ease-in-out infinite;
  }
  .card.legend::after { background-image: linear-gradient(115deg, transparent 35%, rgb(255 225 140 / 0.35) 50%, transparent 65%); animation-duration: 3s; }
  .card.boss::after { background-image: linear-gradient(115deg, transparent 35%, rgb(255 120 100 / 0.3) 50%, transparent 65%); animation-duration: 3s; }
  @keyframes shine { 0%, 60% { background-position: 150% 0; } 100% { background-position: -100% 0; } }

  .portrait { position: absolute; inset: 0; }
  .tint { position: absolute; inset: 0; pointer-events: none; }
  .p0 { outline: 3px solid var(--p0); outline-offset: -3px; }
  .p1 { outline: 3px dashed var(--p1); outline-offset: -3px; }
  .p0 .tint { background: linear-gradient(0deg, color-mix(in srgb, var(--p0) 55%, transparent), transparent 70%); }
  .p1 .tint {
    background:
      repeating-linear-gradient(135deg, rgb(0 0 0 / 0.0) 0 6px, rgb(0 0 0 / 0.18) 6px 9px),
      linear-gradient(0deg, color-mix(in srgb, var(--p1) 60%, transparent), transparent 70%);
  }
  .owner { position: absolute; bottom: 4%; right: 6%; font-size: 13cqw; line-height: 1; text-shadow: 0 0 3px #000; }
  .p0 .owner { color: var(--p0); }
  .p1 .owner { color: var(--p1); }

  .runeslot { position: absolute; top: 3%; right: 3%; line-height: 0; padding: 1.5cqw; border-radius: 50%; background: rgb(0 0 0 / 0.5); }
  .runeslot :global(svg) { width: 18cqw; height: 18cqw; filter: drop-shadow(0 0.04em 0.1em rgb(0 0 0 / 0.9)) drop-shadow(0 0 1px #000); }

  /* Triple Triad layout: a small diamond of values in the top-left corner. */
  .vals {
    position: absolute; top: 2%; left: 2%;
    display: grid;
    grid-template-columns: repeat(3, 0.66em);
    grid-template-rows: repeat(3, 0.74em);
    font-size: 19cqw;
    padding: 0.08em 0.1em 0.14em;
    border-radius: 0.3em;
    background: radial-gradient(closest-side, rgb(0 0 0 / 0.35), transparent);
  }
  .v {
    font-weight: 800;
    line-height: 1;
    text-align: center;
    color: #fff;
    -webkit-text-stroke: 0.04em #000;
    paint-order: stroke fill;
    text-shadow: 0 0.06em 0.12em rgb(0 0 0 / 0.9), 0 0 0.25em rgb(0 0 0 / 0.6);
    font-variant-numeric: tabular-nums;
  }
  .v.top { grid-area: 1 / 2; }
  .v.left { grid-area: 2 / 1; }
  .v.right { grid-area: 2 / 3; }
  .v.bottom { grid-area: 3 / 2; }
  .v.up { color: #a6f3a9; }
  .v.down { color: #ff9c8a; }

  .ability {
    position: absolute; bottom: 3%; left: 3%;
    width: 18cqw; height: 18cqw; padding: 2.5cqw; border-radius: 50%;
    background: rgb(0 0 0 / 0.6); box-shadow: 0 0 0 1px rgb(255 255 255 / 0.15);
  }
  .bond {
    position: absolute; bottom: 4%; left: 50%; transform: translateX(-50%);
    font-size: 13cqw; color: var(--gold-2);
    text-shadow: 0 0 6px var(--gold), 0 0 2px #000;
  }
  .boost {
    position: absolute; top: 27%; right: 5%;
    font-size: 11cqw; font-weight: 800; color: #2a1d0b;
    background: var(--gold-2); border-radius: 6px; padding: 0 4px;
  }

  .back { border-color: #3d3227; }
  .back-art {
    position: absolute; inset: 0; display: grid; place-items: center;
    background:
      repeating-linear-gradient(45deg, #2b211a 0 8px, #241b15 8px 16px);
    color: var(--gold); font-size: 30cqw;
  }
  .sil .portrait { filter: brightness(0) opacity(0.7); }
  .sil { border-color: #3d3227 !important; box-shadow: none !important; }
  .sil::after { display: none; }

  .selected { transform: translateY(-6%); box-shadow: 0 0 0 3px var(--gold-2), 0 8px 18px rgb(0 0 0 / 0.6); }
  .ghost { opacity: 0.9; box-shadow: 0 0 0 3px var(--gold-2), 0 0 18px rgb(243 217 142 / 0.6); }

  .mark {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    font-size: 13cqw; font-weight: 900; letter-spacing: 0.04em;
    padding: 2px 6px; border-radius: 6px; color: #1b130c; background: #fff;
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.6);
    animation: pulse 900ms ease-in-out infinite alternate;
  }
  .mark.same { background: #f3d98e; }
  .mark.plus { background: #9fe3ff; }
  .mark.combo { background: #ffb3e1; }
  .mark.unite { background: #c6ff9a; }
  @keyframes pulse { from { transform: translate(-50%, -50%) scale(0.95); } to { transform: translate(-50%, -50%) scale(1.06); } }

  .name {
    margin-top: 4px; text-align: center; font-size: 0.75rem; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--muted);
  }
</style>
