# Lock-in Phase Space Visualization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive single-page SvelteKit visualization modeling cloud lock-in as a dynamical system with 3D phase space, conservation radar chart, organizational profiles, and feedback loop animation.

**Architecture:** SvelteKit 2 + Svelte 5 runes for reactivity, Threlte 8 for declarative 3D (Three.js), D3.js 7 for 2D SVG charts. All state flows through Svelte 5 `$state`/`$derived` runes in shared store modules. Physics simulation runs in a requestAnimationFrame loop updating the stores.

**Tech Stack:** SvelteKit 2, Svelte 5, Threlte 8, Three.js, D3.js 7, TypeScript

---

## Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: Full SvelteKit project at `/home/walter/workspace/tradeof-space/`
- Modify: `vite.config.ts` (SSR config for Three.js)
- Modify: `app.html` (Google Fonts)
- Create: `src/app.css` (global dark theme)

**Step 1: Scaffold SvelteKit project**

```bash
cd /home/walter/workspace/tradeof-space
npx sv create --template minimal --types ts --no-add-ons --no-install .
```

If the directory isn't empty (because of docs/), use `--no-dir-check`.

**Step 2: Install dependencies**

```bash
cd /home/walter/workspace/tradeof-space
npm install
npm install @threlte/core @threlte/extras three d3
npm install -D @types/three @types/d3
```

**Step 3: Configure Vite for Three.js SSR**

Modify `vite.config.ts`:
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['three', '@threlte/core', '@threlte/extras']
	}
});
```

**Step 4: Add Google Fonts to `src/app.html`**

Add inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Step 5: Create global dark theme `src/app.css`**

```css
:root {
  --bg-primary: #0a0a1a;
  --bg-secondary: #0f0f2a;
  --bg-tertiary: #14143a;
  --neon-cyan: #00f5ff;
  --neon-magenta: #ff00ff;
  --neon-green: #00ff88;
  --neon-orange: #ff8800;
  --neon-yellow: #ffff00;
  --neon-red: #ff3366;
  --text-primary: #e0e0ff;
  --text-secondary: #8888aa;
  --text-dim: #555577;
  --glow-cyan: 0 0 10px #00f5ff, 0 0 20px #00f5ff40;
  --glow-magenta: 0 0 10px #ff00ff, 0 0 20px #ff00ff40;
  --glow-green: 0 0 10px #00ff88, 0 0 20px #00ff8840;
  --font-mono: 'JetBrains Mono', 'Source Code Pro', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-mono);
  overflow-x: hidden;
}

::selection {
  background: var(--neon-cyan);
  color: var(--bg-primary);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--text-dim);
  border-radius: 3px;
}
```

**Step 6: Verify dev server starts**

```bash
cd /home/walter/workspace/tradeof-space && npm run dev -- --port 5199
```

Open in Chrome and verify blank page loads with dark background.

**Step 7: Initialize git and commit**

```bash
cd /home/walter/workspace/tradeof-space
git init
git add -A
git commit -m "feat: scaffold SvelteKit project with threlte, d3, dark theme"
```

---

## Task 2: Types & Shared State

**Files:**
- Create: `src/lib/types/index.ts`
- Create: `src/lib/stores/lockInState.ts`
- Create: `src/lib/stores/organizationProfile.ts`
- Create: `src/lib/stores/simulation.ts`

**Step 1: Create type definitions**

Create `src/lib/types/index.ts`:
```typescript
export type LockInDimension = 'vendor' | 'people' | 'version' | 'complexity' | 'cognitive' | 'ecosystem';

export const DIMENSIONS: LockInDimension[] = ['vendor', 'people', 'version', 'complexity', 'cognitive', 'ecosystem'];

export const DIMENSION_LABELS: Record<LockInDimension, string> = {
  vendor: 'Vendor',
  people: 'People',
  version: 'Version',
  complexity: 'Complexity',
  cognitive: 'Cognitive',
  ecosystem: 'Ecosystem',
};

export const DIMENSION_DESCRIPTIONS: Record<LockInDimension, string> = {
  vendor: 'Cloud-provider-specific coupling',
  people: 'Skills scarcity & tribal knowledge',
  version: 'Upgrade cost between versions',
  complexity: 'Operational overhead of abstractions',
  cognitive: 'Mental models & documentation debt',
  ecosystem: 'Tooling constellation lock-in',
};

export type LockInVector = Record<LockInDimension, number>;

/** 3D position for phase space (maps 3 most impactful dimensions) */
export interface PhasePosition {
  x: number; // vendor
  y: number; // people
  z: number; // complexity
}

export interface AttractorConfig {
  id: string;
  label: string;
  position: PhasePosition;
  strength: number;
  sigma: number;
  color: string;
  description: string;
}

export type OrgProfileId = 'startup' | 'bank' | 'enterprise' | 'scaleup';

export interface OrgProfile {
  id: OrgProfileId;
  emoji: string;
  name: string;
  subtitle: string;
  headcount: string;
  initialState: LockInVector;
  attractors: AttractorConfig[];
  feedbackAlpha: number; // path dependency coefficient
}

export interface TrailPoint {
  position: PhasePosition;
  timestamp: number;
}

export interface FeedbackNode {
  id: string;
  label: string;
  description: string;
}

export interface FeedbackEdge {
  source: string;
  target: string;
}
```

**Step 2: Create lock-in state store**

Create `src/lib/stores/lockInState.ts`:
```typescript
import { DIMENSIONS, type LockInVector, type LockInDimension, type PhasePosition, type TrailPoint } from '$lib/types';

const MAX_TRAIL_LENGTH = 200;

