<script lang="ts">
  import { simulation } from '$lib/stores/simulation.svelte';

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    simulation.setTime(parseFloat(target.value));
  }

  function togglePause() {
    simulation.toggleRunning();
  }

  function handleSpeed(e: Event) {
    const target = e.target as HTMLInputElement;
    simulation.setSpeed(parseFloat(target.value));
  }
</script>

<div class="time-controls">
  <button class="control-btn" onclick={togglePause}>
    {simulation.running ? '\u23F8' : '\u25B6'}
  </button>

  <div class="slider-group">
    <label class="slider-label">Time: {simulation.time.toFixed(1)}y</label>
    <input type="range" min="0" max="20" step="0.1" value={simulation.time} oninput={handleInput} class="slider" />
  </div>

  <div class="slider-group">
    <label class="slider-label">Speed: {simulation.speed.toFixed(1)}x</label>
    <input type="range" min="0.1" max="5" step="0.1" value={simulation.speed} oninput={handleSpeed} class="slider" />
  </div>
</div>

<style>
  .time-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
  }
  .control-btn {
    width: 32px;
    height: 32px;
    background: #14143a;
    border: 1px solid rgba(0, 245, 255, 0.25);
    border-radius: 50%;
    color: #00f5ff;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .control-btn:hover {
    border-color: #00f5ff;
    box-shadow: 0 0 10px #00f5ff, 0 0 20px #00f5ff40;
  }
  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
  .slider-label {
    font-size: 9px;
    color: #555577;
    font-family: 'JetBrains Mono', monospace;
  }
  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    background: #14143a;
    border-radius: 2px;
    outline: none;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #00f5ff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 6px #00f5ff;
  }
</style>
