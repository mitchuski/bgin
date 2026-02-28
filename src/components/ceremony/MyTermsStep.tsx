'use client';

import type { CeremonyStepDef } from '@/lib/ceremony/constellation';
import EmojiPicker from './EmojiPicker';
import Button from '@/components/ui/Button';

export default function MyTermsStep({
  onNext,
  constellationStep,
  chosenEmoji,
  onChosenEmoji,
  inscription,
  setInscription,
}: {
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
        {constellationStep?.title ?? 'MyTerms Agreement'}
      </h2>
      <p className="text-[var(--text-secondary)]">
        {constellationStep?.description ?? 'Before connecting to Mages, you proffer bilateral terms (SD-BASE recommended). Full MyTerms negotiation will be wired in Phase 3.'}
      </p>

      {constellationStep && onChosenEmoji && (
        <EmojiPicker
          options={constellationStep.emojiOptions}
          value={chosenEmoji ?? null}
          onChange={onChosenEmoji}
        />
      )}

      <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-secondary)]">
        <h3 className="font-medium mb-2">SD-BASE Terms</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
          <li>• Your queries and responses remain private to your session</li>
          <li>• Attribution follows your chosen privacy level</li>
          <li>• No data sold to third parties</li>
          <li>• You may revoke consent at any time</li>
        </ul>
      </div>

      {constellationStep && setInscription && (
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Inscription (optional)
          </span>
          <textarea
            value={inscription ?? ''}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="Your thoughts on these terms..."
            rows={2}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-none"
          />
        </label>
      )}

      <Button onClick={onNext}>Accept SD-BASE & Continue</Button>
    </div>
  );
}
