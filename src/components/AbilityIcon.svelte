<script lang="ts">
  import type { Ability } from '../core/types';
  import { ABILITIES } from '../data/abilities';

  let { ability }: { ability: Ability } = $props();

  // Simple original glyphs: shield, banner, dagger, spark.
  const PATHS: Record<Ability, string> = {
    steadfast: 'M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z',
    rally: 'M5 2h2v20H5zM8 3h11l-3 4 3 4H8z',
    sabotage: 'M19 2 9 12l3 3L22 5V2zM8 13l3 3-2 2 2 2-2 2-2-2-3 3-2-2 3-3-2-2 2-2 2 2z',
    runeborn: 'M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z',
  };
</script>

<svg class="ab {ability}" viewBox="0 0 24 24" role="img" aria-label={ABILITIES[ability].name}>
  <title>{ABILITIES[ability].name}: {ABILITIES[ability].text}</title>
  <path d={PATHS[ability]} fill="currentColor" />
</svg>

<style>
  .ab { display: block; width: 100%; height: 100%; }
  .steadfast { color: #c9d4e3; }
  .rally { color: #f3d98e; }
  .sabotage { color: #ff8a7a; }
  .runeborn { color: #c8a6ff; }
</style>
