<script lang="ts" module>
  // Drop art into src/assets/portraits/<card-id>.(png|jpg|jpeg|webp|avif). It is picked up at build time.
  const files = import.meta.glob('../assets/portraits/*.{png,jpg,jpeg,webp,avif}', {
    eager: true, query: '?url', import: 'default',
  }) as Record<string, string>;
  const ART: Record<string, string> = {};
  for (const [path, url] of Object.entries(files)) {
    const id = path.split('/').pop()!.replace(/\.[^.]+$/, '');
    ART[id] = url;
  }
  export function artFor(id: string, override?: string): string | undefined {
    return override ?? ART[id];
  }
</script>

<script lang="ts">
  import type { CardDef } from '../core/types';

  let { card }: { card: CardDef } = $props();

  const url = $derived(artFor(card.id, card.art));
  const initials = $derived(
    card.name.replace(/[^A-Za-z ]/g, ' ').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
  );
  const heavenly = $derived(card.rarity !== 'common');
</script>

{#if url}
  <img class="art" src={url} alt="" loading="lazy" draggable="false" />
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
  .art { width: 100%; height: 100%; object-fit: cover; display: block; }
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
