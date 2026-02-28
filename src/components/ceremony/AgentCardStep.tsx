'use client';

import { useState } from 'react';
import type { CeremonyStepDef } from '@/lib/ceremony/constellation';
import type { AgentCard } from '@/lib/ceremony/agentCard';
import EmojiPicker from './EmojiPicker';
import Button from '@/components/ui/Button';

export default function AgentCardStep({
  card,
  onNext,
  generating,
  error,
  constellationStep,
  chosenEmoji,
  onChosenEmoji,
  inscription,
  setInscription,
}: {
  card: Partial<AgentCard>;
  onNext: () => void;
  generating?: boolean;
  error?: string | null;
  constellationStep?: CeremonyStepDef;
  chosenEmoji?: string | null;
  onChosenEmoji?: (emoji: string) => void;
  inscription?: string;
  setInscription?: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {constellationStep?.title ?? 'Agent Card'}
      </h2>
      <p className="text-[var(--text-secondary)]">
        {constellationStep?.description ?? 'Your Swordsman identity will be created and stored locally. Review the details below.'}
      </p>

      {constellationStep && onChosenEmoji && (
        <EmojiPicker
          options={constellationStep.emojiOptions}
          value={chosenEmoji ?? null}
          onChange={onChosenEmoji}
        />
      )}

      <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-secondary)] space-y-3 text-sm">
        {card.displayName && (
          <div>
            <span className="text-[var(--text-muted)]">Display Name:</span>{' '}
            <span className="font-medium">{card.displayName}</span>
          </div>
        )}
        {card.participantId && (
          <div>
            <span className="text-[var(--text-muted)]">Participant ID:</span>{' '}
            <span className="font-mono text-xs">{card.participantId}</span>
          </div>
        )}
        {card.workingGroups && (
          <div>
            <span className="text-[var(--text-muted)]">Connected Mages:</span>{' '}
            <span>{card.workingGroups.map((w) => w.toUpperCase()).join(', ')}</span>
          </div>
        )}
        {card.privacy && (
          <div>
            <span className="text-[var(--text-muted)]">Attribution:</span>{' '}
            <span className="capitalize">{card.privacy.attributionLevel}</span>
          </div>
        )}
        <div>
          <span className="text-[var(--text-muted)]">Trust Tier:</span>{' '}
          <span>Blade (starting tier)</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded border border-[var(--wg-cyber)] bg-[var(--wg-cyber)]/10 text-sm text-[var(--wg-cyber)]">
          {error}
        </div>
      )}

      {constellationStep && setInscription && (
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Inscription (optional)
          </span>
          <textarea
            value={inscription ?? ''}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="Seal your identity with a note..."
            rows={2}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-none"
          />
        </label>
      )}

      <Button onClick={onNext} disabled={generating}>
        {generating ? 'Creating...' : 'Create & Sign Agent Card'}
      </Button>
    </div>
  );
}
