/**
 * Build agentic Spellweb from BGIN AI Spellbook entries and Proverbs.
 * Aligned with agentprivacy_master SpellWeb; mapped to spellbook/proverbs.
 */

import type { SpellbookEntryInput } from './builder';
import type { SpellwebData, SpellwebNode, SpellwebLink } from './types-agentic';
import type { Glyph } from './types';
import { BLOCK14_WORKING_GROUPS, BLOCK14_TIMETABLE } from '@/lib/block14/sessions';

/** One spell emoji per Block 14 session, shown on session nodes in the spellweb. */
const SESSION_SPELL_EMOJI: Record<string, string> = {};
const SPELL_EMOJIS = ['📜', '✨', '🔮', '🌟', '💫', '⭐', '🌙', '☀️', '🎯', '🗝️', '📿', '🕯️', '🌠', '🔯', '🌀', '🌊', '🔥', '🌿', '🍃', '🦋'];
BLOCK14_TIMETABLE.forEach((s, i) => {
  SESSION_SPELL_EMOJI[s.id] = SPELL_EMOJIS[i % SPELL_EMOJIS.length];
});

/** Proverb from API (RPP — linked to cast when castEntryId is set). */
export interface ProverbInput {
  id: string;
  workingGroup: string;
  content: string;
  castEntryId?: string;
  createdAt: string;
}

const WG_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {};
for (const g of BLOCK14_WORKING_GROUPS) {
  WG_CONFIG[g.id] = {
    emoji: g.emoji,
    color: g.id === 'ikp' ? '#3B82F6' : g.id === 'fase' ? '#8B5CF6' : g.id === 'cyber' ? '#10B981' : '#F59E0B',
    label: g.label,
  };
}

const DEFAULT_COLOR = '#6B7280';

function shortLabel(index: number): string {
  if (index < 20) {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    return roman[index] ?? String(index + 1);
  }
  return String(index + 1);
}