function createLockInState() {
  const defaultVector: LockInVector = {
    vendor: 0.5,
    people: 0.5,
    version: 0.5,
    complexity: 0.5,
    cognitive: 0.5,
    ecosystem: 0.5,
  };

  let vector = $state<LockInVector>({ ...defaultVector });
  let trail = $state<TrailPoint[]>([]);
  let totalEnergy = $derived(DIMENSIONS.reduce((sum, d) => sum + vector[d], 0));

  function toPhasePosition(): PhasePosition {
    return { x: vector.vendor, y: vector.people, z: vector.complexity };
  }

  function setVector(v: LockInVector) {
    vector = { ...v };
    trail = [...trail, { position: toPhasePosition(), timestamp: Date.now() }].slice(-MAX_TRAIL_LENGTH);
  }

  function setDimension(dim: LockInDimension, value: number) {
    vector = { ...vector, [dim]: Math.max(0, Math.min(1, value)) };
    trail = [...trail, { position: toPhasePosition(), timestamp: Date.now() }].slice(-MAX_TRAIL_LENGTH);
  }

  function applyConservation(changedDim: LockInDimension, newValue: number) {
    const oldValue = vector[changedDim];
    const delta = oldValue - newValue;
    const otherDims = DIMENSIONS.filter(d => d !== changedDim);
    const otherSum = otherDims.reduce((sum, d) => sum + vector[d], 0);

    const newVector = { ...vector, [changedDim]: Math.max(0, Math.min(1, newValue)) };

    if (otherSum > 0) {
      for (const d of otherDims) {
        const proportion = vector[d] / otherSum;
        newVector[d] = Math.max(0.05, Math.min(0.95, vector[d] + delta * proportion));
      }
    }

    setVector(newVector);
  }

  function clearTrail() {
    trail = [];
  }

  return {
    get vector() { return vector; },
    get trail() { return trail; },
    get totalEnergy() { return totalEnergy; },
    get phasePosition() { return toPhasePosition(); },
    setVector,
    setDimension,
    applyConservation,
    clearTrail,
  };
}

export const lockInState = createLockInState();
```

**Step 3: Create organization profile store**

Create `src/lib/stores/organizationProfile.ts`:
```typescript
import type { OrgProfile, OrgProfileId } from '$lib/types';

export const ORG_PROFILES: Record<OrgProfileId, OrgProfile> = {
  startup: {
    id: 'startup',
    emoji: '\u{1F355}',
    name: 'Pizza Delivery Startup',
    subtitle: '50 people',
    headcount: '50',
    initialState: {
      vendor: 0.7,
      people: 0.3,
      version: 0.2,
      complexity: 0.2,
      cognitive: 0.3,
      ecosystem: 0.6,
    },
    attractors: [
      {
        id: 'serverless',
        label: 'Serverless-First',
        position: { x: 0.8, y: 0.2, z: 0.3 },
        strength: 0.8,
        sigma: 0.3,
        color: '#00ff88',
        description: 'Lambda/Cloud Functions for everything — minimal ops, maximum vendor coupling',
      },
      {
        id: 'aws-native',
        label: 'AWS-Native',
        position: { x: 0.9, y: 0.3, z: 0.4 },
        strength: 0.6,
        sigma: 0.25,
        color: '#ff8800',
        description: 'Full AWS stack — DynamoDB, SQS, ECS — fast to build, hard to leave',
      },
      {
        id: 'k8s-centric',
        label: 'K8s-Centric',
        position: { x: 0.3, y: 0.8, z: 0.8 },
        strength: 0.3,
        sigma: 0.2,
        color: '#00f5ff',
        description: 'Kubernetes everything — powerful but needs specialists',
      },
      {
        id: 'multi-cloud',
        label: 'Multi-Cloud Abstraction',
        position: { x: 0.2, y: 0.5, z: 0.9 },
        strength: 0.2,
        sigma: 0.2,
        color: '#ff00ff',
        description: 'Terraform + abstraction layers — vendor-free but complexity-heavy',
      },
    ],
    feedbackAlpha: 0.3,
  },
  bank: {
    id: 'bank',
    emoji: '\u{1F3E6}',
    name: 'Regulated Bank',
    subtitle: '5,000 people',
    headcount: '5,000',
    initialState: {
      vendor: 0.4,
      people: 0.6,
      version: 0.5,
      complexity: 0.6,
      cognitive: 0.7,
      ecosystem: 0.5,
    },
    attractors: [
      {
        id: 'multi-cloud',
        label: 'Multi-Cloud Abstraction',
        position: { x: 0.2, y: 0.5, z: 0.7 },
        strength: 0.8,
        sigma: 0.3,
        color: '#ff00ff',
        description: 'Regulatory pressure pushes toward vendor independence',
      },
      {
        id: 'k8s-centric',
        label: 'K8s-Centric',
        position: { x: 0.3, y: 0.7, z: 0.6 },
        strength: 0.7,
        sigma: 0.25,
        color: '#00f5ff',
        description: 'Platform teams can absorb K8s complexity at scale',
      },
      {
        id: 'aws-native',
        label: 'AWS-Native',
        position: { x: 0.8, y: 0.4, z: 0.5 },
        strength: 0.3,
        sigma: 0.2,
        color: '#ff8800',
        description: 'Convenient but regulatory risk — auditors ask questions',
      },
      {
        id: 'serverless',
        label: 'Serverless-First',
        position: { x: 0.7, y: 0.3, z: 0.4 },
        strength: 0.2,
        sigma: 0.2,
        color: '#00ff88',
        description: 'Too much vendor coupling for compliance requirements',
      },
    ],
    feedbackAlpha: 0.15,
  },
  enterprise: {
    id: 'enterprise',
    emoji: '\u{1F6E2}\u{FE0F}',
    name: 'Oil & Gas Enterprise',
    subtitle: '10,000 people',
    headcount: '10,000',
    initialState: {
      vendor: 0.5,
      people: 0.7,
      version: 0.8,
      complexity: 0.7,
      cognitive: 0.8,
      ecosystem: 0.6,
    },
    attractors: [
      {
        id: 'k8s-centric',
        label: 'K8s-Centric',
        position: { x: 0.4, y: 0.8, z: 0.7 },
        strength: 0.7,
        sigma: 0.3,
        color: '#00f5ff',
        description: 'Standardization through K8s — long-lived systems need stability',
      },
      {
        id: 'multi-cloud',
        label: 'Multi-Cloud Abstraction',
        position: { x: 0.3, y: 0.6, z: 0.85 },
        strength: 0.6,
        sigma: 0.25,
        color: '#ff00ff',
        description: 'Compliance and sovereignty requirements drive multi-cloud',
      },
      {
        id: 'aws-native',
        label: 'AWS-Native',
        position: { x: 0.7, y: 0.5, z: 0.5 },
        strength: 0.4,
        sigma: 0.2,
        color: '#ff8800',
        description: 'Legacy workloads already deep in AWS ecosystem',
      },
      {
        id: 'serverless',
        label: 'Serverless-First',
        position: { x: 0.6, y: 0.3, z: 0.4 },
        strength: 0.15,
        sigma: 0.15,
        color: '#00ff88',
        description: 'Edge cases only — not suitable for core workloads',
      },
    ],
    feedbackAlpha: 0.08,
  },
  scaleup: {
    id: 'scaleup',
    emoji: '\u{1F680}',
    name: 'VC-Funded Scale-up',
    subtitle: '200 people',
    headcount: '200',
    initialState: {
      vendor: 0.6,
      people: 0.4,
      version: 0.3,
      complexity: 0.4,
      cognitive: 0.4,
      ecosystem: 0.7,
    },
    attractors: [
      {
        id: 'aws-native',
        label: 'AWS-Native',
        position: { x: 0.85, y: 0.35, z: 0.5 },
        strength: 0.8,
        sigma: 0.3,
        color: '#ff8800',
        description: 'Speed wins — trade lock-in for velocity',
      },
      {
        id: 'serverless',
        label: 'Serverless-First',
        position: { x: 0.75, y: 0.25, z: 0.35 },
        strength: 0.7,
        sigma: 0.25,
        color: '#00ff88',
        description: 'No ops team needed — pure developer velocity',
      },
      {
        id: 'k8s-centric',
        label: 'K8s-Centric',
        position: { x: 0.4, y: 0.7, z: 0.7 },
        strength: 0.4,
        sigma: 0.25,
        color: '#00f5ff',
        description: 'Growing into platform engineering as team scales',
      },
      {
        id: 'multi-cloud',
        label: 'Multi-Cloud Abstraction',
        position: { x: 0.2, y: 0.5, z: 0.85 },
        strength: 0.15,
        sigma: 0.15,
        color: '#ff00ff',
        description: 'Premature optimization — not worth the complexity tax yet',
      },
    ],
    feedbackAlpha: 0.25,
  },
};

