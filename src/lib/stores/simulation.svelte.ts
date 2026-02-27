import { lockInState } from './lockInState.svelte';
import { profileStore } from './organizationProfile.svelte';
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
        if (dist < 0.02) targetAttractor = null;
        const pullStrength = 2.0;
        force = { x: dx * pullStrength, y: dy * pullStrength, z: dz * pullStrength };
      } else {
        force = computeGradient(pos, attractors);
      }
    } else {
      force = computeGradient(pos, attractors);
    }

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

  function navigateToAttractor(id: string) { targetAttractor = id; }
  function reset() {
    time = 0;
    targetAttractor = null;
    lockInState.setVector(profileStore.profile.initialState);
    lockInState.clearTrail();
  }
  function toggleRunning() { running = !running; }
  function setSpeed(s: number) { speed = s; }
  function setTime(t: number) { time = t; }

  return {
    get running() { return running; },
    get time() { return time; },
    get speed() { return speed; },
    get feedbackSpeed() { return feedbackSpeed; },
    get targetAttractor() { return targetAttractor; },
    tick, navigateToAttractor, reset, toggleRunning, setSpeed, setTime, computeGradient,
  };
}

export const simulation = createSimulation();
