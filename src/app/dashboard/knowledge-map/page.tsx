'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { buildLocalKnowledgeMap, type KnowledgeNode } from '@/lib/curation/localMap';
import KnowledgeGraph from '@/components/dashboard/KnowledgeGraph';

export default function KnowledgeMapPage() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<Array<{ source: string; target: string; strength: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildLocalKnowledgeMap()
      .then((map) => {
        setNodes(map.nodes);
        setEdges(map.edges);
      })
      .catch(() => { setNodes([]); setEdges([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/mage" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Mage
      </Link>
      <h1 className="text-2xl font-bold mb-2">Knowledge Map</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6">
        Built from your local episodic memory. No server call — your exploration path stays on device.
      </p>
      {loading ? (
        <p className="text-[var(--text-muted)]">Loading…</p>
      ) : (
        <KnowledgeGraph nodes={nodes} edges={edges} />
      )}
    </main>
  );
}
