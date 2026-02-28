'use client';

import type { CeremonyStepDef } from '@/lib/ceremony/constellation';
import type { PrivacyPreferences } from '@/lib/ceremony/privacy';
import EmojiPicker from './EmojiPicker';
import PrivacyConfig from './PrivacyConfig';
import Button from '@/components/ui/Button';

export default function PrivacyStep({
  privacy,
  setPrivacy,
  onNext,
  constellationStep,
  chosenEmoji,
  onChosenEmoji,
  inscription,
  setInscription,
}: {
  privacy: PrivacyPreferences;
  setPrivacy: (p: PrivacyPreferences) => void;
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
        {constellationStep?.title ?? 'Privacy Preferences'}
      </h2>
      <p className="text-[var(--text-secondary)]">
        {constellationStep?.description ?? 'Define your privacy boundaries. These settings control how Mages can identify and remember you.'}
      </p>

      {constellationStep && onChosenEmoji && (
        <EmojiPicker
          options={constellationStep.emojiOptions}
          value={chosenEmoji ?? null}
          onChange={onChosenEmoji}
        />
      )}

      <PrivacyConfig value={privacy} onChange={setPrivacy} />

      {constellationStep && setInscription && (
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Inscription (optional)
          </span>
          <textarea
            value={inscription ?? ''}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="Why these boundaries matter to you..."
            rows={2}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-none"
          />
        </label>
      )}

      <Button onClick={onNext}>Continue →</Button>
    </div>
  );
}
