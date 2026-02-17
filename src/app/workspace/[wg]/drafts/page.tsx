'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

const VALID_WGS = ['ikp', 'fase', 'cyber', 'governance'];

export default function DraftsListPage() {
  const params = useParams();
  const wg = (params?.wg as string)?.toLowerCase() ?? '';

  if (!VALID_WGS.includes(wg)) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-[var(--text-secondary)]">Unknown working group.</p>
        <Link href="/spellbook" className="text-[var(--mage)] underline mt-2 inline-block">← Spellbook</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/promises" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Promises
      </Link>
      <h1 className="text-2xl font-bold mb-2">Drafts — {wg.toUpperCase()}</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6">
        Collaborative documents. Phase 7.3 (Yjs editor) can be wired here.
      </p>
      <p className="text-[var(--text-muted)] text-sm">No drafts yet. Document creation and editor coming in a future update.</p>
    </main>
  );
}
