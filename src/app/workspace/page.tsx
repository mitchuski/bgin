'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkspaceHubPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/spellbook');
  }, [router]);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <p className="text-[var(--text-muted)]">Redirecting to Spellbook…</p>
    </main>
  );
}
