# vector-lockin

Interactive visualization modeling cloud & technology lock-in as a **dynamical system in phase space**.

Lock-in is not a scalar. It's a state vector in a multi-dimensional space. Every architectural choice creates an attractor basin the system naturally evolves toward. Reducing one dimension of lock-in often inflates others. Total lock-in cannot be reduced to zero — only transformed.

> "Cloud lock-in is rarely about the vendor. It's about architecture."

## The Visualization

### 3D Phase Space Explorer

A Three.js scene where a glowing particle represents your organization's current lock-in state moving through a potential field. Four attractor basins — **AWS-Native**, **K8s-Centric**, **Multi-Cloud Abstraction**, **Serverless-First** — pull the system toward different architectural equilibria. The particle leaves a trajectory trail showing path dependency.

### Conservation Principle ("Balloon Squeeze")

An interactive radar chart with all 6 lock-in dimensions. Drag one vertex down and the others inflate proportionally — like squeezing a balloon. The total area stays roughly constant, encoding the thesis that lock-in is conserved, not eliminated.

### Organizational Profiles

Switch between 4 archetypes to see how the attractor landscape morphs:

| Profile | Characteristics |
|---|---|
| Pizza Delivery Startup (50 people) | Low complexity tolerance, high vendor coupling acceptable |
| Regulated Bank (5,000 people) | Sovereignty requirements, can afford platform teams |
| Oil & Gas Enterprise (10,000 people) | Long-lived systems, version lock-in dominates |
| VC-Funded Scale-up (200 people) | Speed over everything, will trade any lock-in for velocity |

### Feedback Loop

A circular directed graph showing the positive feedback loop of technology lock-in: Hire Specialists -> Advocate Tooling -> Org Momentum -> Switching Cost -> Lock-in Deepens -> Need More Specialists. Animated particles accelerate over time. Click any node to break the loop and observe destabilization.

## Lock-in Dimensions

| Dimension | Description |
|---|---|
| **Vendor** | Cloud-provider-specific coupling (AWS, GCP, Azure primitives) |
| **People** | Skills scarcity, hiring pool constraints, tribal knowledge |
| **Version** | Cost of upgrading between major versions |
| **Complexity** | Operational overhead of abstractions and tooling |
| **Cognitive** | Mental models, documentation debt, institutional knowledge |
| **Ecosystem** | Tooling constellation lock-in (CNCF, HashiCorp, etc.) |

## The Physics

**Attractor dynamics** — gradient descent on a Gaussian potential field:

```
V(x) = -sum_i strength_i * exp(-||x - attractor_i||^2 / (2 * sigma^2))
particle velocity = -grad(V) + noise
```

**Conservation principle** — when dimension j decreases by delta, redistribute proportionally:

```
for each other dimension k:
  k += delta * (k / sum_of_others)
```

**Feedback acceleration** — path dependency strengthens over time:

```
loop_speed(t) = base_speed * (1 + alpha * t)
```

## Tech Stack

- **SvelteKit 2** + **Svelte 5** (runes)
- **Threlte 8** (@threlte/core, @threlte/extras) — declarative Three.js for Svelte
- **Three.js** — 3D rendering
- **D3.js 7** — available for 2D visualizations
- **TypeScript**

## Getting Started

```sh
npm install
npm run dev -- --port 5199
```

Open [http://localhost:5199](http://localhost:5199).

## Project Structure

```
src/lib/
  types/index.ts            — LockInVector, AttractorConfig, OrgProfile
  stores/*.svelte.ts        — lockInState, organizationProfile, simulation
  physics/*.ts              — attractors, conservation, feedback
  components/
    PhaseSpace.svelte       — 3D scene container + animation loop
    PhaseSpaceScene.svelte  — Threlte scene (camera, grid, interactivity)
    Particle.svelte         — Glowing particle + trajectory trail
    AttractorBasin.svelte   — Semi-transparent cone/funnel attractor
    RadarChart.svelte       — Interactive balloon-squeeze radar
    LockInGauges.svelte     — 6 animated gauge bars
    FeedbackLoop.svelte     — Circular feedback graph with particles
    ProfileSelector.svelte  — Organization profile switcher
    TimeSlider.svelte       — Time scrub + speed controls
```

## Author

**Walter Vargas** — Principal Engineer | Platform Engineering @ N26
