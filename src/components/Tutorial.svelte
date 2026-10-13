<script lang="ts">
  import { applyMove, previewValues } from '../core/engine';
  import type { FlipCause, GameState } from '../core/types';
  import { BONDS } from '../data/bonds';
  import { LESSONS, buildLesson } from '../data/tutorial';
  import { sfx, wait } from '../lib/fx';
  import { go } from '../stores/nav.svelte';
  import { persist, save } from '../stores/save.svelte';
  import Board from './Board.svelte';
  import Card from './Card.svelte';

  let index = $state(0);
  let game = $state.raw<GameState>(buildLesson(LESSONS[0]));
  let selected = $state<number | null>(0);
  let aim = $state<number | null>(null);
  let result = $state<'none' | 'ok' | 'retry'>('none');
  let flipKeys = $state<Record<number, number>>({});

  const lesson = $derived(LESSONS[index]);

  function reset() {
    game = buildLesson(lesson);
    selected = 0;
    aim = null;
    result = 'none';
    flipKeys = {};
  }

  async function pick(cell: number) {
    if (selected === null || game.board[cell] || result !== 'none') return;
    if (aim !== cell) {
      aim = cell;
      return;
    }
    const r = applyMove(game, { hand: selected, cell }, BONDS);
    game = r.state;
    aim = null;
    selected = null;
    sfx('place');
    const k = { ...flipKeys };
    for (const f of r.flips) k[f.cell] = (k[f.cell] ?? 0) + 1;
    await wait(150);
    flipKeys = k;
    if (r.flips.length) sfx('flip');
    result = r.flips.some((f) => f.cause === lesson.goal) ? 'ok' : 'retry';
  }

  function nextLesson() {
    if (index === LESSONS.length - 1) {
      save.tutorialDone = true;
      persist();
      go({ name: 'map' });
      return;
    }
    index++;
    reset();
  }

  const preview = $derived.by(() => {
    if (selected === null || aim === null || game.board[aim] || result !== 'none') return null;
    const card = game.hands[0][selected];
    const r = applyMove(game, { hand: selected, cell: aim }, BONDS);
    return { r, ghost: { cell: aim, id: card.id, values: previewValues(game, card, aim, 0), base: card.values } };
  });
  const marks = $derived(preview ? (Object.fromEntries(preview.r.flips.map((f) => [f.cell, f.cause])) as Record<number, FlipCause>) : {});
</script>

<div class="tut">
  <header class="row">
    <button class="btn small" onclick={() => go({ name: 'map' })} aria-label="Exit tutorial">✕</button>
    <span class="muted small">Lesson {index + 1} of {LESSONS.length}</span>
  </header>

  <h1>{lesson.title}</h1>
  <p class="text">{lesson.text}</p>

  <div class="board">
    <Board {game} {flipKeys} ghost={preview?.ghost ?? null} {marks} interactive={result === 'none'} onpick={pick} onaim={(c) => (aim = c)} />
  </div>

  <p class="status" aria-live="polite">
    {#if result === 'ok'}
      <strong class="ok">✓</strong> {lesson.success}
    {:else if result === 'retry'}
      Not quite. Look at the touching values and try again.
    {:else if preview}
      {preview.r.flips.length ? `This flips ${preview.r.flips.length}. Tap the cell again to place.` : 'No flips here. Try another cell.'}
    {:else}
      Choose a cell. The flip preview shows before you confirm.
    {/if}
  </p>

  <div class="hand">
    {#each game.hands[0] as c, i (c.uid)}
      <button class="hc" onclick={() => (selected = i)} aria-pressed={selected === i}>
        <Card id={c.id} values={c.values} base={c.values} owner={0} selected={selected === i} showName />
      </button>
    {/each}
  </div>

  <div class="row actions">
    {#if result === 'ok'}
      <button class="btn primary" onclick={nextLesson}>{index === LESSONS.length - 1 ? 'Finish' : 'Next lesson'}</button>
    {:else if result === 'retry'}
      <button class="btn primary" onclick={reset}>Try again</button>
    {/if}
  </div>
</div>

<style>
  .tut { max-width: 520px; margin: 0 auto; padding: 12px 16px 32px; display: flex; flex-direction: column; gap: 12px; }
  h1 { margin: 0; }
  .text { margin: 0; }
  .board { width: 100%; max-width: 360px; margin: 0 auto; }
  .status { min-height: 3em; margin: 0; text-align: center; color: var(--muted); }
  .ok { color: var(--ok); }
  .hand { display: flex; justify-content: center; }
  .hc { width: 96px; padding: 0; border: 0; background: none; }
  .actions { justify-content: center; }
</style>
