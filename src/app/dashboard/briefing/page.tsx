'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signedFetch, getParticipantId } from '@/lib/swordsman/signedFetch';
import WGBadge from '@/components/shared/WGBadge';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

interface BriefingSection {
  workingGroup: string;
  agendaTopics: string[];
  yourKnowledgeLevel: string;
  suggestedPrep: string;
  relevantMageQueries: string[];
}

interface BriefingData {
  meetingTitle: string;
  meetingDate: string;
  sections: BriefingSection[];
}

function BriefingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meetingId') ?? 'block-14';
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) {
        setLoading(false);
        router.replace('/ceremony');
        return;
      }
      setLoading(true);
      signedFetch(`/api/curation/briefing?meetingId=${encodeURIComponent(meetingId)}`, { method: 'GET' })
        .then((res) => res.json())
        .then((data) => {
          if (data.sections) setBriefing(data);
          else setError('Could not load briefing');
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Briefing failed'))
        .finally(() => setLoading(false));
    });
  }, [router, meetingId]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-[var(--text-muted)]">Loading briefing…</p>
      </main>
    );
  }

  if (error || !briefing) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-[var(--wg-cyber)]">{error ?? 'Briefing unavailable'}</p>
        <Link href="/mage" className="text-[var(--mage)] underline mt-2 inline-block">← Mage</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/mage" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Mage
      </Link>
      <h1 className="text-2xl font-bold mb-1">{briefing.meetingTitle}</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6">Meeting date: {briefing.meetingDate}</p>

      <div className="space-y-6">
        {briefing.sections.map((section) => (
          <div
            key={section.workingGroup}
            className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-secondary)]"
          >
            <div className="flex items-center gap-2 mb-3">
              <WGBadge wg={section.workingGroup} emoji={WG_EMOJI[section.workingGroup] ?? '📄'} />
              <span className="text-xs text-[var(--text-muted)] capitalize">
                Knowledge level: {section.yourKnowledgeLevel}
              </span>
            </div>
            <h2 className="font-semibold mb-2">Agenda topics</h2>
            <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] mb-3">
              {section.agendaTopics.map((topic, i) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
            <p className="text-sm text-[var(--text-secondary)] mb-3">{section.suggestedPrep}</p>
            <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Suggested Mage queries</p>
            <ul className="space-y-1 mb-3">
              {section.relevantMageQueries.map((q, i) => (
                <li key={i} className="text-sm text-[var(--text-secondary)]">• {q}</li>
              ))}
            </ul>
            <Link
              href={`/mage/${section.workingGroup}`}
              className="inline-block text-sm text-[var(--mage)] hover:underline"
            >
              Prepare with {section.workingGroup.toUpperCase()} Mage →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function BriefingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </main>
    }>
      <BriefingContent />
    </Suspense>
  );
}
