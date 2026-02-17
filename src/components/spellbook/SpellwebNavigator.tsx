'use client';

import dynamic from 'next/dynamic';
import type { SpellbookEntryInput } from '@/lib/spellweb/builder';
import type { Glyph } from '@/lib/spellweb/types';

/**
 * Wrapper that loads the Sigma.js canvas only in the browser.
 * This file must not import sigma, graphology, or the adapter so the server never runs them.
 */
const SpellwebNavigatorCanvas = dynamic(
  () => import('./SpellwebNavigatorCanvas'),
  { ssr: false }
);

interface SpellwebNavigatorProps {
  entries: SpellbookEntryInput[];
  onGlyphSelect?: (glyph: Glyph | null) => void;
  grimoireFilter?: string[];
}

export default function SpellwebNavigator({
  entries,
  onGlyphSelect,
  grimoireFilter,
}: SpellwebNavigatorProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[400px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm">
          No spells yet. Cast from a Mage chat to weave your Spellweb.
        </p>
      </div>
    );
  }

  return (
    <SpellwebNavigatorCanvas
      entries={entries}
      onGlyphSelect={onGlyphSelect}
      grimoireFilter={grimoireFilter}
    />
  );
}
