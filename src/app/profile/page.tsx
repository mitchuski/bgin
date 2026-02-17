'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { localDB } from '@/lib/storage/local';
import type { AgentCard } from '@/lib/ceremony/agentCard';
import { getParticipantId, signedFetch } from '@/lib/swordsman/signedFetch';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

interface ProverbRow {
  id: string;
  workingGroup: string;
  content: string;
  sourceType: string;
  createdAt: string;
}

interface CastRow {
  id: string;
  sessionTitle: string;
  workingGroup: string;
  mageQuery: string;
  mageResponse: string;
  addedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [card, setCard] = useState<AgentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [myProverbsExpanded, setMyProverbsExpanded] = useState(false);
  const [myCastsExpanded, setMyCastsExpanded] = useState(false);
  const [myProverbs, setMyProverbs] = useState<ProverbRow[]>([]);
  const [myCasts, setMyCasts] = useState<CastRow[]>([]);
  const [proverbsLoading, setProverbsLoading] = useState(false);
  const [castsLoading, setCastsLoading] = useState(false);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) {
        setLoading(false);
        router.replace('/ceremony');
        return;
      }
      if (!localDB) {
        setLoading(false);
        return;
      }
      localDB.agentCard.toCollection().first().then((c) => {
        setCard(c ?? null);
        setLoading(false);
      });
    });
  }, [router]);

  const fetchMyProverbs = useCallback(async () => {
    setProverbsLoading(true);
    try {
      const res = await signedFetch('/api/proverbs?mine=1&limit=30', { method: 'GET' });
      const data = await res.json();
      setMyProverbs(data.proverbs ?? []);
    } catch {
      setMyProverbs([]);
    } finally {
      setProverbsLoading(false);
    }
  }, []);

  const fetchMyCasts = useCallback(async () => {
    setCastsLoading(true);
    try {
      const res = await signedFetch('/api/spellbook/entries?mine=1', { method: 'GET' });
      const data = await res.json();
      setMyCasts(data.entries ?? []);
    } catch {
      setMyCasts([]);
    } finally {
      setCastsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (myProverbsExpanded) fetchMyProverbs();
  }, [myProverbsExpanded, fetchMyProverbs]);

  useEffect(() => {
    if (myCastsExpanded) fetchMyCasts();
  }, [myCastsExpanded, fetchMyCasts]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto">
        <p className="text-[var(--text-muted)]">Loading profile…</p>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto">
        <p className="text-[var(--text-secondary)]">No Swordsman found. Complete BGIN Ceremony to create your identity.</p>
        <Link href="/ceremony" className="text-[var(--mage)] hover:underline mt-2 inline-block">Go to BGIN Ceremony</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Block 14
      </Link>
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6">
        Your BGIN ID and Swordsman identity.
      </p>
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] space-y-4">
        {card.displayName && (
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Display name</p>
            <p className="text-lg font-medium text-[var(--text-primary)]">⚔️ {card.displayName}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Participant ID</p>
          <p className="text-sm font-mono text-[var(--text-secondary)] break-all">{card.participantId}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Trust tier</p>
          <p className="text-sm text-[var(--text-secondary)] capitalize">{card.trustTier}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Working groups</p>
          <p className="flex flex-wrap gap-2 mt-1">
            {card.workingGroups.map((wg) => (
              <span key={wg} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-sm bg-[var(--bg-tertiary)]">
                {WG_EMOJI[wg] ?? '📄'} {wg.toUpperCase()}
              </span>
            ))}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Privacy</p>
          <p className="text-sm text-[var(--text-secondary)]">Attribution: {card.privacy.attributionLevel}</p>
        </div>
      </div>

      {/* My proverbs — expandable */}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        <button
          type="button"
          onClick={() => setMyProverbsExpanded((e) => !e)}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border)]"
        >
          <h2 className="font-semibold text-[var(--text-primary)]">✦ My proverbs</h2>
          <span className="text-[var(--text-muted)]" aria-hidden>{myProverbsExpanded ? '▼' : '▶'}</span>
        </button>
        {myProverbsExpanded && (
          <div className="p-4 max-h-[24rem] overflow-y-auto">
            {proverbsLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading…</p>
            ) : myProverbs.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No proverbs yet. Inscribe from a Mage response or on a cast in the Spellbook.</p>
            ) : (
              <ul className="space-y-3">
                {myProverbs.map((p) => (
                  <li key={p.id} className="rounded-lg border border-[var(--border)] p-3 bg-[var(--bg-primary)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{WG_EMOJI[p.workingGroup] ?? '📄'}</span>
                      <span className="text-xs text-[var(--text-muted)] uppercase">{p.workingGroup}</span>
                      <span className="text-xs text-[var(--text-muted)]">{new Date(p.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{p.content}</p>
                  </li>
                ))}
              </ul>
            )}
            {myProverbs.length > 0 && (
              <Link href="/proverb" className="text-sm text-[var(--mage)] hover:underline mt-3 inline-block">View all proverbs →</Link>
            )}
          </div>
        )}
      </div>

      {/* My casts — expandable */}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        <button
          type="button"
          onClick={() => setMyCastsExpanded((e) => !e)}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border)]"
        >
          <h2 className="font-semibold text-[var(--text-primary)]">🔮 My casts</h2>
          <span className="text-[var(--text-muted)]" aria-hidden>{myCastsExpanded ? '▼' : '▶'}</span>
        </button>
        {myCastsExpanded && (
          <div className="p-4 max-h-[24rem] overflow-y-auto">
            {castsLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading…</p>
            ) : myCasts.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No casts yet. Use Cast to session or Cast to spellbook in a Mage chat.</p>
            ) : (
              <ul className="space-y-4">
                {myCasts.map((e) => (
                  <li key={e.id} className="rounded-lg border border-[var(--border)] p-3 bg-[var(--bg-primary)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{WG_EMOJI[e.workingGroup] ?? '📄'}</span>
                      <span className="text-xs text-[var(--text-muted)]">{e.sessionTitle}</span>
                      <span className="text-xs text-[var(--text-muted)]">{new Date(e.addedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs font-medium text-[var(--mage)] mb-1">Q: {e.mageQuery.length > 60 ? e.mageQuery.slice(0, 60) + '…' : e.mageQuery}</p>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{e.mageResponse.slice(0, 160)}{e.mageResponse.length > 160 ? '…' : ''}</p>
                    <Link href="/spellbook" className="text-xs text-[var(--mage)] hover:underline mt-2 inline-block">Open Spellbook →</Link>
                  </li>
                ))}
              </ul>
            )}
            {myCasts.length > 0 && (
              <Link href="/spellbook" className="text-sm text-[var(--mage)] hover:underline mt-3 inline-block">View Spellbook →</Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)]">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Community</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Join the BGIN Forum to discuss working groups, Block 14, and blockchain governance with the network.
        </p>
        <a
          href="https://bgin.discourse.group/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:border-[var(--mage)] hover:text-[var(--mage)] transition-colors"
        >
          Open BGIN Forum →
        </a>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          <a href="https://bgin.discourse.group/" target="_blank" rel="noopener noreferrer" className="hover:underline">bgin.discourse.group</a>
        </p>
      </div>
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Settings</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/settings"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:border-[var(--mage)] transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/ceremony"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:border-[var(--mage)] hover:text-[var(--mage)] transition-colors"
          >
            BGIN Ceremony
          </Link>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Run or re-run the ceremony to create or replace your Swordsman identity.
        </p>
      </div>
    </main>
  );
}
