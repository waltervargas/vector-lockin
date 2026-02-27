<script lang="ts">
  import { lockInState } from '$lib/stores/lockInState.svelte';
  import { DIMENSIONS, DIMENSION_LABELS, DIMENSION_DESCRIPTIONS, type LockInDimension } from '$lib/types';

  // Use $state for gauge values — CSS transitions handle the animation
  let gaugeValues = $state<Record<LockInDimension, number>>({
    vendor: 0.5,
    people: 0.5,
    version: 0.5,
    complexity: 0.5,
    cognitive: 0.5,
    ecosystem: 0.5,
  });

  $effect(() => {
    for (const dim of DIMENSIONS) {
      gaugeValues[dim] = lockInState.vector[dim];
    }
  });

  function getColor(value: number): string {
    if (value < 0.5) {
      const t = value / 0.5;
      return `rgb(${Math.round(t * 255)}, 255, 100)`;
    } else {
      const t = (value - 0.5) / 0.5;
      return `rgb(255, ${Math.round((1 - t) * 255)}, 80)`;
    }
  }
</script>

<div class="gauges-panel">
  <h3 class="panel-title">Lock-in Vector</h3>

  {#each DIMENSIONS as dim}
    {@const value = gaugeValues[dim]}
    <div class="gauge-row">
      <div class="gauge-header">
        <span class="gauge-label">{DIMENSION_LABELS[dim]}</span>
        <span class="gauge-value" style="color: {getColor(value)}">{(value * 100).toFixed(0)}%</span>
      </div>
      <div class="gauge-track">
        <div
          class="gauge-fill"
          style="width: {value * 100}%; background: {getColor(value)}; box-shadow: 0 0 8px {getColor(value)}60;"
        ></div>
      </div>
      <div class="gauge-desc">{DIMENSION_DESCRIPTIONS[dim]}</div>
    </div>
  {/each}

  <div class="total-energy">
    <span>Total Energy</span>
    <span class="energy-value">{lockInState.totalEnergy.toFixed(2)}</span>
  </div>
</div>

<style>
  .gauges-panel {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .panel-title {
    font-size: 13px;
    font-weight: 600;
    color: #00f5ff;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }
  .gauge-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .gauge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .gauge-label {
    font-size: 11px;
    font-weight: 500;
    color: #e0e0ff;
  }
  .gauge-value {
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .gauge-track {
    height: 6px;
    background: #14143a;
    border-radius: 3px;
    overflow: hidden;
  }
  .gauge-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease-out, background 0.3s ease-out, box-shadow 0.3s ease-out;
  }
  .gauge-desc {
    font-size: 9px;
    color: #555577;
  }
  .total-energy {
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid rgba(85, 85, 119, 0.25);
    font-size: 11px;
    color: #8888aa;
  }
  .energy-value {
    color: #00f5ff;
    font-weight: 600;
  }
</style>
