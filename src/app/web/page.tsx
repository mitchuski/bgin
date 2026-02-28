'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';
import type { SpellbookEntryInput } from '@/lib/spellweb/builder';
import type { ProverbInput } from '@/lib/spellweb/builder-agentic';
import { buildAgenticSpellweb } from '@/lib/spellweb/builder-agentic';
import { getSpellwebDummyEntries } from '@/lib/spellweb/dummyData';

const SpellwebViewerAgentic = dynamic(
  () => import('@/components/spellbook/SpellwebViewerAgentic'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[300px] text-[var(--text-muted)]">
        Loading Web…
      </div>
    ),
  }
);

// WG color mapping for legend
const WG_COLORS: Record<string, string> = {
  ikp: '#3B82F6',
  fase: '#8B5CF6',
  cyber: '#10B981',
  governance: '#F59E0B',
};

export default function WebPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<SpellbookEntryInput[]>([]);
  const [proverbs, setProverbs] = useState<ProverbInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
  }, [router]);

  const fetchData = useCallback(() => {
    Promise.all([
      fetch('/api/spellbook/entries').then((res) => res.json()),
      fetch('/api/proverbs').then((res) => res.json()),
    ])
      .then(([entriesData, proverbsData]) => {
        const apiEntries = (entriesData.entries ?? []) as SpellbookEntryInput[];
        const apiProverbs = (proverbsData.proverbs ?? []) as ProverbInput[];
        if (apiEntries.length > 0) {
          setEntries(apiEntries);
          setUsingDummyData(false);
        } else {
          setEntries(getSpellwebDummyEntries());
          setUsingDummyData(true);
        }
        setProverbs(apiProverbs);
      })
      .catch(() => {
        setEntries(getSpellwebDummyEntries());
        setUsingDummyData(true);
        setProverbs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when page becomes visible
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchData]);

  const spellwebData = useMemo(
    () => buildAgenticSpellweb(entries, proverbs),
    [entries, proverbs]
  );

  // All WGs always shown
  const allWgIds = BLOCK14_WORKING_GROUPS.map((g) => g.id);

  return (
    <main className="flex flex-col flex-1 min-h-0">
      {/* Top bar */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)]"
          >
            ← Home
          </Link>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            🕸️ Web
          </h1>
          {usingDummyData && (
            <span className="text-xs text-[var(--text-muted)]">
              Demo data
            </span>
          )}
        </div>
        {/* Legend: WG colors + emoji (display only, no toggle) */}
        <div className="flex items-center gap-3">
          {BLOCK14_WORKING_GROUPS.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: WG_COLORS[g.id] }}
              />
              <span>{g.emoji}</span>
              <span>{g.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span>✦</span>
            <span>Proverb</span>
          </div>
        </div>
      </div>

      {/* Full-height graph with integrated right panel */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            Weaving the Web…
          </div>
        ) : (
          <SpellwebViewerAgentic
            data={spellwebData}
            grimoireFilter={allWgIds}
            fullHeight
          />
        )}
      </div>
    </main>
  );
}
