'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const VALID_WGS = ['ikp', 'fase', 'cyber', 'governance'];

export default function WorkspaceWGPage() {
  const params = useParams();
  const router = useRouter();
  const wg = (params?.wg as string)?.toLowerCase() ?? '';

  useEffect(() => {
    if (VALID_WGS.includes(wg)) {
      router.replace(`/promises#${wg}`);
    } else {
      router.replace('/promises');
    }
  }, [wg, router]);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <p className="text-[var(--text-muted)]">Redirecting to Promises…</p>
    </main>
  );
}
