<script lang="ts">
  import { regionOpen } from '../core/progress';
  import type { Rules } from '../core/types';
  import { CARDS } from '../data/cards';
  import { OPPONENT_BY_ID, OPPONENTS, REGIONS } from '../data/opponents';
  import { portraitUrl } from '../data/portraits';
  import { PRIZE_LABEL, type OpponentDef } from '../data/schema';
  import { go } from '../stores/nav.svelte';
  import { save } from '../stores/save.svelte';

  const DIFF = { easy: 1, normal: 2, hard: 3, boss: 4 } as const;
  const RULE_NAMES: [keyof Rules, string][] = [['same', 'Same'], ['plus', 'Plus'], ['combo', 'Combo']];
  const bossOf = (regionId: string) => OPPONENTS.find((o) => o.region === regionId && o.boss)!;
  const oppsIn = (regionId: string) => OPPONENTS.filter((o) => o.region === regionId);
  const beaten = (o: OpponentDef) => !!(save.beaten[o.id]?.[3] || save.beaten[o.id]?.[4]);
  const initials = (name: string) => name.split(/[\s&]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2);
  const ruleLine = (o: OpponentDef) => RULE_NAMES.filter(([k]) => o.rules[k]).map(([, n]) => n).join(' · ') || 'Basic rules';

  const regions = $derived(
    REGIONS.map((r) => {
      const open = regionOpen(r, save.owned.length, save.beaten);
      const opps = oppsIn(r.id);
      return { r, open, opps, cleared: beaten(bossOf(r.id)), done: opps.filter(beaten).length };
    }),
  );
  /** The furthest open region is where the story is now. */
  const currentId = $derived([...regions].reverse().find((x) => x.open)?.r.id);
  const cleared = $derived(regions.filter((x) => x.cleared).length);
  /** Suggest the first unbeaten opponent in the current region, regular opponents before the boss. */
  const next = $derived.by(() => {
    const cur = regions.find((x) => x.r.id === currentId);
    const pool = cur ? [...cur.opps].sort((a, b) => Number(!!a.boss) - Number(!!b.boss)) : [];
    return pool.find((o) => !beaten(o)) ?? null;
  });
</script>

