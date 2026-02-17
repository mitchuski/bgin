'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-48 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-col gap-2">
      <Link href="/dashboard">Feed</Link>
      <Link href="/dashboard/briefing">Briefing</Link>
      <Link href="/dashboard/knowledge-map">Knowledge map</Link>
      <Link href="/trust">Trust</Link>
      <Link href="/mage">Mages</Link>
    </aside>
  );
}
