<script lang="ts">
  import { T } from '@threlte/core';
  import { HTML } from '@threlte/extras';
  import type { AttractorConfig } from '$lib/types';
  import { simulation } from '$lib/stores/simulation.svelte';
  import * as THREE from 'three';

  interface Props {
    attractor: AttractorConfig;
  }
  let { attractor }: Props = $props();

  function scale(v: number): number {
    return (v - 0.5) * 4;
  }

  let hovered = $state(false);

  function handleClick() {
    simulation.navigateToAttractor(attractor.id);
  }

  let pos = $derived<[number, number, number]>([
    scale(attractor.position.x),
    scale(attractor.position.y),
    scale(attractor.position.z),
  ]);
  let funnelHeight = $derived(attractor.strength * 1.5);
  let funnelRadius = $derived(attractor.sigma * 3);
</script>

<T.Group position={pos}>
  <!-- Funnel / cone (inverted) -->
  <T.Mesh
    rotation.x={Math.PI}
    position.y={funnelHeight / 2}
    onclick={handleClick}
    onpointerenter={() => hovered = true}
    onpointerleave={() => hovered = false}
  >
    <T.ConeGeometry args={[funnelRadius, funnelHeight, 32, 1, true]} />
    <T.MeshBasicMaterial
      color={attractor.color}
      transparent
      opacity={hovered ? 0.35 : 0.15}
      side={THREE.DoubleSide}
    />
  </T.Mesh>

  <!-- Ring at top of funnel -->
  <T.Mesh rotation.x={-Math.PI / 2} position.y={funnelHeight}>
    <T.RingGeometry args={[funnelRadius - 0.02, funnelRadius, 64]} />
    <T.MeshBasicMaterial color={attractor.color} transparent opacity={0.5} side={THREE.DoubleSide} />
  </T.Mesh>

  <!-- Center point -->
  <T.Mesh>
    <T.SphereGeometry args={[0.05, 16, 16]} />
    <T.MeshBasicMaterial color={attractor.color} />
  </T.Mesh>

  <!-- Attractor light -->
  <T.PointLight color={attractor.color} intensity={0.5} distance={2} />

  <!-- Label -->
  <HTML position.y={funnelHeight + 0.3} center pointerEvents="none">
    <div
      style="
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: {attractor.color};
        background: rgba(10, 10, 26, 0.85);
        padding: 3px 8px;
        border: 1px solid {attractor.color}40;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
        text-shadow: 0 0 8px {attractor.color};
      "
    >
      {attractor.label}
    </div>
  </HTML>
</T.Group>
