'use client';
/** 00 Phase 2.5 — Four WG cards, multi-select. 02_KEY_CEREMONY Step 5. */

import { WORKING_GROUPS } from '@/lib/ceremony/wgSelection';

const WG_BORDER: Record<string, string> = {
  ikp: 'hover:border-[var(--wg-ikp)]',
  fase: 'hover:border-[var(--wg-fase)]',
  cyber: 'hover:border-[var(--wg-cyber)]',
  governance: 'hover:border-[var(--wg-governance)]',
};

export default function WGSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {WORKING_GROUPS.map((wg) => (
        <button
          key={wg.id}
          type="button"
          onClick={() => toggle(wg.id)}
          className={`rounded-lg border-2 p-4 text-left bg-[var(--bg-secondary)] transition-colors border-[var(--border)] ${WG_BORDER[wg.id] || ''} ${selected.includes(wg.id) ? 'ring-2 ring-[var(--mage)]' : ''}`}
        >
          <span className="text-2xl">{wg.emoji}</span>
          <h4 className="font-medium mt-2">{wg.name}</h4>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{wg.description}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {selected.includes(wg.id) ? '✓ Selected' : 'Click to select'}
          </p>
        </button>
      ))}
    </div>
  );
}
