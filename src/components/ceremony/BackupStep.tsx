'use client';

import { useState } from 'react';
import type { CeremonyStepDef } from '@/lib/ceremony/constellation';
import type { SwordsmanKeys } from '@/lib/ceremony/keygen';
import { generateKeyBackup } from '@/lib/ceremony/backup';
import EmojiPicker from './EmojiPicker';
import Button from '@/components/ui/Button';

export default function BackupStep({
  keys,
  onNext,
  onSkip,
  constellationStep,
  chosenEmoji,
  onChosenEmoji,
  inscription,
  setInscription,
}: {
  keys: SwordsmanKeys;
  onNext: () => void;
  onSkip: () => void;
  constellationStep?: CeremonyStepDef;
  chosenEmoji?: string | null;
  onChosenEmoji?: (emoji: string) => void;
  inscription?: string;
  setInscription?: (v: string) => void;
}) {
  const [passphrase, setPassphrase] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!passphrase.trim()) {
      setError('Enter a passphrase to create the backup.');
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const blob = await generateKeyBackup(keys, passphrase);
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bgin-swordsman-backup-${keys.participantId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {constellationStep?.title ?? 'Key Backup'}
      </h2>
      <p className="text-[var(--text-secondary)]">
        {constellationStep?.description ?? 'Your Swordsman can be recovered with this backup and your passphrase. Without both, this identity cannot be restored. Store safely.'}
      </p>

      {constellationStep && onChosenEmoji && (
        <EmojiPicker
          options={constellationStep.emojiOptions}
          value={chosenEmoji ?? null}
          onChange={onChosenEmoji}
        />
      )}

      <div className="space-y-4">
        <input
          type="password"
          placeholder="Enter a strong passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none"
        />

        {error && (
          <p className="text-sm text-[var(--wg-cyber)]">{error}</p>
        )}

        <div className="flex gap-3">
          <Button onClick={handleDownload} disabled={generating || !passphrase.trim()}>
            {generating ? 'Generating...' : downloaded ? '✓ Downloaded' : 'Download Backup'}
          </Button>
          <Button variant="secondary" onClick={onSkip}>
            Skip (not recommended)
          </Button>
        </div>
      </div>

      {constellationStep && setInscription && (
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Inscription (optional)
          </span>
          <textarea
            value={inscription ?? ''}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="A reminder for your future self..."
            rows={2}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-none"
          />
        </label>
      )}

      {downloaded && (
        <Button onClick={onNext}>
          Enter BGIN AI →
        </Button>
      )}
    </div>
  );
}
