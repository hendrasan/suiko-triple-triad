<script lang="ts">
  import type { Rune } from '../core/types';

  let { rune, size = 16 }: { rune: Rune; size?: number } = $props();

  // Simple original glyphs, one per rune.
  const PATHS: Record<Rune, string> = {
    fire: 'M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z',
    water: 'M12 2c3 5 7 9 7 13a7 7 0 0 1-14 0c0-4 4-8 7-13z',
    wind: 'M3 8h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 18h8',
    earth: 'M2 20 9 7l4 6 3-4 6 11z',
    lightning: 'M13 2 4 14h6l-2 8 10-13h-6l1-7z',
  };
</script>

<svg class="rune {rune}" width={size} height={size} viewBox="0 0 24 24" aria-label="{rune} rune" role="img">
  {#if rune === 'wind'}
    <path d={PATHS[rune]} fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
  {:else}
    <path d={PATHS[rune]} fill="currentColor" />
  {/if}
</svg>

<style>
  .rune { display: inline-block; vertical-align: middle; flex: none; filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.6)); }
  .fire { color: var(--fire); }
  .water { color: var(--water); }
  .wind { color: var(--wind); }
  .earth { color: var(--earth); }
  .lightning { color: var(--lightning); }
</style>
