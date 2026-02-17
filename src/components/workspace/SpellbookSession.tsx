'use client';

import { useEffect, useState } from 'react';
import SourceReference from '@/components/mage/SourceReference';
import CrossWgHint from '@/components/mage/CrossWgHint';

interface SpellbookEntry {
  id: string;
  sessionId: string;
  workingGroup: string;
  participantTier: 'blade' | 'light' | 'heavy' | 'dragon';
  mageQuery: string;
  mageResponse: string;
  sources: Array<{ documentTitle: string; documentDate: string; relevanceScore?: number }>;
  crossWgRefs: Array<{ workingGroup: string; topic: string; hint?: string }>;
  addedAt: string;
  attributionLevel: 'full' | 'role_only' | 'anonymous';
}

const TIER_LABELS: Record<string, string> = {
  blade: 'Blade Tier',
  light: 'Light Tier',
  heavy: 'Heavy Tier',
  dragon: 'Dragon Tier',
};

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

interface Props {
  sessionId: string;
  sessionTitle: string;
}

export default function SpellbookSession({ sessionId, sessionTitle }: Props) {
  const [entries, setEntries] = useState<SpellbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [sessionId]);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/spellbook/entries?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return <p className="text-[var(--text-muted)] text-sm">Loading contributions...</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6 text-center">
        <p className="text-[var(--text-muted)]">No contributions yet for this session.</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Use the Mage chat to explore topics and post insights to the spellbook.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{sessionTitle}</h2>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {entries.length} contribution{entries.length !== 1 ? 's' : ''} from Mage interactions
      </p>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{WG_EMOJI[entry.workingGroup] ?? '🧙'}</span>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase">
                  {entry.workingGroup} Mage
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                  {TIER_LABELS[entry.participantTier]}
                </span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">{formatTime(entry.addedAt)}</span>
            </div>

            {/* Query */}
            <div className="mb-3">
              <span className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                Query
              </span>
              <p className="text-sm text-[var(--text-secondary)] italic">"{entry.mageQuery}"</p>
            </div>

            {/* Response */}
            <div className="mb-3">
              <span className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                Mage Response
              </span>
              <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                {entry.mageResponse}
              </div>
            </div>

            {/* Sources */}
            {entry.sources && entry.sources.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                  Sources
                </span>
                <div className="space-y-1">
                  {entry.sources.map((s, i) => (
                    <SourceReference
                      key={i}
                      title={s.documentTitle}
                      date={s.documentDate}
                      relevance={s.relevanceScore}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cross-WG References */}
            {entry.crossWgRefs && entry.crossWgRefs.length > 0 && (
              <div>
                <span className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                  Cross-WG References
                </span>
                {entry.crossWgRefs.map((r, i) => (
                  <CrossWgHint
                    key={i}
                    workingGroup={r.workingGroup}
                    topic={r.topic}
                    hint={r.hint}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
