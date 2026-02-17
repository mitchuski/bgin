'use client';

export default function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'wg-ikp' | 'wg-fase' | 'wg-cyber' | 'wg-governance';
}) {
  const colors: Record<string, string> = {
    default: 'bg-[var(--bg-tertiary)]',
    'wg-ikp': 'bg-[var(--wg-ikp)]/20 text-[var(--wg-ikp)]',
    'wg-fase': 'bg-[var(--wg-fase)]/20 text-[var(--wg-fase)]',
    'wg-cyber': 'bg-[var(--wg-cyber)]/20 text-[var(--wg-cyber)]',
    'wg-governance': 'bg-[var(--wg-governance)]/20 text-[var(--wg-governance)]',
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors[variant] || colors.default}`}>
      {children}
    </span>
  );
}
