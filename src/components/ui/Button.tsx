'use client';

export default function Button({
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const base = 'rounded-lg px-4 py-2 font-medium transition-colors';
  const variants = {
    primary: 'bg-[var(--mage)] text-white hover:opacity-90',
    secondary: 'border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)]',
    ghost: 'hover:bg-[var(--bg-secondary)]',
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
