/**
 * Convert Spellweb graph to Graphology for Sigma.js.
 * @see docs/CONVERGENCE_BONFIRES_BGINAI.md
 */

import Graph from 'graphology';
import type { SpellwebGraph } from './types';

const GRIMOIRE_COLORS: Record<string, string> = {
  ikp: '#3B82F6',
  fase: '#8B5CF6',
  cyber: '#10B981',
  governance: '#F59E0B',
};

const GLYPH_SIZES: Record<string, number> = {
  grimoire: 25,
  session: 15,
  spell: 10,
  topic: 8,
  source: 6,
};

export function spellwebToGraphology(web: SpellwebGraph): Graph {
  const graph = new Graph();

  for (const glyph of web.glyphs) {
    graph.addNode(glyph.id, {
      label: glyph.label,
      size: GLYPH_SIZES[glyph.type] + Math.min(5, glyph.arcaneResonance),
      color: GRIMOIRE_COLORS[glyph.grimoire] ?? '#6B7280',
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: glyph.type,
      grimoire: glyph.grimoire,
      arcaneResonance: glyph.arcaneResonance,
    });
  }

  for (const strand of web.strands) {
    if (!graph.hasNode(strand.source) || !graph.hasNode(strand.target)) continue;
    try {
      graph.addEdge(strand.source, strand.target, {
        type: strand.type,
        weight: strand.threadStrength,
        color: strand.type === 'cross_wg' ? '#EF4444' : '#E5E7EB',
      });
    } catch {
      const attrs = graph.getEdgeAttributes(strand.source, strand.target);
      const w = (attrs?.weight as number) ?? 0;
      graph.setEdgeAttribute(strand.source, strand.target, 'weight', w + 1);
    }
  }

  return graph;
}
