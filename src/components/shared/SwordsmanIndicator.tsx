'use client';
/** 00 Phase 10.3 — Persistent header indicator. */

export default function SwordsmanIndicator() {
  return (
    <div className="flex items-center gap-2 rounded border border-[var(--border)] px-3 py-1.5 text-sm">
      <span>⚔️</span>
      <span>Active · Anonymous</span>
      {/* TODO: read from context, link to settings */}
    </div>
  );
}
