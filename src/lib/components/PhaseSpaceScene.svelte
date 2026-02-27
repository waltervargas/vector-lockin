<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls, Grid, interactivity } from '@threlte/extras';
  import Particle from './Particle.svelte';
  import AttractorBasin from './AttractorBasin.svelte';
  import { profileStore } from '$lib/stores/organizationProfile.svelte';

  // Enable interactivity plugin so onclick/onpointerenter work on meshes
  interactivity();
</script>

<T.PerspectiveCamera makeDefault position={[5, 4, 5]} fov={50}>
  <OrbitControls
    enableDamping
    dampingFactor={0.05}
    minDistance={3}
    maxDistance={15}
    autoRotate
    autoRotateSpeed={0.3}
  />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.15} />

<Grid
  cellColor="#1a1a4a"
  sectionColor="#2a2a6a"
  fadeDistance={20}
  cellSize={0.5}
  sectionSize={2}
  infiniteGrid
/>

{#each profileStore.profile.attractors as attractor (attractor.id)}
  <AttractorBasin {attractor} />
{/each}

<Particle />
