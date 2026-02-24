'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirect legacy /spellbook/spellweb to /web */
export default function SpellwebRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/web');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px] text-[var(--text-muted)]">
      Redirecting to Web…
    </div>
  );
}
