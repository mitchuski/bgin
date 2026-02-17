'use client';

export default function CrossWgHint({
  workingGroup,
  topic,
  hint,
}: {
  workingGroup: string;
  topic: string;
  hint?: string;
}) {
  return (
    <div className="text-sm text-[var(--text-secondary)] mt-2">
      Related: {workingGroup.toUpperCase()} — {topic}. {hint}
    </div>
  );
}
