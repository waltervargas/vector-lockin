# Lock-in Phase Space Visualization — Design Document

**Author:** Walter Vargas, Principal Engineer | Platform Engineering @ N26
**Date:** 2026-02-22
**Status:** Approved

## Purpose

Interactive single-page visualization modeling cloud/technology lock-in as a dynamical system in a multi-dimensional phase space. For LinkedIn/blog context — visually striking, intellectually honest, fun to explore.

Core thesis: Lock-in is a state vector, not a scalar. Every architectural choice creates an attractor basin. Reducing one dimension inflates others. Total lock-in cannot be reduced to zero — only transformed.

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| SvelteKit | 2.x | Application framework |
| Svelte | 5.x | UI framework (runes) |
| Threlte | 8.x | Svelte-native Three.js wrapper |
| Three.js | (via threlte) | 3D rendering |
| D3.js | 7.x | 2D charts and force layout |
| TypeScript | 5.x | Type safety |

## Lock-in Dimensions

| Dimension | Description |
|---|---|
| Vendor | Cloud-provider-specific coupling |
| People | Skills scarcity, hiring pool constraints, tribal knowledge |
| Version | Cost of upgrading between major versions |
| Complexity | Operational overhead of abstractions and tooling |
| Cognitive | Mental models, documentation debt, institutional knowledge |
| Ecosystem | Tooling constellation lock-in (CNCF, HashiCorp, etc.) |

## Scenes

### Scene 1: 3D Phase Space Explorer
- Threlte-rendered 3D space (Vendor, People, Complexity as axes)
- Glowing particle representing system state
- Attractor basins as semi-transparent funnels (AWS-Native, K8s-Centric, Multi-Cloud Abstraction, Serverless-First)
- Particle trail showing trajectory/path dependency
- OrbitControls for camera

### Scene 2: Conservation Principle (Balloon Squeeze)
- D3+SVG radar/spider chart with all 6 dimensions
- Drag one dimension down → others inflate proportionally
- Total area ~constant (conservation)
- Spring-physics animations
- Green=low, Red=high color coding

### Scene 3: Organizational Profiles
- Pizza Startup (50 people), Regulated Bank (5k), Oil & Gas Enterprise (10k), VC Scale-up (200)
- Switching profiles morphs attractor landscape, optimal regions, conservation surface
- Smooth transitions

### Scene 4: Feedback Loop Animation
- D3 force-directed graph showing positive feedback loop
- Animated particles flowing through loop, accelerating over time
- User can "break" loop at any node

## Physics

**Attractor dynamics:** Gradient descent on Gaussian potential field
**Conservation:** Redistribute delta across other dimensions proportionally
**Feedback acceleration:** loop_speed(t) = base_speed * (1 + alpha * t)

## Project Structure

```
src/
├── lib/
│   ├── stores/ (lockInState.ts, organizationProfile.ts, simulation.ts)
│   ├── components/ (PhaseSpace, AttractorBasin, Particle, RadarChart, LockInGauges, FeedbackLoop, ProfileSelector, TimeSlider)
│   ├── physics/ (attractors.ts, conservation.ts, feedback.ts)
│   └── types/ (index.ts)
├── routes/ (+page.svelte)
└── app.css
```

## Visual Style

Dark background (#0a0a1a), neon cyan (#00f5ff), neon magenta (#ff00ff), neon green (#00ff88). JetBrains Mono font. Sci-fi mission control aesthetic.

## Layout

2-column grid: 3D phase space (left) + gauges (right), radar chart (left) + feedback loop (right), profile selector footer.
