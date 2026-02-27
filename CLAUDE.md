# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev -- --port 5199    # Dev server (use port 5199 to avoid conflicts)
npm run build                 # Production build
npm run check                 # Type-check with svelte-check + TypeScript
npm run check:watch           # Type-check in watch mode
```

No test framework is configured. Verify changes with `npm run check` and browser testing.

## Architecture

Interactive physics visualization of cloud lock-in as a dynamical system. A particle moves through a 3D potential field created by attractor basins, with 6 lock-in dimensions tracked reactively.

**Data flow:** Stores (runes) -> Physics simulation (tick loop) -> 3D rendering (Threlte) + 2D panels (SVG)

### Stores (`src/lib/stores/*.svelte.ts`)

- **lockInState** — 6-dimensional lock-in vector + trail history. `applyConservation()` redistributes energy when one dimension changes (balloon squeeze).
- **organizationProfile** — 4 org archetypes (startup/bank/enterprise/scaleup), each with different attractor positions, strengths, and feedback coefficients.
- **simulation** — Physics tick loop. Computes gradient descent on Gaussian potential field, applies forces to particle, manages time/speed/pause state.

### Physics (`src/lib/physics/*.ts`)

- **attractors** — Gaussian potential wells: `V(x) = -sum strength * exp(-dist^2 / 2sigma^2)`. Gradient gives force direction.
- **conservation** — Proportional redistribution: reducing one dimension inflates others to conserve total energy.
- **feedback** — 6-node circular feedback loop model with time-dependent acceleration.

### Components (`src/lib/components/`)

- **PhaseSpace** wraps a Threlte `<Canvas>`. Animation loop lives in `onMount` (requestAnimationFrame calling `simulation.tick(dt)`).
- **PhaseSpaceScene** is a child of Canvas — this is where `interactivity()` and camera setup happen (must be inside Canvas context).
- **Particle** and **AttractorBasin** are Threlte 3D components rendered inside the scene.
- **RadarChart**, **FeedbackLoop**, **LockInGauges** are pure SVG/DOM — no D3 dependency at runtime.

### Layout (`src/routes/+page.svelte`)

2x2 CSS grid: PhaseSpace | Gauges / RadarChart | FeedbackLoop. Footer has TimeSlider + ProfileSelector. Responsive breakpoint at 900px.

## Critical Patterns

**Store files must use `.svelte.ts` extension** for Svelte 5 runes (`$state`, `$derived`, `$effect`) to work outside `.svelte` files. Import with `.svelte` suffix:
```ts
import { lockInState } from '$lib/stores/lockInState.svelte';
```

**SSR is disabled** via `export const ssr = false` in `src/routes/+page.ts`. Three.js/Threlte are client-only.

**Threlte camera setup** — avoid `makeDefault` prop (type mismatch). Use:
```ts
const { camera } = useThrelte();
const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.set(cam);
```

**Threlte interactivity** — `interactivity()` must be called inside a component rendered as a child of `<Canvas>`, not in the Canvas parent.

**3D coordinate scaling** — Lock-in values [0,1] map to 3D space [-2,2]: `(value - 0.5) * 4`.

**GPG signing may timeout** — use `--no-gpg-sign` for commits if needed.

**Vite SSR config** — `ssr.noExternal` includes `three`, `@threlte/core`, `@threlte/extras` to force client bundling.