function createProfileStore() {
  let activeId = $state<OrgProfileId>('startup');
  let profile = $derived(ORG_PROFILES[activeId]);

  function setProfile(id: OrgProfileId) {
    activeId = id;
  }

  return {
    get activeId() { return activeId; },
    get profile() { return profile; },
    setProfile,
  };
}

export const profileStore = createProfileStore();
```

**Step 4: Create simulation store**

Create `src/lib/stores/simulation.ts`:
```typescript
import { lockInState } from './lockInState';
import { profileStore } from './organizationProfile';
import type { PhasePosition, AttractorConfig } from '$lib/types';

function createSimulation() {
  let running = $state(true);
  let time = $state(0);
  let speed = $state(1);
  let targetAttractor = $state<string | null>(null);
  let feedbackSpeed = $derived(1 + profileStore.profile.feedbackAlpha * time);

  function computeGradient(pos: PhasePosition, attractors: AttractorConfig[]): PhasePosition {
    let gx = 0, gy = 0, gz = 0;

    for (const a of attractors) {
      const dx = pos.x - a.position.x;
      const dy = pos.y - a.position.y;
      const dz = pos.z - a.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      const sigma2 = 2 * a.sigma * a.sigma;
      const factor = a.strength * Math.exp(-distSq / sigma2) / sigma2;

      gx += factor * dx;
      gy += factor * dy;
      gz += factor * dz;
    }

    return { x: -gx, y: -gy, z: -gz };
  }

  function tick(dt: number) {
    if (!running) return;

    const pos = lockInState.phasePosition;
    const attractors = profileStore.profile.attractors;

    let force: PhasePosition;

    if (targetAttractor) {
      const target = attractors.find(a => a.id === targetAttractor);
      if (target) {
        const dx = target.position.x - pos.x;
        const dy = target.position.y - pos.y;
        const dz = target.position.z - pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.02) {
          targetAttractor = null;
        }
        const pullStrength = 2.0;
        force = { x: dx * pullStrength, y: dy * pullStrength, z: dz * pullStrength };
      } else {
        force = computeGradient(pos, attractors);
      }
    } else {
      force = computeGradient(pos, attractors);
    }

    // Add small noise for organic movement
    const noise = 0.02;
    force.x += (Math.random() - 0.5) * noise;
    force.y += (Math.random() - 0.5) * noise;
    force.z += (Math.random() - 0.5) * noise;

    const scaledDt = dt * speed * 0.001;
    const newVendor = Math.max(0.05, Math.min(0.95, lockInState.vector.vendor + force.x * scaledDt));
    const newPeople = Math.max(0.05, Math.min(0.95, lockInState.vector.people + force.y * scaledDt));
    const newComplexity = Math.max(0.05, Math.min(0.95, lockInState.vector.complexity + force.z * scaledDt));

    lockInState.setVector({
      ...lockInState.vector,
      vendor: newVendor,
      people: newPeople,
      complexity: newComplexity,
    });

    time += dt * 0.001;
  }

  function navigateToAttractor(id: string) {
    targetAttractor = id;
  }

  function reset() {
    time = 0;
    targetAttractor = null;
    lockInState.setVector(profileStore.profile.initialState);
    lockInState.clearTrail();
  }

  function toggleRunning() {
    running = !running;
  }

  function setSpeed(s: number) {
    speed = s;
  }

  function setTime(t: number) {
    time = t;
  }

  return {
    get running() { return running; },
    get time() { return time; },
    get speed() { return speed; },
    get feedbackSpeed() { return feedbackSpeed; },
    get targetAttractor() { return targetAttractor; },
    tick,
    navigateToAttractor,
    reset,
    toggleRunning,
    setSpeed,
    setTime,
    computeGradient,
  };
}

export const simulation = createSimulation();
```

**Step 5: Commit**

```bash
git add src/lib/types src/lib/stores
git commit -m "feat: add types, lock-in state, profile, and simulation stores"
```

---

## Task 3: Physics Engine

**Files:**
- Create: `src/lib/physics/attractors.ts`
- Create: `src/lib/physics/conservation.ts`
- Create: `src/lib/physics/feedback.ts`

**Step 1: Create attractor physics**

Create `src/lib/physics/attractors.ts`:
```typescript
import type { PhasePosition, AttractorConfig } from '$lib/types';

