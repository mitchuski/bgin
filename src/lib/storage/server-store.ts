/**
 * Server-side store for Phase 3 (no PostgreSQL). 08_DATA_MODELS.
 * Persists to .data/store.json. Replace with PostgreSQL when ready.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const STORE_PATH = join(DATA_DIR, 'store.json');

export interface ParticipantRow {
  participantId: string;
  /** Optional display name for this Swordsman (BGIN ID). */
  displayName?: string;
  publicKeyHex: string;
  trustTier: 'blade' | 'light' | 'heavy' | 'dragon';
  workingGroups: string[];
  attributionLevel: 'full' | 'role_only' | 'anonymous';
  maxQueriesPerSession?: number; // default 16
  registeredAt: string;
  lastActiveAt?: string;
}

export interface AgreementRecordRow {
  id: string;
  participantId: string;
  agreementId: string;
  agreementVersion: string;
  status: 'active' | 'expired' | 'revoked' | 'disputed';
  signedAt: string;
  participantSignature: string;
  platformSignature: string;
  agreementHash: string;
  regionalFramework?: string;
}

export interface SessionRow {
  id: string;
  participantId: string;
  workingGroup: string;
  queriesUsed: number;
  maxQueries: number;
  createdAt: string;
  expiresAt: string;
}

export type PromiseType =
  | 'author'
  | 'review'
  | 'attend'
  | 'present'
  | 'research'
  | 'coordinate'
  | 'custom';
export type PromiseStatus = 'active' | 'in_progress' | 'completed' | 'withdrawn';

export interface PromiseRow {
  id: string;
  participantId: string;
  workingGroup: string;
  type: PromiseType;
  description: string;
  relatedTopics: string[];
  status: PromiseStatus;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  selfAssessmentNote?: string;
  signature: string;
  peerAssessments: Array<{ assessorId: string; assessment: 'verified' | 'partial' | 'not_verified'; timestamp: string }>;
  /** Optional proverb connecting proof of understanding to this promise (RPP). */
  connectedProverb?: string;
}

// Block14 Spellbook - aggregated Mage contributions per session
export interface SpellbookEntryRow {
  id: string;
  sessionId: string; // Block14 session (e.g., 'agentic-ai-morning', 'ikp-afternoon')
  sessionTitle: string;
  workingGroup: string;
  participantId: string;
  participantTier: 'blade' | 'light' | 'heavy' | 'dragon';
  mageQuery: string;
  mageResponse: string;
  sources: Array<{ documentTitle: string; documentDate: string; relevanceScore?: number }>;
  crossWgRefs: Array<{ workingGroup: string; topic: string; hint?: string }>;
  addedAt: string;
  attributionLevel: 'full' | 'role_only' | 'anonymous';
}

/** RPP / Relationship Proverb Protocol — proverbs link to Mage responses or casts; feed informs promise/trust graph. */
export type ProverbSourceType = 'mage_response' | 'cast_inscription' | 'cast_agreement';

export interface ProverbRow {
  id: string;
  participantId: string;
  workingGroup: string;
  content: string;
  sourceType: ProverbSourceType;
  /** Spellbook entry id when sourceType is cast_inscription or cast_agreement; optional for mage_response. */
  castEntryId?: string;
  createdAt: string;
}

interface Store {
  participants: ParticipantRow[];
  agreementRecords: AgreementRecordRow[];
  sessions: SessionRow[];
  promises: PromiseRow[];
  spellbookEntries: SpellbookEntryRow[];
  proverbs: ProverbRow[];
}

const emptyStore: Store = {
  participants: [],
  agreementRecords: [],
  sessions: [],
  promises: [],
  spellbookEntries: [],
  proverbs: [],
};

async function load(): Promise<Store> {
  try {
    const raw = await readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      participants: parsed.participants ?? emptyStore.participants,
      agreementRecords: parsed.agreementRecords ?? emptyStore.agreementRecords,
      sessions: parsed.sessions ?? emptyStore.sessions,
      promises: parsed.promises ?? emptyStore.promises,
      spellbookEntries: parsed.spellbookEntries ?? emptyStore.spellbookEntries,
      proverbs: parsed.proverbs ?? emptyStore.proverbs,
    };
  } catch {
    return { ...emptyStore };
  }
}

async function save(store: Store): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export async function getParticipant(participantId: string): Promise<ParticipantRow | null> {
  const store = await load();
  return store.participants.find((p) => p.participantId === participantId) ?? null;
}

export async function upsertParticipant(row: ParticipantRow): Promise<void> {
  const store = await load();
  const idx = store.participants.findIndex((p) => p.participantId === row.participantId);
  if (idx >= 0) store.participants[idx] = row;
  else store.participants.push(row);
  await save(store);
}

export async function getActiveAgreement(
  participantId: string,
  agreementId: string
): Promise<AgreementRecordRow | null> {
  const store = await load();
  return (
    store.agreementRecords.find(
      (a) => a.participantId === participantId && a.agreementId === agreementId && a.status === 'active'
    ) ?? null
  );
}

export async function addAgreementRecord(row: AgreementRecordRow): Promise<void> {
  const store = await load();
  store.agreementRecords.push(row);
  await save(store);
}

export async function getSession(
  participantId: string,
  workingGroup: string
): Promise<SessionRow | null> {
  const store = await load();
  const now = new Date().toISOString();
  return (
    store.sessions.find(
      (s) =>
        s.participantId === participantId &&
        s.workingGroup === workingGroup &&
        s.expiresAt > now
    ) ?? null
  );
}

