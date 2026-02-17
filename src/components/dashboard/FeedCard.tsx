'use client';
/** 00 Phase 6.2 — Single feed item. */

import Link from 'next/link';
import WGBadge from '@/components/shared/WGBadge';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

export default function FeedCard({
  title,
  summary,
  workingGroup,
  relevanceScore,
  type: itemType,
  action,
}: {
  title: string;
  summary: string;
  workingGroup: string;
  relevanceScore?: number;
  type?: string;
  action?: { label: string; route: string };
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-2 mb-2">
        <WGBadge wg={workingGroup} emoji={WG_EMOJI[workingGroup] ?? '📄'} />
        {itemType && (
          <span className="text-xs text-[var(--text-muted)] capitalize">
            {itemType.replace(/_/g, ' ')}
          </span>
        )}
        {relevanceScore != null && (
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            {Math.round(relevanceScore * 100)}% relevant
          </span>
        )}
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">{summary}</p>
      {action && (
        <Link
          href={action.route}
          className="inline-block mt-3 text-sm text-[var(--mage)] hover:underline"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
