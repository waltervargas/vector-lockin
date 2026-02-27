<script lang="ts">
  import { profileStore, ORG_PROFILES } from '$lib/stores/organizationProfile.svelte';
  import { simulation } from '$lib/stores/simulation.svelte';
  import type { OrgProfileId } from '$lib/types';

  const profiles = Object.values(ORG_PROFILES);

  function selectProfile(id: OrgProfileId) {
    profileStore.setProfile(id);
    simulation.reset();
  }
</script>

<div class="profile-selector">
  {#each profiles as profile}
    <button
      class="profile-btn"
      class:active={profileStore.activeId === profile.id}
      onclick={() => selectProfile(profile.id)}
    >
      <span class="profile-emoji">{profile.emoji}</span>
      <span class="profile-name">{profile.name}</span>
      <span class="profile-subtitle">{profile.subtitle}</span>
    </button>
  {/each}
</div>

<style>
  .profile-selector {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .profile-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #14143a;
    border: 1px solid rgba(85, 85, 119, 0.25);
    border-radius: 6px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    color: #8888aa;
    transition: all 0.3s ease;
  }
  .profile-btn:hover {
    border-color: rgba(0, 245, 255, 0.37);
    color: #e0e0ff;
  }
  .profile-btn.active {
    border-color: #00f5ff;
    color: #00f5ff;
    box-shadow: 0 0 10px #00f5ff, 0 0 20px #00f5ff40;
    background: #0f0f2a;
  }
  .profile-emoji { font-size: 18px; }
  .profile-name { font-size: 11px; font-weight: 600; }
  .profile-subtitle { font-size: 9px; color: #555577; }
</style>
