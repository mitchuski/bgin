'use client';

import Link from 'next/link';
import { BLOCK14_TIMETABLE, getSessionsByDay, BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

export default function Block14Timetable() {
  const day1 = getSessionsByDay('March 1');
  const day2 = getSessionsByDay('March 2');
  const wgById = Object.fromEntries(BLOCK14_WORKING_GROUPS.map((g) => [g.id, g]));

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Block 14 timetable</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          March 1–2, 2026 · Click a session to open its spellbook and casts
        </p>
      </div>
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">March 1, 2026</h3>
          <ul className="space-y-1.5">
            {day1.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/spellbook?session=${encodeURIComponent(s.id)}`}
                  className="flex items-start gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--mage)] hover:bg-[var(--mage)]/5 transition-colors group"
                >
                  <span className="text-lg shrink-0" title={wgById[s.workingGroup]?.label}>{WG_EMOJI[s.workingGroup] ?? '📄'}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--mage)]">{s.title}</span>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.room}</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">Spellbook →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">March 2, 2026</h3>
          <ul className="space-y-1.5">
            {day2.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/spellbook?session=${encodeURIComponent(s.id)}`}
                  className="flex items-start gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--mage)] hover:bg-[var(--mage)]/5 transition-colors group"
                >
                  <span className="text-lg shrink-0" title={wgById[s.workingGroup]?.label}>{WG_EMOJI[s.workingGroup] ?? '📄'}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--mage)]">{s.title}</span>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.room}</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">Spellbook →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
          Each session has its own spellbook; casts also appear in the working group spellbook ({BLOCK14_WORKING_GROUPS.map((g) => `${g.emoji} ${g.label}`).join(', ')}).
        </p>
      </div>
    </section>
  );
}
