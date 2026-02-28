'use client';

import type { CeremonyStepDef } from '@/lib/ceremony/constellation';
import EmojiPicker from './EmojiPicker';
import WGSelector from './WGSelector';
import Button from '@/components/ui/Button';

export default function WGStep({
  selectedWgs,
  setSelectedWgs,
  onNext,
  constellationStep,
  chosenEmoji,
  onChosenEmoji,
  inscription,
  setInscription,
}: {
  selectedWgs: string[];
  setSelectedWgs: (wgs: string[]) => void;
  onNext: () => void;
  constellationStep?: CeremonyStepDef;
  chosenEmoji?: string | null;
  onChosenEmoji?: (emoji: string) => void;
  inscription?: string;
  setInscription?: (v: string) => void;
}) {
  const canProceed = selectedWgs.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {constellationStep?.title ?? 'Working Group Selection'}
      </h2>
      <p className="text-[var(--text-secondary)]">
        {constellationStep?.description ?? 'Select at least one Mage to connect to. Each Mage specializes in a BGIN working group domain.'}
      </p>

      {constellationStep && onChosenEmoji && (
        <EmojiPicker
          options={constellationStep.emojiOptions}
          value={chosenEmoji ?? null}
          onChange={onChosenEmoji}
        />
      )}

      <WGSelector selected={selectedWgs} onChange={setSelectedWgs} />

      {!canProceed && (
        <p className="text-sm text-[var(--wg-cyber)]">
          Select at least one working group to continue.
        </p>
      )}

      {constellationStep && setInscription && (
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Inscription (optional)
          </span>
          <textarea
            value={inscription ?? ''}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="Why you chose these Mages..."
            rows={2}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-none"
          />
        </label>
      )}

      <Button onClick={onNext} disabled={!canProceed}>
        Connect to these Mages →
      </Button>
    </div>
  );
}
