'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import SpellbookSession from '@/components/workspace/SpellbookSession';

interface SessionSummary {
  sessionId: string;
  sessionTitle: string;
  entryCount: number;
}

// Block 14 sessions based on March 1-2, 2026 Tokyo event
const BLOCK14_SESSIONS = [
  { id: 'agentic-ai-1', title: 'Agentic AI Session 1', day: 'March 1', wg: 'agent-hack' },
  { id: 'agentic-ai-2', title: 'Agentic AI Session 2', day: 'March 1', wg: 'agent-hack' },
  { id: 'ikp-session', title: 'IKP Working Group', day: 'March 1', wg: 'ikp' },
  { id: 'cyber-session', title: 'Cyber Security Working Group', day: 'March 1', wg: 'cyber' },
  { id: 'fase-session', title: 'FASE Working Group', day: 'March 2', wg: 'fase' },
  { id: 'governance-session', title: 'Governance Working Group', day: 'March 2', wg: 'governance' },
  { id: 'general-session', title: 'General Session', day: 'March 2', wg: 'general' },
];

const WG_COLORS: Record<string, string> = {
  ikp: 'var(--wg-ikp)',
  fase: 'var(--wg-fase)',
  cyber: 'var(--wg-cyber)',
  governance: 'var(--wg-governance)',
  'agent-hack': 'var(--mage)',
  general: 'var(--text-secondary)',
};

export default function Block14SpellbookPage() {
  const router = useRouter();
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
    fetchSessions();
  }, [router]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/spellbook/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessionSummaries(data.sessions);
      }
    } catch {
      // Silent fail — just show empty
    } finally {
      setLoading(false);
    }
  };

  const getEntryCount = (sessionId: string) => {
    const summary = sessionSummaries.find((s) => s.sessionId === sessionId);
    return summary?.entryCount ?? 0;
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <Link
        href="/spellbook"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block"
      >
        ← Spellbook
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold">Block 14 Spellbook</h1>
        <span className="text-2xl">📜</span>
      </div>
      <p className="text-[var(--text-secondary)] text-sm mb-2">
        March 1-2, 2026 • Shibuya Parco DG Bldg., Tokyo, Japan
      </p>
      <p className="text-[var(--text-muted)] text-sm mb-6">
        Aggregated Mage contributions from all working group sessions. Each entry represents
        knowledge shared through Mage interactions during Block 14.
      </p>

      {selectedSession ? (
        <div>
          <button
            onClick={() => setSelectedSession(null)}
            className="text-sm text-[var(--mage)] hover:underline mb-4"
          >
            ← Back to all sessions
          </button>
          <SpellbookSession
            sessionId={selectedSession}
            sessionTitle={
              BLOCK14_SESSIONS.find((s) => s.id === selectedSession)?.title ?? selectedSession
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Day 1 */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
              Day 1 — March 1, 2026
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {BLOCK14_SESSIONS.filter((s) => s.day === 'March 1').map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className="text-left p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--mage)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${WG_COLORS[session.wg]} 20%, transparent)`,
                        color: WG_COLORS[session.wg],
                      }}
                    >
                      {session.wg.toUpperCase()}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {getEntryCount(session.id)} contributions
                    </span>
                  </div>
                  <h3 className="font-medium mt-2">{session.title}</h3>
                </button>
              ))}
            </div>
          </div>

          {/* Day 2 */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
              Day 2 — March 2, 2026
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {BLOCK14_SESSIONS.filter((s) => s.day === 'March 2').map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className="text-left p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--mage)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${WG_COLORS[session.wg]} 20%, transparent)`,
                        color: WG_COLORS[session.wg],
                      }}
                    >
                      {session.wg.toUpperCase()}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {getEntryCount(session.id)} contributions
                    </span>
                  </div>
                  <h3 className="font-medium mt-2">{session.title}</h3>
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <p className="text-[var(--text-muted)] text-sm">Loading session data...</p>
          )}
        </div>
      )}
    </main>
  );
}
