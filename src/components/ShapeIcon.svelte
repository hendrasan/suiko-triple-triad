<script lang="ts">
  import { SHAPES, type Shape } from '../data/formations';

  let { shape }: { shape: Shape } = $props();
  const on = $derived(new Set(SHAPES[shape].example));
</script>

<span class="shape" role="img" aria-label="{SHAPES[shape].name} formation">
  {#each Array(9) as _, i}<span class:on={on.has(i)}></span>{/each}
</span>

<style>
  .shape {
    display: inline-grid; grid-template-columns: repeat(3, 7px); gap: 2px;
    vertical-align: middle; flex: none;
  }
  .shape span { width: 7px; height: 7px; border-radius: 2px; background: rgb(255 255 255 / 0.1); }
  .shape span.on { background: var(--gold-2); }
</style>