/** Compute the potential energy at a point given attractors */
export function potential(pos: PhasePosition, attractors: AttractorConfig[]): number {
  let V = 0;
  for (const a of attractors) {
    const dx = pos.x - a.position.x;
    const dy = pos.y - a.position.y;
    const dz = pos.z - a.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    V += -a.strength * Math.exp(-distSq / (2 * a.sigma * a.sigma));
  }
  return V;
}

/** Compute the negative gradient of the potential (force direction) */
export function gradient(pos: PhasePosition, attractors: AttractorConfig[]): PhasePosition {
  let gx = 0, gy = 0, gz = 0;

  for (const a of attractors) {
    const dx = pos.x - a.position.x;
    const dy = pos.y - a.position.y;
    const dz = pos.z - a.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    const sigma2 = 2 * a.sigma * a.sigma;
    const factor = a.strength * Math.exp(-distSq / sigma2) / sigma2;

    gx -= factor * dx;
    gy -= factor * dy;
    gz -= factor * dz;
  }

  return { x: gx, y: gy, z: gz };
}

/** Find the nearest attractor to a position */
export function nearestAttractor(pos: PhasePosition, attractors: AttractorConfig[]): AttractorConfig | null {
  let nearest: AttractorConfig | null = null;
  let minDist = Infinity;

  for (const a of attractors) {
    const dx = pos.x - a.position.x;
    const dy = pos.y - a.position.y;
    const dz = pos.z - a.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < minDist) {
      minDist = dist;
      nearest = a;
    }
  }

  return nearest;
}
```

**Step 2: Create conservation physics**

Create `src/lib/physics/conservation.ts`:
```typescript
import { DIMENSIONS, type LockInVector, type LockInDimension } from '$lib/types';

/**
 * Redistribute lock-in when one dimension changes.
 * Total "energy" is approximately conserved.
 */
export function conserve(
  current: LockInVector,
  changedDim: LockInDimension,
  newValue: number,
): LockInVector {
  const clamped = Math.max(0.05, Math.min(0.95, newValue));
  const delta = current[changedDim] - clamped;
  const otherDims = DIMENSIONS.filter(d => d !== changedDim);
  const otherSum = otherDims.reduce((sum, d) => sum + current[d], 0);

  const result: LockInVector = { ...current, [changedDim]: clamped };

  if (otherSum > 0 && Math.abs(delta) > 0.001) {
    for (const d of otherDims) {
      const proportion = current[d] / otherSum;
      result[d] = Math.max(0.05, Math.min(0.95, current[d] + delta * proportion));
    }
  }

  return result;
}

/** Calculate the total lock-in energy (sum of all dimensions) */
export function totalEnergy(v: LockInVector): number {
  return DIMENSIONS.reduce((sum, d) => sum + v[d], 0);
}
```

**Step 3: Create feedback loop model**

Create `src/lib/physics/feedback.ts`:
```typescript
import type { FeedbackNode, FeedbackEdge } from '$lib/types';

export const FEEDBACK_NODES: FeedbackNode[] = [
  { id: 'hire', label: 'Hire Specialists', description: 'Organization hires K8s/cloud specialists to manage infrastructure' },
  { id: 'advocate', label: 'Advocate Tooling', description: 'Specialists naturally advocate for tools they know best' },
  { id: 'momentum', label: 'Org Momentum', description: 'Organizational processes and runbooks crystallize around chosen tools' },
  { id: 'switching-cost', label: 'Switching Cost \u2191', description: 'Migration cost grows as more systems depend on current choices' },
  { id: 'lockin', label: 'Lock-in Deepens', description: 'The basin of attraction becomes deeper and harder to escape' },
  { id: 'need-more', label: 'Need More Specialists', description: 'Deeper lock-in requires even more specialized knowledge' },
];

export const FEEDBACK_EDGES: FeedbackEdge[] = [
  { source: 'hire', target: 'advocate' },
  { source: 'advocate', target: 'momentum' },
  { source: 'momentum', target: 'switching-cost' },
  { source: 'switching-cost', target: 'lockin' },
  { source: 'lockin', target: 'need-more' },
  { source: 'need-more', target: 'hire' },
];

/** Compute the feedback loop speed at a given time */
export function loopSpeed(baseSpeed: number, alpha: number, time: number): number {
  return baseSpeed * (1 + alpha * time);
}

/** Compute what happens when a feedback loop is broken at a node */
export function breakLoop(nodeId: string): { brokenEdges: string[]; destabilizationFactor: number } {
  const incomingEdge = FEEDBACK_EDGES.find(e => e.target === nodeId);
  const outgoingEdge = FEEDBACK_EDGES.find(e => e.source === nodeId);
  const brokenEdges: string[] = [];

  if (incomingEdge) brokenEdges.push(`${incomingEdge.source}-${incomingEdge.target}`);
  if (outgoingEdge) brokenEdges.push(`${outgoingEdge.source}-${outgoingEdge.target}`);

  // Destabilization is higher when breaking early in the loop
  const nodeIndex = FEEDBACK_NODES.findIndex(n => n.id === nodeId);
  const destabilizationFactor = 1 - (nodeIndex / FEEDBACK_NODES.length) * 0.5;

  return { brokenEdges, destabilizationFactor };
}
```

**Step 4: Commit**

```bash
git add src/lib/physics
git commit -m "feat: add physics engine — attractors, conservation, feedback loop"
```

---

## Task 4: 3D Phase Space (Threlte Components)

**Files:**
- Create: `src/lib/components/PhaseSpace.svelte`
- Create: `src/lib/components/AttractorBasin.svelte`
- Create: `src/lib/components/Particle.svelte`

**Step 1: Create the Particle component**

Create `src/lib/components/Particle.svelte`:
```svelte
<script lang="ts">
  import { T } from '@threlte/core';
  import { lockInState } from '$lib/stores/lockInState';
  import type { TrailPoint } from '$lib/types';
  import * as THREE from 'three';

  // Scale factor: map 0-1 to -2 to 2 in 3D space
  function scale(v: number): number {
    return (v - 0.5) * 4;
  }

  let trailGeometry = $state<THREE.BufferGeometry | null>(null);

  $effect(() => {
    const trail = lockInState.trail;
    if (trail.length < 2) {
      trailGeometry = null;
      return;
    }

    const points = trail.map((p: TrailPoint) =>
      new THREE.Vector3(scale(p.position.x), scale(p.position.y), scale(p.position.z))
    );

    const geo = new THREE.BufferGeometry().setFromPoints(points);

    // Color gradient: older = dim, newer = bright
    const colors = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      const t = i / (points.length - 1);
      colors[i * 3] = t * 0;       // R
      colors[i * 3 + 1] = t * 0.96; // G
      colors[i * 3 + 2] = t * 1;    // B
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    trailGeometry = geo;
  });
