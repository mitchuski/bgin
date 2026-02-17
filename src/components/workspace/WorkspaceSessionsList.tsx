'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';

interface SpellbookEntryRow {
  id: string;
  workingGroup: string;
}

export default function WorkspaceSessionsList() {
  const [countByWg, setCountByWg] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/spellbook/entries')
      .then((res) => res.json())
      .then((data) => {
        const entries: SpellbookEntryRow[] = data.entries ?? [];
        const counts: Record<string, number> = {};
        BLOCK14_WORKING_GROUPS.forEach((g) => { counts[g.id] = 0; });
        entries.forEach((e) => {
          if (counts[e.workingGroup] !== undefined) counts[e.workingGroup]++;
        });
        setCountByWg(counts);
      })
      .catch(() => setCountByWg({}));
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col min-h-[24rem]">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
        <h2 className="font-semibold text-[var(--text-primary)]">Spellbook by working group</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">View casts by IKP, FASE, Security, Governance</p>
      </div>
      <div className="p-3 space-y-2 flex-1">
        {BLOCK14_WORKING_GROUPS.map((g) => (
          <Link
            key={g.id}
            href={`/spellbook`}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 hover:border-[var(--mage)] hover:bg-[var(--mage)]/5 transition-colors"
          >
            <span className="text-lg">{g.emoji}</span>
            <span className="flex-1 ml-2 font-medium text-sm text-[var(--text-primary)]">{g.label} Spellbook</span>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {countByWg[g.id] ?? 0} entr{(countByWg[g.id] ?? 0) === 1 ? 'y' : 'ies'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
