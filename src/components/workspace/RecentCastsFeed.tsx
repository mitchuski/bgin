'use client';

import { useState, useEffect, useRef } from 'react';
import WGBadge from '@/components/shared/WGBadge';
import InscribeProverbButton from '@/components/shared/InscribeProverbButton';
import LearnButton from '@/components/shared/LearnButton';
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
  sources?: Array<{ documentTitle: string; documentDate?: string }>;
  crossWgRefs?: Array<{ workingGroup: string; topic: string }>;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trim() + '…';
}

export default function RecentCastsFeed({ embedded }: { embedded?: boolean }) {
  const [entries, setEntries] = useState<CastEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (expandedId && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedId]);

  const content = loading ? (
    <div className="p-4 flex items-center justify-center min-h-[12rem]">
      <p className="text-[var(--text-muted)] text-sm">Loading recent casts…</p>
    </div>
  ) : (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 min-h-[12rem]">
      {entries.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm py-4">No casts yet. Use Cast to session or Cast to spellbook in a Mage chat to add.</p>
      ) : (
        entries.map((e) => {
          const session = BLOCK14_TIMETABLE.find((s) => s.id === e.sessionId);
          const isExpanded = expandedId === e.id;
          return (
            <div
              key={e.id}
              ref={isExpanded ? expandedRef : undefined}
              role="button"
              tabIndex={0}
              onClick={() => setExpandedId(isExpanded ? null : e.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  setExpandedId(isExpanded ? null : e.id);
                }
              }}
              className={`rounded-lg border bg-[var(--bg-primary)] p-3 shadow-sm cursor-pointer transition-colors text-left ${
                isExpanded ? 'border-[var(--mage)] ring-1 ring-[var(--mage)]/30' : 'border-[var(--border)] hover:border-[var(--mage)]/50'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <WGBadge wg={e.workingGroup} emoji={WG_EMOJI[e.workingGroup] ?? '📄'} />
                <span className="text-xs text-[var(--text-muted)]">→</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {session?.title ?? e.sessionTitle ?? e.sessionId}
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--mage)] mb-1">Q: {isExpanded ? e.mageQuery : truncate(e.mageQuery, 80)}</p>
              <p className={`text-sm text-[var(--text-secondary)] ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                {isExpanded ? e.mageResponse : truncate(e.mageResponse, 160)}
              </p>
              {isExpanded && (e.sources?.length ?? 0) > 0 && (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Sources: {e.sources!.map((s) => s.documentTitle).join(', ')}
                </p>
              )}
              {isExpanded && (e.crossWgRefs?.length ?? 0) > 0 && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Cross-WG: {e.crossWgRefs!.map((r) => r.workingGroup).join(', ')}
                </p>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {new Date(e.addedAt).toLocaleString()}
                {isExpanded && <span className="ml-2 text-[var(--mage)]">· Click to collapse</span>}
              </p>
              <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-3" onClick={(ev) => ev.stopPropagation()}>
                <LearnButton
                  text={`Q: ${e.mageQuery}\n\n${e.mageResponse}${(e.sources?.length ?? 0) > 0 ? `\n\nSources: ${e.sources!.map((s) => s.documentTitle).join(', ')}` : ''}${(e.crossWgRefs?.length ?? 0) > 0 ? `\n\nCross-WG: ${e.crossWgRefs!.map((r) => r.workingGroup).join(', ')}` : ''}`}
                  title="Copy cast"
                />
                <InscribeProverbButton castEntryId={e.id} workingGroup={e.workingGroup} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="flex flex-col min-h-0 flex-1">
        {content}
      </div>
    );
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
