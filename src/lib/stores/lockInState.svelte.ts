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
