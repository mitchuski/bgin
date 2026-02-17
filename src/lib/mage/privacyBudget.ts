/**
 * Privacy budget — server-side session and query count. 03_MAGE_AGENTS, 07_API_SPEC.
 * Uses server-store sessions; maxQueries from participant row.
 */

import {
  getParticipant,
  getOrCreateSession,
  incrementSessionQueries,
  getSession,
} from '@/lib/storage/server-store';

const DEFAULT_MAX_QUERIES = 16;

export async function checkPrivacyBudget(
  participantId: string,
  workingGroup: string
): Promise<boolean> {
  const participant = await getParticipant(participantId);
  const maxQueries = participant?.maxQueriesPerSession ?? DEFAULT_MAX_QUERIES;
  const session = await getOrCreateSession(participantId, workingGroup, maxQueries);
  return session.queriesUsed < session.maxQueries;
}

export async function decrementPrivacyBudget(
  participantId: string,
  workingGroup: string
): Promise<number> {
  const result = await incrementSessionQueries(participantId, workingGroup);
  if (!result) return 0;
  return Math.max(0, result.maxQueries - result.queriesUsed);
}

export async function getPrivacyBudget(
  participantId: string,
  workingGroup: string
): Promise<number> {
  const session = await getSession(participantId, workingGroup);
  if (!session) return DEFAULT_MAX_QUERIES;
  return Math.max(0, session.maxQueries - session.queriesUsed);
}
