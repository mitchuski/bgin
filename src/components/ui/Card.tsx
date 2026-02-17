'use client';

export default function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] ${className}`}>
      {children}
    </div>
  );
}
