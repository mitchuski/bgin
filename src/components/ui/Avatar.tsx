'use client';

export default function Avatar({ emoji, wg }: { emoji: string; wg?: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] text-lg">
      {emoji}
    </div>
  );
}
