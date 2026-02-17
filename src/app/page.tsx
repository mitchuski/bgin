'use client';

import Link from 'next/link';
import HomeCastBoard from '@/components/home/HomeCastBoard';
import HomePromiseBoard from '@/components/home/HomePromiseBoard';
import Block14Timetable from '@/components/home/Block14Timetable';

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">BGIN Block 14</h1>
      <p className="text-[var(--text-secondary)] mb-4">
        Governance intelligence - BGIN the overlap. Use your mage to cast insight into our Block 14 spellbook.
      </p>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Demo: Start with <strong>BGIN Ceremony</strong> to create your identity → then <strong>🧙 Mages</strong> to chat → use 🔮 <strong>Cast to session</strong> to add replies to the Spellbook.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Block14Timetable />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <HomeCastBoard />
          <HomePromiseBoard />
          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h2 className="text-base font-semibold mb-3">Get started</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                href="/ceremony"
                className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--swordsman)] transition-colors"
              >
                BGIN Ceremony
              </Link>
              <Link
                href="/mage"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mage)] bg-[var(--mage)]/10 px-3 py-2 text-sm font-medium text-[var(--mage)] hover:bg-[var(--mage)]/20 transition-colors"
              >
                🔮 Cast your first spell
              </Link>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-1.5 font-medium">How the flow works:</p>
            <ol className="text-xs text-[var(--text-muted)] space-y-1 list-decimal list-inside">
              <li><strong className="text-[var(--text-primary)]">Mage</strong> — Pick a working group, ask a question; the Mage responds using BGIN knowledge.</li>
              <li>Under a response, click <strong className="text-[var(--text-primary)]">Cast to session</strong> and choose a Block 14 session; the reply is added to that session’s spellbook.</li>
              <li><strong className="text-[var(--text-primary)]">Spellbook</strong> — View casts by session (timetable) or by working group; your cast appears in both.</li>
            </ol>
          </section>
        </div>
      </div>

      <p className="text-sm text-[var(--text-muted)] mt-8">
        ⚔️ ⊥ 🧙 | 🏛️
      </p>
    </main>
  );
}
