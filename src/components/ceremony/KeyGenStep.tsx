'use client';

import { useState, useEffect } from 'react';
import type { CeremonyStepDef } from '@/lib/ceremony/constellation';
import type { SwordsmanKeys } from '@/lib/ceremony/keygen';
import { generateSwordsmanKeys } from '@/lib/ceremony/keygen';
import EmojiPicker from './EmojiPicker';
import KeyGenAnimation from './KeyGenAnimation';
import Button from '@/components/ui/Button';

export default function KeyGenStep({
  onKeyGenerated,
  onNext,
  constellationStep,
  chosenEmoji,
  onChosenEmoji,
  inscription,
  setInscription,
}: {
  onKeyGenerated: (keys: SwordsmanKeys) => void;
  onNext: () => void;
  constellationStep?: CeremonyStepDef;
  chosenEmoji?: string | null;
  onChosenEmoji?: (emoji: string) => void;
  inscription?: string;
  setInscription?: (v: string) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const keys = await generateSwordsmanKeys();
      onKeyGenerated(keys);
      setGenerated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Key generation failed');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!generated && !generating) {
      handleGenerate();
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {constellationStep?.title ?? 'Key Generation'}
      </h2>
      <p className="text-[var(--text-secondary)]">
        {constellationStep?.description ?? 'Your Ed25519 keypair is being forged in your browser. This key will anchor your Swordsman identity.'}
      </p>

      {generating && <KeyGenAnimation />}

      {error && (
        <div className="p-3 rounded border border-[var(--wg-cyber)] bg-[var(--wg-cyber)]/10 text-sm text-[var(--wg-cyber)]">
          {error}
        </div>
      )}

      {generated && !generating && (
        <>
          <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            <p className="text-[var(--mage)] font-medium">✓ Your Swordsman key has been forged</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Your keys are stored locally and never leave your device.
            </p>
          </div>

          {constellationStep && onChosenEmoji && (
            <EmojiPicker
              options={constellationStep.emojiOptions}
              value={chosenEmoji ?? null}
              onChange={onChosenEmoji}
            />
          )}

          {constellationStep && setInscription && (
            <label className="block">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Inscription (optional)
              </span>
              <textarea
                value={inscription ?? ''}
                onChange={(e) => setInscription(e.target.value)}
                placeholder="Mark this moment..."
                rows={2}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-none"
              />
            </label>
          )}

          <Button onClick={onNext}>Continue →</Button>
        </>
      )}
    </div>
  );
}
