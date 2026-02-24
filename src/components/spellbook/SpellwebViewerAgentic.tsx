'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { SpellwebData, SpellwebNode, SpellwebLink } from '@/lib/spellweb/types-agentic';
import { agenticNodeToGlyph } from '@/lib/spellweb/builder-agentic';
import type { Glyph } from '@/lib/spellweb/types';

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d').then((mod) => mod.default),
  { ssr: false }
);

interface SpellwebViewerAgenticProps {
  /** Agentic graph data (nodes + links). */
  data: SpellwebData;
  /** WG ids to show (grimoire + spells/proverbs in those WGs). */
  grimoireFilter?: string[];
  /** Callback when user selects a node (Glyph for GlyphInspector). */
  onGlyphSelect?: (glyph: Glyph | null) => void;
  /** When true, viewer fills its container (use with a parent that has defined height). */
  fullHeight?: boolean;
}

export default function SpellwebViewerAgentic({
  data,
  grimoireFilter,
  onGlyphSelect,
  fullHeight = false,
}: SpellwebViewerAgenticProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<SpellwebNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: fullHeight ? 600 : 500 });

  const filteredData = useMemo(() => {
    if (!grimoireFilter || grimoireFilter.length === 0) return data;
    const wgSet = new Set(grimoireFilter);
    const nodeIds = new Set(
      data.nodes.filter((n) => n.type === 'grimoire' || wgSet.has(n.grimoire)).map((n) => n.id)
    );
    const links = data.links.filter(
      (l) => nodeIds.has(l.source as string) && nodeIds.has(l.target as string)
    );
    const nodes = data.nodes.filter((n) => nodeIds.has(n.id));
    return { nodes, links };
  }, [data, grimoireFilter]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreen]);

  useEffect(() => {
    if (!fullHeight || !containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 800, height: 600 };
      setSize({ width: Math.max(100, width), height: Math.max(100, height) });
    });
    ro.observe(el);
    setSize({ width: el.offsetWidth || 800, height: el.offsetHeight || 600 });
    return () => ro.disconnect();
  }, [fullHeight, filteredData.nodes.length]);

  const handleNodeClick = useCallback(
    (node: { id?: string | number }, _event: MouseEvent) => {
      const id = node?.id != null ? String(node.id) : undefined;
      if (!id) {
        onGlyphSelect?.(null);
        return;
      }
      const spellwebNode = filteredData.nodes.find((n) => n.id === id);
      if (spellwebNode) onGlyphSelect?.(agenticNodeToGlyph(spellwebNode));
      else onGlyphSelect?.(null);
    },
    [filteredData.nodes, onGlyphSelect]
  );

  const handleBackgroundClick = useCallback(() => {
    onGlyphSelect?.(null);
  }, [onGlyphSelect]);

  const nodeCanvasObject = useCallback(
    (obj: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = obj as SpellwebNode & { x?: number; y?: number };
      const label = node.label || String(node.id);
      const fontSize = 10 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;

      const textWidth = Math.max(ctx.measureText(label).width, 20);
      const radius = (node.val ?? 8) + 4;
      const nodeX = node.x ?? 0;
      const nodeY = node.y ?? 0;

      // Glow / fill
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = (node.color || '#6B7280') + '20';
      ctx.fill();
      ctx.fillStyle = node.color || '#6B7280';
      ctx.fill();

      ctx.strokeStyle = node.isLit ? '#fbbf24' : node.color || '#6B7280';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Emoji above node
      if (node.emoji) {
        ctx.font = `${Math.min(14, radius * 1.8)}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.emoji, nodeX, nodeY - radius * 0.4);
      }

      // Label below or beside
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.max(6, fontSize)}px Sans-Serif`;
      ctx.fillText(
        label.length > 18 ? label.slice(0, 18) + '…' : label,
        nodeX,
        nodeY + (node.emoji ? radius * 0.6 : 0)
      );
    },
    []
  );

  const linkCanvasObject = useCallback(
    (obj: unknown, ctx: CanvasRenderingContext2D, _globalScale: number) => {
      const link = obj as SpellwebLink & {
        source?: { x: number; y: number } | string;
        target?: { x: number; y: number } | string;
      };
      const src = link.source;
      const tgt = link.target;
      const source =
        src && typeof src === 'object' && 'x' in src ? (src as { x: number; y: number }) : null;
      const target =
        tgt && typeof tgt === 'object' && 'x' in tgt ? (tgt as { x: number; y: number }) : null;
      if (!source || !target) return;

      const linkType = link.type;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = linkType === 'constellation' ? '#f59e0b' : linkType === 'sequence' ? '#94a3b8' : 'rgba(150,150,150,0.6)';
      ctx.setLineDash(linkType === 'sequence' ? [4, 4] : []);
      ctx.lineWidth = link.type === 'constellation' ? 1.5 : 1;
      ctx.stroke();
    },
    []
  );

  if (filteredData.nodes.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[400px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm">
          No spells or proverbs in the selected grimoires. Cast from a Mage or inscribe proverbs to weave the Spellweb.
        </p>
      </div>
    );
  }

  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 bg-[var(--bg-primary)]'
    : fullHeight
      ? 'w-full h-full min-h-0 relative'
      : 'rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] min-h-[500px] w-full relative';

  const graphWidth = fullscreen ? undefined : size.width;
  const graphHeight = fullscreen ? undefined : size.height;

  return (
    <div
      ref={fullHeight ? containerRef : undefined}
      className={containerClass}
      style={fullscreen ? undefined : fullHeight ? { width: '100%', height: '100%' } : { minHeight: 500 }}
    >
      <ForceGraph2D
        graphData={filteredData}
        nodeId="id"
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        onNodeHover={(node) => setHoveredNode((node as SpellwebNode) ?? null)}
        linkDirectionalArrowLength={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        cooldownTicks={100}
        width={graphWidth}
        height={graphHeight}
      />
      {!fullscreen && (
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute top-2 right-2 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
        >
          Expand
        </button>
      )}
      {fullscreen && (
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="fixed top-4 right-4 z-10 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
        >
          Exit (Esc)
        </button>
      )}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm shadow">
          <span className="text-[var(--text-muted)]">{hoveredNode.emoji} </span>
          <span className="font-medium">{hoveredNode.fullTitle || hoveredNode.label}</span>
        </div>
      )}
    </div>
  );
}
