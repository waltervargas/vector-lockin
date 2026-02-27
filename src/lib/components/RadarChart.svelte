<script lang="ts">
  import { onMount } from 'svelte';
  import { lockInState } from '$lib/stores/lockInState.svelte';
  import { DIMENSIONS, DIMENSION_LABELS } from '$lib/types';
  import type { LockInDimension } from '$lib/types';

  let svgEl: SVGSVGElement;
  let width = $state(400);
  let height = $state(400);
  let dragging = $state<LockInDimension | null>(null);

  const padding = 60;
  const cx = $derived(width / 2);
  const cy = $derived(height / 2);
  const radius = $derived(Math.min(width, height) / 2 - padding);
  const angleStep = (2 * Math.PI) / DIMENSIONS.length;

  function getPoint(index: number, value: number): { x: number; y: number } {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * value,
      y: cy + Math.sin(angle) * radius * value,
    };
  }

  function getColor(value: number): string {
    if (value < 0.5) {
      const t = value / 0.5;
      return `rgb(${Math.round(t * 255)}, 255, 100)`;
    } else {
      const t = (value - 0.5) / 0.5;
      return `rgb(255, ${Math.round((1 - t) * 255)}, 80)`;
    }
  }

  function handleMouseDown(dim: LockInDimension) {
    dragging = dim;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging || !svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // Scale mouse position to SVG viewBox coordinates
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const svgX = mouseX * scaleX;
    const svgY = mouseY * scaleY;
    const dx = svgX - cx;
    const dy = svgY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const newValue = Math.max(0.05, Math.min(0.95, dist / radius));
    lockInState.applyConservation(dragging, newValue);
  }

  function handleMouseUp() {
    dragging = null;
  }

  onMount(() => {
    const container = svgEl.parentElement;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  });
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="radar-container">
  <h3 class="panel-title">Conservation Principle</h3>
  <p class="panel-subtitle">Drag vertices — squeeze one, others inflate</p>

  <svg bind:this={svgEl} viewBox="0 0 {width} {height}" class="radar-svg">
    <!-- Background rings -->
    {#each [0.25, 0.5, 0.75, 1.0] as ring}
      <circle cx={cx} cy={cy} r={radius * ring} fill="none" stroke="#1a1a4a" stroke-width="1" />
    {/each}

    <!-- Axis lines -->
    {#each DIMENSIONS as _, i}
      {@const endpoint = getPoint(i, 1)}
      <line x1={cx} y1={cy} x2={endpoint.x} y2={endpoint.y} stroke="#1a1a4a" stroke-width="1" />
    {/each}

    <!-- Filled polygon -->
    <polygon
      points={DIMENSIONS.map((dim, i) => {
        const p = getPoint(i, lockInState.vector[dim]);
        return `${p.x},${p.y}`;
      }).join(' ')}
      fill="rgba(0, 245, 255, 0.1)"
      stroke="#00f5ff"
      stroke-width="2"
    />

    <!-- Vertex handles and labels -->
    {#each DIMENSIONS as dim, i}
      {@const value = lockInState.vector[dim]}
      {@const p = getPoint(i, value)}
      {@const labelP = getPoint(i, 1.15)}

      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <circle
        cx={p.x} cy={p.y}
        r={dragging === dim ? 10 : 7}
        fill={getColor(value)}
        stroke="white" stroke-width="2"
        style="cursor: grab; filter: drop-shadow(0 0 6px {getColor(value)});"
        onmousedown={() => handleMouseDown(dim)}
      />

      <text
        x={labelP.x} y={labelP.y}
        text-anchor="middle" dominant-baseline="middle"
        fill="#8888aa" font-size="10"
        font-family="'JetBrains Mono', monospace"
      >
        {DIMENSION_LABELS[dim]}
      </text>
    {/each}
  </svg>
</div>

<style>
  .radar-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .panel-title {
    font-size: 13px;
    font-weight: 600;
    color: #ff00ff;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 2px;
  }
  .panel-subtitle {
    font-size: 10px;
    color: #555577;
    margin-bottom: 8px;
  }
  .radar-svg {
    flex: 1;
    width: 100%;
  }
</style>
