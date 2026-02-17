'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import GlyphInspector from '@/components/spellbook/GlyphInspector';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';
import type { Glyph } from '@/lib/spellweb/types';
import type { SpellbookEntryInput } from '@/lib/spellweb/builder';
import { getSpellwebDummyEntries } from '@/lib/spellweb/dummyData';

const SpellwebNavigator = dynamic(
  () => import('@/components/spellbook/SpellwebNavigator'),
  { ssr: false, loading: () => (
    <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[500px] flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Loading graph…</p>
    </div>
  ) }
);

export default function SpellwebPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<SpellbookEntryInput[]>([]);
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null);
  const [grimoireFilter, setGrimoireFilter] = useState<string[]>(
    BLOCK14_WORKING_GROUPS.map((g) => g.id)
  );
  const [loading, setLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
  }, [router]);

  useEffect(() => {
    fetch('/api/spellbook/entries')
      .then((res) => res.json())
      .then((data) => {
        const apiEntries = (data.entries ?? []) as SpellbookEntryInput[];
        if (apiEntries.length > 0) {
          setEntries(apiEntries);
          setUsingDummyData(false);
        } else {
          setEntries(getSpellwebDummyEntries());
          setUsingDummyData(true);
        }
      })
      .catch(() => {
        setEntries(getSpellwebDummyEntries());
        setUsingDummyData(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleGrimoire = (wg: string) => {
    setGrimoireFilter((prev) =>
      prev.includes(wg) ? prev.filter((g) => g !== wg) : [...prev, wg]
    );
  };

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
      <Link
        href="/spellbook"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block"
      >
        ← Spellbook
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🕸️ Spellweb</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Navigate the threads between spells, sessions, and grimoires
        </p>
        {usingDummyData && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Showing demo data. Add casts via Mages or connect the Spellbook API for live data.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {BLOCK14_WORKING_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => toggleGrimoire(g.id)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              grimoireFilter.includes(g.id)
                ? 'border-[var(--mage)] bg-[var(--mage)]/10 text-[var(--text-primary)]'
                : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[500px] flex items-center justify-center">
              <p className="text-[var(--text-muted)]">Weaving the Spellweb…</p>
            </div>
          ) : (
            <SpellwebNavigator
              entries={entries}
              onGlyphSelect={setSelectedGlyph}
              grimoireFilter={grimoireFilter}
            />
          )}
        </div>
        <div className="lg:col-span-1">
          <GlyphInspector glyph={selectedGlyph} />
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
        <h3 className="text-sm font-semibold mb-3">Legend</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#3B82F6]" /> IKP Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#8B5CF6]" /> FASE Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#10B981]" /> Cyber Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#F59E0B]" /> Governance Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#EF4444]" /> Cross-WG Thread
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#E5E7EB]" /> Standard Strand
          </div>
        </div>
      </div>
    </main>
  );
}
