'use client';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-4 text-sm text-[var(--text-muted)] flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      <span>⚔️ ⊥ 🧙 | 🏛️</span>
      <span className="text-[var(--text-secondary)]">casting spells with ❤️ <a href="https://agentprivacy.ai" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--mage)] transition-colors">agentprivacy.ai</a></span>
    </footer>
  );
}
