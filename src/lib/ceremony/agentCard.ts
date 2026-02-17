/**
 * Agent card generation — combine keys, privacy, WG selection; self-signed. 02_KEY_CEREMONY Step 6.
 */

import { signData } from './signData';
import type { SwordsmanKeys } from './keygen';
import type { PrivacyPreferences } from './privacy';

export interface AgentCard {
  version: '1.0';
  type: 'swordsman';
  participantId: string;
  /** Optional display name for this Swordsman (BGIN ID). */
  displayName?: string;
  publicKeyHex: string;
  createdAt: string;
  privacy: PrivacyPreferences;
  workingGroups: string[];
  trustTier: 'blade';
  signature: string;
}

export async function createAgentCard(
  keys: SwordsmanKeys,
  privacy: PrivacyPreferences,
  workingGroups: string[],
  displayName?: string
): Promise<AgentCard> {
  const card: Omit<AgentCard, 'signature'> = {
    version: '1.0',
    type: 'swordsman',
    participantId: keys.participantId,
    ...(displayName?.trim() ? { displayName: displayName.trim() } : {}),
    publicKeyHex: keys.publicKeyHex,
    createdAt: keys.createdAt,
    privacy,
    workingGroups,
    trustTier: 'blade',
  };

  const cardJson = JSON.stringify(card);
  const signature = await signData(keys.privateKey, cardJson);

  return { ...card, signature };
}
