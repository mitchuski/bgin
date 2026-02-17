'use client';

import { useState } from 'react';
import { useMagePanel } from '@/contexts/MagePanelContext';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';
import MageChat from '@/components/mage/MageChat';

export default function MagePanel() {
  const { open, setOpen } = useMagePanel();
  const [wg, setWg] = useState<string>(BLOCK14_WORKING_GROUPS[0].id);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        aria-hidden
        onClick={() => setOpen(false)}
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[28rem] flex flex-col border-l border-[var(--border)] bg-[var(--bg-primary)] shadow-xl"
        role="dialog"
        aria-label="Mage chat"
      >
        <div className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span className="text-xl" aria-hidden>🧙</span>
            Mage
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
        <div className="shrink-0 px-3 py-2 border-b border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Which Mage?</p>
          <div className="flex flex-wrap gap-1.5">
            {BLOCK14_WORKING_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setWg(g.id)}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  wg === g.id
                    ? 'bg-[var(--mage)]/20 text-[var(--mage)] border border-[var(--mage)]'
                    : 'border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--mage)]'
                }`}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <MageChat wg={wg} embedded />
        </div>
      </aside>
    </>
  );
}
