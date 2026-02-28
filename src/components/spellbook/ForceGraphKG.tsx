'use client';

/**
 * ForceGraphKG — D3-powered force-directed graph for knowledge graph visualization.
 * Imported from agentprivacy_master with adaptations for BGINAI.
 *
 * Features:
 * - Guild-based coloring (swordsman/mage/emergent/bridge)
 * - Maturity-based sizing (concept→deployed)
 * - Complexity encoded as polygon sides (3-6)
 * - Edge type styling (dashed, gradient, arrows)
 */

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { SpellwebKGNode, SpellwebKGEdge } from '@/lib/spellweb/kg-types';
import { GUILD_COLORS, MATURITY_SIZES } from '@/lib/spellweb/kg-types';

type SimNode = SpellwebKGNode & { x?: number; y?: number; vx?: number; vy?: number };
type SimLink = SpellwebKGEdge & { source: SimNode; target: SimNode };

function polygonPoints(sides: number, radius: number): string {
  if (sides <= 1) return '';
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
    return `${radius * Math.cos(angle)},${radius * Math.sin(angle)}`;
  }).join(' ');
}

interface ForceGraphKGProps {
  nodes: SpellwebKGNode[];
  edges: SpellwebKGEdge[];
  onNodeClick?: (node: SpellwebKGNode) => void;
}

export default function ForceGraphKG({ nodes, edges, onNodeClick }: ForceGraphKGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });
  const [hoveredNode, setHoveredNode] = useState<SpellwebKGNode | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 800, height: 520 };
      setDimensions({ width: Math.max(100, width), height: Math.max(100, height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (nodes.length === 0) return;
    const width = dimensions.width;
    const height = dimensions.height;
    const simNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: height / 2 + (Math.random() - 0.5) * height * 0.6,
    }));
    const initialPos = new Map<string, { x: number; y: number }>();
    simNodes.forEach((n) => {
      if (n.x != null && n.y != null) initialPos.set(n.id, { x: n.x, y: n.y });
    });
    setPositions(initialPos);

    const simLinks: SimLink[] = edges.map((e) => {
      const source = simNodes.find((n) => n.id === e.source);
      const target = simNodes.find((n) => n.id === e.target);
      if (!source || !target) return null;
      return { ...e, source, target };
    }).filter(Boolean) as SimLink[];

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        'link',
        d3
          .forceLink(simLinks)
          .distance((d: SimLink) => 120 - d.strength * 80)
          .strength((d: SimLink) => d.strength * 0.3)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force(
        'collide',
        d3.forceCollide<SimNode>().radius((d) => MATURITY_SIZES[d.maturity] + 4)
      )
      .on('tick', () => {
        const next = new Map<string, { x: number; y: number }>();
        simNodes.forEach((n) => {
          if (n.x != null && n.y != null) next.set(n.id, { x: n.x, y: n.y });
        });
        setPositions(new Map(next));
      });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, dimensions.width, dimensions.height]);

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    zoomRef.current = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 4]).on('zoom', (ev) => {
      const g = svg.querySelector('g.zoom-group');
      if (g) (g as SVGElement).setAttribute('transform', ev.transform.toString());
    });
    d3.select(svg).call(zoomRef.current);
    return () => {
      d3.select(svg).on('.zoom', null);
    };
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[520px] flex items-center justify-center" style={{ color: '#666680', fontFamily: '"IBM Plex Sans", sans-serif' }}>
        No nodes
      </div>
    );
  }

  const { width, height } = dimensions;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[520px] relative" style={{ background: '#06060e' }}>
      <svg ref={svgRef} width={width} height={height} className="bg-transparent overflow-visible">
        <defs>
          {/* Spellweb glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gradient-amber-violet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#7b68ee" />
          </linearGradient>
          <marker id="arrow" viewBox="0 -5 10 10" refX="12" refY="0" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="#666680" />
          </marker>
        </defs>
        <g className="zoom-group">
          {/* Edges - spellweb styled */}
          <g className="edges">
            {edges.map((edge, i) => {
              const srcPos = positions.get(edge.source);
              const tgtPos = positions.get(edge.target);
              if (!srcPos || !tgtPos) return null;
              const isPrincipleExtends = edge.type === 'principle_extends';
              const isDashed = edge.type === 'inscription_echo' || edge.type === 'dependency';
              const stroke = edge.type === 'guild_bridge' ? 'url(#gradient-amber-violet)' : '#444460';
              const strokeWidth = 0.8 + edge.strength * 1.5;
              return (
                <line
                  key={`${edge.source}-${edge.target}-${i}`}
                  x1={srcPos.x}
                  y1={srcPos.y}
                  x2={tgtPos.x}
                  y2={tgtPos.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isDashed ? '4 4' : undefined}
                  markerEnd={isPrincipleExtends ? 'url(#arrow)' : undefined}
                  opacity={edge.type === 'dependency' ? 0.35 : 0.5}
                />
              );
            })}
          </g>
          {/* Nodes - spellweb styled with glow */}
          <g className="nodes">
            {nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const radius = MATURITY_SIZES[node.maturity];
              const color = GUILD_COLORS[node.guild];
              const sides = Math.max(1, Math.min(6, node.complexity));
              const isHovered = hoveredNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => onNodeClick?.(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  filter={isHovered ? 'url(#glowStrong)' : 'url(#glow)'}
                  style={{ transition: 'filter 0.15s ease' }}
                >
                  {sides <= 1 ? (
                    <circle
                      r={radius}
                      fill={color}
                      stroke={isHovered ? '#ffd700' : `${color}80`}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      opacity={isHovered ? 1 : 0.85}
                    />
                  ) : (
                    <polygon
                      points={polygonPoints(sides, radius)}
                      fill={color}
                      stroke={isHovered ? '#ffd700' : `${color}80`}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      opacity={isHovered ? 1 : 0.85}
                    />
                  )}
                  <text
                    y={radius + 8}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    fill="#c8c8d8"
                    fontSize={9}
                    fontWeight="500"
                    fontFamily="'IBM Plex Sans', sans-serif"
                    opacity={isHovered ? 1 : 0.8}
                  >
                    {node.label.length > 22 ? node.label.slice(0, 21) + '…' : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      {/* Hover tooltip - spellweb styled */}
      {hoveredNode && (
        <div
          className="absolute bottom-5 left-5 rounded-lg px-4 py-3 shadow-2xl max-w-xs"
          style={{
            background: 'rgba(12, 12, 24, 0.95)',
            border: '1px solid #1a1a30',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#e8e8f0',
          }}>
            {hoveredNode.label}
          </div>
          <div style={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: 12,
            color: '#666680',
            marginTop: 6,
            lineHeight: 1.4,
          }}>
            {hoveredNode.summary}
          </div>
          <div className="flex gap-2 mt-3">
            <span
              className="px-2 py-1 rounded text-xs"
              style={{
                background: GUILD_COLORS[hoveredNode.guild],
                color: '#000',
                fontFamily: '"IBM Plex Sans", sans-serif',
                fontWeight: 500,
              }}
            >
              {hoveredNode.guild}
            </span>
            <span className="px-2 py-1 rounded text-xs" style={{ background: '#12121a', color: '#8888a0' }}>
              {hoveredNode.maturity}
            </span>
            <span className="px-2 py-1 rounded text-xs" style={{ background: '#12121a', color: '#8888a0' }}>
              {hoveredNode.type}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
