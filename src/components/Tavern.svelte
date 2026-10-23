<script lang="ts">
  import { rumors } from '../core/progress';
  import { portraitUrl } from '../data/portraits';
  import { speakerFor } from '../data/tavern';
  import { openRegions, ownedSet, save } from '../stores/save.svelte';

  const list = $derived.by(() => {
    void save.owned.length;
    return rumors(ownedSet(), openRegions());
  });
  // Rumors come out slowly: three to start, one more per win.
  const heard = $derived(list.slice(0, 3 + save.stats.wins));
  const pct = $derived(list.length ? Math.round((100 * heard.length) / list.length) : 100);
</script>

<div class="tavern">
  <header class="host rise" style="--i:0">
    <img class="leona" src={portraitUrl('leona')} alt="" />
    <div>
      <h1>Leona's Tavern</h1>
      <p class="bubble">“Sit down, have a drink. Travelers talk, and if you listen well, Stars will find you.”</p>
    </div>
  </header>

  {#if list.length}
    <div class="progress rise" style="--i:1">
      <div class="progress-label small">
        <span>Rumors heard</span><span>{heard.length} / {list.length}</span>
      </div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax={list.length} aria-valuenow={heard.length} aria-label="Rumors heard">
        <span style="width:{pct}%"></span>
      </div>
    </div>

    <ul class="rumors">
      {#each heard as r, i}
        <li class="rumor rise" class:bond={r.kind === 'bond'} style="--i:{Math.min(i + 2, 10)}">
          <span class="plate">{r.kind === 'bond' ? '⛓ ' : ''}{speakerFor(r.id)}</span>
          <p>{r.text}</p>
        </li>
      {/each}
      {#if heard.length < list.length}
        <li class="rumor teaser rise" style="--i:{Math.min(heard.length + 2, 10)}">
          <span class="plate">Stranger in the corner</span>
          <p>…He isn't talking yet. Win another duel and come back.</p>
        </li>
      {/if}
    </ul>
  {:else}
    <div class="panel quiet rise" style="--i:1">
      <p>The tavern is quiet tonight. Open a new region, and new travelers will come in with new rumors.</p>
    </div>
  {/if}

  <p class="muted small foot">Rumors are about Stars you do not own yet. ⛓ Bond rumors join when you own their friends.</p>
</div>

<style>
  .tavern { display: flex; flex-direction: column; gap: 14px; max-width: 720px; margin: 0 auto; }

  .host { display: flex; gap: 14px; align-items: flex-start; }
  .leona {
    flex: none; width: 72px; height: 72px; border-radius: 50%; object-fit: cover; object-position: 50% 20%;
    background: #fff; border: 2px solid var(--gold); box-shadow: 0 0 0 3px rgb(0 0 0 / 0.35), 0 0 24px rgb(217 180 91 / 0.25);
  }
  h1 { margin: 4px 0 8px; }
  .bubble {
    position: relative; margin: 0; padding: 10px 14px; border-radius: 4px 14px 14px 14px;
    background: var(--panel-2); border: 1px solid var(--line);
    font-family: var(--font-title); font-style: italic; color: var(--text);
  }

  .progress-label { display: flex; justify-content: space-between; color: var(--muted); margin-bottom: 6px; }
  .bar { height: 6px; border-radius: 999px; background: rgb(255 255 255 / 0.08); overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--gold), var(--gold-2)); transition: width 400ms var(--ease-out); }

  /* Room above each box for its name plate. */
  .rumors { list-style: none; margin: 0; padding: 14px 0 0; display: grid; gap: 36px 16px; }
  @media (min-width: 720px) { .rumors { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .rumor {
    position: relative; padding: 20px 16px 14px; border-radius: 4px;
    background: rgb(14 20 22 / 0.9); border: 1px solid rgb(255 255 255 / 0.28);
    box-shadow: 0 6px 18px rgb(0 0 0 / 0.35);
  }
  .rumor p { margin: 0; font-size: 1rem; line-height: 1.5; color: #f2efe8; }
  /* NPC name plate */
  .plate {
    position: absolute; top: -13px; left: 10px; padding: 2px 12px; border-radius: 3px;
    background: #ece4cf; color: #1f2a2c; font-size: 0.85rem; white-space: nowrap;
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.4);
  }
  .bond .plate { background: #d6e4f0; }
  .teaser { background: transparent; border-style: dashed; box-shadow: none; }
  .teaser p { color: var(--muted); }
  .teaser .plate { background: var(--panel-2); color: var(--muted); }

  .quiet p { margin: 0; font-family: var(--font-title); font-style: italic; }
  .foot { margin: 0; }
</style>
