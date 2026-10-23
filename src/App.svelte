<script lang="ts">
  import Collection from './components/Collection.svelte';
  import DeckBuilder from './components/DeckBuilder.svelte';
  import Duel from './components/Duel.svelte';
  import MapScreen from './components/MapScreen.svelte';
  import Prep from './components/Prep.svelte';
  import Settings from './components/Settings.svelte';
  import Tavern from './components/Tavern.svelte';
  import Tutorial from './components/Tutorial.svelte';
  import { CARDS } from './data/cards';
  import { installUiSounds, reducedMotion } from './lib/fx';
  import { setTrack } from './lib/music';
  import { go, nav } from './stores/nav.svelte';
  import { save } from './stores/save.svelte';

  const TABS = [
    { name: 'map', label: 'World', icon: '⚑' },
    { name: 'decks', label: 'Decks', icon: '▦' },
    { name: 'collection', label: 'Stars', icon: '★' },
    { name: 'tavern', label: 'Tavern', icon: '☕' },
    { name: 'settings', label: 'Settings', icon: '⚙' },
  ] as const;

  const fullscreen = $derived(nav.screen.name === 'duel' || nav.screen.name === 'tutorial');

  installUiSounds();

  // Battle music in duels, calm music everywhere else.
  $effect(() => {
    setTrack(nav.screen.name === 'duel' ? 'battle' : 'menu');
  });

  $effect(() => {
    void save.settings.reducedMotion;
    document.documentElement.classList.toggle('reduce-motion', reducedMotion());
  });
</script>

{#if !fullscreen}
  <header class="top">
    <span class="logo">Suikoden <em>Triple Triad</em></span>
    <span class="count" title="Cards owned">★ {save.owned.length}/{CARDS.length}</span>
  </header>
{/if}

<main class:fullscreen>
  {#if nav.screen.name === 'map'}
    <MapScreen />
  {:else if nav.screen.name === 'prep'}
    <Prep opponent={nav.screen.opponent} initialMode={nav.screen.mode} />
  {:else if nav.screen.name === 'duel'}
    {#key nav.screen.seed}
      <Duel opponent={nav.screen.opponent} mode={nav.screen.mode} seed={nav.screen.seed} />
    {/key}
  {:else if nav.screen.name === 'decks'}
    <DeckBuilder initialMode={nav.screen.mode} back={nav.screen.back} />
  {:else if nav.screen.name === 'collection'}
    <Collection />
  {:else if nav.screen.name === 'tavern'}
    <Tavern />
  {:else if nav.screen.name === 'tutorial'}
    <Tutorial />
  {:else if nav.screen.name === 'settings'}
    <Settings />
  {/if}
</main>

{#if !fullscreen}
  <nav class="tabs" aria-label="Main">
    {#each TABS as t}
      <button data-sfx="nav" class:active={nav.screen.name === t.name || (t.name === 'map' && nav.screen.name === 'prep')} onclick={() => go({ name: t.name })}>
        <span aria-hidden="true">{t.icon}</span>
        <span>{t.label}</span>
      </button>
    {/each}
  </nav>
{/if}

<style>
  .top {
    position: sticky; top: 0; z-index: 10;
    display: flex; justify-content: space-between; align-items: center;
    padding: calc(10px + env(safe-area-inset-top)) 16px 10px;
    background: rgb(20 17 15 / 0.9); backdrop-filter: blur(6px);
    border-bottom: 1px solid var(--line);
  }
  .logo { font-family: var(--font-title); font-size: 1.15rem; font-weight: 700; color: var(--gold-2); }
  .logo em { font-style: normal; color: var(--text); }
  .count { font-weight: 700; color: var(--gold); font-variant-numeric: tabular-nums; }
  main { max-width: 960px; margin: 0 auto; padding: 16px 16px 96px; }
  main.fullscreen { max-width: none; padding: 0; }
  .tabs {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 10;
    display: grid; grid-template-columns: repeat(5, 1fr);
    padding-bottom: env(safe-area-inset-bottom);
    background: rgb(20 17 15 / 0.95); backdrop-filter: blur(6px);
    border-top: 1px solid var(--line);
  }
  .tabs button {
    min-height: 58px; border: 0; background: none; color: var(--muted);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    font-size: 0.72rem; font-weight: 600;
  }
  .tabs button span:first-child { font-size: 1.2rem; line-height: 1; }
  .tabs button.active { color: var(--gold-2); }

  /* Desktop: the menu is a sidebar on the left. Mobile keeps the bottom bar. */
  @media (min-width: 960px) {
    .tabs {
      top: 0; right: auto; width: 96px;
      grid-template-columns: 1fr; grid-auto-rows: 76px; align-content: start;
      padding: 72px 0 0;
      border-top: 0; border-right: 1px solid var(--line);
    }
    .tabs button { min-height: 76px; font-size: 0.78rem; border-left: 3px solid transparent; }
    .tabs button.active { border-left-color: var(--gold); background: rgb(217 180 91 / 0.06); }
    .tabs button span:first-child { font-size: 1.4rem; }
    .top { padding-left: calc(96px + 16px); }
    main:not(.fullscreen) { padding: 24px 24px 32px calc(96px + 24px); max-width: calc(960px + 96px); }
  }
</style>
