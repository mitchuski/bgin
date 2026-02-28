'use client';

import Link from 'next/link';
import type { AgentCard } from '@/lib/ceremony/agentCard';
import { buildConstellationPath, getCeremonyConstellation } from '@/lib/ceremony/constellation';
import Button from '@/components/ui/Button';

export default function CompletionStep({
  agentCard,
  backupDone,
}: {
  agentCard: AgentCard;
  backupDone: boolean;
}) {
  const constellation = getCeremonyConstellation();
  const constellationPath = constellation?.constellationPath || buildConstellationPath(constellation?.steps || []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">⚔️ Your Swordsman is ready</h1>

      {constellationPath && (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-muted)] mb-2">Your Constellation Path</p>
          <p className="text-2xl tracking-wider">{constellationPath}</p>
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] space-y-2 text-sm">
        {agentCard.displayName && (
          <p>
            <strong>BGIN ID name:</strong> {agentCard.displayName}
          </p>
        )}
        <p>
          <strong>Participant ID:</strong> {agentCard.participantId}
        </p>
        <p>
          <strong>Trust tier:</strong> Blade (starting tier)
        </p>
        <p>
          <strong>Connected Mages:</strong>{' '}
          {agentCard.workingGroups.map((w) => w.toUpperCase()).join(', ')}
        </p>
        <p>
          <strong>Privacy:</strong> {agentCard.privacy.attributionLevel}
        </p>
        <p>
          <strong>Key backup:</strong> {backupDone ? '✓ Downloaded' : 'Skipped'}
        </p>
      </div>

      <p className="text-[var(--text-secondary)]">
        Your Swordsman will guard your privacy boundaries in all interactions with the BGIN AI constellation.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
        <Link href="/mage">
          <Button variant="secondary">🧙 Mages</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
