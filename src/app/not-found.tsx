import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-2">404</h1>
      <p className="text-[var(--text-secondary)] mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="rounded-lg border border-[var(--mage)] bg-[var(--mage)]/10 px-4 py-2 text-sm font-medium text-[var(--mage)] hover:bg-[var(--mage)]/20"
      >
        ← Block 14
      </Link>
    </div>
  );
}