{#snippet face(o: OpponentDef, size: number)}
  <span class="face" class:boss={o.boss} style="--s:{size}px" aria-hidden="true">
    {#if o.portrait}<img src={portraitUrl(o.portrait)} alt="" loading="lazy" />{:else}<span>{initials(o.name)}</span>{/if}
  </span>
{/snippet}

{#snippet pips(o: OpponentDef)}
  <span class="pips" aria-label="Difficulty {DIFF[o.difficulty]} of 4">
    {#each [1, 2, 3, 4] as n}<span class:on={n <= DIFF[o.difficulty]}>★</span>{/each}
  </span>
{/snippet}

<div class="world">
  <header class="intro rise" style="--i:0">
    <p class="eyebrow">The Dunan Unification War</p>
    <h1>World</h1>
    <div class="stats">
      <div><strong>{cleared}</strong><span>/ {REGIONS.length} chapters</span></div>
      <div><strong>{save.owned.length}</strong><span>/ {CARDS.length} Stars</span></div>
      <div><strong>{save.stats.wins}</strong><span>wins in {save.stats.duels}</span></div>
    </div>
  </header>

  {#if !save.tutorialDone}
    <button class="callout tut rise" style="--i:1" onclick={() => go({ name: 'tutorial' })}>
      <span class="callout-icon" aria-hidden="true">📜</span>
      <span class="callout-text">
        <strong>New to Triple Triad?</strong>
        <span class="muted small">A short lesson: flips, Same, Plus, Combo, runes, bonds, and abilities.</span>
      </span>
      <span class="go" aria-hidden="true">›</span>
    </button>
  {:else if next}
    <button class="callout rise" style="--i:1" data-sfx="open" onclick={() => go({ name: 'prep', opponent: next.id })}>
      {@render face(next, 44)}
      <span class="callout-text">
        <span class="eyebrow">Next duel</span>
        <strong>{next.name}</strong>
        <span class="muted small">{next.title}{next.boss ? ' · Boss' : ''}</span>
      </span>
      <span class="go" aria-hidden="true">›</span>
    </button>
  {/if}

  <ol class="path">
    {#each regions as { r, open, opps, cleared: isCleared, done }, i (r.id)}
      {@const current = r.id === currentId}
      <li class="chapter rise" class:open class:current class:cleared={isCleared} style="--i:{i + 2}">
        <span class="node" aria-hidden="true">{isCleared ? '✓' : open ? i + 1 : '🔒'}</span>

        <div class="chapter-body">
          <div class="chapter-head">
            <div>
              <p class="eyebrow">Chapter {i + 1}{isCleared ? ' · Cleared' : current ? ' · Now' : ''}</p>
              <h2>{r.name}</h2>
            </div>
            {#if open}
              <span class="dots" aria-label="{done} of {opps.length} beaten">
                {#each opps as o}<span class:on={beaten(o)} class:bossdot={o.boss}></span>{/each}
              </span>
            {/if}
          </div>

          {#if open}
            <p class="blurb">{r.blurb}</p>
            <ul class="opps">
              {#each opps as o (o.id)}
                {@const b = save.beaten[o.id]}
                <li class:boss-row={o.boss}>
                  <button class="opp" class:boss={o.boss} data-sfx="open" onclick={() => go({ name: 'prep', opponent: o.id })}>
                    {@render face(o, o.boss ? 56 : 44)}
                    <span class="opp-main">
                      <span class="opp-top">
                        <strong>{o.name}</strong>
                        {#if o.boss}<span class="tag">Boss · Best of 2</span>{/if}
                      </span>
                      <span class="muted small">{o.title}</span>
                      <span class="opp-meta small">
                        {@render pips(o)}
                        <span>{ruleLine(o)}</span>
                        <span>{PRIZE_LABEL[o.prize]}</span>
                      </span>
                    </span>
                    <span class="modes" aria-label="Won: 3×3 {b?.[3] ? 'yes' : 'no'}, 4×4 {b?.[4] ? 'yes' : 'no'}">
                      <span class:won={b?.[3]}>3×3{b?.[3] ? ' ✓' : ''}</span>
                      <span class:won={b?.[4]}>4×4{b?.[4] ? ' ✓' : ''}</span>
                    </span>
                  </button>
                </li>
              {/each}
            </ul>
          {:else if r.unlock}
            {@const need = r.unlock.cards}
            <div class="lock">
              <p class="small">Opens when you either:</p>
              <div class="lock-ways">
                <div class="way">
                  {@render face(OPPONENT_BY_ID[r.unlock.boss], 32)}
                  <span class="small">Beat <strong>{OPPONENT_BY_ID[r.unlock.boss].name}</strong></span>
                </div>
                <span class="or small">or</span>
                <div class="way grow">
                  <span class="small">Own <strong>{need}</strong> Stars <span class="muted">({Math.min(save.owned.length, need)}/{need})</span></span>
                  <span class="bar"><span style="width:{Math.min(100, (100 * save.owned.length) / need)}%"></span></span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </li>
    {/each}
  </ol>
</div>

<style>
  .world { display: flex; flex-direction: column; gap: 16px; max-width: 820px; margin: 0 auto; }
  .eyebrow { margin: 0; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); }

  /* Header */
  .intro h1 { margin: 2px 0 10px; font-size: 2rem; }
  .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .stats div {
    padding: 10px 12px; border-radius: var(--radius); background: var(--panel); border: 1px solid var(--line);
    display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; font-variant-numeric: tabular-nums;
  }
  .stats strong { font-size: 1.4rem; color: var(--gold-2); line-height: 1; }
  .stats span { font-size: 0.78rem; color: var(--muted); }

  /* Next duel / tutorial */
  .callout {
    display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 12px 14px;
    border-radius: var(--radius); border: 1px solid var(--gold);
    background: linear-gradient(100deg, #3a2e1e, var(--panel) 70%);
    box-shadow: 0 0 0 1px rgb(217 180 91 / 0.12), 0 8px 24px rgb(0 0 0 / 0.35);
    transition: transform 160ms var(--ease-out);
  }
  .callout:active { transform: scale(0.98); }
  .callout-icon { font-size: 1.8rem; }
  .callout-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
  .callout-text strong { font-size: 1.05rem; }
  .go { font-size: 1.8rem; color: var(--gold); line-height: 1; transition: transform 160ms var(--ease-out); }
  @media (hover: hover) and (pointer: fine) { .callout:hover .go { transform: translateX(3px); } }

  /* Journey path */
  .path { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .chapter { position: relative; display: grid; grid-template-columns: 40px 1fr; gap: 12px; padding-bottom: 18px; }
  /* The line between nodes. It is gold up to the furthest open chapter. */
  .chapter::before {
    content: ''; position: absolute; left: 19px; top: 40px; bottom: 0; width: 2px;
    background: var(--line);
  }
  .chapter.open:has(+ .chapter.open)::before { background: linear-gradient(var(--gold), #8a6a2e); }
  .chapter:last-child::before { display: none; }
  .node {
    position: relative; z-index: 1; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
    font-weight: 800; font-size: 0.95rem; background: var(--panel-2); border: 2px solid var(--line); color: var(--muted);
  }
  .open .node { border-color: var(--gold); color: var(--gold-2); }
  .cleared .node { background: linear-gradient(180deg, var(--gold-2), var(--gold)); color: #2a1d0b; border-color: transparent; }
  .current .node { box-shadow: 0 0 0 4px rgb(217 180 91 / 0.18), 0 0 18px rgb(217 180 91 / 0.45); }

  .chapter-body {
    padding: 14px; border-radius: var(--radius); background: var(--panel); border: 1px solid var(--line);
  }
  .current .chapter-body { border-color: rgb(217 180 91 / 0.55); background: linear-gradient(180deg, #2c241b, var(--panel)); }
  .chapter:not(.open) .chapter-body { background: transparent; border-style: dashed; }
  .chapter:not(.open) h2 { color: var(--muted); }
  .chapter-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .chapter-head h2 { margin: 2px 0 0; }
  .blurb { margin: 6px 0 12px; font-family: var(--font-title); font-style: italic; color: var(--muted); }
  .dots { display: flex; gap: 5px; padding-top: 6px; }
  .dots span { width: 9px; height: 9px; border-radius: 50%; background: rgb(255 255 255 / 0.12); }
  .dots .bossdot { border-radius: 2px; transform: rotate(45deg); }
  .dots .on { background: var(--gold-2); }

  /* Opponents */
  .opps { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  @media (min-width: 720px) {
    .opps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .boss-row { grid-column: 1 / -1; }
  }
  .opp {
    width: 100%; height: 100%; text-align: left; display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg-2);
    transition: transform 160ms var(--ease-out), border-color 160ms ease, box-shadow 160ms ease;
  }
  .opp:active { transform: scale(0.98); }
  @media (hover: hover) and (pointer: fine) {
    .opp:hover { border-color: var(--gold); transform: translateY(-2px); box-shadow: 0 8px 18px rgb(0 0 0 / 0.4); }
  }
  .opp.boss { border-color: #7b2a22; background: linear-gradient(100deg, #3a1713, #241614 60%, var(--bg-2)); }
  @media (hover: hover) and (pointer: fine) { .opp.boss:hover { border-color: #c0392b; } }
  .opp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .opp-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tag { font-size: 0.66rem; font-weight: 800; letter-spacing: 0.06em; color: #ffb4a6; text-transform: uppercase; }
  .opp-meta { display: flex; align-items: center; gap: 2px 10px; flex-wrap: wrap; color: var(--muted); margin-top: 2px; }
  .pips span { color: rgb(255 255 255 / 0.18); font-size: 0.72rem; }
  .pips .on { color: var(--gold); }
  .modes { display: flex; flex-direction: column; gap: 4px; flex: none; }
  .modes span {
    font-size: 0.68rem; font-weight: 800; padding: 1px 7px; border-radius: 999px; text-align: center;
    border: 1px solid var(--line); color: var(--muted); font-variant-numeric: tabular-nums;
  }
  .modes .won { border-color: var(--ok); color: var(--ok); background: rgb(123 196 127 / 0.08); }

  .face {
    flex: none; width: var(--s); height: var(--s); border-radius: 50%; overflow: hidden; display: grid; place-items: center;
    background: radial-gradient(circle at 50% 35%, #4a3a2a, #241c15); border: 2px solid #6b5640;
    font-family: var(--font-title); font-weight: 700; color: var(--gold-2); font-size: calc(var(--s) * 0.36);
  }
  .face.boss { border-color: #c0392b; box-shadow: 0 0 12px rgb(192 57 43 / 0.35); }
  .face img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; background: #fff; }

  /* Locked chapter */
  .lock p { margin: 8px 0 8px; color: var(--muted); }

  /* Phones: a thinner rail and stacked stats leave more room for the cards. */
  @media (max-width: 559px) {
    .chapter { grid-template-columns: 26px 1fr; gap: 8px; }
    .chapter::before { left: 12px; top: 26px; }
    .node { width: 26px; height: 26px; font-size: 0.75rem; border-width: 1.5px; }
    .chapter-body { padding: 12px; }
    .opp { gap: 10px; padding: 10px; }
    .stats div { flex-direction: column; align-items: flex-start; gap: 2px; }
  }
  .lock-ways { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .way { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; background: rgb(0 0 0 / 0.2); }
  .way.grow { flex: 1; min-width: 180px; flex-direction: column; align-items: stretch; gap: 6px; }
  .or { color: var(--muted); font-style: italic; }
  .bar { display: block; height: 5px; border-radius: 999px; background: rgb(255 255 255 / 0.08); overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--gold), var(--gold-2)); }
</style>
