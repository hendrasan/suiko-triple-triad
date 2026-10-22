<script lang="ts">
  import { CONFIG } from '../core/config';
  import { createGame } from '../core/engine';
  import { tilesFor } from '../core/match';
  import { newSeed } from '../core/rng';
  import type { BoardSize } from '../core/types';
  import { OPPONENT_BY_ID } from '../data/opponents';
  import { go } from '../stores/nav.svelte';
  import { activeDeck, deckCost, deckProblem, save } from '../stores/save.svelte';
  import Avatar from './Avatar.svelte';
  import Board from './Board.svelte';
  import Card from './Card.svelte';
  import RuleChips from './RuleChips.svelte';

  let { opponent }: { opponent: string } = $props();
  const opp = $derived(OPPONENT_BY_ID[opponent]);
  let mode = $state<BoardSize>(3);

  const layout = $derived(
    createGame({ size: mode, rules: opp.rules, tiles: tilesFor(opp, mode), hands: [[], []], first: 0, bonds: [] }),
  );
  const deck = $derived(activeDeck(mode));
  const problem = $derived(deckProblem(deck, mode));
</script>

<div class="stack">
  <button class="btn small back" data-sfx="back" onclick={() => go({ name: 'map' })}>← World</button>
  <div class="panel stack">
    <div class="row head">
      <Avatar file={opp.portrait} size={72} boss={opp.boss} />
      <div>
        <h1>{opp.name}</h1>
        <p class="muted">{opp.title}</p>
      </div>
    </div>
    <p>{opp.intro}</p>
    <RuleChips rules={opp.rules} showOff />
    <p class="small muted">
      {opp.format === 'bo2' ? 'Best of two: win both games to win the match. The first player switches in game 2.' : mode === 4 ? 'Single game. The first player boosts one card by +1, because the second player gets the last move.' : 'Single game.'}
      Prize: {opp.prize === 'choose' ? 'choose one of their cards' : opp.prize === 'random' ? 'a random card from their hand' : 'their strongest card'}.
    </p>
  </div>

  <div class="panel stack">
    <div class="row mode" role="radiogroup" aria-label="Board mode">
      <button class="btn" class:primary={mode === 3} role="radio" aria-checked={mode === 3} onclick={() => (mode = 3)}>Triple Triad 3×3</button>
      <button class="btn" class:primary={mode === 4} role="radio" aria-checked={mode === 4} onclick={() => (mode = 4)}>Quad Quartet 4×4</button>
    </div>
    <div class="layout">
      <h3>Rune layout</h3>
      <div class="board-prev"><Board game={layout} /></div>
    </div>
    <div>
      <h3>Your deck <span class="muted small">(slot {save.activeSlot[mode] + 1}{mode === 4 ? ` · cost ${deckCost(deck)}/${CONFIG.costCap}` : ''})</span></h3>
      <div class="deck s{mode}">
        {#each deck as id}<Card {id} />{/each}
      </div>
      {#if problem}<p class="warn small">{problem}</p>{/if}
    </div>
    <div class="row">
      <button class="btn primary" disabled={!!problem} onclick={() => go({ name: 'duel', opponent: opp.id, mode, seed: newSeed() })}>Duel</button>
      <button class="btn" onclick={() => go({ name: 'decks', mode })}>Edit deck</button>
    </div>
  </div>
</div>

<style>
  .back { align-self: flex-start; }
  h1 { margin: 0; }
  .head p { margin: 0; }
  .head { flex-wrap: nowrap; gap: 14px; }
  .mode .btn { flex: 1; }
  .board-prev { max-width: 240px; }
  .deck { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; max-width: 420px; }
  .deck.s4 { grid-template-columns: repeat(8, 1fr); max-width: 640px; }
  @media (max-width: 520px) { .deck.s4 { grid-template-columns: repeat(4, 1fr); } }
  .warn { color: var(--danger); margin: 8px 0 0; }
</style>
