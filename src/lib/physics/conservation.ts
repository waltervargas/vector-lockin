import { DIMENSIONS, type LockInVector, type LockInDimension } from '$lib/types';

export function conserve(current: LockInVector, changedDim: LockInDimension, newValue: number): LockInVector {
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

export function totalEnergy(v: LockInVector): number {
  return DIMENSIONS.reduce((sum, d) => sum + v[d], 0);
}
