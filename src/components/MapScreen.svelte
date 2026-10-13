<script lang="ts">
  import { regionOpen } from '../core/progress';
  import { OPPONENTS, REGIONS } from '../data/opponents';
  import { go } from '../stores/nav.svelte';
  import { save } from '../stores/save.svelte';
  import Avatar from './Avatar.svelte';
  import RuleChips from './RuleChips.svelte';

  const DIFF = { easy: '★', normal: '★★', hard: '★★★', boss: '★★★★' };
  const bossName = (id: string) => OPPONENTS.find((o) => o.id === id)?.name ?? id;
</script>

<div class="stack">
  {#if !save.tutorialDone}
    <div class="panel tut row">
      <div style="flex:1">
        <h3>New to Triple Triad?</h3>
        <p class="muted small">A short lesson covers flips, Same, Plus, Combo, runes, and bonds.</p>
      </div>
      <button class="btn primary" onclick={() => go({ name: 'tutorial' })}>Tutorial</button>
    </div>
  {/if}

  {#each REGIONS as r, i}
    {@const open = regionOpen(r, save.owned.length, save.beaten)}
    <section class="panel region" class:locked={!open}>
      <div class="head">
        <span class="num">{i + 1}</span>
        <div>
          <h2>{r.name}</h2>
          <p class="muted small">{open ? r.blurb : `Locked. Beat ${bossName(r.unlock!.boss)} or own ${r.unlock!.cards} cards.`}</p>
        </div>
      </div>
      {#if open}
        <ul class="opps">
          {#each OPPONENTS.filter((o) => o.region === r.id) as o}
            {@const b = save.beaten[o.id]}
            <li>
              <button class="opp" class:boss={o.boss} onclick={() => go({ name: 'prep', opponent: o.id })}>
                <div class="name">
                  <Avatar file={o.portrait} size={36} boss={o.boss} />
                  <strong>{o.name}</strong>
                  {#if o.boss}<span class="tag">Boss · Bo2</span>{/if}
                  <span class="diff" aria-label="Difficulty {o.difficulty}">{DIFF[o.difficulty]}</span>
                </div>
                <div class="muted small">{o.title} · Prize: {o.prize === 'choose' ? 'your choice' : o.prize}</div>
                <RuleChips rules={o.rules} />
                <div class="wins small">
                  <span class:done={b?.[3]}>3×3 {b?.[3] ? '✓' : '—'}</span>
                  <span class:done={b?.[4]}>4×4 {b?.[4] ? '✓' : '—'}</span>
                </div>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/each}
</div>

<style>
  .tut { border-color: var(--gold); }
  .tut h3 { margin: 0; }
  .tut p { margin: 0; }
  .region.locked { opacity: 0.6; }
  .head { display: flex; gap: 12px; align-items: flex-start; }
  .head h2 { margin: 0; }
  .head p { margin: 0; }
  .num {
    flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
    background: var(--panel-2); border: 1px solid var(--gold); color: var(--gold-2); font-weight: 800;
  }
  .opps { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 8px; }
  @media (min-width: 720px) { .opps { grid-template-columns: repeat(3, 1fr); } }
  .opp {
    width: 100%; text-align: left; display: flex; flex-direction: column; gap: 6px;
    padding: 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg-2);
    transition: border-color 120ms ease, transform 120ms ease;
  }
  .opp:hover { border-color: var(--gold); }
  .opp:active { transform: scale(0.98); }
  .opp.boss { border-color: #7b2a22; background: linear-gradient(180deg, #2a1512, var(--bg-2)); }
  .name { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .tag { font-size: 0.7rem; font-weight: 800; color: #ffb4a6; text-transform: uppercase; }
  .diff { margin-left: auto; color: var(--gold); font-size: 0.8rem; }
  .wins { display: flex; gap: 12px; color: var(--muted); }
  .wins .done { color: var(--ok); }
</style>
