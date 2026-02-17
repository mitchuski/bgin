'use client';

export default function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 w-full rounded bg-[var(--bg-tertiary)] overflow-hidden">
      <div className="h-full bg-[var(--mage)] transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
