'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getParticipantId, signedFetch } from '@/lib/swordsman/signedFetch';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import LearnButton from '@/components/shared/LearnButton';

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
  const [proverbs, setProverbs] = useState<ProverbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWg, setFilterWg] = useState<string | null>(null);
  const [castOpen, setCastOpen] = useState(false);
  const [castContent, setCastContent] = useState('');
  const [castWg, setCastWg] = useState(BLOCK14_WORKING_GROUPS[0]?.id ?? 'ikp');
  const [castLoading, setCastLoading] = useState(false);
  const [castSuccess, setCastSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterWg) params.set('workingGroup', filterWg);
    fetch(`/api/proverbs?${params.toString()}&limit=80`)
      .then((res) => res.json())
      .then((data) => setProverbs(data.proverbs ?? []))
      .catch(() => setProverbs([]))
      .finally(() => setLoading(false));
  }, [filterWg]);

  const fetchProverbs = () => {
    const params = new URLSearchParams();
    if (filterWg) params.set('workingGroup', filterWg);
    return fetch(`/api/proverbs?${params.toString()}&limit=80`)
      .then((res) => res.json())
      .then((data) => setProverbs(data.proverbs ?? []));
  };

  const submitCast = async () => {
    if (!castContent.trim()) return;
    setCastLoading(true);
    setCastSuccess(null);
    try {
      const res = await signedFetch('/api/proverbs', {
        method: 'POST',
        body: JSON.stringify({
          content: castContent.trim(),
          workingGroup: castWg,
          sourceType: 'mage_response',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCastSuccess('Proverb cast.');
        setCastContent('');
        await fetchProverbs();
        setTimeout(() => {
          setCastOpen(false);
          setCastSuccess(null);
        }, 1500);
      } else {
        setCastSuccess(data.message ?? 'Failed to cast');
      }
    } catch (e) {
      setCastSuccess(e instanceof Error ? e.message : 'Failed to cast');
    } finally {
      setCastLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Block 14
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">✦ Proverbs</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Relationship Proverb Protocol (RPP): proverbs connect seeker context to the tale. Inscribe from Mage responses or agree on casts; this feed informs the promise and trust graphs.
          </p>
        </div>
        <Button
          onClick={() => {
            setCastOpen(true);
            setCastContent('');
            setCastSuccess(null);
            setCastWg(BLOCK14_WORKING_GROUPS[0]?.id ?? 'ikp');
          }}
        >
          ✦ Cast proverb
        </Button>
      </div>

      <Modal
        open={castOpen}
        onClose={() => { setCastOpen(false); setCastContent(''); setCastSuccess(null); }}
        title="✦ Cast proverb"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Inscribe a proverb from your own context. It will appear in the feed and inform the trust graph.
        </p>
        {castSuccess && (
          <p className="text-sm mb-3 text-[var(--mage)]">{castSuccess}</p>
        )}
        <div className="mb-3">
          <label className="block text-xs text-[var(--text-muted)] mb-1">Working group</label>
          <select
            value={castWg}
            onChange={(e) => setCastWg(e.target.value as 'ikp' | 'fase' | 'cyber' | 'governance')}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--mage)] focus:outline-none"
            disabled={castLoading}
          >
            {BLOCK14_WORKING_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.emoji} {g.label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={castContent}
          onChange={(e) => setCastContent(e.target.value)}
          placeholder="Your proverb…"
          rows={3}
          className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-y"
          disabled={castLoading}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => { setCastOpen(false); setCastContent(''); setCastSuccess(null); }}
          >
            Cancel
          </Button>
          <Button onClick={submitCast} disabled={castLoading || !castContent.trim()}>
            {castLoading ? '…' : 'Cast'}
          </Button>
        </div>
      </Modal>

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
                <span className="text-xs text-[var(--text-muted)] ml-auto flex items-center gap-2">
                  <LearnButton text={p.content} title="Copy proverb" />
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
