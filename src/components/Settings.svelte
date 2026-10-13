<script lang="ts">
  import { go } from '../stores/nav.svelte';
  import { exportSave, importSave, persist, resetSave, save } from '../stores/save.svelte';

  let message = $state('');
  let file = $state<HTMLInputElement | undefined>();

  function download(name: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try {
      importSave(await f.text());
      message = 'Save imported.';
    } catch (err) {
      message = `Import failed: ${(err as Error).message}`;
    }
    if (file) file.value = '';
  }

  function reset() {
    if (confirm('Delete all progress and start again? This cannot be undone.')) {
      resetSave();
      message = 'Progress reset.';
    }
  }
</script>

<div class="stack">
  <h1>Settings</h1>

  <section class="panel stack">
    <label class="toggle">
      <input type="checkbox" bind:checked={save.settings.skipAnimations} onchange={persist} />
      <span><strong>Skip animations</strong><br /><span class="muted small">Flips resolve at once. Good for long 4×4 duels.</span></span>
    </label>
    <label class="toggle">
      <input type="checkbox" bind:checked={save.settings.sound} onchange={persist} />
      <span><strong>Sound effects</strong><br /><span class="muted small">Simple generated tones.</span></span>
    </label>
    <label class="select">
      <strong>Reduced motion</strong>
      <select bind:value={save.settings.reducedMotion} onchange={persist}>
        <option value="auto">Follow system</option>
        <option value="on">On</option>
        <option value="off">Off</option>
      </select>
    </label>
  </section>

  <section class="panel stack">
    <h2>Save data</h2>
    <p class="muted small">Progress saves in this browser. Export a file to keep a backup or move devices.</p>
    <div class="row">
      <button class="btn" onclick={() => download('suiko-triple-triad-save.json', exportSave())}>Export</button>
      <button class="btn" onclick={() => file?.click()}>Import</button>
      <input bind:this={file} type="file" accept="application/json,.json" hidden onchange={onImport} />
      <button class="btn danger" onclick={reset}>Reset</button>
    </div>
    {#if save.lastDuel}
      <button class="btn small" onclick={() => download('last-duel.json', JSON.stringify(save.lastDuel, null, 2))}>
        Download last duel log (seed {save.lastDuel.seed})
      </button>
    {/if}
    {#if message}<p class="small" role="status">{message}</p>{/if}
  </section>

  <section class="panel stack">
    <h2>Help</h2>
    <div class="row">
      <button class="btn" onclick={() => go({ name: 'tutorial' })}>Replay tutorial</button>
    </div>
    <p class="muted small">
      Keyboard: number keys pick a hand card, arrow keys move on the board, Enter places, Escape cancels.
      Ownership: your cards have a solid blue frame and ●. Opponent cards have a dashed orange frame, stripes, and ◆.
    </p>
    <p class="muted small">Stats: {save.stats.wins} wins in {save.stats.duels} duels.</p>
  </section>
</div>

<style>
  .toggle { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; }
  .toggle input { width: 22px; height: 22px; margin-top: 2px; accent-color: var(--gold); }
  .select { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  select {
    min-height: 40px; border-radius: 8px; background: var(--panel-2); color: var(--text);
    border: 1px solid var(--line); padding: 0 8px; font: inherit;
  }
</style>
