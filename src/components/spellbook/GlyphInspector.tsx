'use client';

import Link from 'next/link';
import type { Glyph } from '@/lib/spellweb/types';

interface GlyphInspectorProps {
  glyph: Glyph | null;
}

const GLYPH_ICONS: Record<string, string> = {
  grimoire: '📚',
  session: '📅',
  spell: '✨',
  topic: '💡',
  source: '📄',
  proverb: '✦',
};

export default function GlyphInspector({ glyph }: GlyphInspectorProps) {
  if (!glyph) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[300px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm text-center">
          Select a glyph in the Spellweb to inspect its threads
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2">
          <span className="text-xl">{GLYPH_ICONS[glyph.type] ?? '•'}</span>
          <div>
            <h3 className="font-semibold text-sm">{glyph.label}</h3>
            <p className="text-xs text-[var(--text-muted)] capitalize">
              {glyph.type} · {glyph.grimoire.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">Arcane Resonance</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--mage)] rounded-full"
                style={{
                  width: `${Math.min(100, glyph.arcaneResonance * 10)}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium">{glyph.arcaneResonance}</span>
          </div>
        </div>

        <div className="grid gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">First Scried</span>
            <span>{new Date(glyph.firstScried).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Last Invoked</span>
            <span>{new Date(glyph.lastInvoked).toLocaleDateString()}</span>
          </div>
        </div>

        {glyph.type === 'spell' && glyph.metadata.query && (
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Query</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {glyph.metadata.query}
            </p>
          </div>
        )}

        {glyph.type === 'spell' && glyph.metadata.sessionId && (
          <Link
            href={`/spellbook?session=${glyph.metadata.sessionId}`}
            className="inline-block text-xs text-[var(--mage)] hover:underline"
          >
            View in Spellbook →
          </Link>
        )}

        {glyph.type === 'proverb' && glyph.metadata?.content && (
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Proverb (RPP)</p>
            <p className="text-sm text-[var(--text-secondary)] italic">&ldquo;{glyph.metadata.content}&rdquo;</p>
            {glyph.metadata.castEntryId && (
              <Link
                href={`/proverb?castEntryId=${glyph.metadata.castEntryId}`}
                className="inline-block text-xs text-[var(--mage)] hover:underline mt-2"
              >
                View proverbs for this cast →
              </Link>
            )}
          </div>
        )}

        {glyph.type === 'grimoire' && (
          <Link
            href={`/mage/${glyph.grimoire}`}
            className="inline-block text-xs text-[var(--mage)] hover:underline"
          >
            Chat with {glyph.grimoire.toUpperCase()} Mage →
          </Link>
        )}
      </div>
    </div>
  );
}
