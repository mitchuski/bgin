'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { localDB } from '@/lib/storage/local';
import FeedCard from '@/components/dashboard/FeedCard';
import type { FeedItem } from '@/app/api/curation/feed/route';

const WGS = [
  { id: 'ikp', name: 'Identity, Key Management & Privacy', emoji: '🔐' },
  { id: 'fase', name: 'Financial Applications & Stablecoin Ecosystem', emoji: '💎' },
  { id: 'cyber', name: 'Cybersecurity', emoji: '🛡️' },
  { id: 'governance', name: 'Internal Governance', emoji: '🏛️' },
] as const;

export default function MageHubPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = (workingGroups: string) => {
      fetch(`/api/curation/feed?workingGroups=${workingGroups}&limit=50&offset=0`, { method: 'GET' })
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .then((data) => {
          if (data.items) setFeedItems(data.items);
          else setFeedError('Could not load knowledge');
        })
        .catch((e) => setFeedError(e instanceof Error ? e.message : 'Failed'))
        .finally(() => setFeedLoading(false));
    };
    if (!localDB) {
      loadFeed('ikp,fase,governance,cyber');
      return;
    }
    localDB.agentCard.toCollection().first().then((card) => {
      const wgs = card?.workingGroups?.length ? card.workingGroups.join(',') : 'ikp,fase,cyber,governance';
      loadFeed(wgs);
    });
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Block 14
      </Link>
      <h1 className="text-2xl font-bold mb-6">📚 Archive</h1>

      {/* Talk to a Mage */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Talk to a Mage</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Choose a working group to chat with its Mage.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {WGS.map((wg) => (
            <Link
              key={wg.id}
              href={`/mage/${wg.id}`}
              className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--mage)] transition-colors"
            >
              <span className="text-xl">{wg.emoji}</span>
              <span className="ml-2 font-medium">{wg.name}</span>
              <p className="text-sm text-[var(--text-muted)] mt-2">Enter →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Block 14 briefings & Knowledge map */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Block 14 briefings & Knowledge map</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/briefing?meetingId=block-14"
            className="rounded-lg border border-[var(--border)] px-4 py-2 bg-[var(--bg-secondary)] text-sm hover:border-[var(--mage)] transition-colors"
          >
            📋 Block 14 Briefing
          </Link>
          <Link
            href="/dashboard/knowledge-map"
            className="rounded-lg border border-[var(--border)] px-4 py-2 bg-[var(--bg-secondary)] text-sm hover:border-[var(--mage)] transition-colors"
          >
            🗺️ Knowledge Map
          </Link>
        </div>
      </section>

      {/* Knowledge — BGIN projects & publications */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Knowledge</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Publications and projects from BGIN working groups. Each spell links to a Mage that can help you explore the topic. Full list at{' '}
          <a href="https://bgin-global.org/projects" target="_blank" rel="noopener noreferrer" className="text-[var(--mage)] hover:underline">
            bgin-global.org/projects
          </a>.
        </p>
        {feedError && (
          <p className="text-sm text-[var(--wg-cyber)] mb-3">{feedError}</p>
        )}
        {feedLoading ? (
          <p className="text-[var(--text-muted)]">Loading knowledge…</p>
        ) : feedItems.length === 0 ? (
          <p className="text-[var(--text-muted)]">
            No knowledge for your working groups. Complete ceremony or adjust your profile to see BGIN publications and projects.
          </p>
        ) : (
          <div className="space-y-4">
            {feedItems.map((item) => (
              <FeedCard
                key={item.id}
                title={item.title}
                summary={item.summary}
                workingGroup={item.workingGroup}
                relevanceScore={item.relevanceScore}
                type={item.type}
                action={item.action}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
