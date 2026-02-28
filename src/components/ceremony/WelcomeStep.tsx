'use client';

import type { CeremonyStepDef } from '@/lib/ceremony/constellation';
import EmojiPicker from './EmojiPicker';
import Button from '@/components/ui/Button';

export default function WelcomeStep({
  displayName,
  setDisplayName,
  onNext,
  constellationStep,
  chosenEmoji,
  onChosenEmoji,
  inscription,
  setInscription,
}: {
  displayName: string;
  setDisplayName: (v: string) => void;
  onNext: () => void;
  constellationStep?: CeremonyStepDef;
  chosenEmoji?: string | null;
  onChosenEmoji?: (emoji: string) => void;
  inscription?: string;
  setInscription?: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {constellationStep?.title ?? 'BGIN Ceremony'}
      </h2>
      <p className="text-[var(--text-secondary)]">
        {constellationStep?.description ?? 'You are about to generate your sovereign identity within the BGIN governance constellation. Your keys are yours. Your privacy boundaries are yours. No platform can override them.'}
      </p>

      {constellationStep && onChosenEmoji && (
        <EmojiPicker
          options={constellationStep.emojiOptions}
          value={chosenEmoji ?? null}
          onChange={onChosenEmoji}
        />
      )}

      <label className="block">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          Name your Swordsman (optional)
        </span>
        <span className="block text-xs text-[var(--text-muted)] mt-1">
          This becomes your BGIN ID display name.
        </span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Tokyo Blade"
          maxLength={64}
          className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none"
          autoFocus
        />
      </label>

      {constellationStep && setInscription && (
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Inscription (optional)
          </span>
          <textarea
            value={inscription ?? ''}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="What this name means to you..."
            rows={2}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-none"
          />
        </label>
      )}

      <Button onClick={onNext}>
        {constellationStep ? 'Inscribe & Continue' : 'Begin'}
      </Button>
    </div>
  );
}