</script>

<!-- Glowing particle sphere -->
<T.Group position={[scale(lockInState.phasePosition.x), scale(lockInState.phasePosition.y), scale(lockInState.phasePosition.z)]}>
  <!-- Core -->
  <T.Mesh>
    <T.SphereGeometry args={[0.08, 32, 32]} />
    <T.MeshBasicMaterial color="#00f5ff" />
  </T.Mesh>
  <!-- Glow -->
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
{#if trailGeometry}
  <T.Line geometry={trailGeometry}>
    <T.LineBasicMaterial vertexColors transparent opacity={0.7} linewidth={1} />
  </T.Line>
{/if}
```

**Step 2: Create the AttractorBasin component**

Create `src/lib/components/AttractorBasin.svelte`:
```svelte
<script lang="ts">
  import { T } from '@threlte/core';
  import { HTML } from '@threlte/extras';
  import type { AttractorConfig } from '$lib/types';
  import { simulation } from '$lib/stores/simulation';
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

  const pos: [number, number, number] = [
    scale(attractor.position.x),
    scale(attractor.position.y),
    scale(attractor.position.z),
  ];

  const funnelHeight = attractor.strength * 1.5;
  const funnelRadius = attractor.sigma * 3;
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
      wireframe={false}
    />
  </T.Mesh>

  <!-- Wireframe ring at top -->
  <T.Mesh rotation.x={-Math.PI / 2} position.y={funnelHeight}>
    <T.RingGeometry args={[funnelRadius - 0.02, funnelRadius, 64]} />
    <T.MeshBasicMaterial color={attractor.color} transparent opacity={0.5} side={THREE.DoubleSide} />
  </T.Mesh>

  <!-- Center glow point -->
  <T.Mesh>
    <T.SphereGeometry args={[0.05, 16, 16]} />
    <T.MeshBasicMaterial color={attractor.color} />
  </T.Mesh>
  <T.PointLight color={attractor.color} intensity={0.5} distance={2} />

  <!-- Label -->
  <HTML position.y={funnelHeight + 0.3} center>
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
```

**Step 3: Create the main PhaseSpace component**

Create `src/lib/components/PhaseSpace.svelte`:
```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { OrbitControls, Grid } from '@threlte/extras';
  import { T } from '@threlte/core';
  import Particle from './Particle.svelte';
  import AttractorBasin from './AttractorBasin.svelte';
  import { profileStore } from '$lib/stores/organizationProfile';
  import { simulation } from '$lib/stores/simulation';
  import { lockInState } from '$lib/stores/lockInState';
  import { onMount } from 'svelte';

  let animFrameId: number;

  onMount(() => {
    let lastTime = performance.now();

    function loop(now: number) {
      const dt = Math.min(now - lastTime, 50); // cap at 50ms
      lastTime = now;
      simulation.tick(dt);
      animFrameId = requestAnimationFrame(loop);
    }

    // Initialize state
    lockInState.setVector(profileStore.profile.initialState);
    animFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animFrameId);
  });
</script>

