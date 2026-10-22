<script lang="ts">
  import { CONFIG } from '../core/config';
  import { newSeed } from '../core/rng';
  import type { BoardSize, Rules } from '../core/types';
  import { OPPONENT_BY_ID, REGIONS } from '../data/opponents';
  import { portraitUrl } from '../data/portraits';
  import { PRIZE_LABEL } from '../data/schema';
  import { go } from '../stores/nav.svelte';
  import { activeDeck, deckCost, deckProblem, save } from '../stores/save.svelte';
  import Card from './Card.svelte';

  let { opponent }: { opponent: string } = $props();
  const opp = $derived(OPPONENT_BY_ID[opponent]);
  const region = $derived(REGIONS.find((r) => r.id === opp.region));
  let mode = $state<BoardSize>(3);

  const deck = $derived(activeDeck(mode));
  const problem = $derived(deckProblem(deck, mode));
  const DIFF = { easy: 1, normal: 2, hard: 3, boss: 4 } as const;

  const RULES: { key: keyof Rules; name: string; text: string }[] = [
    { key: 'same', name: 'Same', text: 'Equal values on 2+ sides flip those cards.' },
    { key: 'plus', name: 'Plus', text: 'Equal sums on 2+ sides flip those cards.' },
    { key: 'combo', name: 'Combo', text: 'Cards flipped by Same or Plus attack again.' },
    { key: 'runes', name: 'Runes', text: 'Matching rune tile +1, other rune −1.' },
    { key: 'bonds', name: 'Bonds', text: 'Bonded allies get +1 while they touch.' },
    { key: 'unite', name: 'Unite', text: 'A complete formation flips one enemy.' },
  ];

  const MODES = [
    { size: 3 as BoardSize, name: 'Triple Triad', sub: '3×3 · 5 cards' },
    { size: 4 as BoardSize, name: 'Quad Quartet', sub: `4×4 · 8 cards · cost ≤ ${CONFIG.costCap}` },
  ];
  const tileAt = (size: BoardSize, cell: number) => opp.tiles[size].find(([c]) => c === cell)?.[1];
  const wins = (size: BoardSize) => save.beaten[opp.id]?.[size] ?? 0;

  const formatText = $derived(
    opp.format === 'bo2'
      ? 'Best of two: win both games to win the match. The first player switches in game 2.'
      : mode === 4
        ? 'Single game. The first player boosts one card by +1, because the second player gets the last move.'
        : 'Single game.',
  );
</script>

