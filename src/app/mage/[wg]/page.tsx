'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import MageChat from '@/components/mage/MageChat';

const VALID_WGS = ['ikp', 'fase', 'cyber', 'governance'];

export default function MageChatPage() {
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
    <main className="min-h-screen p-8">
      <Link href="/mage" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Archive
      </Link>
      <MageChat wg={wg} />
    </main>
  );
}
