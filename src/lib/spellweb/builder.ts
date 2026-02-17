/**
 * Build Spellweb graph from Spellbook entries.
 * @see docs/CONVERGENCE_BONFIRES_BGINAI.md
 */

import type { SpellwebGraph, Glyph, Strand } from './types';

/** Shape of spellbook entry from API / spellbook page (minimal for builder). */
export interface SpellbookEntryInput {
  id: string;
  sessionId: string;
  sessionTitle: string;
  workingGroup: string;
  mageQuery: string;
  mageResponse?: string;
  sources?: Array<{ documentTitle: string; documentDate?: string; relevanceScore?: number }>;
  crossWgRefs?: Array<{ workingGroup: string; topic: string; hint?: string }>;
  addedAt: string;
}

const GRIMOIRES = ['ikp', 'fase', 'cyber', 'governance'] as const;

export function buildSpellweb(entries: SpellbookEntryInput[]): SpellwebGraph {
  const glyphs = new Map<string, Glyph>();
  const strands: Strand[] = [];
  const now = new Date().toISOString();

  for (const wg of GRIMOIRES) {
    glyphs.set(`grimoire:${wg}`, {
      id: `grimoire:${wg}`,
      type: 'grimoire',
      label: wg.toUpperCase(),
      grimoire: wg,
      arcaneResonance: 0,
      firstScried: now,
      lastInvoked: now,
      metadata: {},
    });
  }

  const sessionGlyphIds = new Set<string>();

  for (const entry of entries) {
    const spellId = `spell:${entry.id}`;
    glyphs.set(spellId, {
      id: spellId,
      type: 'spell',
      label: entry.mageQuery.slice(0, 40) + (entry.mageQuery.length > 40 ? '…' : ''),
      grimoire: entry.workingGroup,
      arcaneResonance: (entry.sources?.length ?? 0) + (entry.crossWgRefs?.length ?? 0),
      firstScried: entry.addedAt,
      lastInvoked: entry.addedAt,
      metadata: {
        query: entry.mageQuery,
        sessionId: entry.sessionId,
      },
    });

    const sessionId = `session:${entry.sessionId}`;
    if (!sessionGlyphIds.has(sessionId)) {
      sessionGlyphIds.add(sessionId);
      glyphs.set(sessionId, {
        id: sessionId,
        type: 'session',
        label: entry.sessionTitle,
        grimoire: entry.workingGroup,
        arcaneResonance: 0,
        firstScried: entry.addedAt,
        lastInvoked: entry.addedAt,
        metadata: { sessionId: entry.sessionId },
      });
    }

    strands.push({
      id: `strand:contains:${entry.workingGroup}:${entry.id}`,
      source: `grimoire:${entry.workingGroup}`,
      target: spellId,
      type: 'contains',
      threadStrength: 1,
      firstWoven: entry.addedAt,
      lastTraversed: entry.addedAt,
    });

    strands.push({
      id: `strand:cast:${entry.id}:${entry.sessionId}`,
      source: spellId,
      target: sessionId,
      type: 'cast_to',
      threadStrength: 1,
      firstWoven: entry.addedAt,
      lastTraversed: entry.addedAt,
    });

    for (const source of entry.sources ?? []) {
      const sourceNodeId = `source:${source.documentTitle}`;
      if (!glyphs.has(sourceNodeId)) {
        glyphs.set(sourceNodeId, {
          id: sourceNodeId,
          type: 'source',
          label: source.documentTitle,
          grimoire: entry.workingGroup,
          arcaneResonance: 0,
          firstScried: entry.addedAt,
          lastInvoked: entry.addedAt,
          metadata: { documentTitle: source.documentTitle },
        });
      }
      strands.push({
        id: `strand:cites:${entry.id}:${source.documentTitle}`,
        source: spellId,
        target: sourceNodeId,
        type: 'cites',
        threadStrength: 1,
        firstWoven: entry.addedAt,
        lastTraversed: entry.addedAt,
      });
    }

    for (const ref of entry.crossWgRefs ?? []) {
      const topicId = `topic:${ref.workingGroup}:${ref.topic}`;
      if (!glyphs.has(topicId)) {
        glyphs.set(topicId, {
          id: topicId,
          type: 'topic',
          label: ref.topic,
          grimoire: ref.workingGroup,
          arcaneResonance: 0,
          firstScried: entry.addedAt,
          lastInvoked: entry.addedAt,
          metadata: {},
        });
      }
      strands.push({
        id: `strand:cross:${entry.id}:${ref.workingGroup}:${ref.topic}`,
        source: spellId,
        target: topicId,
        type: 'cross_wg',
        threadStrength: 1,
        firstWoven: entry.addedAt,
        lastTraversed: entry.addedAt,
      });
    }
  }

  for (const strand of strands) {
    if (strand.type === 'contains') {
      const g = glyphs.get(strand.source);
      if (g) g.arcaneResonance += 1;
    }
  }

  return {
    glyphs: Array.from(glyphs.values()),
    strands,
  };
}