<div class="prep">
  <button class="btn small back" data-sfx="back" onclick={() => go({ name: 'map' })}>← World</button>

  <section class="panel hero rise" class:boss={opp.boss} style="--i:0">
    <div class="portrait" aria-hidden="true">
      {#if opp.portrait}
        <img src={portraitUrl(opp.portrait)} alt="" />
      {:else}
        <span class="mono">{opp.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
      {/if}
    </div>
    <div class="id">
      <p class="eyebrow">{region?.name} · {opp.title}</p>
      <h1>{opp.name}</h1>
      <div class="badges">
        {#if opp.boss}<span class="badge boss-badge">Boss</span>{/if}
        <span class="badge">{opp.format === 'bo2' ? 'Best of 2' : 'Single game'}</span>
        <span class="badge" aria-label="Difficulty {DIFF[opp.difficulty]} of 4">
          {#each [1, 2, 3, 4] as n}<span class="pip" class:on={n <= DIFF[opp.difficulty]}>★</span>{/each}
        </span>
        <span class="badge">{PRIZE_LABEL[opp.prize]}</span>
      </div>
    </div>
    <blockquote>{opp.intro}</blockquote>
  </section>




  <div class="modes rise" style="--i:1" role="radiogroup" aria-label="Board mode">
    {#each MODES as m}
      <button class="mode" class:selected={mode === m.size} role="radio" aria-checked={mode === m.size} onclick={() => (mode = m.size)}>
        <span class="check" aria-hidden="true">✓</span>
        <span class="mini s{m.size}" aria-hidden="true">
          {#each Array(m.size * m.size) as _, cell}
            {@const tile = tileAt(m.size, cell)}
            <span class="dot {tile ?? ''}"></span>
          {/each}
        </span>
        <span class="mode-name">{m.name}</span>
        <span class="muted small">{m.sub}</span>
        <span class="record small" class:won={wins(m.size) > 0}>{wins(m.size) ? `Won ${wins(m.size)}×` : 'Not beaten yet'}</span>
      </button>
    {/each}
  </div>
  <p class="muted small legend rise" style="--i:1">Colored dots are rune tiles.</p>
  <section class="panel rise" style="--i:2">
    <div class="deck-head">
      <h3>Your deck</h3>
      <span class="muted small">Slot {save.activeSlot[mode] + 1}{mode === 4 ? ` · cost ${deckCost(deck)}/${CONFIG.costCap}` : ''}</span>
      <button class="btn small edit" onclick={() => go({ name: 'decks', mode })}>Edit deck</button>
    </div>
    <div class="deck s{mode}">
      {#each Array(CONFIG.deckSize[mode]) as _, i}
        {#if deck[i]}<Card id={deck[i]} />{:else}<div class="empty" aria-hidden="true"></div>{/if}
      {/each}
    </div>
  </section>
  <section class="panel rise" style="--i:3">
    <h3>Rules</h3>
    <ul class="rules">
      {#each RULES.filter((r) => opp.rules[r.key]) as r}
        <li>
          <span class="mark" aria-hidden="true">✓</span>
          <span><strong>{r.name}</strong><span class="rule-text">{r.text}</span></span>
        </li>
      {/each}
    </ul>
    <p class="muted small format">{formatText}</p>
  </section>
  <div class="actionbar">
    <div class="action-text">
      {#if problem}
        <span class="warn small">{problem}</span>
      {:else}
        <strong>{MODES.find((m) => m.size === mode)?.name}</strong>
        <span class="muted small">vs {opp.name}</span>
      {/if}
    </div>
    <button class="btn primary duel" disabled={!!problem} onclick={() => go({ name: 'duel', opponent: opp.id, mode, seed: newSeed() })}>Duel</button>
  </div>
</div>

<style>
  .prep { display: flex; flex-direction: column; gap: 12px; max-width: 720px; margin: 0 auto; }
  .back { align-self: flex-start; }
  h3 { margin: 0 0 10px; font-size: 0.95rem; color: var(--muted); font-family: var(--font); text-transform: uppercase; letter-spacing: 0.08em; }

  /* Opponent */
  .hero {
    display: grid; grid-template-columns: auto 1fr; gap: 14px 16px; align-items: center;
    background: radial-gradient(120% 140% at 0% 0%, #3a2b1d 0%, var(--panel) 60%);
  }
  .hero.boss { border-color: #7b2a22; background: radial-gradient(120% 140% at 0% 0%, #4a1c16 0%, var(--panel) 60%); }
  .portrait {
    width: 92px; height: 92px; border-radius: 14px; overflow: hidden; background: #fff;
    border: 2px solid var(--gold); box-shadow: 0 0 0 3px rgb(0 0 0 / 0.35), 0 8px 20px rgb(0 0 0 / 0.45);
    display: grid; place-items: center;
  }
  .boss .portrait { border-color: #c0392b; }
  .portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; }
  .mono { font-family: var(--font-title); font-size: 2rem; font-weight: 700; color: var(--gold); background: var(--panel-2); width: 100%; height: 100%; display: grid; place-items: center; }
  .eyebrow { margin: 0 0 2px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold); }
  h1 { margin: 0 0 8px; font-size: 1.7rem; line-height: 1.1; }
  .badges { display: flex; flex-wrap: wrap; gap: 6px; }
  .badge {
    display: inline-flex; align-items: center; gap: 1px; padding: 2px 9px; border-radius: 999px;
    font-size: 0.74rem; font-weight: 700; background: rgb(0 0 0 / 0.3); border: 1px solid var(--line); color: var(--text);
  }
  .boss-badge { color: #ffb4a6; border-color: #7b2a22; text-transform: uppercase; letter-spacing: 0.06em; }
  .pip { color: rgb(255 255 255 / 0.18); }
  .pip.on { color: var(--gold); }
  blockquote {
    grid-column: 1 / -1; margin: 0; padding: 2px 0 2px 14px; border-left: 3px solid var(--gold);
    font-family: var(--font-title); font-style: italic; font-size: 1.05rem; color: var(--text);
  }

  /* Rules */
  .rules { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  @media (min-width: 640px) { .rules { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  .rules li {
    display: flex; gap: 8px; align-items: flex-start; padding: 8px 10px; border-radius: 10px;
    border: 1px solid rgb(217 180 91 / 0.35); background: rgb(217 180 91 / 0.06);
  }
  .mark { font-weight: 900; color: var(--gold-2); width: 1em; flex: none; }
  .rules strong { display: block; font-size: 0.9rem; }
  .rule-text { display: block; font-size: 0.72rem; color: var(--muted); line-height: 1.3; }
  .format { margin: 10px 0 0; }

  /* Mode choice */
  .modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .mode {
    position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center;
    padding: 16px 10px 12px; border-radius: var(--radius); border: 2px solid var(--line); background: var(--panel);
    transition: border-color 160ms ease, background-color 160ms ease, transform 160ms var(--ease-out);
  }
  .mode:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) { .mode:hover { border-color: #7a6450; } }
  .mode.selected { border-color: var(--gold); background: linear-gradient(180deg, #3a2e1e, var(--panel)); }
  .check {
    position: absolute; top: 8px; right: 8px; width: 22px; height: 22px; border-radius: 50%;
    display: grid; place-items: center; font-size: 0.75rem; font-weight: 900; color: #2a1d0b; background: var(--gold-2);
    opacity: 0; transform: scale(0.6); transition: opacity 160ms ease, transform 200ms var(--ease-out);
  }
  .selected .check { opacity: 1; transform: scale(1); }
  .mini { display: grid; gap: 3px; margin-bottom: 6px; padding: 6px; border-radius: 8px; background: rgb(0 0 0 / 0.3); }
  .mini.s3 { grid-template-columns: repeat(3, 14px); }
  .mini.s4 { grid-template-columns: repeat(4, 10px); }
  .dot { aspect-ratio: 1; border-radius: 3px; background: rgb(255 255 255 / 0.08); }
  .dot.fire { background: var(--fire); }
  .dot.water { background: var(--water); }
  .dot.wind { background: var(--wind); }
  .dot.earth { background: var(--earth); }
  .dot.lightning { background: var(--lightning); }
  .mode-name { font-family: var(--font-title); font-weight: 700; font-size: 1.1rem; }
  .record { margin-top: 2px; color: var(--muted); }
  .record.won { color: var(--ok); }
  .legend { margin: -4px 0 0; text-align: center; }

  /* Deck */
  .deck-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
  .deck-head h3 { margin: 0; }
  .edit { margin-left: auto; }
  .deck { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
  .deck.s4 { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  @media (max-width: 520px) { .deck.s4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  .empty { aspect-ratio: 1; border: 2px dashed var(--line); border-radius: 10px; }

  /* Pinned action bar: always visible above the mobile menu. */
  .actionbar {
    position: sticky; bottom: calc(58px + env(safe-area-inset-bottom) + 10px); z-index: 5;
    display: flex; align-items: center; gap: 12px; padding: 10px 10px 10px 16px;
    border-radius: 999px; border: 1px solid var(--line);
    background: rgb(29 24 20 / 0.92); backdrop-filter: blur(8px);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.5);
  }
  @media (min-width: 960px) { .actionbar { bottom: 16px; } }
  .action-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25; }
  .warn { color: var(--danger); }
  .duel { min-width: 132px; min-height: 48px; font-size: 1.05rem; }
</style>
