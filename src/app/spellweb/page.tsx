'use client';

/**
 * Spellweb — Knowledge graph visualization of tales, protocols, and standards.
 * Imported from agentprivacy_master with adaptations for BGINAI.
 *
 * Features:
 * - Force-directed graph (constellation map)
 * - Guild-based coloring (swordsman/mage/emergent/bridge)
 * - Maturity-based sizing (concept→deployed)
 * - Complexity encoded as polygon sides
 * - Edge type styling (dashed, gradient, arrows)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadSpellwebKG } from '@/lib/spellweb/kg-loader';
import type { SpellwebKGData } from '@/lib/spellweb/kg-loader';
import type { SpellwebKGNode } from '@/lib/spellweb/kg-types';
import { GUILD_COLORS, DIM_LABELS } from '@/lib/spellweb/kg-types';
import ForceGraphKG from '@/components/spellbook/ForceGraphKG';

interface NodeDetailProps {
  node: SpellwebKGNode;
  onClose: () => void;
}

function NodeDetail({ node, onClose }: NodeDetailProps) {
  const dims = node.dimensions;
  const dimValues = [dims.d1Hide, dims.d2Commit, dims.d3Prove, dims.d4Connect, dims.d5Reflect, dims.d6Delegate];

  return (
    <div
      className="absolute top-3 right-3 bottom-3 w-[380px] max-w-[90vw] z-20 shadow-2xl rounded-lg overflow-hidden"
      style={{ background: '#0c0c18', border: '1px solid #1a1a30' }}
    >
      <div className="h-full overflow-auto p-5">
        {/* Type label */}
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          color: '#666680',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: 12,
        }}>
          {node.type}
        </div>

        <div className="flex items-start justify-between mb-4">
          <h2 style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 20,
            fontWeight: 600,
            color: '#e8e8f0',
          }}>
            {node.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-xs transition-all duration-150"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              background: 'transparent',
              border: '1px solid #1a1a30',
              color: '#666680',
            }}
          >
            Close
          </button>
        </div>

        <p style={{
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: 13,
          color: '#8888a0',
          marginBottom: 16,
          lineHeight: 1.5,
        }}>
          {node.summary}
        </p>

        {/* Guild / Maturity / Type badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span
            className="px-2.5 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: GUILD_COLORS[node.guild],
              color: '#000',
              fontFamily: '"IBM Plex Sans", sans-serif',
            }}
          >
            {node.guild}
          </span>
          <span className="px-2.5 py-1 rounded text-xs" style={{ background: '#12121a', color: '#8888a0' }}>
            {node.maturity}
          </span>
          <span className="px-2.5 py-1 rounded text-xs" style={{ background: '#12121a', color: '#8888a0' }}>
            complexity: {node.complexity}
          </span>
        </div>

        {/* Dimensional profile */}
        <div className="mb-5">
          <h3 style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            color: '#666680',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 10,
          }}>
            Dimensional Profile
          </h3>
          <div className="space-y-2">
            {DIM_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span style={{ fontSize: 11, color: '#666680', width: 64, fontFamily: '"IBM Plex Sans", sans-serif' }}>{label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#12121a' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${dimValues[i] * 100}%`,
                      backgroundColor: GUILD_COLORS[node.guild],
                      boxShadow: `0 0 8px ${GUILD_COLORS[node.guild]}60`,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: '#666680', width: 32, textAlign: 'right' }}>
                  {(dimValues[i] * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy-Delegation Position */}
        <div className="mb-5">
          <h3 style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            color: '#666680',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 10,
          }}>
            Privacy ↔ Delegation
          </h3>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: '#666680' }}>Privacy</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden relative" style={{ background: '#12121a' }}>
              <div
                className="absolute top-0 bottom-0 w-1 rounded"
                style={{ left: `${node.privacyDelegationPosition * 100}%`, background: '#ffd700', boxShadow: '0 0 6px #ffd700' }}
              />
            </div>
            <span style={{ fontSize: 11, color: '#666680' }}>Delegation</span>
          </div>
        </div>

        {/* Inscriptions */}
        {node.inscriptions.length > 0 && (
          <div className="mb-5">
            <h3 style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              color: '#666680',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 10,
            }}>
              Inscriptions
            </h3>
            <div className="flex flex-wrap gap-2">
              {node.inscriptions.map((ins, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    color: '#ffd700',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    fontFamily: '"IBM Plex Sans", sans-serif',
                  }}
                >
                  "{ins}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Standards */}
        {node.standards.length > 0 && (
          <div className="mb-5">
            <h3 style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              color: '#666680',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 10,
            }}>
              Standards
            </h3>
            <div className="flex flex-wrap gap-2">
              {node.standards.map((std, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded text-xs"
                  style={{ background: '#12121a', color: '#8888a0' }}
                >
                  {std}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3 pt-3" style={{ borderTop: '1px solid #1a1a30' }}>
          {node.taleUrl && (
            <Link
              href={node.taleUrl}
              className="px-4 py-2 rounded text-xs transition-all duration-150"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#ffd700',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                fontFamily: '"IBM Plex Sans", sans-serif',
                fontWeight: 500,
              }}
            >
              Read Tale →
            </Link>
          )}
          {node.externalUrl && (
            <a
              href={node.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded text-xs transition-all duration-150"
              style={{
                background: 'transparent',
                color: '#666680',
                border: '1px solid #1a1a30',
                fontFamily: '"IBM Plex Sans", sans-serif',
              }}
            >
              External →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpellwebPage() {
  const [data, setData] = useState<SpellwebKGData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SpellwebKGNode | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    loadSpellwebKG()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load spellweb'));
  }, []);

  return (
    <main className="flex flex-col h-[calc(100vh-3.5rem)] min-h-0" style={{ background: '#06060e' }}>
      {/* Top bar - spellweb styled header */}
      <header
        className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-6 py-3"
        style={{
          background: 'rgba(12, 12, 24, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1a1a30',
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm transition-colors" style={{ color: '#666680', fontFamily: '"IBM Plex Sans", sans-serif' }}>
            ← Home
          </Link>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 18,
            fontWeight: 700,
            color: '#ffd700',
            letterSpacing: '1px',
          }}>
            ✦ SPELLWEB
          </h1>
          <span style={{ fontSize: 11, color: '#666680', fontFamily: '"IBM Plex Sans", sans-serif' }}>
            Tales, protocols, standards as constellation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/web"
            className="px-4 py-2 rounded transition-all duration-150"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              fontSize: 11,
              background: 'transparent',
              border: '1px solid #1a1a30',
              color: '#666680',
            }}
          >
            🕸️ Session Web
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLegendOpen((o) => !o)}
              className="px-4 py-2 rounded transition-all duration-150"
              style={{
                fontFamily: '"IBM Plex Sans", sans-serif',
                fontSize: 11,
                background: legendOpen ? 'rgba(255, 215, 0, 0.09)' : 'transparent',
                border: legendOpen ? '1px solid rgba(255, 215, 0, 0.25)' : '1px solid #1a1a30',
                color: legendOpen ? '#ffd700' : '#666680',
              }}
            >
              Legend
            </button>
            {legendOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setLegendOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 z-20 w-72 p-4 rounded-lg shadow-2xl"
                  style={{
                    background: '#0c0c18',
                    border: '1px solid #1a1a30',
                    fontFamily: '"IBM Plex Sans", sans-serif',
                  }}
                >
                  <h4 style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    color: '#666680',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 10,
                  }}>
                    Guild Colors
                  </h4>
                  <div className="grid gap-2 mb-4">
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: '#8888a0' }}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GUILD_COLORS.swordsman, boxShadow: `0 0 6px ${GUILD_COLORS.swordsman}` }} />
                      Swordsman (privacy)
                    </div>
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: '#8888a0' }}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GUILD_COLORS.mage, boxShadow: `0 0 6px ${GUILD_COLORS.mage}` }} />
                      Mage (delegation)
                    </div>
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: '#8888a0' }}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GUILD_COLORS.emergent, boxShadow: `0 0 6px ${GUILD_COLORS.emergent}` }} />
                      Emergent
                    </div>
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: '#8888a0' }}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GUILD_COLORS.bridge, boxShadow: `0 0 6px ${GUILD_COLORS.bridge}` }} />
                      Bridge
                    </div>
                  </div>
                  <h4 style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    color: '#666680',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 8,
                  }}>
                    Node Size = Maturity
                  </h4>
                  <div style={{ fontSize: 12, color: '#666680', marginBottom: 12 }}>concept → spec → impl → deployed</div>
                  <h4 style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    color: '#666680',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 8,
                  }}>
                    Shape = Complexity
                  </h4>
                  <div style={{ fontSize: 12, color: '#666680', marginBottom: 12 }}>triangle (3) → hexagon (6)</div>
                  <h4 style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    color: '#666680',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 8,
                  }}>
                    Edge Types
                  </h4>
                  <div className="grid gap-2" style={{ fontSize: 12, color: '#8888a0' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 16, height: 2, background: '#666680', display: 'inline-block' }} /> principle_extends
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 16, height: 0, borderTop: '2px dashed #666680', display: 'inline-block' }} /> inscription_echo
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 16, height: 2, background: 'linear-gradient(to right, #ffd700, #7b68ee)', display: 'inline-block' }} /> guild_bridge
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Graph area */}
      <div className="flex-1 min-h-0 relative" style={{ background: '#06060e' }}>
        {error && (
          <div className="rounded-lg m-4 px-5 py-4" style={{ background: 'rgba(233, 69, 96, 0.1)', border: '1px solid rgba(233, 69, 96, 0.3)', color: '#e94560' }}>
            {error}
          </div>
        )}
        {data && !error && (
          <div className="w-full h-full" style={{ background: '#06060e' }}>
            <ForceGraphKG
              nodes={data.nodes}
              edges={data.edges}
              onNodeClick={setSelectedNode}
            />
          </div>
        )}
        {!data && !error && (
          <div className="flex items-center justify-center h-full" style={{ color: '#666680', fontFamily: '"IBM Plex Sans", sans-serif' }}>
            Loading spellweb…
          </div>
        )}
        {selectedNode && (
          <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </main>
  );
}
