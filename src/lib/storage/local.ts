/**
 * Client-side IndexedDB via Dexie. 08_DATA_MODELS, 02_KEY_CEREMONY.
 * Keys stored as JWK strings (browser-only; never sent).
 */

import Dexie, { type Table } from 'dexie';
import type { AgentCard } from '@/lib/ceremony/agentCard';
import type { PrivacyPreferences } from '@/lib/ceremony/privacy';

export interface StoredSwordsmanKeys {
  id: string;
  publicKeyJwk: string;
  privateKeyJwk: string;
  publicKeyHex: string;
  participantId: string;
  createdAt: string;
}

export interface StoredPrivacyPreferences extends PrivacyPreferences {
  id: string;
}

export interface EpisodicMemoryRow {
  id: string;
  participantId: string;
  workingGroup: string;
  timestamp: string;
  type: 'query' | 'topic_explored' | 'document_cited' | 'cross_wg_reference';
  content: string;
}

export interface LocalPromiseDraft {
  id: string;
  workingGroup: string;
  type: string;
  description: string;
  relatedTopics: string[];
  savedAt: string;
}

export interface SessionStateRow {
  id: string;
  workingGroup: string;
  sessionId: string;
  conversationHistory: Array<{ role: string; content: string; timestamp: string }>;
  queriesUsed: number;
  createdAt: string;
}

export interface AgreementChronicleRow {
  id: string;
  agreementId: string;
  version: string;
  counterparty: string;
  signedAt: string;
  status: 'active' | 'expired' | 'revoked' | 'disputed';
  participantSignature: string;
  platformSignature: string;
  agreementHash: string;
}

class BGINLocalDB extends Dexie {
  swordsmanKeys!: Table<StoredSwordsmanKeys, string>;
  agentCard!: Table<AgentCard, string>;
  privacyPreferences!: Table<StoredPrivacyPreferences, string>;
  episodicMemory!: Table<EpisodicMemoryRow, string>;
  localPromiseDrafts!: Table<LocalPromiseDraft, string>;
  sessionState!: Table<SessionStateRow, string>;
  agreementChronicle!: Table<AgreementChronicleRow, string>;

  constructor() {
    super('bgin-ai');
    this.version(1).stores({
      swordsmanKeys: 'id, participantId',
      agentCard: 'participantId',
      privacyPreferences: 'id',
      episodicMemory: 'id, participantId, workingGroup, timestamp',
      localPromiseDrafts: 'id, workingGroup',
      sessionState: 'id, workingGroup',
      agreementChronicle: 'id, agreementId, status',
    });
  }
}

// Only create DB in the browser; Dexie/IndexedDB are undefined in Node and cause 500s during SSR.
export const localDB: BGINLocalDB | null =
  typeof window !== 'undefined' ? new BGINLocalDB() : null;
