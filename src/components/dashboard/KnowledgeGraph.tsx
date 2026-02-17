'use client';

/** 00 Phase 6.4 — Knowledge map from episodic memory. Nodes by WG, depth = interaction count. */

import Link from 'next/link';
import type { KnowledgeNode } from '@/lib/curation/localMap';
import WGBadge from '@/components/shared/WGBadge';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  edges?: Array<{ source: string; target: string; strength: number }>;
}

export default function KnowledgeGraph({ nodes, edges = [] }: KnowledgeGraphProps) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[200px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm">
          No topics yet. Chat with a Mage to build your knowledge map.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)]">
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Topics from your episodic memory. Size = interactions. Explore with a Mage to deepen.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rounded-lg border border-[var(--border)] p-3 bg-[var(--bg-tertiary)]"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <WGBadge wg={node.workingGroup} emoji={WG_EMOJI[node.workingGroup] ?? '📄'} />
              <span className="text-xs text-[var(--text-muted)]">×{node.depth}</span>
            </div>
            <p className="font-medium text-sm break-words">{node.topic}</p>
            {node.relatedNodes.length > 0 && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Related: {node.relatedNodes.slice(0, 3).join(', ')}
                {node.relatedNodes.length > 3 ? '…' : ''}
              </p>
            )}
            <Link
              href={`/mage/${node.workingGroup}`}
              className="inline-block mt-2 text-xs text-[var(--mage)] hover:underline"
            >
              Explore with {node.workingGroup.toUpperCase()} Mage →
            </Link>
          </div>
        ))}
      </div>
      {edges.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] mt-4">
          {edges.length} connection{edges.length !== 1 ? 's' : ''} between topics
        </p>
      )}
    </div>
  );
}
