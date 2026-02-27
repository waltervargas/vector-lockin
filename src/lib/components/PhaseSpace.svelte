<script lang="ts">
  import { Canvas } from '@threlte/core';
  import PhaseSpaceScene from './PhaseSpaceScene.svelte';
  import { profileStore } from '$lib/stores/organizationProfile.svelte';
  import { simulation } from '$lib/stores/simulation.svelte';
  import { lockInState } from '$lib/stores/lockInState.svelte';
  import { onMount } from 'svelte';

  let animFrameId: number;

  onMount(() => {
    let lastTime = performance.now();
    lockInState.setVector(profileStore.profile.initialState);

    function loop(now: number) {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      simulation.tick(dt);
      animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  });
</script>

<div class="phase-space-container">
  <Canvas>
    <PhaseSpaceScene />
  </Canvas>

  <div class="axis-label axis-x">Vendor &rarr;</div>
  <div class="axis-label axis-y">&uarr; People</div>
  <div class="axis-label axis-z">Complexity &rarr;</div>
</div>

<style>
  .phase-space-container {
    width: 100%;
    height: 100%;
    position: relative;
    border: 1px solid rgba(0, 245, 255, 0.12);
    border-radius: 8px;
    overflow: hidden;
    background: #0f0f2a;
  }
  .axis-label {
    position: absolute;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #8888aa;
    pointer-events: none;
  }
  .axis-x { bottom: 12px; right: 20%; }
  .axis-y { top: 12px; left: 12px; }
  .axis-z { bottom: 12px; left: 20%; }
</style>
