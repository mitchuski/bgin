'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6 text-center">
        {error.message || 'An error occurred.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg px-4 py-2 bg-[var(--mage)] text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg px-4 py-2 border border-[var(--border)] hover:border-[var(--mage)]"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
