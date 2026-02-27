<script lang="ts">
  import { onMount } from 'svelte';
  import { FEEDBACK_NODES, FEEDBACK_EDGES, loopSpeed } from '$lib/physics/feedback';
  import { simulation } from '$lib/stores/simulation.svelte';
  import { profileStore } from '$lib/stores/organizationProfile.svelte';

  let svgEl: SVGSVGElement;
  let width = $state(400);
  let height = $state(400);
  let hoveredNode = $state<string | null>(null);
  let brokenNode = $state<string | null>(null);
  let particleOffset = $state(0);
  let animFrameId: number;

  const cx = $derived(width / 2);
  const cy = $derived(height / 2);
  const loopRadius = $derived(Math.min(width, height) / 2 - 70);

  function getNodePos(index: number) {
    const n = FEEDBACK_NODES.length;
    const angle = (index / n) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * loopRadius,
      y: cy + Math.sin(angle) * loopRadius,
    };
  }

  const PARTICLE_COUNT = 8;

  function getParticlePositions() {
    const totalEdges = FEEDBACK_EDGES.length;
    const particles: Array<{ x: number; y: number; opacity: number; color: string }> = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const rawT = ((particleOffset + i / PARTICLE_COUNT) % 1) * totalEdges;
      const edgeIndex = Math.floor(rawT);
      const t = rawT - edgeIndex;
      if (edgeIndex >= totalEdges) continue;

      const edge = FEEDBACK_EDGES[edgeIndex];
      if (brokenNode && (edge.source === brokenNode || edge.target === brokenNode)) continue;

      const fromIdx = FEEDBACK_NODES.findIndex(n => n.id === edge.source);
      const toIdx = FEEDBACK_NODES.findIndex(n => n.id === edge.target);
      const from = getNodePos(fromIdx);
      const to = getNodePos(toIdx);

      particles.push({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        opacity: 0.5 + t * 0.5,
        color: brokenNode ? '#ff3366' : '#00f5ff',
      });
    }
    return particles;
  }

  function handleBreak(nodeId: string) {
    brokenNode = brokenNode === nodeId ? null : nodeId;
  }

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) { width = entry.contentRect.width; height = entry.contentRect.height; }
    });
    if (svgEl.parentElement) observer.observe(svgEl.parentElement);

    function animate() {
      const speed = loopSpeed(0.0003, profileStore.profile.feedbackAlpha, simulation.time);
      particleOffset = (particleOffset + speed) % 1;
      animFrameId = requestAnimationFrame(animate);
    }
    animFrameId = requestAnimationFrame(animate);

    return () => { observer.disconnect(); cancelAnimationFrame(animFrameId); };
  });
</script>

<div class="feedback-container">
  <h3 class="panel-title">Feedback Loop</h3>
  <p class="panel-subtitle">Click a node to break the loop</p>

  <svg bind:this={svgEl} viewBox="0 0 {width} {height}" class="feedback-svg">
    <!-- Edges -->
    {#each FEEDBACK_EDGES as edge, i}
      {@const fromIdx = FEEDBACK_NODES.findIndex(n => n.id === edge.source)}
      {@const toIdx = FEEDBACK_NODES.findIndex(n => n.id === edge.target)}
      {@const from = getNodePos(fromIdx)}
      {@const to = getNodePos(toIdx)}
      {@const isBroken = brokenNode !== null && (edge.source === brokenNode || edge.target === brokenNode)}
      <line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={isBroken ? '#ff336640' : '#00f5ff40'}
        stroke-width={isBroken ? 1 : 2}
        stroke-dasharray={isBroken ? '4,4' : 'none'}
      />
      <!-- Arrow head at 65% along edge -->
      {#if !isBroken}
        {@const dx = to.x - from.x}
        {@const dy = to.y - from.y}
        {@const len = Math.sqrt(dx * dx + dy * dy)}
        {@const ux = dx / len}
        {@const uy = dy / len}
        {@const ax = from.x + dx * 0.65}
        {@const ay = from.y + dy * 0.65}
        <polygon
          points="{ax},{ay} {ax - ux * 6 + uy * 4},{ay - uy * 6 - ux * 4} {ax - ux * 6 - uy * 4},{ay - uy * 6 + ux * 4}"
          fill="#00f5ff80"
        />
      {/if}
    {/each}

    <!-- Animated particles -->
    {#each getParticlePositions() as particle}
      <circle cx={particle.x} cy={particle.y} r={3} fill={particle.color} opacity={particle.opacity}
        style="filter: drop-shadow(0 0 4px {particle.color});" />
    {/each}

    <!-- Nodes -->
    {#each FEEDBACK_NODES as node, i}
      {@const pos = getNodePos(i)}
      {@const isHovered = hoveredNode === node.id}
      {@const isBroken = brokenNode === node.id}

      <circle
        cx={pos.x} cy={pos.y} r={isHovered ? 22 : 18}
        fill={isBroken ? '#ff336630' : '#14143a'}
        stroke={isBroken ? '#ff3366' : isHovered ? '#00f5ff' : '#00f5ff60'}
        stroke-width={isHovered ? 2 : 1}
        style="cursor: pointer; transition: all 0.2s;"
        onmouseenter={() => hoveredNode = node.id}
        onmouseleave={() => hoveredNode = null}
        onclick={() => handleBreak(node.id)}
        role="button"
        tabindex="0"
        onkeydown={(e) => { if (e.key === 'Enter') handleBreak(node.id); }}
      />

      <!-- Label outside the circle -->
      {@const labelOffset = 30}
      {@const angle = (i / FEEDBACK_NODES.length) * Math.PI * 2 - Math.PI / 2}
      <text
        x={pos.x + Math.cos(angle) * labelOffset}
        y={pos.y + Math.sin(angle) * labelOffset}
        text-anchor="middle" dominant-baseline="middle"
        fill={isBroken ? '#ff3366' : '#e0e0ff'}
        font-size="9" font-family="'JetBrains Mono', monospace"
        style="pointer-events: none;"
      >
        {node.label}
      </text>

      <!-- Tooltip -->
      {#if isHovered}
        <foreignObject x={pos.x - 100} y={pos.y + (pos.y < cy ? -55 : 25)} width="200" height="40">
          <div class="tooltip">{node.description}</div>
        </foreignObject>
      {/if}
    {/each}

    <!-- Speed indicator -->
    <text x={cx} y={height - 10} text-anchor="middle" fill="#555577" font-size="9" font-family="'JetBrains Mono', monospace">
      Loop speed: {(loopSpeed(1, profileStore.profile.feedbackAlpha, simulation.time)).toFixed(2)}x
    </text>
  </svg>
</div>

<style>
  .feedback-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .panel-title {
    font-size: 13px;
    font-weight: 600;
    color: #00ff88;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 2px;
  }
  .panel-subtitle {
    font-size: 10px;
    color: #555577;
    margin-bottom: 8px;
  }
  .feedback-svg {
    flex: 1;
    width: 100%;
  }
  .tooltip {
    background: rgba(10, 10, 26, 0.95);
    border: 1px solid rgba(0, 245, 255, 0.37);
    border-radius: 4px;
    padding: 4px 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #e0e0ff;
    text-align: center;
  }
</style>
