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
  feedbackAlpha: number;
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
