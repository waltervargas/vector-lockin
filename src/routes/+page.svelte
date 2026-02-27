<script lang="ts">
  import PhaseSpace from '$lib/components/PhaseSpace.svelte';
  import LockInGauges from '$lib/components/LockInGauges.svelte';
  import RadarChart from '$lib/components/RadarChart.svelte';
  import FeedbackLoop from '$lib/components/FeedbackLoop.svelte';
  import ProfileSelector from '$lib/components/ProfileSelector.svelte';
  import TimeSlider from '$lib/components/TimeSlider.svelte';
</script>

<svelte:head>
  <title>Lock-in Phase Space Explorer</title>
</svelte:head>

<div class="app">
  <header class="header">
    <h1 class="title">Lock-in Phase Space Explorer</h1>
    <p class="subtitle">Total lock-in cannot be reduced to zero &mdash; only transformed</p>
  </header>

  <main class="grid">
    <section class="panel phase-space">
      <PhaseSpace />
    </section>

    <aside class="panel gauges">
      <LockInGauges />
    </aside>

    <section class="panel radar">
      <RadarChart />
    </section>

    <section class="panel feedback">
      <FeedbackLoop />
    </section>
  </main>

  <footer class="footer">
    <TimeSlider />
    <ProfileSelector />
    <div class="attribution">
      <span>Walter Vargas</span>
      <span class="sep">&middot;</span>
      <span>Principal Engineer | Platform Engineering @ N26</span>
    </div>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }

  .header {
    padding: 16px 24px 8px;
    text-align: center;
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    color: var(--neon-cyan);
    text-shadow: var(--glow-cyan);
    letter-spacing: 1px;
  }

  .subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
    font-style: italic;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    padding: 8px 16px;
    flex: 1;
    min-height: 0;
  }

  .panel {
    background: var(--bg-secondary);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    overflow: hidden;
  }

  .phase-space {
    grid-row: 1;
    grid-column: 1;
  }

  .gauges {
    grid-row: 1;
    grid-column: 2;
    overflow-y: auto;
  }

  .radar {
    grid-row: 2;
    grid-column: 1;
  }

  .feedback {
    grid-row: 2;
    grid-column: 2;
  }

  .footer {
    padding: 4px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .attribution {
    text-align: center;
    font-size: 10px;
    color: var(--text-dim);
    padding-top: 4px;
  }

  .sep {
    margin: 0 6px;
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
      grid-template-rows: 350px auto 350px auto;
    }
    .gauges { grid-row: 2; grid-column: 1; }
    .radar { grid-row: 3; grid-column: 1; }
    .feedback { grid-row: 4; grid-column: 1; }
    .app { max-height: none; overflow: auto; }
  }
</style>
