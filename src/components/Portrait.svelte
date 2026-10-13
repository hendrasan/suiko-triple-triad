<script lang="ts">
  import type { CardDef } from '../core/types';
  import { cardPortrait } from '../data/portraits';

  let { card }: { card: CardDef } = $props();

  const url = $derived(cardPortrait(card.id, card.art));
  // Falls back to the placeholder when the file is missing.
  let failed = $state(false);
  $effect(() => {
    void url;
    failed = false;
  });
  const initials = $derived(
    card.name.replace(/[^A-Za-z ]/g, ' ').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
  );
  const heavenly = $derived(card.rarity !== 'common');
</script>

{#if !failed}
  <img class="art" src={url} alt="" loading="lazy" draggable="false" onerror={() => (failed = true)} />
  <div class="shade" aria-hidden="true"></div>
{:else}
  <div class="ph {card.rune}" aria-hidden="true">
    <svg viewBox="0 0 100 100" class="shape">
      {#if heavenly}
        <polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" />
      {:else}
        <circle cx="50" cy="50" r="38" />
      {/if}
    </svg>
    <span class="ini">{initials}</span>
  </div>
{/if}

<style>
  .art { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; display: block; background: #fff; }
  /* Darkens the edges so the white values stay readable on light art. */
  .shade {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 62% at 50% 50%, transparent 45%, rgb(0 0 0 / 0.55) 100%),
      linear-gradient(0deg, rgb(0 0 0 / 0.35), transparent 30%, transparent 70%, rgb(0 0 0 / 0.35));
  }
  .ph {
    position: relative; width: 100%; height: 100%;
    display: grid; place-items: center;
    background: radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--c) 55%, #000) 0%, color-mix(in srgb, var(--c) 18%, #0b0907) 75%);
  }
  .ph.fire { --c: var(--fire); }
  .ph.water { --c: var(--water); }
  .ph.wind { --c: var(--wind); }
  .ph.earth { --c: var(--earth); }
  .ph.lightning { --c: var(--lightning); }
  .shape { position: absolute; width: 70%; height: 70%; fill: color-mix(in srgb, var(--c) 30%, transparent); }
  .ini {
    position: relative; font-family: var(--font-title); font-weight: 700;
    font-size: 30cqw; color: rgb(255 255 255 / 0.28); letter-spacing: 0.02em;
  }
</style>
