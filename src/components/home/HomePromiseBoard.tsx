'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import WGBadge from '@/components/shared/WGBadge';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

const WGS = ['ikp', 'fase', 'cyber', 'governance'];

interface PromiseRow {
  id: string;
  workingGroup: string;
  type: string;
  description: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export default function HomePromiseBoard() {
  const [promises, setPromises] = useState<PromiseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    getParticipantId().then((pid) => setAuthenticated(!!pid));
    Promise.all(
      WGS.map((wg) =>
        fetch(`/api/promises?wg=${encodeURIComponent(wg)}`, { method: 'GET' })
          .then((r) => (r.ok ? r.json() : { promises: [] }))
          .then((d) => (d.promises ?? []) as PromiseRow[])
          .catch(() => [] as PromiseRow[])
      )
    )
      .then((arrays) => {
        const merged = arrays.flat();
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPromises(merged.slice(0, 15));
      })
      .catch(() => setPromises([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col min-h-[16rem]">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)] flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">🤝 Promises</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Recent voluntary commitments</p>
        </div>
        <Link href="/spellbook" className="text-xs text-[var(--mage)] hover:underline">View all →</Link>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[20rem]">
        {loading ? (
          <p className="text-[var(--text-muted)] text-sm py-2">Loading…</p>
        ) : !authenticated ? (
          <p className="text-[var(--text-muted)] text-sm py-2">
            <Link href="/ceremony" className="text-[var(--mage)] hover:underline">Complete ceremony</Link> to see promises.
          </p>
        ) : promises.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm py-2">No promises yet. Add some in <Link href="/spellbook" className="text-[var(--mage)] hover:underline">Spellbook</Link>.</p>
        ) : (
          promises.map((p) => (
            <Link
              key={p.id}
              href={`/promises#${p.workingGroup}`}
              className="block rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2.5 shadow-sm hover:border-[var(--mage)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <WGBadge wg={p.workingGroup} emoji={WG_EMOJI[p.workingGroup] ?? '📄'} />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{p.type}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-auto">{p.status}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{p.description}</p>
              {p.dueDate && (
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Due: {new Date(p.dueDate).toLocaleDateString()}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
