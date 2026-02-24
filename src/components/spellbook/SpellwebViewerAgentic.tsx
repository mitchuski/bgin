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

type WebMode = 'constellation' | 'draw';

/** User-drawn link in draw mode */
interface DrawnLink {
  source: string;
  target: string;
}

/** Line segment from edge of source node to edge of target node (so line doesn't overlap circles). */
function lineEndpoints(
  source: { x: number; y: number; val?: number },
  target: { x: number; y: number; val?: number }
): { x1: number; y1: number; x2: number; y2: number } {
  const r1 = (source.val ?? 8) + 4;
  const r2 = (target.val ?? 8) + 4;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: source.x + ux * r1,
    y1: source.y + uy * r1,
    x2: target.x - ux * r2,
    y2: target.y - uy * r2,
  };
}

const SAVED_MAP_KEY = 'bginai-web-saved-map';

function loadSavedMap(): DrawnLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_MAP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((l): l is DrawnLink => l && typeof l.source === 'string' && typeof l.target === 'string') : [];
  } catch {
    return [];
  }
}

function saveSavedMapToStorage(links: DrawnLink[]) {
  try {
    window.localStorage.setItem(SAVED_MAP_KEY, JSON.stringify(links));
  } catch {
    // ignore
  }
}

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
  const [mode, setMode] = useState<WebMode>('constellation');
  const [drawnLinks, setDrawnLinks] = useState<DrawnLink[]>([]);
  const [savedMapLinks, setSavedMapLinks] = useState<DrawnLink[]>([]);
  const [drawSelectedId, setDrawSelectedId] = useState<string | null>(null);
  const savedMapLoaded = useRef(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<SpellwebNode | null>(null);
  const [pulse, setPulse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<{ d3Force: (name: string, fn?: unknown) => unknown; d3ReheatSimulation: () => void } | null>(null);
  const [size, setSize] = useState({ width: 800, height: fullHeight ? 600 : 500 });
  const prevFilterKey = useRef<string>(JSON.stringify(grimoireFilter ?? []));

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

  // Load saved map from localStorage once
  useEffect(() => {
    if (savedMapLoaded.current) return;
    savedMapLoaded.current = true;
    setSavedMapLinks(loadSavedMap());
  }, []);

  // Constellation: full graph + saved map links. Draw: same nodes, only current drawn links.
  const graphData = useMemo(() => {
    if (mode === 'constellation') {
      const savedAsLinks = savedMapLinks.map((l) => ({ ...l, type: 'saved' as const }));
      return { nodes: filteredData.nodes, links: [...filteredData.links, ...savedAsLinks] };
    }
    const linksForDraw = drawnLinks.map((l) => ({ ...l, type: 'drawn' as const }));
    return { nodes: filteredData.nodes, links: linksForDraw };
  }, [mode, filteredData.nodes, filteredData.links, drawnLinks, savedMapLinks]);

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
  }, [fullHeight, graphData.nodes.length]);

  // Force layout: link distance, charge repulsion, keep center gravity; reheat when filter changes for pulse effect
  const filterKey = JSON.stringify(grimoireFilter ?? []);
  const filterJustChanged = prevFilterKey.current !== filterKey;
  if (filterJustChanged) prevFilterKey.current = filterKey;

  useEffect(() => {
    if (graphData.nodes.length === 0) return;
    if (filterJustChanged) setPulse(true);
    const id = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg) return;
      const link = fg.d3Force('link') as { distance?: (d: number | ((link: SpellwebLink & { type?: string }, i: number) => number)) => void } | undefined;
      const charge = fg.d3Force('charge') as { strength?: (s: number) => void } | undefined;
      if (link?.distance) {
        link.distance((l: SpellwebLink & { type?: string }) => {
          const t = l.type;
          if (t === 'grimoire' || t === 'cluster') return 90;
          if (t === 'sequence') return 140;
          if (t === 'drawn' || t === 'saved') return 120;
          return 160;
        });
      }
      if (charge?.strength) charge.strength(-350);
      fg.d3ReheatSimulation();
    }, 100);
    return () => clearTimeout(id);
  }, [graphData.nodes.length, graphData.links.length, filterKey, mode]);

  // Clear pulse after animation
  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [pulse]);

  const randomiseLayout = useCallback(() => {
    const w = Math.max(size.width * 0.45, 320);
    const h = Math.max(size.height * 0.45, 240);
    graphData.nodes.forEach((n) => {
      const node = n as SpellwebNode & { x?: number; y?: number; vx?: number; vy?: number; fx?: number; fy?: number };
      node.x = -w + Math.random() * 2 * w;
      node.y = -h + Math.random() * 2 * h;
      node.vx = 0;
      node.vy = 0;
      delete node.fx;
      delete node.fy;
    });
    setPulse(true);
    requestAnimationFrame(() => {
      fgRef.current?.d3ReheatSimulation();
    });
  }, [graphData.nodes, size.width, size.height]);

  const handleNodeClick = useCallback(
    (node: { id?: string | number }, _event: MouseEvent) => {
      const id = node?.id != null ? String(node.id) : undefined;
      if (!id) {
        if (mode === 'draw') setDrawSelectedId(null);
        onGlyphSelect?.(null);
        return;
      }
      if (mode === 'draw') {
        if (drawSelectedId === id) {
          setDrawSelectedId(null);
          return;
        }
        if (drawSelectedId) {
          const exists = drawnLinks.some(
            (l) => (l.source === drawSelectedId && l.target === id) || (l.source === id && l.target === drawSelectedId)
          );
          if (!exists) setDrawnLinks((prev) => [...prev, { source: drawSelectedId, target: id }]);
          setDrawSelectedId(null);
          return;
        }
        setDrawSelectedId(id);
        return;
      }
      const spellwebNode = filteredData.nodes.find((n) => n.id === id);
      if (spellwebNode) onGlyphSelect?.(agenticNodeToGlyph(spellwebNode));
      else onGlyphSelect?.(null);
    },
    [mode, drawSelectedId, drawnLinks, filteredData.nodes, onGlyphSelect]
  );

  const handleBackgroundClick = useCallback(() => {
    if (mode === 'draw') setDrawSelectedId(null);
    onGlyphSelect?.(null);
  }, [mode, onGlyphSelect]);

  const nodeCanvasObject = useCallback(
    (obj: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = obj as SpellwebNode & { x?: number; y?: number };
      const label = node.label || String(node.id);
      const fontSize = 10 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;

      const radius = (node.val ?? 8) + 4;
      const nodeX = node.x ?? 0;
      const nodeY = node.y ?? 0;
      const isPulse = pulse;

      // Outer glow (stronger during pulse)
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, radius + (isPulse ? 6 : 2), 0, 2 * Math.PI);
      ctx.fillStyle = (node.color || '#6B7280') + (isPulse ? '35' : '20');
      ctx.fill();
      ctx.fillStyle = node.color || '#6B7280';
      ctx.fill();

      const isDrawSelected = drawSelectedId === node.id;
      ctx.strokeStyle = node.isLit ? '#fbbf24' : isDrawSelected ? 'rgba(34, 197, 94, 0.95)' : isPulse ? 'rgba(251, 191, 36, 0.8)' : node.color || '#6B7280';
      ctx.lineWidth = isPulse ? 2 : isDrawSelected ? 2.5 : 1;
      ctx.stroke();
      if (isDrawSelected) {
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, radius + 8, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

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
    [pulse, drawSelectedId]
  );

  const linkCanvasObject = useCallback(
    (obj: unknown, ctx: CanvasRenderingContext2D, _globalScale: number) => {
      const link = obj as SpellwebLink & {
        source?: { x: number; y: number; val?: number } | string;
        target?: { x: number; y: number; val?: number } | string;
        type?: string;
      };
      const src = link.source;
      const tgt = link.target;
      const source =
        src && typeof src === 'object' && 'x' in src ? (src as { x: number; y: number; val?: number }) : null;
      const target =
        tgt && typeof tgt === 'object' && 'x' in tgt ? (tgt as { x: number; y: number; val?: number }) : null;
      if (!source || !target) return;

      const { x1, y1, x2, y2 } = lineEndpoints(source, target);
      const linkType = link.type ?? 'cluster';
      const isPulse = pulse;
      const baseWidth = linkType === 'constellation' ? 2.5 : linkType === 'drawn' || linkType === 'saved' ? 2.5 : 2;
      const lineWidth = isPulse ? baseWidth + 1 : baseWidth;
      const colors: Record<string, string> = {
        constellation: 'rgba(245, 158, 11, 0.95)',
        sequence: 'rgba(148, 163, 184, 0.9)',
        grimoire: 'rgba(156, 163, 175, 0.9)',
        cluster: 'rgba(156, 163, 175, 0.9)',
        drawn: 'rgba(34, 197, 94, 0.9)',
        saved: 'rgba(34, 197, 94, 0.9)',
      };
      const stroke = colors[linkType] ?? colors.cluster;
      const useDashed = linkType === 'sequence' ? [5, 5] : linkType === 'drawn' || linkType === 'saved' ? [3, 3] : [];

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isPulse ? 'rgba(251, 191, 36, 0.9)' : stroke;
      ctx.setLineDash(useDashed);
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    },
    [pulse]
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
        ref={fgRef as any}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        onNodeHover={(node) => setHoveredNode((node as SpellwebNode) ?? null)}
        linkDirectionalArrowLength={0}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.25}
        cooldownTicks={200}
        width={graphWidth}
        height={graphHeight}
      />
      {!fullscreen && (
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => { setMode('constellation'); setDrawSelectedId(null); }}
              className={`rounded border px-2 py-1 text-xs ${mode === 'constellation' ? 'border-[var(--mage)] bg-[var(--mage)]/10 text-[var(--mage)]' : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
              title="Preset links: grimoires, sessions, spells, proverbs"
            >
              ⭐ Constellation
            </button>
            <button
              type="button"
              onClick={() => { setMode('draw'); setDrawSelectedId(null); setDrawnLinks([...savedMapLinks]); }}
              className={`rounded border px-2 py-1 text-xs ${mode === 'draw' ? 'border-[var(--mage)] bg-[var(--mage)]/10 text-[var(--mage)]' : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
              title="Draw your own links between nodes"
            >
              ✏️ Draw
            </button>
          </div>
          <div className="flex gap-1.5">
            {mode === 'draw' && (
              <>
                <button
                  type="button"
                  onClick={() => { setSavedMapLinks(drawnLinks); saveSavedMapToStorage(drawnLinks); }}
                  className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--mage)]"
                  title="Save current lines so they show in Constellation"
                >
                  🗺️ Save map
                </button>
                <button
                  type="button"
                  onClick={() => setDrawnLinks([])}
                  className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                >
                  Clear lines
                </button>
              </>
            )}
            <button
              type="button"
              onClick={randomiseLayout}
              className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              title="Randomise node positions and re-run simulation"
            >
              Randomise layout
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            >
              Expand
            </button>
          </div>
          {mode === 'draw' && (
            <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/95 px-2 py-1 rounded border border-[var(--border)]">
              {drawSelectedId ? 'Click another node to connect' : 'Click two nodes to connect them'}
            </p>
          )}
        </div>
      )}
      {fullscreen && (
        <div className="fixed top-4 right-4 z-10 flex flex-wrap gap-2 items-center">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => { setMode('constellation'); setDrawSelectedId(null); }}
              className={`rounded border px-2.5 py-1 text-sm ${mode === 'constellation' ? 'border-[var(--mage)] bg-[var(--mage)]/10 text-[var(--mage)]' : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
            >
              ⭐ Constellation
            </button>
            <button
              type="button"
              onClick={() => { setMode('draw'); setDrawSelectedId(null); setDrawnLinks([...savedMapLinks]); }}
              className={`rounded border px-2.5 py-1 text-sm ${mode === 'draw' ? 'border-[var(--mage)] bg-[var(--mage)]/10 text-[var(--mage)]' : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
            >
              ✏️ Draw
            </button>
          </div>
          {mode === 'draw' && (
            <>
              <button
                type="button"
                onClick={() => { setSavedMapLinks(drawnLinks); saveSavedMapToStorage(drawnLinks); }}
                className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--mage)]"
              >
                🗺️ Save map
              </button>
              <button
                type="button"
                onClick={() => setDrawnLinks([])}
                className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1 text-sm text-[var(--text-secondary)]"
              >
                Clear lines
              </button>
            </>
          )}
          <button type="button" onClick={randomiseLayout} className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
            Randomise layout
          </button>
          <button type="button" onClick={() => setFullscreen(false)} className="rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
            Exit (Esc)
          </button>
        </div>
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
