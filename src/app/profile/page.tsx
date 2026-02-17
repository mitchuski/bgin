'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { localDB } from '@/lib/storage/local';
import type { AgentCard } from '@/lib/ceremony/agentCard';
import { getParticipantId } from '@/lib/swordsman/signedFetch';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

export default function ProfilePage() {
  const router = useRouter();
  const [card, setCard] = useState<AgentCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) {
        setLoading(false);
        router.replace('/ceremony');
        return;
      }
      localDB.agentCard.toCollection().first().then((c) => {
        setCard(c ?? null);
        setLoading(false);
      });
    });
  }, [router]);

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
