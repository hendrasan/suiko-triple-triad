<script lang="ts">
  import type { Rules } from '../core/types';

  let { rules, showOff = false }: { rules: Rules; showOff?: boolean } = $props();
  const NAMES: [keyof Rules, string][] = [
    ['same', 'Same'], ['plus', 'Plus'], ['combo', 'Combo'], ['runes', 'Runes'], ['bonds', 'Bonds'], ['unite', 'Unite'],
  ];
</script>

<div class="row chips">
  {#each NAMES as [key, name]}
    {#if rules[key] || showOff}
      <span class="chip" class:on={rules[key]}>{rules[key] ? '✓' : '–'} {name}</span>
    {/if}
  {/each}
</div>

<style>
  .chips { gap: 4px; }
</style>
