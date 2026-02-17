'use client';

export default function SourceReference({
  title,
  date,
  relevance,
}: {
  title: string;
  date: string;
  relevance?: number;
}) {
  return (
    <div className="rounded border border-[var(--border)] p-2 text-sm bg-[var(--bg-tertiary)]">
      📄 {title} · {date}
      {relevance != null && ` · ${Math.round(relevance * 100)}% relevant`}
    </div>
  );
}
