'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

interface ProverbRow {
  id: string;
  participantId: string;
  workingGroup: string;
  content: string;
  sourceType: 'mage_response' | 'cast_inscription' | 'cast_agreement';
  castEntryId?: string;
  createdAt: string;
}

export default function ProverbPage() {
  const router = useRouter();
  const [proverbs, setProverbs] = useState<ProverbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWg, setFilterWg] = useState<string | null>(null);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
  }, [router]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterWg) params.set('workingGroup', filterWg);
    fetch(`/api/proverbs?${params.toString()}&limit=80`)
      .then((res) => res.json())
      .then((data) => setProverbs(data.proverbs ?? []))
      .catch(() => setProverbs([]))
      .finally(() => setLoading(false));
  }, [filterWg]);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Block 14
      </Link>
      <h1 className="text-2xl font-bold mb-2">✦ Proverbs</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6">
        Relationship Proverb Protocol (RPP): proverbs connect seeker context to the tale. Inscribe from Mage responses or agree on casts; this feed informs the promise and trust graphs.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilterWg(null)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            filterWg === null ? 'border-[var(--mage)] bg-[var(--mage)]/10' : 'border-[var(--border)] hover:border-[var(--mage)]'
          }`}
        >
          All
        </button>
        {BLOCK14_WORKING_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setFilterWg(g.id)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1 ${
              filterWg === g.id ? 'border-[var(--mage)] bg-[var(--mage)]/10' : 'border-[var(--border)] hover:border-[var(--mage)]'
            }`}
          >
            <span>{g.emoji}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--text-muted)] text-sm">Loading proverbs…</p>
      ) : proverbs.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm">
          No proverbs yet. Use <strong>✦ Inscribe proverb</strong> on a Mage response, or <strong>Inscribe proverb</strong> on a cast in the Spellbook to add one.
        </p>
      ) : (
        <ul className="space-y-4">
          {proverbs.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-secondary)]"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-lg" title={p.workingGroup}>
                  {WG_EMOJI[p.workingGroup] ?? '📄'}
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase">
                  {p.workingGroup}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {p.sourceType === 'cast_agreement' && '· Agreed on cast'}
                  {p.sourceType === 'cast_inscription' && '· Inscribed on cast'}
                  {p.sourceType === 'mage_response' && '· From Mage'}
                </span>
                <span className="text-xs text-[var(--text-muted)] ml-auto">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-[var(--text-primary)] whitespace-pre-wrap">{p.content}</p>
              {p.castEntryId && (
                <Link
                  href={`/spellbook?cast=${p.castEntryId}`}
                  className="text-xs text-[var(--mage)] hover:underline mt-2 inline-block"
                >
                  View cast →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
