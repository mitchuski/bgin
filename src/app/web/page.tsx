'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import GlyphInspector from '@/components/spellbook/GlyphInspector';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';
import type { Glyph } from '@/lib/spellweb/types';
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

export default function WebPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<SpellbookEntryInput[]>([]);
  const [proverbs, setProverbs] = useState<ProverbInput[]>([]);
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null);
  const [grimoireFilter, setGrimoireFilter] = useState<string[]>(
    BLOCK14_WORKING_GROUPS.map((g) => g.id)
  );
  const [loading, setLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
  }, [router]);

  useEffect(() => {
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

  const spellwebData = useMemo(
    () => buildAgenticSpellweb(entries, proverbs),
    [entries, proverbs]
  );

  const toggleGrimoire = (wg: string) => {
    setGrimoireFilter((prev) =>
      prev.includes(wg) ? prev.filter((g) => g !== wg) : [...prev, wg]
    );
  };

  return (
    <main className="flex flex-col h-[calc(100vh-3.5rem)] min-h-0">
      {/* Slim top bar */}
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
        <div className="flex items-center gap-2">
          {BLOCK14_WORKING_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGrimoire(g.id)}
              className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                grimoireFilter.includes(g.id)
                  ? 'border-[var(--mage)] bg-[var(--mage)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-muted)]'
              }`}
            >
              {g.emoji} {g.label}
            </button>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLegendOpen((o) => !o)}
              className="px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                <div className="absolute right-0 top-full mt-1 z-20 w-56 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg text-xs text-[var(--text-secondary)]">
                  <div className="grid gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#3B82F6]" /> IKP
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" /> FASE
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#10B981]" /> Cyber
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#F59E0B]" /> Governance
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✦</span> Proverb
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-0.5 bg-[#f59e0b]" /> Constellation
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-0.5 border-t border-dashed border-[#94a3b8]" /> Sequence
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-height graph + optional inspector */}
      <div className="flex-1 min-h-0 flex relative">
        <div className="flex-1 min-w-0 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              Weaving the Web…
            </div>
          ) : (
            <SpellwebViewerAgentic
              data={spellwebData}
              grimoireFilter={grimoireFilter}
              onGlyphSelect={setSelectedGlyph}
              fullHeight
            />
          )}
        </div>
        {selectedGlyph && (
          <div className="absolute top-2 right-2 bottom-2 w-80 max-w-[90vw] z-20 shadow-lg rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="h-full overflow-auto">
              <GlyphInspector glyph={selectedGlyph} />
            </div>
            <button
              type="button"
              onClick={() => setSelectedGlyph(null)}
              className="absolute top-2 right-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
