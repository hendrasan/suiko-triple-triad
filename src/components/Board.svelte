<script lang="ts">
  import { DIRS, hasBondPartner, neighbor, sideValue } from '../core/engine';
  import type { FlipCause, GameState, Side } from '../core/types';
  import Card from './Card.svelte';
  import RuneIcon from './RuneIcon.svelte';

  let {
    game,
    shownOwner = (cell: number) => game.board[cell]?.owner ?? 0,
    flipKeys = {},
    ghost = null,
    marks = {},
    interactive = false,
    lastPlaced = null,
    onpick = () => {},
    onaim = () => {},
  }: {
    game: GameState;
    shownOwner?: (cell: number) => Side;
    flipKeys?: Record<number, number>;
    ghost?: { cell: number; id: string; values: number[]; base?: number[] } | null;
    marks?: Record<number, FlipCause>;
    interactive?: boolean;
    lastPlaced?: number | null;
    onpick?: (cell: number) => void;
    onaim?: (cell: number | null) => void;
  } = $props();

  let cells = $state<HTMLButtonElement[]>([]);
  const ROWS = 'ABCD';

  function keydown(e: KeyboardEvent, cell: number) {
    const dir = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
    if (dir === undefined) return;
    e.preventDefault();
    const n = neighbor(game.size, cell, dir);
    if (n >= 0) cells[n]?.focus();
  }

  function cellLabel(cell: number): string {
    const r = Math.floor(cell / game.size);
    const c = cell % game.size;
    const name = `${ROWS[r]}${c + 1}`;
    const tile = game.tiles[cell] ? `, ${game.tiles[cell]} tile` : '';
    const p = game.board[cell];
    return p ? `${name}${tile}` : `${name}, empty${tile}`;
  }
</script>

<div class="board s{game.size}" role="grid" aria-label="Board">
  {#each game.board as p, cell (cell)}
    {@const tile = game.tiles[cell]}
    <button
      bind:this={cells[cell]}
      class="cell"
      class:tile={!!tile}
      class:last={lastPlaced === cell}
      class:aim={ghost?.cell === cell}
      disabled={!interactive || !!p}
      tabindex={interactive && !p ? 0 : -1}
      aria-label={cellLabel(cell)}
      onclick={() => onpick(cell)}
      onfocus={(e) => interactive && !p && e.currentTarget.matches(':focus-visible') && onaim(cell)}
      onpointerenter={(e) => interactive && !p && e.pointerType === 'mouse' && onaim(cell)}
      onkeydown={(e) => keydown(e, cell)}
    >
      {#if tile}
        <span class="tile-glyph {tile}" aria-hidden="true"><RuneIcon rune={tile} size={28} /></span>
      {/if}
      {#if p}
        {#key flipKeys[cell] ?? 0}
          <div class="slot" class:flip={(flipKeys[cell] ?? 0) > 0} class:drop={lastPlaced === cell && !flipKeys[cell]}>
            <Card
              id={p.card.id}
              owner={shownOwner(cell)}
              values={DIRS.map((d) => sideValue(game, cell, d))}
              base={p.card.values}
              bond={game.rules.bonds && hasBondPartner(game, cell)}
              mark={marks[cell] ?? null}
            />
          </div>
        {/key}
      {:else if ghost?.cell === cell}
        <div class="slot"><Card id={ghost.id} values={ghost.values} base={ghost.base} owner={0} ghost /></div>
      {/if}
    </button>
  {/each}
</div>

<style>
  .board {
    display: grid;
    gap: 6px;
    padding: 8px;
    width: 100%;
    max-width: min(100%, 520px);
    margin: 0 auto;
    background:
      linear-gradient(135deg, #2b2119, #1a140f);
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: inset 0 0 30px rgb(0 0 0 / 0.6), 0 6px 24px rgb(0 0 0 / 0.4);
  }
  .s3 { grid-template-columns: repeat(3, 1fr); }
  .s4 { grid-template-columns: repeat(4, 1fr); gap: 5px; padding: 6px; }

  .cell {
    position: relative;
    aspect-ratio: 1;
    padding: 0;
    border: 1px dashed #4b3c2f;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.22);
    perspective: 600px;
  }
  .cell:disabled { cursor: default; }
  .cell:not(:disabled):hover { border-color: var(--gold); background: rgb(217 180 91 / 0.08); }
  .cell.tile { border-style: solid; }
  .cell.aim { border-color: var(--gold-2); }
  .tile-glyph {
    position: absolute; inset: 0; display: grid; place-items: center; opacity: 0.55;
  }
  .tile-glyph.fire { background: radial-gradient(circle, rgb(228 87 46 / 0.25), transparent 70%); }
  .tile-glyph.water { background: radial-gradient(circle, rgb(63 167 214 / 0.25), transparent 70%); }
  .tile-glyph.wind { background: radial-gradient(circle, rgb(92 194 122 / 0.25), transparent 70%); }
  .tile-glyph.earth { background: radial-gradient(circle, rgb(180 138 78 / 0.25), transparent 70%); }
  .tile-glyph.lightning { background: radial-gradient(circle, rgb(233 196 64 / 0.25), transparent 70%); }

  .slot { position: absolute; inset: 0; }
  .slot.flip { animation: flip 380ms cubic-bezier(0.3, 0.7, 0.3, 1); }
  .slot.drop { animation: drop 220ms cubic-bezier(0.2, 0.8, 0.3, 1.2); }
  @keyframes flip {
    0% { transform: rotateY(90deg) scale(1.08); filter: brightness(1.6); }
    60% { filter: brightness(1.25); }
    100% { transform: rotateY(0) scale(1); filter: none; }
  }
  @keyframes drop {
    from { transform: scale(1.18) translateY(-6%); opacity: 0.4; }
    to { transform: none; opacity: 1; }
  }
</style>
