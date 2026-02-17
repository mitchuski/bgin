/**
 * Block 14 timetable — March 1–2, 2026 Tokyo.
 * One entry per session for "Cast to session". Each session maps to a working group for spellbook-by-WG views.
 */

export type Block14WorkingGroup = 'ikp' | 'fase' | 'cyber' | 'governance';

export interface Block14Session {
  id: string;
  title: string;
  day: 'March 1' | 'March 2';
  room: string;
  workingGroup: Block14WorkingGroup;
}

/** All Block 14 sessions from the timetable. Use for "Cast to session" and for spellbook-by-session views. */
export const BLOCK14_TIMETABLE: Block14Session[] = [
  // Day 1 — March 1, 2026
  { id: 'opening-plenary', title: 'Opening Plenary', day: 'March 1', room: 'Room A', workingGroup: 'governance' },
  { id: 'security-cyber-info-1', title: 'Security: Cyber Security Information Sharing (1)', day: 'March 1', room: 'Room A', workingGroup: 'cyber' },
  { id: 'security-cyber-info-2', title: 'Security: Cyber Security Information Sharing (2)', day: 'March 1', room: 'Room A', workingGroup: 'cyber' },
  { id: 'ikp-accountable-wallet', title: 'IKP: Accountable Wallet', day: 'March 1', room: 'Room A', workingGroup: 'ikp' },
  { id: 'ikp-fase-forensics', title: 'IKP + FASE: Forensics and Analysis, Toward a Common Lexicon for Harmful On-Chain Activities', day: 'March 1', room: 'Room A', workingGroup: 'ikp' },
  { id: 'agentwg-fase-ai-blockchain', title: 'AgentWG + FASE: AI + Blockchain', day: 'March 1', room: 'Room B', workingGroup: 'fase' },
  { id: 'fase-harmonization', title: 'FASE: Harmonization among Crypto-asset, stablecoin and tokenized deposit', day: 'March 1', room: 'Room B', workingGroup: 'fase' },
  { id: 'fase-technical-metrics', title: "FASE: Establishing Technical Metrics to Evaluate the 'Decentralization' of Blockchain Networks", day: 'March 1', room: 'Room B', workingGroup: 'fase' },
  { id: 'agent-hack-day1', title: 'Agent Hack', day: 'March 1', room: 'Open Space', workingGroup: 'governance' },
  { id: 'networking-reception', title: 'Networking Reception', day: 'March 1', room: 'Room B', workingGroup: 'governance' },
  // Day 2 — March 2, 2026
  { id: 'announcement-competition', title: 'Announcement of Blockchain Technology Competition', day: 'March 2', room: 'Room A', workingGroup: 'governance' },
  { id: 'security-target-profile', title: 'Security: Security Target and Protection Profile', day: 'March 2', room: 'Room A', workingGroup: 'cyber' },
  { id: 'security-supply-chain', title: 'Security: Governance of security supply chain', day: 'March 2', room: 'Room A', workingGroup: 'cyber' },
  { id: 'security-offline-key', title: 'Security: Offline Key Management', day: 'March 2', room: 'Room A', workingGroup: 'cyber' },
  { id: 'audit-securities-law', title: 'Audit: securities law and regulation — assurances / risk management', day: 'March 2', room: 'Room A', workingGroup: 'governance' },
  { id: 'ikp-crypto-agility', title: 'IKP: Crypto Agility and PQC Migration', day: 'March 2', room: 'Room B', workingGroup: 'ikp' },
  { id: 'ikp-privacy-auth', title: 'IKP: Privacy Enhanced Authentication and Key Management (competition)', day: 'March 2', room: 'Room B', workingGroup: 'ikp' },
  { id: 'ikp-proof-of-personhood', title: 'IKP: Proof of Personhood', day: 'March 2', room: 'Room B', workingGroup: 'ikp' },
  { id: 'fase-stablecoin-guide', title: 'FASE: Practical Stablecoin Implementation Guide', day: 'March 2', room: 'Room B', workingGroup: 'fase' },
  { id: 'agent-hack-day2', title: 'Agent Hack', day: 'March 2', room: 'Open Space', workingGroup: 'governance' },
];

export const BLOCK14_WORKING_GROUPS: { id: Block14WorkingGroup; label: string; emoji: string }[] = [
  { id: 'ikp', label: 'IKP', emoji: '🔐' },
  { id: 'fase', label: 'FASE', emoji: '💎' },
  { id: 'cyber', label: 'Security (Cyber)', emoji: '🛡️' },
  { id: 'governance', label: 'Governance', emoji: '🏛️' },
];

export function getSessionsByDay(day: 'March 1' | 'March 2') {
  return BLOCK14_TIMETABLE.filter((s) => s.day === day);
}

export function getSessionsByWorkingGroup(wg: Block14WorkingGroup) {
  return BLOCK14_TIMETABLE.filter((s) => s.workingGroup === wg);
}
