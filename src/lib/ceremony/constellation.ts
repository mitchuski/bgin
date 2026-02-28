/**
 * Ceremony constellation: step definitions for the BGIN ceremony.
 * Adapted from agentprivacy_master pattern with BGIN-specific steps.
 */

export interface CeremonyStepDef {
  id: string;
  title: string;
  description: string;
  emojiOptions: string[];
  requiredForComplete: boolean;
}

export interface CeremonyStepEntry {
  stepId: string;
  chosenEmoji: string;
  inscription: string;
  completedAt: string; // ISO
}

export interface CeremonyConstellation {
  steps: CeremonyStepEntry[];
  constellationPath: string; // e.g. "🗡️→🔐→🔒→📜→🏛️→⚔️→💾→✨"
}

export const CEREMONY_STEPS: CeremonyStepDef[] = [
  {
    id: 'naming',
    title: 'Name Your Swordsman',
    description: 'Choose a display name for your BGIN identity',
    emojiOptions: ['🗡️', '⚔️', '🛡️', '🏹', '🗿', '🌟'],
    requiredForComplete: true,
  },
  {
    id: 'keygen',
    title: 'Forge Your Key',
    description: 'Ed25519 keypair generated in your browser',
    emojiOptions: ['🔐', '🔑', '🗝️', '💎', '⚡', '🔮'],
    requiredForComplete: true,
  },
  {
    id: 'privacy',
    title: 'Set Your Boundaries',
    description: 'Define your privacy preferences and attribution level',
    emojiOptions: ['🔒', '🙈', '👁️', '🎭', '🌑', '🕶️'],
    requiredForComplete: true,
  },
  {
    id: 'myterms',
    title: 'Accept Terms',
    description: 'Review and accept bilateral terms (SD-BASE)',
    emojiOptions: ['📜', '📝', '✍️', '🤝', '⚖️', '📋'],
    requiredForComplete: true,
  },
  {
    id: 'workinggroups',
    title: 'Choose Your Mages',
    description: 'Select which BGIN working groups to connect with',
    emojiOptions: ['🏛️', '🧙', '🔮', '📚', '🌐', '⭐'],
    requiredForComplete: true,
  },
  {
    id: 'seal',
    title: 'Create Agent Card',
    description: 'Sign and seal your Swordsman identity',
    emojiOptions: ['⚔️', '🖋️', '💫', '🔥', '🌟', '👤'],
    requiredForComplete: true,
  },
  {
    id: 'backup',
    title: 'Backup Your Keys',
    description: 'Download an encrypted backup of your keys',
    emojiOptions: ['💾', '📦', '🔐', '☁️', '🗄️', '🛡️'],
    requiredForComplete: false,
  },
  {
    id: 'activation',
    title: 'Activation',
    description: 'Your Swordsman enters the BGIN constellation',
    emojiOptions: ['✨', '🌅', '🎆', '💥', '🌟', '🚀'],
    requiredForComplete: true,
  },
];

/** Build constellation path string from step entries (emoji order by step definition). */
export function buildConstellationPath(steps: CeremonyStepEntry[]): string {
  const byId = new Map(steps.map((s) => [s.stepId, s.chosenEmoji]));
  const order = CEREMONY_STEPS.map((d) => d.id);
  return order.map((id) => byId.get(id) || '○').join('→');
}

/** Save constellation to localStorage */
export function saveCeremonyConstellation(constellation: CeremonyConstellation): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bgin-ceremony-constellation', JSON.stringify(constellation));
}

/** Load constellation from localStorage */
export function getCeremonyConstellation(): CeremonyConstellation | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('bgin-ceremony-constellation');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CeremonyConstellation;
  } catch {
    return null;
  }
}
