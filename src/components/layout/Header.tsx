'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localDB } from '@/lib/storage/local';
import { useMagePanel } from '@/contexts/MagePanelContext';

export default function Header() {
  const pathname = usePathname();
  const [agentCard, setAgentCard] = useState<{ displayName?: string } | null>(null);
  const { setOpen: setMagePanelOpen } = useMagePanel();

  const loadCard = () => {
    if (!localDB) return;
    localDB.agentCard.toCollection().first().then((card) => {
      setAgentCard(card ?? null);
    });
  };

  useEffect(() => {
    loadCard();
    const onCardUpdate = () => loadCard();
    window.addEventListener('agentCardUpdated', onCardUpdate);
    return () => window.removeEventListener('agentCardUpdated', onCardUpdate);
  }, []);

  const profileLabel = agentCard?.displayName?.trim() || 'Profile';
  const onMagePage = pathname === '/mage' || pathname?.startsWith('/mage/');

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-bold text-lg hover:text-[var(--mage)] transition-colors">
          BGIN AI
        </Link>
        {agentCard ? (
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] hover:border-[var(--mage)] hover:text-[var(--mage)] transition-colors"
            title="Your profile"
          >
            ⚔️ {profileLabel}
          </Link>
        ) : (
          <Link
            href="/ceremony"
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[var(--mage)] bg-[var(--mage)]/10 px-3 py-1.5 text-sm font-medium text-[var(--mage)] hover:bg-[var(--mage)]/20 transition-colors"
          >
            BGIN Ceremony
          </Link>
        )}
      </div>
      <nav className="flex flex-wrap gap-3 text-sm items-center">
        <Link href="/" className="font-bold text-[var(--text-primary)] hover:text-[var(--mage)]">Block 14</Link>
        <Link href="/spellbook" className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--mage)]">🔮 Spellbook</Link>
        <Link href="/proverb" className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--mage)]">✦ Proverbs</Link>
        <Link href="/promises" className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--mage)]">🤝 Promises</Link>
        <Link
          href="/mage"
          className={onMagePage ? 'inline-flex items-center gap-1.5 font-semibold text-[var(--mage)]' : 'inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--mage)]'}
          aria-current={onMagePage ? 'page' : undefined}
        >
          📚 Archive
        </Link>
        <button
          type="button"
          onClick={() => setMagePanelOpen(true)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-xl hover:border-[var(--mage)] hover:bg-[var(--mage)]/10 transition-colors"
          title="Open Mage chat"
          aria-label="Open Mage chat panel"
        >
          🧙
        </button>
      </nav>
    </header>
  );
}
