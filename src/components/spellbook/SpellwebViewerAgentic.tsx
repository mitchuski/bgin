'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as d3 from 'd3';
import type { SpellwebData, SpellwebNode, SpellwebLink } from '@/lib/spellweb/types-agentic';

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d').then((mod) => mod.default),
  { ssr: false }
);

/** User-drawn link */
interface UserLink {
  source: string;
  target: string;
}

/** Reflection notes */
interface ReflectionNotes {
  [nodeId: string]: string;
}

/** Line segment from edge of source node to edge of target node */
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

const CONNECTIONS_KEY = 'bginai-web-connections';
const REFLECTIONS_KEY = 'bginai-web-reflections';

function loadConnections(): UserLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CONNECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((l): l is UserLink => l && typeof l.source === 'string' && typeof l.target === 'string') : [];
  } catch {
    return [];
  }
}

function saveConnections(links: UserLink[]) {
  try {
    window.localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(links));
  } catch {
    // ignore
  }
}

function loadReflections(): ReflectionNotes {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(REFLECTIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReflectionNotes;
  } catch {
    return {};
  }
}

function saveReflectionsToStorage(notes: ReflectionNotes) {
  try {
    window.localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

interface SpellwebViewerAgenticProps {
  /** Agentic graph data (nodes + links). */
  data: SpellwebData;
  /** WG ids to show (grimoire + spells/proverbs in those WGs). */
  grimoireFilter?: string[];
  /** When true, viewer fills its container (use with a parent that has defined height). */
  fullHeight?: boolean;
}

export default function SpellwebViewerAgentic({
  data,
  grimoireFilter,
  fullHeight = false,
}: SpellwebViewerAgenticProps) {
  const [userLinks, setUserLinks] = useState<UserLink[]>([]);
  const [reflections, setReflections] = useState<ReflectionNotes>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectRequested, setConnectRequested] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);
  const dataLoaded = useRef(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<SpellwebNode | null>(null);
  const [pulse, setPulse] = useState(false);
  /** When true, nodes show only emoji + colour; when false, show labels too. */
  const [evokeMode, setEvokeMode] = useState(true);
  /** Sidebar (panel) open: like spellweb directory, one big screen with overlay panel when open. */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
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

  // Load connections and reflections from localStorage once
  useEffect(() => {
    if (dataLoaded.current) return;
    dataLoaded.current = true;
    setUserLinks(loadConnections());
    setReflections(loadReflections());
  }, []);

  // Graph data includes base links + user connections (only links whose nodes exist in filtered set)
  const graphData = useMemo(() => {
    const nodeIdSet = new Set(filteredData.nodes.map((n) => n.id));
    const validUserLinks = userLinks.filter(
      (l) => nodeIdSet.has(l.source) && nodeIdSet.has(l.target)
    );
    const connectionLinks = validUserLinks.map((l) => ({ ...l, type: 'connection' as const }));
    return { nodes: filteredData.nodes, links: [...filteredData.links, ...connectionLinks] };
  }, [filteredData.nodes, filteredData.links, userLinks]);

  // Get selected node object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return filteredData.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [selectedNodeId, filteredData.nodes]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreen(false);
        setConnectRequested(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreen]);

  // Open sidebar when user selects a node (so they can Reflect/Connect)
  useEffect(() => {
    if (selectedNodeId) setSidebarOpen(true);
  }, [selectedNodeId]);

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

  // Force layout config
  const filterKey = JSON.stringify(grimoireFilter ?? []);
  const filterJustChanged = prevFilterKey.current !== filterKey;
  if (filterJustChanged) prevFilterKey.current = filterKey;

  // Force layout: align with spellweb KG patterns (ForceGraphKG) for better scaling
  useEffect(() => {
    if (graphData.nodes.length === 0) return;
    if (filterJustChanged) setPulse(true);
    const id = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg) return;
      const link = fg.d3Force('link') as {
        distance?: (d: number | ((l: SpellwebLink & { type?: string }) => number)) => void;
        strength?: (s: number | ((l: SpellwebLink & { type?: string }) => number)) => void;
      } | undefined;
      const charge = fg.d3Force('charge') as { strength?: (s: number) => void } | undefined;
      if (link?.distance) {
        link.distance((l: SpellwebLink & { type?: string }) => {
          const t = l.type;
          if (t === 'grimoire' || t === 'cluster') return 90;
          if (t === 'sequence') return 140;
          if (t === 'connection' || t === 'drawn' || t === 'saved') return 120;
          return 160;
        });
      }
      if (link?.strength) {
        link.strength((l: SpellwebLink & { type?: string }) => {
          const t = l.type;
          if (t === 'connection' || t === 'drawn' || t === 'saved') return 0.4;
          if (t === 'sequence') return 0.35;
          if (t === 'grimoire' || t === 'cluster') return 0.25;
          return 0.2;
        });
      }
      if (charge?.strength) charge.strength(-280);
      // Collision (like KG): prevents node overlap and helps scale with many nodes
      const collide = d3.forceCollide<SpellwebNode & { x?: number; y?: number }>().radius((d) => (d.val ?? 8) + 4);
      fg.d3Force('collision', collide);
      fg.d3ReheatSimulation();
    }, 100);
    return () => clearTimeout(id);
  }, [graphData]);

  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [pulse]);

  // Save reflection
  const saveReflection = useCallback((nodeId: string, text: string) => {
    const next = { ...reflections };
    if (text.trim()) next[nodeId] = text.trim();
    else delete next[nodeId];
    setReflections(next);
    saveReflectionsToStorage(next);
  }, [reflections]);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: { id?: string | number }, _event: MouseEvent) => {
      const nodeId = node?.id != null ? String(node.id) : null;

      // If connect is requested and we have a selected node, make the link
      if (connectRequested && selectedNodeId && nodeId && nodeId !== selectedNodeId) {
        const newLinks = [...userLinks, { source: selectedNodeId, target: nodeId }];
        setUserLinks(newLinks);
        saveConnections(newLinks);
        setConnectRequested(false);
        return;
      }

      // Toggle selection
      const nextId = selectedNodeId === nodeId ? null : nodeId;
      setSelectedNodeId(nextId);
      setConnectRequested(false);
    },
    [connectRequested, selectedNodeId, userLinks]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setConnectRequested(false);
  }, []);

  // Generate markdown for Path the Stars download
  const generatePathMarkdown = useCallback(() => {
    const lines: string[] = ['# Path the Stars', '', `*Exported: ${new Date().toISOString().split('T')[0]}*`, ''];

    if (userLinks.length > 0) {
      lines.push('## Connections', '');
      userLinks.forEach(({ source, target }) => {
        const sourceNode = filteredData.nodes.find(n => n.id === source);
        const targetNode = filteredData.nodes.find(n => n.id === target);
        const sourceLabel = sourceNode?.label || source;
        const targetLabel = targetNode?.label || target;
        lines.push(`- ${sourceLabel} → ${targetLabel}`);
      });
      lines.push('');
    }

    const reflectionEntries = Object.entries(reflections).filter(([, text]) => text?.trim());
    if (reflectionEntries.length > 0) {
      lines.push('## Reflections', '');
      reflectionEntries.forEach(([nodeId, text]) => {
        const node = filteredData.nodes.find(n => n.id === nodeId);
        const label = node?.label || nodeId;
        lines.push(`### ${label}`, '', text.trim(), '');
      });
    }

    if (userLinks.length === 0 && reflectionEntries.length === 0) {
      lines.push('*No connections or reflections yet. Select a node, then use Connect or Reflect.*');
    }

    lines.push('', '---', '', '*🌌 Path the Stars — BGIN AI Block 14*');
    return lines.join('\n');
  }, [userLinks, reflections, filteredData.nodes]);

  const downloadPathMarkdown = useCallback(() => {
    const md = generatePathMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-the-stars-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowPathModal(false);
  }, [generatePathMarkdown]);

  const nodeCanvasObject = useCallback(
    (obj: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = obj as SpellwebNode & { x?: number; y?: number };
      const label = node.label || String(node.id);
      const fontSize = 10 / globalScale;

      const radius = (node.val ?? 8) + 4;
      const nodeX = node.x ?? 0;
      const nodeY = node.y ?? 0;
      const isPulse = pulse;
      const emojiOnly = evokeMode;

      const isSelected = selectedNodeId === node.id;
      const isConnectHighlight = connectRequested && selectedNodeId === node.id;
      const hasReflection = !!reflections[node.id];

      // Spellweb-style glow effect
      const glowRadius = isSelected || isPulse ? 12 : 6;
      ctx.shadowColor = node.color || '#ffd700';
      ctx.shadowBlur = glowRadius;

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, radius + (isPulse ? 4 : 2), 0, 2 * Math.PI);
      ctx.fillStyle = (node.color || '#5c4a00') + (isPulse ? '40' : '25');
      ctx.fill();

      // Main node circle
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || '#5c4a00';
      ctx.fill();

      // Reset shadow for stroke
      ctx.shadowBlur = 0;

      // Stroke styling - spellweb gold accent for selected/lit
      ctx.strokeStyle = node.isLit ? '#ffd700'
        : isConnectHighlight ? '#2ecc71'
        : isSelected ? '#ffd700'
        : isPulse ? '#ffd700'
        : (node.color || '#ffd700') + '80';
      ctx.lineWidth = isPulse ? 2 : isSelected || isConnectHighlight ? 2.5 : 1.5;
      ctx.stroke();

      // Selection ring - gold dashed
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, radius + 8, 0, 2 * Math.PI);
        ctx.strokeStyle = isConnectHighlight ? 'rgba(46, 204, 113, 0.6)' : 'rgba(255, 215, 0, 0.5)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Reflection indicator - gold dot
      if (hasReflection && !isSelected) {
        ctx.beginPath();
        ctx.arc(nodeX + radius * 0.7, nodeY - radius * 0.7, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Emoji: centered when emoji-only, slightly above centre when showing label
      if (node.emoji) {
        ctx.font = `${Math.min(14, radius * 1.8)}px "Cormorant Garamond", Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#e8e8f0';
        const emojiY = emojiOnly ? nodeY : nodeY - radius * 0.4;
        ctx.fillText(node.emoji, nodeX, emojiY);
      }

      // Label (only when Evoke is off) - IBM Plex Sans style
      if (!emojiOnly) {
        const labelText = label.length > 18 ? label.slice(0, 18) + '…' : label;
        const labelY = nodeY + (node.emoji ? radius * 0.6 : 0);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.max(6, fontSize)}px "IBM Plex Sans", sans-serif`;
        ctx.strokeStyle = 'rgba(6, 6, 14, 0.95)';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.strokeText(labelText, nodeX, labelY);
        ctx.fillStyle = '#c8c8d8';
        ctx.fillText(labelText, nodeX, labelY);
      }
    },
    [pulse, selectedNodeId, connectRequested, reflections, evokeMode]
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
      const source = src && typeof src === 'object' && 'x' in src ? (src as { x: number; y: number; val?: number }) : null;
      const target = tgt && typeof tgt === 'object' && 'x' in tgt ? (tgt as { x: number; y: number; val?: number }) : null;
      if (!source || !target) return;

      const { x1, y1, x2, y2 } = lineEndpoints(source, target);
      const linkType = link.type ?? 'cluster';
      const isPulse = pulse;

      // Spellweb-aligned edge styles
      const edgeStyles: Record<string, { color: string; width: number; dash: number[] }> = {
        sequence: { color: '#2ecc71', width: 1.5, dash: [4, 4] },      // narrates green, dashed
        grimoire: { color: '#444460', width: 1, dash: [] },            // dim, solid
        cluster: { color: '#444460', width: 1, dash: [] },             // dim, solid
        connection: { color: '#ffd700', width: 2, dash: [6, 3] },      // gold, user-drawn
        constellation: { color: '#ffd700', width: 1.5, dash: [3, 3] }, // gold constellation
      };

      const style = edgeStyles[linkType] ?? edgeStyles.cluster;
      const lineWidth = isPulse ? style.width + 1 : style.width;
      const opacity = isPulse ? 0.8 : 0.35;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isPulse ? 'rgba(255, 215, 0, 0.8)' : style.color;
      ctx.globalAlpha = opacity;
      ctx.setLineDash(style.dash);
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    },
    [pulse]
  );

  if (filteredData.nodes.length === 0) {
    return (
      <div className="rounded-lg p-8 min-h-[400px] flex items-center justify-center" style={{ background: '#06060e', border: '1px solid #1a1a30' }}>
        <p style={{ fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 13, color: '#666680', textAlign: 'center' }}>
          No spells or proverbs in the selected grimoires.<br />
          <span style={{ color: '#ffd700' }}>Cast from a Mage</span> or <span style={{ color: '#ffd700' }}>inscribe proverbs</span> to weave the Spellweb.
        </p>
      </div>
    );
  }

  // Right side panel component - spellweb styled; min-h-0 so it scrolls inside flex layout; clean edges
  const rightPanel = (isExpanded: boolean) => (
    <div
      ref={rightPanelRef}
      className={`flex flex-col gap-3 min-h-0 ${isExpanded ? 'w-[260px]' : 'w-[240px]'} shrink-0 p-4 overflow-y-auto border-l border-r border-[#1a1a30] bg-[#0c0c18] shadow-[-2px_0_16px_rgba(0,0,0,0.35)]`}
    >
      {/* Top controls - spellweb filter button style */}
      <div className="rounded-lg p-3 flex flex-col gap-1" style={{ background: '#06060e', border: '1px solid #1a1a30' }}>
        <button
          type="button"
          onClick={() => setEvokeMode((e) => !e)}
          className="flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-150"
          style={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            background: evokeMode ? 'rgba(255, 215, 0, 0.09)' : 'transparent',
            border: evokeMode ? '1px solid rgba(255, 215, 0, 0.25)' : '1px solid transparent',
            color: evokeMode ? '#ffd700' : '#666680',
          }}
          title={evokeMode ? 'Show labels on nodes' : 'Hide labels (emoji + colour only)'}
        >
          <span aria-hidden>🔮</span>
          Evoke {evokeMode ? '(emoji)' : '(text)'}
        </button>
        <button
          type="button"
          onClick={() => { setLayoutKey((k) => k + 1); setPulse(true); }}
          className="flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-150"
          style={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            background: 'transparent',
            border: '1px solid transparent',
            color: '#666680',
          }}
          title="Re-layout constellation"
        >
          <span aria-hidden>✦</span>
          Constellation
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((e) => !e)}
          className="flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-150"
          style={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            background: 'transparent',
            border: '1px solid transparent',
            color: '#666680',
          }}
          title={isExpanded ? 'Close fullscreen' : 'Expand to fullscreen'}
        >
          <span aria-hidden>{isExpanded ? '✕' : '⛶'}</span>
          {isExpanded ? 'Close' : 'Expand'}
        </button>
      </div>

      {/* Selected node details - spellweb styled inspector */}
      {selectedNode && (
        <div className="rounded-lg p-4 space-y-4" style={{ background: '#06060e', border: '1px solid #1a1a30' }}>
          {/* Type label - JetBrains Mono */}
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            color: '#666680',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {selectedNode.type}
          </div>

          {/* Header - Cormorant Garamond title */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedNode.emoji}</span>
            <h3 style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 18,
              fontWeight: 600,
              color: '#e8e8f0',
              lineHeight: 1.2,
            }}>
              {selectedNode.fullTitle || selectedNode.label}
            </h3>
          </div>

          {/* Proverb/Query content */}
          {selectedNode.metadata?.content && (
            <div style={{
              fontSize: 12,
              fontStyle: 'italic',
              color: '#8888a0',
              borderLeft: '2px solid #ffd700',
              paddingLeft: 8,
            }}>
              "{selectedNode.metadata.content}"
            </div>
          )}
          {selectedNode.metadata?.query && (
            <div style={{ fontSize: 11, color: '#666680' }}>
              <span style={{ fontWeight: 500 }}>Query:</span> {selectedNode.metadata.query}
            </div>
          )}

          {/* Reflect textarea - spellweb styled */}
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              color: '#666680',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <span aria-hidden>🪞</span>
              Reflect
            </div>
            <textarea
              className="w-full resize-y focus:outline-none"
              style={{
                minHeight: 80,
                padding: 12,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid #1a1a30',
                color: '#c8c8d8',
                fontFamily: '"IBM Plex Sans", sans-serif',
                fontSize: 12,
              }}
              placeholder="Add your reflection..."
              value={reflections[selectedNode.id] ?? ''}
              onChange={(e) => saveReflection(selectedNode.id, e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>

          {/* Connect button - spellweb action style */}
          <button
            type="button"
            onClick={() => setConnectRequested((c) => !c)}
            className="flex items-center gap-2 w-full px-4 py-2 rounded transition-all duration-150"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              fontSize: 11,
              fontWeight: 500,
              background: connectRequested ? 'rgba(46, 204, 113, 0.15)' : 'transparent',
              border: connectRequested ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid #1a1a30',
              color: connectRequested ? '#2ecc71' : '#666680',
            }}
            title="Draw a line to another node"
          >
            <span aria-hidden>🔗</span>
            Connect
          </button>
          {connectRequested && (
            <p style={{ fontSize: 11, color: '#2ecc71' }}>Click another node to make a link.</p>
          )}
        </div>
      )}

      {/* Legend / Instructions - spellweb styled */}
      <div className="rounded-lg p-4 space-y-3" style={{ background: '#06060e', border: '1px solid #1a1a30' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          color: '#666680',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Legend
        </div>
        <div className="space-y-2" style={{ fontSize: 11, color: '#666680', fontFamily: '"IBM Plex Sans", sans-serif' }}>
          <div>Click a node to <span style={{ color: '#ffd700' }}>🪞 Reflect</span> or <span style={{ color: '#2ecc71' }}>🔗 Connect</span></div>
          <div className="flex items-center gap-2">
            <span style={{ width: 12, height: 2, background: '#ffd700', display: 'inline-block', borderRadius: 1 }} />
            <span>User connection</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: 12, height: 2, background: '#2ecc71', display: 'inline-block', borderRadius: 1 }} />
            <span>Sequence</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: 12, height: 2, background: '#444460', display: 'inline-block', borderRadius: 1 }} />
            <span>Grimoire</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPathModal(true)}
            className="text-left text-xs mt-2 block hover:underline"
            style={{ color: '#8888a0' }}
            title="Export connections and reflections"
          >
            Export connections & reflections
          </button>
        </div>
        {hoveredNode && (
          <div className="pt-3" style={{ borderTop: '1px solid #1a1a30' }}>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#666680' }}>FOCUS</span>
            <div className="mt-1 flex items-center gap-2" style={{ color: '#e8e8f0', fontSize: 12 }}>
              <span>{hoveredNode.emoji}</span>
              <span style={{ fontFamily: '"Cormorant Garamond", serif' }}>{hoveredNode.fullTitle || hoveredNode.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Container classes - spellweb styled
  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 flex'
    : fullHeight
      ? 'w-full h-full min-h-0 flex relative'
      : 'rounded-lg min-h-[520px] w-full flex relative';

  const containerStyle = fullscreen
    ? { background: '#06060e' }
    : fullHeight
      ? { background: '#06060e' }
      : { background: '#06060e', border: '1px solid #1a1a30' };

  const graphWidth = fullscreen ? undefined : size.width;
  const graphHeight = fullscreen ? undefined : size.height;

  return (
    <div
      ref={fullHeight ? containerRef : undefined}
      className={containerClass}
      style={{ ...containerStyle, ...(fullscreen ? {} : fullHeight ? { width: '100%', height: '100%' } : { minHeight: 520 }) }}
    >
      {/* One big screen: graph fills container */}
      <div className="flex-1 min-w-0 min-h-0 relative w-full h-full">
        <ForceGraph2D
          key={layoutKey}
          ref={fgRef as any}
          graphData={graphData}
          nodeId="id"
          backgroundColor="#06060e"
          enableNodeDrag
          nodeCanvasObject={nodeCanvasObject}
          linkCanvasObject={linkCanvasObject}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          onNodeHover={(node) => setHoveredNode((node as SpellwebNode) ?? null)}
          linkDirectionalArrowLength={0}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTicks={100}
          minZoom={0.2}
          maxZoom={4}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          width={graphWidth}
          height={graphHeight}
        />
        {/* Toggle to open sidebar - tab on the right edge */}
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 py-4 px-2 rounded-l-lg shadow-lg transition-all duration-200"
          style={{
            background: sidebarOpen ? '#0c0c18' : 'rgba(12, 12, 24, 0.9)',
            border: '1px solid #1a1a30',
            borderRight: 'none',
            color: sidebarOpen ? '#ffd700' : '#666680',
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: 11,
          }}
          title={sidebarOpen ? 'Close panel' : 'Open panel'}
          aria-label={sidebarOpen ? 'Close panel' : 'Open panel'}
        >
          <span aria-hidden>{sidebarOpen ? '▶' : '◀'}</span>
        </button>
      </div>

      {/* Sidebar overlay - opens over the graph like spellweb directory */}
      {sidebarOpen && (
        <>
          <div
            className="absolute inset-0 z-20"
            aria-hidden
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'transparent' }}
          />
          <div className="absolute right-0 top-0 bottom-0 z-30 w-[280px] max-w-[90vw] flex flex-col border-l border-[#1a1a30] shadow-[-4px_0_24px_rgba(0,0,0,0.4)]" style={{ background: '#0c0c18' }}>
            <div className="flex-shrink-0 flex justify-end p-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded transition-colors hover:bg-[#1a1a30]"
                style={{ color: '#666680', fontSize: 14 }}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {rightPanel(fullscreen)}
            </div>
          </div>
        </>
      )}

      {/* Path the Stars Modal - spellweb styled */}
      {showPathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }} role="dialog" aria-modal="true" aria-label="Path the stars">
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-lg shadow-2xl overflow-hidden" style={{ background: '#0c0c18', border: '1px solid #1a1a30' }}>
            <div className="p-5 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #1a1a30' }}>
              <h2 className="flex items-center gap-3" style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 20,
                fontWeight: 600,
                color: '#ffd700',
              }}>
                <span aria-hidden>🌌</span>
                path the stars
              </h2>
              <button
                type="button"
                onClick={() => setShowPathModal(false)}
                className="p-2 rounded transition-colors"
                style={{ color: '#666680', fontSize: 18 }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
              <p style={{ fontSize: 13, color: '#666680' }}>
                Download your connections and reflections as a markdown file.
              </p>
              {(() => {
                const hasConnections = userLinks.length > 0;
                const hasReflections = Object.entries(reflections).some(([, text]) => text?.trim());
                if (!hasConnections && !hasReflections) {
                  return <p style={{ fontSize: 13, color: '#8888a0' }}>No connections or reflections yet. Select a node, then use Reflect or Connect.</p>;
                }
                return (
                  <div className="space-y-5" style={{ fontSize: 13 }}>
                    {hasConnections && (
                      <div>
                        <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 600, color: '#e8e8f0', marginBottom: 12 }}>
                          Connections ({userLinks.length})
                        </h3>
                        <ul className="space-y-2" style={{ color: '#8888a0' }}>
                          {userLinks.map(({ source, target }, i) => {
                            const sourceNode = filteredData.nodes.find(n => n.id === source);
                            const targetNode = filteredData.nodes.find(n => n.id === target);
                            return (
                              <li key={i} className="flex items-center gap-2">
                                <span style={{ color: '#ffd700' }}>→</span>
                                {sourceNode?.label || source} → {targetNode?.label || target}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {hasReflections && (
                      <div>
                        <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 600, color: '#e8e8f0', marginBottom: 12 }}>
                          Reflections
                        </h3>
                        <ul className="space-y-3">
                          {Object.entries(reflections).filter(([, text]) => text?.trim()).map(([nodeId, text]) => {
                            const node = filteredData.nodes.find(n => n.id === nodeId);
                            return (
                              <li key={nodeId} className="rounded-lg p-3" style={{ background: '#06060e', border: '1px solid #1a1a30' }}>
                                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#666680' }}>{node?.label || nodeId}</span>
                                <p className="mt-2 whitespace-pre-wrap break-words" style={{ color: '#c8c8d8' }}>{text.trim().slice(0, 200)}{text.trim().length > 200 ? '…' : ''}</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="p-4 flex gap-3 justify-end shrink-0" style={{ borderTop: '1px solid #1a1a30' }}>
              <button
                type="button"
                onClick={() => setShowPathModal(false)}
                className="px-5 py-2 rounded transition-all duration-150"
                style={{
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  fontSize: 12,
                  background: 'transparent',
                  border: '1px solid #1a1a30',
                  color: '#666680',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={downloadPathMarkdown}
                className="px-5 py-2 rounded transition-all duration-150"
                style={{
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#2ecc71',
                  border: 'none',
                  color: '#000',
                }}
              >
                Download .md
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
