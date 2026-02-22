import type { OrgProfile, OrgProfileId } from '$lib/types';

export const ORG_PROFILES: Record<OrgProfileId, OrgProfile> = {
  startup: {
    id: 'startup',
    emoji: '\u{1F355}',
    name: 'Pizza Delivery Startup',
    subtitle: '50 people',
    headcount: '50',
    initialState: {
      vendor: 0.7, people: 0.3, version: 0.2, complexity: 0.2, cognitive: 0.3, ecosystem: 0.6,
    },
    attractors: [
      { id: 'serverless', label: 'Serverless-First', position: { x: 0.8, y: 0.2, z: 0.3 }, strength: 0.8, sigma: 0.3, color: '#00ff88', description: 'Lambda/Cloud Functions \u2014 minimal ops, maximum vendor coupling' },
      { id: 'aws-native', label: 'AWS-Native', position: { x: 0.9, y: 0.3, z: 0.4 }, strength: 0.6, sigma: 0.25, color: '#ff8800', description: 'Full AWS stack \u2014 fast to build, hard to leave' },
      { id: 'k8s-centric', label: 'K8s-Centric', position: { x: 0.3, y: 0.8, z: 0.8 }, strength: 0.3, sigma: 0.2, color: '#00f5ff', description: 'Kubernetes everything \u2014 powerful but needs specialists' },
      { id: 'multi-cloud', label: 'Multi-Cloud Abstraction', position: { x: 0.2, y: 0.5, z: 0.9 }, strength: 0.2, sigma: 0.2, color: '#ff00ff', description: 'Terraform + abstraction layers \u2014 vendor-free but complexity-heavy' },
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
      vendor: 0.4, people: 0.6, version: 0.5, complexity: 0.6, cognitive: 0.7, ecosystem: 0.5,
    },
    attractors: [
      { id: 'multi-cloud', label: 'Multi-Cloud Abstraction', position: { x: 0.2, y: 0.5, z: 0.7 }, strength: 0.8, sigma: 0.3, color: '#ff00ff', description: 'Regulatory pressure pushes toward vendor independence' },
      { id: 'k8s-centric', label: 'K8s-Centric', position: { x: 0.3, y: 0.7, z: 0.6 }, strength: 0.7, sigma: 0.25, color: '#00f5ff', description: 'Platform teams can absorb K8s complexity at scale' },
      { id: 'aws-native', label: 'AWS-Native', position: { x: 0.8, y: 0.4, z: 0.5 }, strength: 0.3, sigma: 0.2, color: '#ff8800', description: 'Convenient but regulatory risk' },
      { id: 'serverless', label: 'Serverless-First', position: { x: 0.7, y: 0.3, z: 0.4 }, strength: 0.2, sigma: 0.2, color: '#00ff88', description: 'Too much vendor coupling for compliance' },
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
      vendor: 0.5, people: 0.7, version: 0.8, complexity: 0.7, cognitive: 0.8, ecosystem: 0.6,
    },
    attractors: [
      { id: 'k8s-centric', label: 'K8s-Centric', position: { x: 0.4, y: 0.8, z: 0.7 }, strength: 0.7, sigma: 0.3, color: '#00f5ff', description: 'Standardization through K8s \u2014 long-lived systems need stability' },
      { id: 'multi-cloud', label: 'Multi-Cloud Abstraction', position: { x: 0.3, y: 0.6, z: 0.85 }, strength: 0.6, sigma: 0.25, color: '#ff00ff', description: 'Compliance and sovereignty drive multi-cloud' },
      { id: 'aws-native', label: 'AWS-Native', position: { x: 0.7, y: 0.5, z: 0.5 }, strength: 0.4, sigma: 0.2, color: '#ff8800', description: 'Legacy workloads already deep in AWS' },
      { id: 'serverless', label: 'Serverless-First', position: { x: 0.6, y: 0.3, z: 0.4 }, strength: 0.15, sigma: 0.15, color: '#00ff88', description: 'Edge cases only' },
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
      vendor: 0.6, people: 0.4, version: 0.3, complexity: 0.4, cognitive: 0.4, ecosystem: 0.7,
    },
    attractors: [
      { id: 'aws-native', label: 'AWS-Native', position: { x: 0.85, y: 0.35, z: 0.5 }, strength: 0.8, sigma: 0.3, color: '#ff8800', description: 'Speed wins \u2014 trade lock-in for velocity' },
      { id: 'serverless', label: 'Serverless-First', position: { x: 0.75, y: 0.25, z: 0.35 }, strength: 0.7, sigma: 0.25, color: '#00ff88', description: 'No ops team needed \u2014 pure developer velocity' },
      { id: 'k8s-centric', label: 'K8s-Centric', position: { x: 0.4, y: 0.7, z: 0.7 }, strength: 0.4, sigma: 0.25, color: '#00f5ff', description: 'Growing into platform engineering as team scales' },
      { id: 'multi-cloud', label: 'Multi-Cloud Abstraction', position: { x: 0.2, y: 0.5, z: 0.85 }, strength: 0.15, sigma: 0.15, color: '#ff00ff', description: 'Premature optimization \u2014 not worth complexity tax yet' },
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
