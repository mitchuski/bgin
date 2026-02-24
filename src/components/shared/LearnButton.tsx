'use client';

import { useState } from 'react';

interface LearnButtonProps {
  text: string;
  className?: string;
  title?: string;
}

/**
 * Copy-to-clipboard "Learn" button (🔮). Use next to casts and proverbs.
 */
export default function LearnButton({ text, className = '', title = 'Copy to learn' }: LearnButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className={`inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--mage)] transition-colors ${className}`}
      aria-label={title}
    >
      <span aria-hidden>{copied ? '✓' : '🔮'}</span>
      {copied && <span className="text-xs">Copied</span>}
    </button>
  );
}
