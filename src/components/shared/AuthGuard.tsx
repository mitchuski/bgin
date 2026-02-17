'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    // TODO: check IndexedDB for agent card / keys; if missing, redirect to /ceremony
    // const hasKeys = await localDB.swordsmanKeys.count() > 0;
    // if (!hasKeys) router.replace('/ceremony');
  }, [router]);
  return <>{children}</>;
}