export async function getSessionsForParticipant(participantId: string): Promise<SessionRow[]> {
  const store = await load();
  const now = new Date().toISOString();
  return store.sessions.filter(
    (s) => s.participantId === participantId && s.expiresAt > now
  );
}

export async function upsertSession(row: SessionRow): Promise<void> {
  const store = await load();
  const idx = store.sessions.findIndex(
    (s) => s.participantId === row.participantId && s.workingGroup === row.workingGroup
  );
  if (idx >= 0) store.sessions[idx] = row;
  else store.sessions.push(row);
  await save(store);
}

export async function incrementSessionQueries(
  participantId: string,
  workingGroup: string
): Promise<{ queriesUsed: number; maxQueries: number } | null> {
  const session = await getSession(participantId, workingGroup);
  if (!session) return null;
  session.queriesUsed += 1;
  await upsertSession(session);
  return { queriesUsed: session.queriesUsed, maxQueries: session.maxQueries };
}

export async function listPromises(
  workingGroup: string,
  status?: PromiseStatus
): Promise<PromiseRow[]> {
  const store = await load();
  return store.promises.filter(
    (p) => p.workingGroup === workingGroup && (status == null || p.status === status)
  );
}

export async function getPromise(id: string): Promise<PromiseRow | null> {
  const store = await load();
  return store.promises.find((p) => p.id === id) ?? null;
}

export async function addPromise(row: PromiseRow): Promise<void> {
  const store = await load();
  store.promises.push(row);
  await save(store);
}

export async function updatePromise(
  id: string,
  updates: Partial<Pick<PromiseRow, 'status' | 'completedAt' | 'selfAssessmentNote'>>
): Promise<PromiseRow | null> {
  const store = await load();
  const idx = store.promises.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  Object.assign(store.promises[idx], updates);
  await save(store);
  return store.promises[idx];
}

export async function addPeerAssessment(
  promiseId: string,
  assessorId: string,
  assessment: 'verified' | 'partial' | 'not_verified'
): Promise<PromiseRow | null> {
  const store = await load();
  const idx = store.promises.findIndex((p) => p.id === promiseId);
  if (idx < 0) return null;
  const row = store.promises[idx];
  if (!row.peerAssessments) row.peerAssessments = [];
  row.peerAssessments.push({
    assessorId,
    assessment,
    timestamp: new Date().toISOString(),
  });
  await save(store);
  return row;
}

const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Get existing valid session or create one. Used by Mage chat to enforce privacy budget.
 */
export async function getOrCreateSession(
  participantId: string,
  workingGroup: string,
  maxQueries: number
): Promise<SessionRow> {
  let session = await getSession(participantId, workingGroup);
  if (session) return session;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();
  session = {
    id: crypto.randomUUID(),
    participantId,
    workingGroup,
    queriesUsed: 0,
    maxQueries,
    createdAt: now.toISOString(),
    expiresAt,
  };
  await upsertSession(session);
  return session;
}

// Block14 Spellbook functions
export async function listSpellbookEntries(
  sessionId?: string,
  workingGroup?: string,
  participantId?: string
): Promise<SpellbookEntryRow[]> {
  const store = await load();
  let list = store.spellbookEntries;
  if (sessionId) list = list.filter((e) => e.sessionId === sessionId);
  if (workingGroup) list = list.filter((e) => e.workingGroup === workingGroup);
  if (participantId) list = list.filter((e) => e.participantId === participantId);
  return list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
}

export async function listSpellbookSessions(): Promise<
  Array<{ sessionId: string; sessionTitle: string; entryCount: number }>
> {
  const store = await load();
  const sessionMap = new Map<string, { title: string; count: number }>();
  for (const entry of store.spellbookEntries) {
    const existing = sessionMap.get(entry.sessionId);
    if (existing) {
      existing.count++;
    } else {
      sessionMap.set(entry.sessionId, { title: entry.sessionTitle, count: 1 });
    }
  }
  return Array.from(sessionMap.entries()).map(([sessionId, data]) => ({
    sessionId,
    sessionTitle: data.title,
    entryCount: data.count,
  }));
}

export async function addSpellbookEntry(entry: SpellbookEntryRow): Promise<void> {
  const store = await load();
  store.spellbookEntries.push(entry);
  await save(store);
}

export async function getSpellbookEntry(id: string): Promise<SpellbookEntryRow | null> {
  const store = await load();
  return store.spellbookEntries.find((e) => e.id === id) ?? null;
}

// Proverbs (RPP — Relationship Proverb Protocol)
export async function listProverbs(options?: {
  workingGroup?: string;
  castEntryId?: string;
  sourceType?: ProverbSourceType;
  participantId?: string;
  limit?: number;
  offset?: number;
}): Promise<ProverbRow[]> {
  const store = await load();
  let list = [...store.proverbs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (options?.workingGroup) list = list.filter((p) => p.workingGroup === options.workingGroup);
  if (options?.castEntryId) list = list.filter((p) => p.castEntryId === options.castEntryId);
  if (options?.sourceType) list = list.filter((p) => p.sourceType === options.sourceType);
  if (options?.participantId) list = list.filter((p) => p.participantId === options.participantId);
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 50;
  return list.slice(offset, offset + limit);
}

export async function addProverb(row: ProverbRow): Promise<void> {
  const store = await load();
  store.proverbs.push(row);
  await save(store);
}
