'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WGBadge from '@/components/shared/WGBadge';
import { BLOCK14_TIMETABLE } from '@/lib/block14/sessions';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

interface CastEntry {
  id: string;
  sessionId: string;
  sessionTitle: string;
  workingGroup: string;
  mageQuery: string;
  mageResponse: string;
  addedAt: string;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trim() + '…';
}

export default function HomeCastBoard() {
  const [entries, setEntries] = useState<CastEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/spellbook/entries')
      .then((res) => res.json())
      .then((data) => {
        const list: CastEntry[] = data.entries ?? [];
        list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        setEntries(list.slice(0, 15));
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col min-h-[16rem]">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)] flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">Cast board</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Recent Mage casts</p>
        </div>
        <Link href="/spellbook" className="text-xs text-[var(--mage)] hover:underline">View all →</Link>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[20rem]">
        {loading ? (
          <p className="text-[var(--text-muted)] text-sm py-2">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm py-2">No casts yet. Use 🔮 Cast to session in Mages.</p>
        ) : (
          entries.map((e) => {
            const session = BLOCK14_TIMETABLE.find((s) => s.id === e.sessionId);
            return (
              <div
                key={e.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2.5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <WGBadge wg={e.workingGroup} emoji={WG_EMOJI[e.workingGroup] ?? '📄'} />
                  <span className="text-xs text-[var(--text-muted)]">→ {session?.title ?? e.sessionTitle ?? e.sessionId}</span>
                </div>
                <p className="text-xs font-medium text-[var(--mage)]">Q: {truncate(e.mageQuery, 60)}</p>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">{truncate(e.mageResponse, 100)}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{new Date(e.addedAt).toLocaleString()}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
