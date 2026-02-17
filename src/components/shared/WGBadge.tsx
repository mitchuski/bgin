'use client';

export default function WGBadge({ wg, emoji }: { wg: string; emoji: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs bg-[var(--bg-tertiary)]">
      {emoji} {wg.toUpperCase()}
    </span>
  );
}
