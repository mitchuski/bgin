'use client';

export default function PrivacyBudgetIndicator({
  remaining,
  max,
}: {
  remaining: number;
  max: number;
}) {
  return (
    <span className="text-xs text-[var(--text-muted)]">
      Budget: {remaining}/{max}
    </span>
  );
}
