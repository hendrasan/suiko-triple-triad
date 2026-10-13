<script lang="ts">
  import { rumors } from '../core/progress';
  import { openRegions, ownedSet, save } from '../stores/save.svelte';

  const list = $derived.by(() => {
    void save.owned.length;
    return rumors(ownedSet(), openRegions());
  });
  // Rumors come out slowly: three to start, one more per win.
  const heard = $derived(list.slice(0, 3 + save.stats.wins));
</script>

<div class="stack">
  <div>
    <h1>Leona's Tavern</h1>
    <p class="muted">Travelers talk. Listen well, and Stars will find you.</p>
  </div>
  {#if heard.length}
    <ul class="rumors">
      {#each heard as r}
        <li class="panel rumor" class:bond={r.kind === 'bond'}>
          <span class="icon" aria-hidden="true">{r.kind === 'bond' ? '⛓' : '“'}</span>
          <span>{r.text}</span>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="panel muted">The tavern is quiet. Open new regions to hear new rumors.</p>
  {/if}
  <p class="muted small">
    {heard.length < list.length ? 'Win more duels and the regulars will talk more.' : 'Rumors are about Stars you do not own yet. New regions bring new rumors.'}
  </p>
</div>

<style>
  .rumors { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  .rumor { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; }
  .icon { font-family: var(--font-title); font-size: 1.6rem; line-height: 1; color: var(--gold); }
  .rumor.bond .icon { font-size: 1.1rem; }
</style>
