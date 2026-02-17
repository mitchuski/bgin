'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import RecentCastsFeed from '@/components/workspace/RecentCastsFeed';
import InscribeProverbButton from '@/components/shared/InscribeProverbButton';
import { BLOCK14_TIMETABLE, BLOCK14_WORKING_GROUPS, getSessionsByDay } from '@/lib/block14/sessions';

interface SpellbookEntry {
  id: string;
  sessionId: string;
  sessionTitle: string;
  workingGroup: string;
  mageQuery: string;
  mageResponse: string;
  sources: Array<{ documentTitle: string; documentDate: string; relevanceScore?: number }>;
  crossWgRefs: Array<{ workingGroup: string; topic: string; hint?: string }>;
  addedAt: string;
  attributionLevel: string;
}

function SpellbookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionFromUrl = useMemo(() => searchParams.get('session'), [searchParams]);
  const [allEntries, setAllEntries] = useState<SpellbookEntry[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessionFromUrl || null);
  const [selectedWg, setSelectedWg] = useState<string | null>(null);
  const [sessionsExpanded, setSessionsExpanded] = useState(!!sessionFromUrl);
  const [wgSpellbookExpanded, setWgSpellbookExpanded] = useState(false);
  const [recentCastsExpanded, setRecentCastsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
  }, [router]);

  useEffect(() => {
    if (sessionFromUrl && BLOCK14_TIMETABLE.some((s) => s.id === sessionFromUrl)) {
      setSelectedSessionId(sessionFromUrl);
      setSessionsExpanded(true);
    }
  }, [sessionFromUrl]);

  useEffect(() => {
    fetch('/api/spellbook/entries')
      .then((res) => res.json())
      .then((data) => {
        setAllEntries((data.entries ?? []) as SpellbookEntry[]);
      })
      .catch(() => setAllEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const entriesBySession = useMemo(() => {
    const by: Record<string, SpellbookEntry[]> = {};
    for (const s of BLOCK14_TIMETABLE) by[s.id] = [];
    for (const e of allEntries) {
      if (!by[e.sessionId]) by[e.sessionId] = [];
      by[e.sessionId].push(e);
    }
    for (const id of Object.keys(by)) {
      by[id].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }
    return by;
  }, [allEntries]);

  const entriesByWg = useMemo(() => {
    const by: Record<string, SpellbookEntry[]> = {};
    for (const g of BLOCK14_WORKING_GROUPS) by[g.id] = [];
    for (const e of allEntries) {
      if (!by[e.workingGroup]) by[e.workingGroup] = [];
      by[e.workingGroup].push(e);
    }
    for (const id of Object.keys(by)) {
      by[id].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }
    return by;
  }, [allEntries]);

  const selectedSession = BLOCK14_TIMETABLE.find((s) => s.id === selectedSessionId);
  const selectedEntries = selectedSessionId ? (entriesBySession[selectedSessionId] ?? []) : [];
  const selectedWgEntries = selectedWg ? (entriesByWg[selectedWg] ?? []) : [];
  const selectedWgMeta = BLOCK14_WORKING_GROUPS.find((g) => g.id === selectedWg);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto">
      <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Block 14
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Spellbook</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Promises, Sessions, Spellbooks, Recent Casts
        </p>
      </div>

      {/* 🤝 Promises */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">🤝 Promises</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Voluntary commitments across all working groups</p>
          </div>
          <Link
            href="/promises"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-primary)] hover:border-[var(--mage)] hover:text-[var(--mage)] transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Block 14 casts by session (timetable) — collapsible */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => { setSessionsExpanded((e) => !e); if (wgSpellbookExpanded) setWgSpellbookExpanded(false); }}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border)]"
        >
          <h2 className="font-semibold text-[var(--text-primary)]">Cast to session</h2>
          <span className="text-xs text-[var(--text-muted)] font-normal">View by timetable session</span>
          <span className="text-[var(--text-muted)]" aria-hidden>{sessionsExpanded ? '▼' : '▶'}</span>
        </button>
        {sessionsExpanded && (
          <div className="p-4">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Each Block 14 session can receive casts. Select a session to see its entries.
            </p>
            <div className="space-y-4">
              <section>
                <p className="text-xs text-[var(--text-muted)] font-medium mb-2">March 1, 2026</p>
                <div className="flex flex-wrap gap-2">
                  {getSessionsByDay('March 1').map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSelectedSessionId(selectedSessionId === s.id ? null : s.id); setSelectedWg(null); }}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selectedSessionId === s.id
                          ? 'border-[var(--mage)] bg-[var(--mage)]/10'
                          : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--mage)]'
                      }`}
                    >
                      {s.title}
                      <span className="text-[var(--text-muted)] ml-1">({(entriesBySession[s.id] ?? []).length})</span>
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-xs text-[var(--text-muted)] font-medium mb-2">March 2, 2026</p>
                <div className="flex flex-wrap gap-2">
                  {getSessionsByDay('March 2').map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSelectedSessionId(selectedSessionId === s.id ? null : s.id); setSelectedWg(null); }}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selectedSessionId === s.id
                          ? 'border-[var(--mage)] bg-[var(--mage)]/10'
                          : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--mage)]'
                      }`}
                    >
                      {s.title}
                      <span className="text-[var(--text-muted)] ml-1">({(entriesBySession[s.id] ?? []).length})</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
            {selectedSession && (
              <section className="mt-6 pt-4 border-t border-[var(--border)]">
                <h3 className="text-base font-semibold mb-4">{selectedSession.title}</h3>
                {selectedEntries.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-sm">No casts yet for this session. Cast from a Mage chat.</p>
                ) : (
                  <div className="space-y-6">
                    {selectedEntries.map((e) => (
                      <div key={e.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-primary)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">{new Date(e.addedAt).toLocaleString()} · {e.attributionLevel}</p>
                        <p className="font-medium text-sm text-[var(--mage)] mb-2">Q: {e.mageQuery}</p>
                        <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-3">{e.mageResponse}</div>
                        {e.sources?.length > 0 && <div className="text-xs text-[var(--text-muted)]">Sources: {e.sources.map((s) => s.documentTitle).join(', ')}</div>}
                        {e.crossWgRefs?.length > 0 && <div className="text-xs text-[var(--text-muted)] mt-1">Cross-WG: {e.crossWgRefs.map((r) => r.workingGroup).join(', ')}</div>}
                        <div className="mt-3 pt-2 border-t border-[var(--border)]">
                          <InscribeProverbButton castEntryId={e.id} workingGroup={e.workingGroup} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      {/* Spellbook by working group — one spellbook per WG */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => { setWgSpellbookExpanded((e) => !e); if (sessionsExpanded) setSessionsExpanded(false); }}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border)]"
        >
          <h2 className="font-semibold text-[var(--text-primary)]">Spellbook by working group</h2>
          <span className="text-xs text-[var(--text-muted)] font-normal">IKP, FASE, Security, Governance</span>
          <span className="text-[var(--text-muted)]" aria-hidden>{wgSpellbookExpanded ? '▼' : '▶'}</span>
        </button>
        {wgSpellbookExpanded && (
          <div className="p-4">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              One spellbook per working group. Casts to any session in that WG appear here.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              {BLOCK14_WORKING_GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { setSelectedWg(selectedWg === g.id ? null : g.id); setSelectedSessionId(null); }}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selectedWg === g.id ? 'border-[var(--mage)] bg-[var(--mage)]/10' : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--mage)]'
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span className="ml-2 font-medium">{g.label} Spellbook</span>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{(entriesByWg[g.id] ?? []).length} entr{(entriesByWg[g.id] ?? []).length === 1 ? 'y' : 'ies'}</p>
                </button>
              ))}
            </div>
            {selectedWgMeta && (
              <section className="mt-4 pt-4 border-t border-[var(--border)]">
                <h3 className="text-base font-semibold mb-4">{selectedWgMeta.emoji} {selectedWgMeta.label} Spellbook</h3>
                {selectedWgEntries.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-sm">No casts yet. Cast to a session in this working group from a Mage chat.</p>
                ) : (
                  <div className="space-y-6">
                    {selectedWgEntries.map((e) => (
                      <div key={e.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-primary)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">{new Date(e.addedAt).toLocaleString()} · {e.sessionTitle} · {e.attributionLevel}</p>
                        <p className="font-medium text-sm text-[var(--mage)] mb-2">Q: {e.mageQuery}</p>
                        <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-3">{e.mageResponse}</div>
                        {e.sources?.length > 0 && <div className="text-xs text-[var(--text-muted)]">Sources: {e.sources.map((s) => s.documentTitle).join(', ')}</div>}
                        {e.crossWgRefs?.length > 0 && <div className="text-xs text-[var(--text-muted)] mt-1">Cross-WG: {e.crossWgRefs.map((r) => r.workingGroup).join(', ')}</div>}
                        <div className="mt-3 pt-2 border-t border-[var(--border)]">
                          <InscribeProverbButton castEntryId={e.id} workingGroup={e.workingGroup} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      {/* Recent casts — expandable */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden mb-10">
        <button
          type="button"
          onClick={() => setRecentCastsExpanded((e) => !e)}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border)]"
        >
          <h2 className="font-semibold text-[var(--text-primary)]">Recent casts</h2>
          <span className="text-xs text-[var(--text-muted)] font-normal">Mage insights cast to sessions</span>
          <span className="text-[var(--text-muted)]" aria-hidden>{recentCastsExpanded ? '▼' : '▶'}</span>
        </button>
        {recentCastsExpanded && (
          <div className="min-h-[16rem] max-h-[32rem] flex flex-col">
            <RecentCastsFeed embedded />
          </div>
        )}
      </div>
    </main>
  );
}

export default function SpellbookPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </main>
    }>
      <SpellbookContent />
    </Suspense>
  );
}
