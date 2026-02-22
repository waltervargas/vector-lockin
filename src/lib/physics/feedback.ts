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

export function loopSpeed(baseSpeed: number, alpha: number, time: number): number {
  return baseSpeed * (1 + alpha * time);
}

export function breakLoop(nodeId: string): { brokenEdges: string[]; destabilizationFactor: number } {
  const incomingEdge = FEEDBACK_EDGES.find(e => e.target === nodeId);
  const outgoingEdge = FEEDBACK_EDGES.find(e => e.source === nodeId);
  const brokenEdges: string[] = [];
  if (incomingEdge) brokenEdges.push(`${incomingEdge.source}-${incomingEdge.target}`);
  if (outgoingEdge) brokenEdges.push(`${outgoingEdge.source}-${outgoingEdge.target}`);
  const nodeIndex = FEEDBACK_NODES.findIndex(n => n.id === nodeId);
  const destabilizationFactor = 1 - (nodeIndex / FEEDBACK_NODES.length) * 0.5;
  return { brokenEdges, destabilizationFactor };
}
