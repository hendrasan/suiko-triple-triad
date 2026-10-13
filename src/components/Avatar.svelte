<script lang="ts">
  import { portraitUrl } from '../data/portraits';

  let { file, size = 44, boss = false }: { file?: string; size?: number; boss?: boolean } = $props();
</script>

{#if file}
  <img class="avatar" class:boss src={portraitUrl(file)} alt="" width={size} height={size} style="width:{size}px;height:{size}px" />
{/if}

<style>
  .avatar {
    flex: none; border-radius: 50%; object-fit: cover; object-position: 50% 25%;
    background: #fff; border: 2px solid var(--line);
  }
  .avatar.boss { border-color: #b3261e; }
</style>
