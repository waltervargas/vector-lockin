import type { PhasePosition, AttractorConfig } from '$lib/types';

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

export function nearestAttractor(pos: PhasePosition, attractors: AttractorConfig[]): AttractorConfig | null {
  let nearest: AttractorConfig | null = null;
  let minDist = Infinity;
  for (const a of attractors) {
    const dx = pos.x - a.position.x;
    const dy = pos.y - a.position.y;
    const dz = pos.z - a.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < minDist) { minDist = dist; nearest = a; }
  }
  return nearest;
}
