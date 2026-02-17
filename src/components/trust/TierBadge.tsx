'use client';

export default function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-[var(--bg-tertiary)] border border-[var(--border)]">
      {tier}
    </span>
  );
}
