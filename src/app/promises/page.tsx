'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PromiseBoard from '@/components/workspace/PromiseBoard';

const WGS = [
  { id: 'ikp', emoji: '🔐' },
  { id: 'fase', emoji: '💎' },
  { id: 'cyber', emoji: '🛡️' },
  { id: 'governance', emoji: '🏛️' },
];

export default function AllPromisesPage() {
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (hash && WGS.some((w) => w.id === hash)) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto">
      <Link href="/spellbook" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Spellbook
      </Link>
      <h1 className="text-2xl font-bold mb-2">🤝 Promises</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-8">
        Voluntary commitments across all working groups.
      </p>

      <div className="space-y-12">
        {WGS.map((wg) => (
          <section key={wg.id} id={wg.id} className="scroll-mt-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{wg.emoji}</span>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{wg.id.toUpperCase()}</h2>
            </div>
            <PromiseBoard wg={wg.id} />
          </section>
        ))}
      </div>
    </main>
  );
}
