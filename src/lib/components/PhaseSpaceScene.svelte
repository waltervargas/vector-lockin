<script lang="ts">
  import { T, useThrelte } from '@threlte/core';
  import { OrbitControls, Grid, interactivity } from '@threlte/extras';
  import Particle from './Particle.svelte';
  import AttractorBasin from './AttractorBasin.svelte';
  import { profileStore } from '$lib/stores/organizationProfile.svelte';
  import * as THREE from 'three';

  interactivity();

  const { camera } = useThrelte();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  cam.position.set(5, 4, 5);
  camera.set(cam);
</script>

<T is={cam}>
  <OrbitControls
    enableDamping
    dampingFactor={0.05}
    minDistance={3}
    maxDistance={15}
    autoRotate
    autoRotateSpeed={0.3}
  />
</T>

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
