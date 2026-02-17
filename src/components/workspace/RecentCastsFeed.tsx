'use client';

import { useState, useEffect } from 'react';
import WGBadge from '@/components/shared/WGBadge';
import { BLOCK14_TIMETABLE } from '@/lib/block14/sessions';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

export interface CastEntry {
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

export default function RecentCastsFeed({ embedded }: { embedded?: boolean }) {
  const [entries, setEntries] = useState<CastEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/spellbook/entries')
      .then((res) => res.json())
      .then((data) => {
        const list: CastEntry[] = data.entries ?? [];
        list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        setEntries(list);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const content = loading ? (
    <div className="p-4 flex items-center justify-center min-h-[12rem]">
      <p className="text-[var(--text-muted)] text-sm">Loading recent casts…</p>
    </div>
  ) : (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[12rem]">
      {entries.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm py-4">No casts yet. Use Cast to session or Cast to spellbook in a Mage chat to add.</p>
      ) : (
        entries.map((e) => {
          const session = BLOCK14_TIMETABLE.find((s) => s.id === e.sessionId);
          return (
            <div
              key={e.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <WGBadge wg={e.workingGroup} emoji={WG_EMOJI[e.workingGroup] ?? '📄'} />
                <span className="text-xs text-[var(--text-muted)]">→</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {session?.title ?? e.sessionTitle ?? e.sessionId}
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--mage)] mb-1">Q: {truncate(e.mageQuery, 80)}</p>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{truncate(e.mageResponse, 160)}</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {new Date(e.addedAt).toLocaleString()}
              </p>
            </div>
          );
        })
      )}
    </div>
  );

  if (embedded) {
    return <div className="flex flex-col">{content}</div>;
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col h-full min-h-[24rem]">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
        <h2 className="font-semibold text-[var(--text-primary)]">Recent casts</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Mage insights cast to sessions</p>
      </div>
      {content}
    </div>
  );
}