<div class="phase-space-container">
  <Canvas>
    <!-- Camera -->
    <T.PerspectiveCamera makeDefault position={[5, 4, 5]} fov={50}>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </T.PerspectiveCamera>

    <!-- Ambient light -->
    <T.AmbientLight intensity={0.15} />

    <!-- Grid floor -->
    <Grid
      cellColor="#1a1a4a"
      sectionColor="#2a2a6a"
      fadeDistance={20}
      cellSize={0.5}
      sectionSize={2}
      infiniteGrid
    />

    <!-- Axes labels using HTML -->

    <!-- Attractor basins -->
    {#each profileStore.profile.attractors as attractor (attractor.id)}
      <AttractorBasin {attractor} />
    {/each}

    <!-- The system particle -->
    <Particle />

    <!-- Axis lines -->
    <!-- X axis (Vendor) - red -->
    <T.Line>
      <T.BufferGeometry>
        {#snippet children()}
          <!-- We'll create axis lines in onMount or via raw Three -->
        {/snippet}
      </T.BufferGeometry>
    </T.Line>
  </Canvas>

  <!-- Axis labels overlay -->
  <div class="axis-label axis-x">Vendor &rarr;</div>
  <div class="axis-label axis-y">&uarr; People</div>
  <div class="axis-label axis-z">Complexity &rarr;</div>
</div>

<style>
  .phase-space-container {
    width: 100%;
    height: 100%;
    position: relative;
    border: 1px solid var(--neon-cyan, #00f5ff)20;
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-secondary, #0f0f2a);
  }

  .axis-label {
    position: absolute;
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    color: var(--text-secondary, #8888aa);
    pointer-events: none;
  }

  .axis-x {
    bottom: 12px;
    right: 20%;
  }

  .axis-y {
    top: 12px;
    left: 12px;
  }

  .axis-z {
    bottom: 12px;
    left: 20%;
  }
</style>
```

**Step 4: Verify in Chrome**

Start dev server and verify:
- 3D scene renders with dark background
- Particle is visible and glowing
- Attractor basins render as funnels
- OrbitControls work (click+drag to rotate)
- Particle drifts toward nearest attractor
- Trail draws behind particle

**Step 5: Commit**

```bash
git add src/lib/components/PhaseSpace.svelte src/lib/components/AttractorBasin.svelte src/lib/components/Particle.svelte
git commit -m "feat: add 3D phase space with particle, attractors, and trail"
```

---

## Task 5: Lock-in Gauges (Side Panel)

**Files:**
- Create: `src/lib/components/LockInGauges.svelte`

**Step 1: Create the gauges component**

Create `src/lib/components/LockInGauges.svelte`:
```svelte
<script lang="ts">
  import { lockInState } from '$lib/stores/lockInState';
  import { DIMENSIONS, DIMENSION_LABELS, DIMENSION_DESCRIPTIONS, type LockInDimension } from '$lib/types';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // Create tweened values for smooth animation
  const tweenedValues: Record<string, ReturnType<typeof tweened>> = {};
  for (const dim of DIMENSIONS) {
    tweenedValues[dim] = tweened(0.5, { duration: 300, easing: cubicOut });
  }

  $effect(() => {
    for (const dim of DIMENSIONS) {
      tweenedValues[dim].set(lockInState.vector[dim]);
    }
  });

  function getColor(value: number): string {
    // Green (low) to Yellow (mid) to Red (high)
    if (value < 0.5) {
      const t = value / 0.5;
      const r = Math.round(t * 255);
      const g = 255;
      return `rgb(${r}, ${g}, 100)`;
    } else {
      const t = (value - 0.5) / 0.5;
      const r = 255;
      const g = Math.round((1 - t) * 255);
      return `rgb(${r}, ${g}, 80)`;
    }
  }

  function getGlow(value: number): string {
    const color = getColor(value);
    return `0 0 8px ${color}60`;
  }
</script>

<div class="gauges-panel">
  <h3 class="panel-title">Lock-in Vector</h3>

  {#each DIMENSIONS as dim}
    {@const value = tweenedValues[dim]}
    <div class="gauge-row">
      <div class="gauge-header">
        <span class="gauge-label">{DIMENSION_LABELS[dim]}</span>
        <span class="gauge-value" style="color: {getColor($value)}">{($value * 100).toFixed(0)}%</span>
      </div>
      <div class="gauge-track">
        <div
          class="gauge-fill"
          style="
            width: {$value * 100}%;
            background: {getColor($value)};
            box-shadow: {getGlow($value)};
          "
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
    color: var(--neon-cyan);
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
    color: var(--text-primary);
  }

  .gauge-value {
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .gauge-track {
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
    overflow: hidden;
  }

  .gauge-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease-out;
  }

  .gauge-desc {
    font-size: 9px;
    color: var(--text-dim);
  }

  .total-energy {
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid var(--text-dim)40;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .energy-value {
    color: var(--neon-cyan);
    font-weight: 600;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/lib/components/LockInGauges.svelte
git commit -m "feat: add animated lock-in gauge bars"
```

---

## Task 6: Radar Chart (Balloon Squeeze)

**Files:**
- Create: `src/lib/components/RadarChart.svelte`

**Step 1: Create the interactive radar chart**

Create `src/lib/components/RadarChart.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { lockInState } from '$lib/stores/lockInState';
  import { DIMENSIONS, DIMENSION_LABELS, type LockInDimension } from '$lib/types';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let svgEl: SVGSVGElement;
  let width = $state(400);
  let height = $state(400);
  const padding = 60;
  let dragging = $state<LockInDimension | null>(null);

  const cx = $derived(width / 2);
  const cy = $derived(height / 2);
  const radius = $derived(Math.min(width, height) / 2 - padding);

  const angleStep = (2 * Math.PI) / DIMENSIONS.length;

  // Tweened values for smooth animation
  const tweenedValues: Record<string, ReturnType<typeof tweened>> = {};
  for (const dim of DIMENSIONS) {
    tweenedValues[dim] = tweened(0.5, { duration: 400, easing: cubicOut });
  }

  $effect(() => {
    for (const dim of DIMENSIONS) {
      tweenedValues[dim].set(lockInState.vector[dim]);
    }
  });

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

  function polygonPoints(): string {
    return DIMENSIONS.map((dim, i) => {
      const val = tweenedValues[dim] as { subscribe: (fn: (v: number) => void) => void };
      let v = 0.5;
      val.subscribe((value: number) => { v = value; })();
      const p = getPoint(i, lockInState.vector[dim]);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  function handleMouseDown(dim: LockInDimension) {
    dragging = dim;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging || !svgEl) return;

    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const newValue = Math.max(0.05, Math.min(0.95, dist / radius));

    lockInState.applyConservation(dragging, newValue);
  }

  function handleMouseUp() {
    dragging = null;
  }

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
    });
    observer.observe(svgEl.parentElement!);
    return () => observer.disconnect();
  });
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="radar-container">
  <h3 class="panel-title">Conservation Principle</h3>
  <p class="panel-subtitle">Drag vertices — squeeze one, others inflate</p>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
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
      stroke="var(--neon-cyan)"
      stroke-width="2"
    />

    <!-- Vertex handles and labels -->
    {#each DIMENSIONS as dim, i}
      {@const value = lockInState.vector[dim]}
      {@const p = getPoint(i, value)}
      {@const labelP = getPoint(i, 1.15)}

      <!-- Draggable vertex -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <circle
        cx={p.x}
        cy={p.y}
        r={dragging === dim ? 10 : 7}
        fill={getColor(value)}
        stroke="white"
        stroke-width="2"
        style="cursor: grab; filter: drop-shadow(0 0 6px {getColor(value)});"
        onmousedown={() => handleMouseDown(dim)}
      />

      <!-- Dimension label -->
      <text
        x={labelP.x}
        y={labelP.y}
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--text-secondary)"
        font-size="10"
        font-family="var(--font-mono)"
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
    color: var(--neon-magenta);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 2px;
  }

  .panel-subtitle {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .radar-svg {
    flex: 1;
    width: 100%;
  }
</style>
```

**Step 2: Verify in Chrome**

- Radar chart renders with all 6 dimensions
- Dragging vertices redistributes values
- Color coding works (green=low, red=high)
- Polygon area stays roughly constant

**Step 3: Commit**

```bash
git add src/lib/components/RadarChart.svelte
git commit -m "feat: add interactive radar chart with conservation principle"
```

---

## Task 7: Feedback Loop Animation

**Files:**
- Create: `src/lib/components/FeedbackLoop.svelte`

**Step 1: Create the feedback loop component**

Create `src/lib/components/FeedbackLoop.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { FEEDBACK_NODES, FEEDBACK_EDGES, loopSpeed } from '$lib/physics/feedback';
  import { simulation } from '$lib/stores/simulation';
  import { profileStore } from '$lib/stores/organizationProfile';

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

  interface NodePos {
    x: number;
    y: number;
    angle: number;
  }

  const nodePositions = $derived<Record<string, NodePos>>(() => {
    const positions: Record<string, NodePos> = {};
    const n = FEEDBACK_NODES.length;
    FEEDBACK_NODES.forEach((node, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      positions[node.id] = {
        x: cx + Math.cos(angle) * loopRadius,
        y: cy + Math.sin(angle) * loopRadius,
        angle,
      };
    });
    return positions;
  });

  function getNodePos(id: string) {
    const positions = nodePositions();
    return positions[id] || { x: 0, y: 0, angle: 0 };
  }

  // Animated particles along edges
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

      // Skip particles on broken edges
      if (brokenNode && (edge.source === brokenNode || edge.target === brokenNode)) {
        continue;
      }

      const from = getNodePos(edge.source);
      const to = getNodePos(edge.target);

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
    if (brokenNode === nodeId) {
      brokenNode = null;
    } else {
      brokenNode = nodeId;
    }
  }

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
    });
    if (svgEl.parentElement) observer.observe(svgEl.parentElement);

    function animate() {
      const speed = loopSpeed(0.0003, profileStore.profile.feedbackAlpha, simulation.time);
      particleOffset = (particleOffset + speed) % 1;
      animFrameId = requestAnimationFrame(animate);
    }
    animFrameId = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animFrameId);
    };
  });