export function buildAgenticSpellweb(
  entries: SpellbookEntryInput[],
  proverbs: ProverbInput[] = []
): SpellwebData {
  const nodes: SpellwebNode[] = [];
  const links: SpellwebLink[] = [];
  const nodeIds = new Set<string>();

  // Grimoire (WG) hub nodes
  for (const wg of BLOCK14_WORKING_GROUPS) {
    const id = `grimoire:${wg.id}`;
    nodeIds.add(id);
    nodes.push({
      id,
      type: 'grimoire',
      emoji: wg.emoji,
      label: wg.label,
      fullTitle: `${wg.label} Grimoire`,
      name: wg.label,
      val: 28,
      color: WG_CONFIG[wg.id]?.color ?? DEFAULT_COLOR,
      group: wg.id,
      grimoire: wg.id,
    });
  }

  const sessionIds = new Set<string>();
  const entriesBySession = new Map<string, SpellbookEntryInput[]>();

  for (const entry of entries) {
    sessionIds.add(entry.sessionId);
    const list = entriesBySession.get(entry.sessionId) ?? [];
    list.push(entry);
    entriesBySession.set(entry.sessionId, list);
  }

  // Sort entries within each session by addedAt for sequence links
  Array.from(entriesBySession.values()).forEach((list) => {
    list.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
  });

  // Session hub nodes
  for (const sessionId of Array.from(sessionIds)) {
    const first = entries.find((e) => e.sessionId === sessionId);
    const id = `session:${sessionId}`;
    if (!nodeIds.has(id) && first) {
      nodeIds.add(id);
      nodes.push({
        id,
        type: 'session',
        emoji: SESSION_SPELL_EMOJI[sessionId] ?? '📅',
        label: first.sessionTitle.slice(0, 30) + (first.sessionTitle.length > 30 ? '…' : ''),
        fullTitle: first.sessionTitle,
        val: 16,
        color: WG_CONFIG[first.workingGroup]?.color ?? DEFAULT_COLOR,
        group: first.workingGroup,
        grimoire: first.workingGroup,
        metadata: { sessionId, firstScried: first.addedAt, lastInvoked: first.addedAt },
      });
    }
  }

  // Spell nodes (spellbook entries) and links
  let sequenceNumber = 0;
  for (const entry of entries) {
    const spellId = `spell:${entry.id}`;
    nodeIds.add(spellId);
    const resonance = (entry.sources?.length ?? 0) + (entry.crossWgRefs?.length ?? 0);
    nodes.push({
      id: spellId,
      type: 'spell',
      emoji: SESSION_SPELL_EMOJI[entry.sessionId] ?? '✨',
      label: entry.mageQuery.slice(0, 35) + (entry.mageQuery.length > 35 ? '…' : ''),
      fullTitle: entry.mageQuery,
      name: shortLabel(sequenceNumber),
      val: 10 + Math.min(5, resonance),
      color: WG_CONFIG[entry.workingGroup]?.color ?? DEFAULT_COLOR,
      group: entry.workingGroup,
      grimoire: entry.workingGroup,
      sequenceNumber: sequenceNumber + 1,
      metadata: {
        query: entry.mageQuery,
        sessionId: entry.sessionId,
        firstScried: entry.addedAt,
        lastInvoked: entry.addedAt,
      },
    });
    sequenceNumber += 1;

    links.push({
      source: `grimoire:${entry.workingGroup}`,
      target: spellId,
      type: 'grimoire',
      weight: 1,
    });
    links.push({
      source: `session:${entry.sessionId}`,
      target: spellId,
      type: 'cluster',
      weight: 1,
    });

    // Sequence: spell → next spell in same session
    const sessionEntries = entriesBySession.get(entry.sessionId) ?? [];
    const idx = sessionEntries.findIndex((e) => e.id === entry.id);
    if (idx >= 0 && idx < sessionEntries.length - 1) {
      const nextId = `spell:${sessionEntries[idx + 1].id}`;
      if (nodeIds.has(nextId)) {
        links.push({ source: spellId, target: nextId, type: 'sequence', weight: 1 });
      }
    }

    // Constellation: spell → topic (cross-WG)
    for (const ref of entry.crossWgRefs ?? []) {
      const topicId = `topic:${ref.workingGroup}:${ref.topic}`;
      if (!nodeIds.has(topicId)) {
        nodeIds.add(topicId);
        nodes.push({
          id: topicId,
          type: 'topic',
          emoji: '💡',
          label: ref.topic,
          fullTitle: ref.topic,
          val: 8,
          color: WG_CONFIG[ref.workingGroup]?.color ?? DEFAULT_COLOR,
          group: ref.workingGroup,
          grimoire: ref.workingGroup,
        });
      }
      links.push({ source: spellId, target: topicId, type: 'constellation', weight: 1 });
    }
  }

  // Proverbs: node per proverb; link to spell when castEntryId is set
  for (const p of proverbs) {
    const proverbId = `proverb:${p.id}`;
    nodeIds.add(proverbId);
    nodes.push({
      id: proverbId,
      type: 'proverb',
      emoji: '✦',
      label: p.content.slice(0, 30) + (p.content.length > 30 ? '…' : ''),
      fullTitle: p.content,
      val: 8,
      color: WG_CONFIG[p.workingGroup]?.color ?? DEFAULT_COLOR,
      group: p.workingGroup,
      grimoire: p.workingGroup,
      metadata: {
        proverbId: p.id,
        content: p.content,
        castEntryId: p.castEntryId,
        firstScried: p.createdAt,
        lastInvoked: p.createdAt,
      },
    });
    if (p.castEntryId) {
      const spellId = `spell:${p.castEntryId}`;
      if (nodeIds.has(spellId)) {
        links.push({ source: spellId, target: proverbId, type: 'constellation', weight: 1 });
      }
    }
  }

  return { nodes, links };
}

/** Map agentic node id back to Glyph for GlyphInspector (spell/session/proverb/topic/source/grimoire). */
export function agenticNodeToGlyph(node: SpellwebNode): Glyph {
  const type = node.type === 'grimoire' ? 'grimoire' : node.type;
  return {
    id: node.id,
    type: type as Glyph['type'],
    label: node.fullTitle || node.label,
    grimoire: node.grimoire,
    arcaneResonance: node.val ? Math.min(10, Math.floor(node.val)) : 0,
    firstScried: node.metadata?.firstScried ?? new Date().toISOString(),
    lastInvoked: node.metadata?.lastInvoked ?? new Date().toISOString(),
    metadata: {
      query: node.metadata?.query,
      sessionId: node.metadata?.sessionId,
      documentTitle: node.metadata?.documentTitle,
      content: node.metadata?.content,
      castEntryId: node.metadata?.castEntryId,
      proverbId: node.metadata?.proverbId,
    },
  };
}
