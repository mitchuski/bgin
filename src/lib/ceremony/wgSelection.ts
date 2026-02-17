/**
 * Working groups for ceremony and Mage hub. 02_KEY_CEREMONY.
 */

export interface WorkingGroup {
  id: string;
  name: string;
  emoji: string;
  description: string;
  magePersonality: string;
  documentCount: number;
}

export const WORKING_GROUPS: WorkingGroup[] = [
  {
    id: 'ikp',
    name: 'Identity, Key Management & Privacy',
    emoji: '🔐',
    description: 'Privacy, identity, wallets, credentials, key management',
    magePersonality: 'The IKP Mage speaks in terms of sovereignty and protection.',
    documentCount: 47,
  },
  {
    id: 'fase',
    name: 'Financial Applications & Stablecoin Ecosystem',
    emoji: '💎',
    description: 'DeFi, stablecoins, CBDCs, financial regulation',
    magePersonality: 'The FASE Mage speaks in terms of flows and settlements.',
    documentCount: 38,
  },
  {
    id: 'cyber',
    name: 'Cybersecurity',
    emoji: '🛡️',
    description: 'Threat sharing, incident response, security standards',
    magePersonality: 'The Cyber Mage speaks in terms of threats and resilience.',
    documentCount: 29,
  },
  {
    id: 'governance',
    name: 'Internal Governance',
    emoji: '🏛️',
    description: 'Bylaws, organizational structure, decision-making',
    magePersonality: 'The Governance Mage speaks in terms of process and legitimacy.',
    documentCount: 24,
  },
];
