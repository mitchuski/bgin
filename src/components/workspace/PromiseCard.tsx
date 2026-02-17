'use client';

import type { PromiseType } from '@/lib/promises/types';
import WGBadge from '@/components/shared/WGBadge';

const WG_EMOJI: Record<string, string> = {
  ikp: '🔐',
  fase: '💎',
  cyber: '🛡️',
  governance: '🏛️',
};

const TYPE_LABELS: Record<PromiseType, string> = {
  author: 'Author',
  review: 'Review',
  attend: 'Attend',
  present: 'Present',
  research: 'Research',
  coordinate: 'Coordinate',
  custom: 'Custom',
};

export interface PromiseCardProps {
  id: string;
  type: PromiseType;
  description: string;
  dueDate?: string;
  status: string;
  workingGroup: string;
  isMine?: boolean;
  peerAssessments?: Array<{ assessment: string }>;
  /** Proverb connecting proof of understanding to this promise (RPP). */
  connectedProverb?: string;
  onStatusChange?: (newStatus: 'in_progress' | 'completed') => void;
  onAssess?: () => void;
}

export default function PromiseCard({
  id,
  type,
  description,
  dueDate,
  status,
  workingGroup,
  isMine,
  peerAssessments = [],
  connectedProverb,
  onStatusChange,
}: PromiseCardProps) {
  const verifiedCount = peerAssessments.filter((a) => a.assessment === 'verified').length;
  return (
    <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--bg-secondary)]">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs text-[var(--text-muted)]">{TYPE_LABELS[type] ?? type}</span>
        <WGBadge wg={workingGroup} emoji={WG_EMOJI[workingGroup] ?? '📄'} />
      </div>
      <p className="text-sm break-words">{description}</p>
      {connectedProverb && (
        <blockquote className="text-xs text-[var(--mage)] border-l-2 border-[var(--mage)]/50 pl-2 mt-2 italic">
          ✦ {connectedProverb}
        </blockquote>
      )}
      {dueDate && (
        <p className="text-xs text-[var(--text-muted)] mt-1">Due: {dueDate}</p>
      )}
      {verifiedCount > 0 && (
        <p className="text-xs text-[var(--mage)] mt-1">✓ {verifiedCount} verified</p>
      )}
      {isMine && status !== 'completed' && status !== 'withdrawn' && onStatusChange && (
        <div className="flex gap-2 mt-2">
          {status === 'active' && (
            <button
              type="button"
              onClick={() => onStatusChange('in_progress')}
              className="text-xs text-[var(--mage)] hover:underline"
            >
              Start →
            </button>
          )}
          {(status === 'active' || status === 'in_progress') && (
            <button
              type="button"
              onClick={() => onStatusChange('completed')}
              className="text-xs text-[var(--mage)] hover:underline"
            >
              Mark complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