</script>

<div class="feedback-container">
  <h3 class="panel-title">Feedback Loop</h3>
  <p class="panel-subtitle">Click a node to break the loop</p>

  <svg bind:this={svgEl} viewBox="0 0 {width} {height}" class="feedback-svg">
    <!-- Edges (arcs between nodes) -->
    {#each FEEDBACK_EDGES as edge}
      {@const from = getNodePos(edge.source)}
      {@const to = getNodePos(edge.target)}
      {@const isBroken = brokenNode && (edge.source === brokenNode || edge.target === brokenNode)}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={isBroken ? '#ff336640' : '#00f5ff40'}
        stroke-width={isBroken ? 1 : 2}
        stroke-dasharray={isBroken ? '4,4' : 'none'}
      />
      <!-- Arrow head -->
      {#if !isBroken}
        {@const dx = to.x - from.x}
        {@const dy = to.y - from.y}
        {@const len = Math.sqrt(dx * dx + dy * dy)}
        {@const ux = dx / len}
        {@const uy = dy / len}
        {@const arrowX = from.x + dx * 0.65}
        {@const arrowY = from.y + dy * 0.65}
        <polygon
          points="{arrowX},{arrowY} {arrowX - ux * 6 + uy * 4},{arrowY - uy * 6 - ux * 4} {arrowX - ux * 6 - uy * 4},{arrowY - uy * 6 + ux * 4}"
          fill="#00f5ff80"
        />
      {/if}
    {/each}

    <!-- Animated particles -->
    {#each getParticlePositions() as particle}
      <circle
        cx={particle.x}
        cy={particle.y}
        r={3}
        fill={particle.color}
        opacity={particle.opacity}
        style="filter: drop-shadow(0 0 4px {particle.color});"
      />
    {/each}

    <!-- Nodes -->
    {#each FEEDBACK_NODES as node}
      {@const pos = getNodePos(node.id)}
      {@const isHovered = hoveredNode === node.id}
      {@const isBroken = brokenNode === node.id}

      <!-- Node circle -->
      <circle
        cx={pos.x}
        cy={pos.y}
        r={isHovered ? 22 : 18}
        fill={isBroken ? '#ff336630' : 'var(--bg-tertiary)'}
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

      <!-- Node label -->
      <text
        x={pos.x}
        y={pos.y + loopRadius * 0.22 * (pos.y < cy ? -1 : 1)}
        text-anchor="middle"
        dominant-baseline="middle"
        fill={isBroken ? '#ff3366' : 'var(--text-primary)'}
        font-size="9"
        font-family="var(--font-mono)"
        style="pointer-events: none;"
      >
        {node.label}
      </text>

      <!-- Tooltip on hover -->
      {#if isHovered}
        <foreignObject
          x={pos.x - 100}
          y={pos.y + (pos.y < cy ? -55 : 25)}
          width="200"
          height="40"
        >
          <div class="tooltip">
            {node.description}
          </div>
        </foreignObject>
      {/if}
    {/each}

    <!-- Speed indicator -->
    <text
      x={cx}
      y={height - 10}
      text-anchor="middle"
      fill="var(--text-dim)"
      font-size="9"
      font-family="var(--font-mono)"
    >
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
    color: var(--neon-green);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 2px;
  }

  .panel-subtitle {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .feedback-svg {
    flex: 1;
    width: 100%;
  }

  .tooltip {
    background: rgba(10, 10, 26, 0.95);
    border: 1px solid var(--neon-cyan, #00f5ff)60;
    border-radius: 4px;
    padding: 4px 8px;
    font-family: var(--font-mono, monospace);
    font-size: 9px;
    color: var(--text-primary, #e0e0ff);
    text-align: center;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/lib/components/FeedbackLoop.svelte
git commit -m "feat: add feedback loop animation with breakable nodes"
```

---

## Task 8: Profile Selector & Time Slider

**Files:**
- Create: `src/lib/components/ProfileSelector.svelte`
- Create: `src/lib/components/TimeSlider.svelte`

**Step 1: Create profile selector**

Create `src/lib/components/ProfileSelector.svelte`:
```svelte
<script lang="ts">
  import { profileStore, ORG_PROFILES } from '$lib/stores/organizationProfile';
  import { lockInState } from '$lib/stores/lockInState';
  import { simulation } from '$lib/stores/simulation';
  import type { OrgProfileId } from '$lib/types';

  const profiles = Object.values(ORG_PROFILES);

  function selectProfile(id: OrgProfileId) {
    profileStore.setProfile(id);
    simulation.reset();
  }
</script>

<div class="profile-selector">
  {#each profiles as profile}
    <button
      class="profile-btn"
      class:active={profileStore.activeId === profile.id}
      onclick={() => selectProfile(profile.id)}
    >
      <span class="profile-emoji">{profile.emoji}</span>
      <span class="profile-name">{profile.name}</span>
      <span class="profile-subtitle">{profile.subtitle}</span>
    </button>
  {/each}
</div>

<style>
  .profile-selector {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .profile-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--text-dim)40;
    border-radius: 6px;
    cursor: pointer;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    transition: all 0.3s ease;
  }

  .profile-btn:hover {
    border-color: var(--neon-cyan)60;
    color: var(--text-primary);
  }

  .profile-btn.active {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
    box-shadow: var(--glow-cyan);
    background: var(--bg-secondary);
  }

  .profile-emoji {
    font-size: 18px;
  }

  .profile-name {
    font-size: 11px;
    font-weight: 600;
  }

  .profile-subtitle {
    font-size: 9px;
    color: var(--text-dim);
  }
</style>
```

**Step 2: Create time slider**

Create `src/lib/components/TimeSlider.svelte`:
```svelte
<script lang="ts">
  import { simulation } from '$lib/stores/simulation';

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
    <input
      type="range"
      min="0"
      max="20"
      step="0.1"
      value={simulation.time}
      oninput={handleInput}
      class="slider"
    />
  </div>

  <div class="slider-group">
    <label class="slider-label">Speed: {simulation.speed.toFixed(1)}x</label>
    <input
      type="range"
      min="0.1"
      max="5"
      step="0.1"
      value={simulation.speed}
      oninput={handleSpeed}
      class="slider"
    />
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
    background: var(--bg-tertiary);
    border: 1px solid var(--neon-cyan)40;
    border-radius: 50%;
    color: var(--neon-cyan);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .control-btn:hover {
    border-color: var(--neon-cyan);
    box-shadow: var(--glow-cyan);
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .slider-label {
    font-size: 9px;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    outline: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: var(--neon-cyan);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 6px var(--neon-cyan);
  }
</style>
```

**Step 3: Commit**

```bash
git add src/lib/components/ProfileSelector.svelte src/lib/components/TimeSlider.svelte
git commit -m "feat: add profile selector and time/speed controls"
```

---

## Task 9: Main Layout Composition

**Files:**
- Modify: `src/routes/+page.svelte`

**Step 1: Compose all components in the main page**

Write `src/routes/+page.svelte`:
```svelte
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
  <!-- Header -->
  <header class="header">
    <h1 class="title">Lock-in Phase Space Explorer</h1>
    <p class="subtitle">Total lock-in cannot be reduced to zero &mdash; only transformed</p>
  </header>

  <!-- Main Grid -->
  <main class="grid">
    <!-- Top Left: 3D Phase Space -->
    <section class="panel phase-space">
      <PhaseSpace />
    </section>

    <!-- Top Right: Gauges -->
    <aside class="panel gauges">
      <LockInGauges />
    </aside>

    <!-- Bottom Left: Radar Chart -->
    <section class="panel radar">
      <RadarChart />
    </section>

    <!-- Bottom Right: Feedback Loop -->
    <section class="panel feedback">
      <FeedbackLoop />
    </section>
  </main>

  <!-- Footer Controls -->
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
    border: 1px solid #ffffff08;
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

  /* Tablet responsive */
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
      grid-template-rows: 350px auto 350px auto;
    }

    .gauges {
      grid-row: 2;
      grid-column: 1;
    }

    .radar {
      grid-row: 3;
      grid-column: 1;
    }

    .feedback {
      grid-row: 4;
      grid-column: 1;
    }

    .app {
      max-height: none;
      overflow: auto;
    }
  }
</style>
```

**Step 2: Verify in Chrome**

Open dev server and verify:
- Full layout renders with all 4 panels
- 3D scene animates
- Gauges update in real-time
- Radar chart is interactive (drag vertices)
- Feedback loop particles flow
- Profile selector switches configurations
- Time slider controls simulation
- Dark theme looks correct
- Responsive on tablet width

**Step 3: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: compose main layout with all visualization components"
```

---

## Task 10: Polish & Bug Fixes

**Files:**
- Various files as needed based on Chrome testing

**Step 1: Open in Chrome and systematically test all interactions**

Test checklist:
- [ ] Click each attractor in 3D view — particle animates toward it
- [ ] Drag radar chart vertices — conservation works
- [ ] Switch all 4 profiles — landscape morphs
- [ ] Hover feedback loop nodes — tooltips show
- [ ] Break feedback loop at each node — loop behavior changes
- [ ] Time slider — scrub works
- [ ] Speed slider — simulation speeds up/slows down
- [ ] Pause/play button works
- [ ] Trail renders behind particle
- [ ] No console errors

**Step 2: Fix any issues found**

Address bugs discovered during testing.

**Step 3: Final commit**

```bash
git add -A
git commit -m "fix: polish interactions and fix visual bugs"
```

---

## Task 11: SSR Compatibility

**Files:**
- Modify: `src/routes/+page.svelte` (wrap 3D in client-only)
- Possibly modify: `src/routes/+page.ts` (disable SSR)

**Step 1: Ensure client-only rendering for Three.js**

If SSR errors occur, create `src/routes/+page.ts`:
```typescript
export const ssr = false;
```

Or alternatively, wrap Three.js components with Svelte's `{#await}` or `onMount` guard.

**Step 2: Test production build**

```bash
cd /home/walter/workspace/tradeof-space && npm run build && npm run preview
```

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: ensure client-only rendering for 3D components"
```

---

## Execution Notes

- **Chrome verification** should happen at Tasks 4, 6, 7, 9, and 10
- **Dev server**: Run on port 5199 (`npm run dev -- --port 5199`) to avoid conflicts
- **If threlte errors on import**: Check that `@threlte/core` v8+ is installed, and that `ssr.noExternal` includes all three packages
- **If D3 causes SSR issues**: Wrap all D3 usage in `onMount()` callbacks
- **If `$state` runes cause issues**: Ensure `svelte.config.js` doesn't have legacy mode enabled
