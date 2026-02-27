<script lang="ts">
  import { T } from '@threlte/core';
  import { lockInState } from '$lib/stores/lockInState.svelte';
  import type { TrailPoint } from '$lib/types';
  import * as THREE from 'three';

  // Scale: map 0-1 range to -2..2 in 3D space
  function scale(v: number): number {
    return (v - 0.5) * 4;
  }

  let trailLine = $state<THREE.Line | null>(null);

  $effect(() => {
    const trail = lockInState.trail;
    if (trail.length < 2) {
      trailLine = null;
      return;
    }
    const points = trail.map((p: TrailPoint) =>
      new THREE.Vector3(scale(p.position.x), scale(p.position.y), scale(p.position.z))
    );
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const colors = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      const t = i / (points.length - 1);
      // Fade from dark to cyan (#00f5ff)
      colors[i * 3] = t * 0;       // R
      colors[i * 3 + 1] = t * 0.96; // G
      colors[i * 3 + 2] = t * 1;    // B
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7 });
    trailLine = new THREE.Line(geo, mat);
  });
</script>

<!-- Glowing particle -->
<T.Group position={[scale(lockInState.phasePosition.x), scale(lockInState.phasePosition.y), scale(lockInState.phasePosition.z)]}>
  <!-- Core sphere -->
  <T.Mesh>
    <T.SphereGeometry args={[0.08, 32, 32]} />
    <T.MeshBasicMaterial color="#00f5ff" />
  </T.Mesh>
  <!-- Inner glow -->
  <T.Mesh>
    <T.SphereGeometry args={[0.15, 32, 32]} />
    <T.MeshBasicMaterial color="#00f5ff" transparent opacity={0.3} />
  </T.Mesh>
  <!-- Outer glow -->
  <T.Mesh>
    <T.SphereGeometry args={[0.25, 16, 16]} />
    <T.MeshBasicMaterial color="#00f5ff" transparent opacity={0.08} />
  </T.Mesh>
  <!-- Point light for illumination -->
  <T.PointLight color="#00f5ff" intensity={2} distance={3} />
</T.Group>

<!-- Trail line -->
{#if trailLine}
  <T is={trailLine} />
{/if}
