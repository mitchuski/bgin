'use client';

import { useEffect, useRef, useState } from 'react';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { buildSpellweb } from '@/lib/spellweb/builder';
import { spellwebToGraphology } from '@/lib/spellweb/adapter';
import type { SpellbookEntryInput } from '@/lib/spellweb/builder';
import type { Glyph } from '@/lib/spellweb/types';

interface SpellwebNavigatorCanvasProps {
  entries: SpellbookEntryInput[];
  onGlyphSelect?: (glyph: Glyph | null) => void;
  grimoireFilter?: string[];
}

/**
 * Sigma.js graph canvas. Only ever loaded in the browser (via dynamic import from SpellwebNavigator).
 * Do not import this file from server-rendered code.
 */
export default function SpellwebNavigatorCanvas({
  entries,
  onGlyphSelect,
  grimoireFilter,
}: SpellwebNavigatorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || entries.length === 0) return;

    const spellweb = buildSpellweb(entries);
    const filteredGlyphs = grimoireFilter
      ? spellweb.glyphs.filter(
          (g) => g.type === 'grimoire' || grimoireFilter.includes(g.grimoire)
        )
      : spellweb.glyphs;
    const filteredIds = new Set(filteredGlyphs.map((g) => g.id));
    const filteredStrands = spellweb.strands.filter(
      (s) => filteredIds.has(s.source) && filteredIds.has(s.target)
    );

    if (filteredGlyphs.length === 0) return;

    const graph = spellwebToGraphology({
      glyphs: filteredGlyphs,
      strands: filteredStrands,
    });

    try {
      forceAtlas2.assign(graph, {
        iterations: 100,
        settings: {
          gravity: 1,
          scalingRatio: 2,
          barnesHutOptimize: true,
        },
      });

      const sigma = new Sigma(graph, containerRef.current, {
        renderEdgeLabels: false,
        defaultNodeColor: '#6B7280',
        defaultEdgeColor: '#E5E7EB',
        labelRenderedSizeThreshold: 8,
      });
      sigmaRef.current = sigma;

      sigma.on('enterNode', ({ node }) => {
        setHoveredLabel(graph.getNodeAttribute(node, 'label') ?? node);
      });
      sigma.on('leaveNode', () => setHoveredLabel(null));

      sigma.on('clickNode', ({ node }) => {
        const glyph = spellweb.glyphs.find((g) => g.id === node);
        onGlyphSelect?.(glyph ?? null);
      });
      sigma.on('clickStage', () => onGlyphSelect?.(null));

      return () => {
        sigma.kill();
        sigmaRef.current = null;
      };
    } catch (err) {
      console.error('SpellwebNavigatorCanvas: Sigma/graph init failed', err);
      return undefined;
    }
  }, [entries, grimoireFilter, onGlyphSelect]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] min-h-[500px]"
        style={{ height: 500 }}
      />
      {hoveredLabel && (
        <div className="absolute bottom-4 left-4 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm shadow">
          <span className="text-[var(--text-muted)]">Glyph:</span>{' '}
          <span className="font-medium">{hoveredLabel}</span>
        </div>
      )}
    </div>
  );
}
