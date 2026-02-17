/**
 * Build knowledge map from local episodic memory only. 04_PERSONAL_CURATION.
 * No server call — all from IndexedDB.
 */

import { localDB } from '@/lib/storage/local';

export interface KnowledgeNode {
  id: string;
  topic: string;
  workingGroup: string;
  depth: number;
  firstExplored: string;
  lastExplored: string;
  relatedNodes: string[];
}

export interface KnowledgeMap {
  nodes: KnowledgeNode[];
  edges: Array<{ source: string; target: string; strength: number }>;
}

const CO_OCCURRENCE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function buildLocalKnowledgeMap(): Promise<KnowledgeMap> {
  const card = await localDB.agentCard.toCollection().first();
  const participantId = card?.participantId;
  if (!participantId) return { nodes: [], edges: [] };

  const memories = await localDB.episodicMemory
    .where('participantId')
    .equals(participantId)
    .toArray();

  const topicCounts = new Map<string, number>();
  const topicWgs = new Map<string, string>();
  const topicTimestamps = new Map<string, { first: string; last: string }>();
  const topicByTime: Array<{ topic: string; timestamp: string }> = [];

  for (const m of memories) {
    if (m.type !== 'topic_explored') continue;
    const topic = m.content;
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    topicWgs.set(topic, m.workingGroup);
    const ts = topicTimestamps.get(topic);
    if (!ts) {
      topicTimestamps.set(topic, { first: m.timestamp, last: m.timestamp });
    } else {
      if (m.timestamp < ts.first) ts.first = m.timestamp;
      if (m.timestamp > ts.last) ts.last = m.timestamp;
    }
    topicByTime.push({ topic, timestamp: m.timestamp });
  }

  topicByTime.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const topicConnections = new Map<string, Set<string>>();
  for (let i = 0; i < topicByTime.length; i++) {
    const t0 = new Date(topicByTime[i].timestamp).getTime();
    const topicsInWindow = new Set<string>();
    for (let j = i; j < topicByTime.length; j++) {
      if (new Date(topicByTime[j].timestamp).getTime() - t0 > CO_OCCURRENCE_WINDOW_MS) break;
      topicsInWindow.add(topicByTime[j].topic);
    }
    const arr = Array.from(topicsInWindow);
    for (let a = 0; a < arr.length; a++) {
      if (!topicConnections.has(arr[a])) topicConnections.set(arr[a], new Set());
      for (let b = 0; b < arr.length; b++) {
        if (a !== b) topicConnections.get(arr[a])!.add(arr[b]);
      }
    }
  }

  const edges: KnowledgeMap['edges'] = [];
  const seen = new Set<string>();
  for (const [source, targets] of Array.from(topicConnections.entries())) {
    for (const target of Array.from(targets)) {
      const key = [source, target].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source, target, strength: 1 });
    }
  }

  const nodes: KnowledgeNode[] = Array.from(topicCounts.entries()).map(([topic, count]) => ({
    id: topic,
    topic,
    workingGroup: topicWgs.get(topic) ?? 'ikp',
    depth: count,
    firstExplored: topicTimestamps.get(topic)!.first,
    lastExplored: topicTimestamps.get(topic)!.last,
    relatedNodes: Array.from(topicConnections.get(topic) ?? []),
  }));

  return { nodes, edges };
}
