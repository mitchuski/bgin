/**
 * Episodic memory — client-side (IndexedDB). 00 Phase 4.3, 03_MAGE_AGENTS.
 * Server does not store episodic memory; client sends episodicContext in chat request.
 */

import { localDB } from '@/lib/storage/local';

export interface EpisodicMemoryEvent {
  participantId: string;
  workingGroup: string;
  timestamp: string;
  type: 'query' | 'topic_explored' | 'document_cited' | 'cross_wg_reference';
  content: string;
}

export async function updateEpisodicMemory(
  participantId: string,
  workingGroup: string,
  event: {
    query?: string;
    topicsExplored?: string[];
    timestamp: string;
  }
): Promise<void> {
  const rows: Array<EpisodicMemoryEvent & { id: string }> = [];
  if (event.query) {
    rows.push({
      id: crypto.randomUUID(),
      participantId,
      workingGroup,
      timestamp: event.timestamp,
      type: 'query',
      content: event.query,
    });
  }
  if (event.topicsExplored?.length) {
    for (const topic of event.topicsExplored) {
      rows.push({
        id: crypto.randomUUID(),
        participantId,
        workingGroup,
        timestamp: event.timestamp,
        type: 'topic_explored',
        content: topic,
      });
    }
  }
  if (!localDB) return;
  for (const row of rows) {
    await localDB.episodicMemory.add(row);
  }
}

/**
 * Retrieve recent episodic context for this WG to send in chat request.
 */
export async function getEpisodicContextForPrompt(
  workingGroup: string,
  limit = 10
): Promise<Array<{ topic?: string; summary?: string }>> {
  if (!localDB) return [];
  const participantId = (await localDB.agentCard.toCollection().first())?.participantId;
  if (!participantId) return [];

  const all = await localDB.episodicMemory
    .where('workingGroup')
    .equals(workingGroup)
    .toArray();
  const forParticipant = all
    .filter((m) => m.participantId === participantId)
    .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
    .slice(0, limit);

  const recent = forParticipant;
  return recent.map((m) =>
    m.type === 'topic_explored'
      ? { topic: m.content, summary: m.content }
      : { summary: m.content }
  );
}
