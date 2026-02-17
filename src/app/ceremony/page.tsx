'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { generateSwordsmanKeys } from '@/lib/ceremony/keygen';
import { createAgentCard } from '@/lib/ceremony/agentCard';
import { storeSwordsmanKeys } from '@/lib/ceremony/storeKeys';
import { generateKeyBackup } from '@/lib/ceremony/backup';
import { DEFAULT_PRIVACY } from '@/lib/ceremony/privacy';
import type { PrivacyPreferences } from '@/lib/ceremony/privacy';
import type { SwordsmanKeys } from '@/lib/ceremony/keygen';
import type { AgentCard } from '@/lib/ceremony/agentCard';
import { localDB } from '@/lib/storage/local';
import KeyGenAnimation from '@/components/ceremony/KeyGenAnimation';
import PrivacyConfig from '@/components/ceremony/PrivacyConfig';
import WGSelector from '@/components/ceremony/WGSelector';
import Button from '@/components/ui/Button';

const STEPS = [
  'Welcome',
  'Key generation',
  'Privacy preferences',
  'MyTerms agreement',
  'Working group selection',
  'Agent card',
  'Key backup',
  'Complete',
];

export default function CeremonyPage() {
  const [step, setStep] = useState(1);
  const [keys, setKeys] = useState<SwordsmanKeys | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(DEFAULT_PRIVACY);
  const [selectedWgs, setSelectedWgs] = useState<string[]>([]);
  const [agentCard, setAgentCard] = useState<AgentCard | null>(null);
  const [backupDone, setBackupDone] = useState(false);
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [swordsmanName, setSwordsmanName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleBeginCeremony = useCallback(async () => {
    setError(null);
    setGenerating(true);
    try {
      const k = await generateSwordsmanKeys();
      setKeys(k);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Key generation failed.');
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleKeyGenComplete = useCallback(() => {
    setStep(3);
  }, []);

  const handlePrivacyNext = useCallback(() => {
    setStep(4);
  }, []);

  const handleMyTermsAccept = useCallback(() => {
    setStep(5);
  }, []);

  const handleWgNext = useCallback(() => {
    if (selectedWgs.length === 0) {
      setError('Select at least one working group.');
      return;
    }
    setError(null);
    setStep(6);
  }, [selectedWgs]);

  const handleAgentCardCreate = useCallback(async () => {
    if (!keys) return;
    setError(null);
    setGenerating(true);
    try {
      const card = await createAgentCard(keys, privacy, selectedWgs, swordsmanName || undefined);
      await storeSwordsmanKeys(keys);
      if (!localDB) throw new Error('IndexedDB not available');
      await localDB.privacyPreferences.put({ ...privacy, id: 'default' });
      await localDB.agentCard.put(card);
      setAgentCard(card);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('agentCardUpdated'));
      }

      const registerRes = await fetch('/api/ceremony/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentCard: card }),
      });
      if (!registerRes.ok) {
        const data = await registerRes.json().catch(() => ({}));
        throw new Error(data.message ?? `Registration failed (${registerRes.status})`);
      }

      setStep(7);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create agent card.');
    } finally {
      setGenerating(false);
    }
  }, [keys, privacy, selectedWgs, swordsmanName]);

  const handleBackupDownload = useCallback(async () => {
    if (!keys || !backupPassphrase.trim()) {
      setError('Enter a passphrase to create the backup.');
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const blob = await generateKeyBackup(keys, backupPassphrase);
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bgin-swordsman-backup-${keys.participantId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup generation failed.');
    } finally {
      setGenerating(false);
    }
  }, [keys, backupPassphrase]);

  const handleBackupSkip = useCallback(() => {
    setStep(8);
  }, []);

  const handleComplete = useCallback(() => {
    setStep(8);
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
          <span>Step {step} of {STEPS.length}</span>
          <span>{STEPS[step - 1]}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
          <div
            className="h-full bg-[var(--mage)] transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-[var(--wg-cyber)] bg-[var(--wg-cyber)]/10 text-sm text-[var(--wg-cyber)]">
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold mb-4">BGIN Ceremony</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            You are about to generate your sovereign identity within the BGIN governance constellation.
            Your keys are yours. Your privacy boundaries are yours. No platform can override them.
          </p>
          <label className="block mb-4">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Name your Swordsman (optional)</span>
            <span className="block text-xs text-[var(--text-muted)] mt-1">This becomes your BGIN ID display name.</span>
            <input
              type="text"
              placeholder="e.g. Tokyo Blade"
              maxLength={64}
              value={swordsmanName}
              onChange={(e) => setSwordsmanName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none"
            />
          </label>
          <Button onClick={handleBeginCeremony} disabled={generating}>
            {generating ? 'Generating…' : 'Begin'}
          </Button>
        </>
      )}

      {step === 2 && keys && (
        <>
          <KeyGenAnimation />
          <p className="mt-4 text-[var(--text-secondary)]">Your Swordsman is forming…</p>
          <Button className="mt-6" onClick={handleKeyGenComplete}>
            Continue →
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-bold mb-4">Privacy preferences</h2>
          <PrivacyConfig value={privacy} onChange={setPrivacy} />
          <Button className="mt-6" onClick={handlePrivacyNext}>
            Continue →
          </Button>
        </>
      )}

      {step === 4 && (
        <>
          <h2 className="text-xl font-bold mb-4">MyTerms agreement</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Before connecting to Mages, you proffer bilateral terms (SD-BASE recommended).
            Full MyTerms negotiation will be wired in Phase 3.
          </p>
          <Button onClick={handleMyTermsAccept}>Accept SD-BASE (continue)</Button>
        </>
      )}

      {step === 5 && (
        <>
          <h2 className="text-xl font-bold mb-4">Working group selection</h2>
          <p className="text-[var(--text-secondary)] mb-4">Select at least one Mage to connect to.</p>
          <WGSelector selected={selectedWgs} onChange={setSelectedWgs} />
          <Button className="mt-6" onClick={handleWgNext} disabled={selectedWgs.length === 0}>
            Connect to these Mages →
          </Button>
        </>
      )}

      {step === 6 && (
        <>
          <h2 className="text-xl font-bold mb-4">Agent card</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Your Swordsman identity will be created and stored locally.
          </p>
          <Button onClick={handleAgentCardCreate} disabled={generating}>
            {generating ? 'Creating…' : 'Create agent card'}
          </Button>
        </>
      )}

      {step === 7 && keys && (
        <>
          <h2 className="text-xl font-bold mb-4">Key backup</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Your Swordsman can be recovered with this backup and your passphrase.
            Without both, this identity cannot be restored. Store safely.
          </p>
          <input
            type="password"
            placeholder="Passphrase"
            value={backupPassphrase}
            onChange={(e) => setBackupPassphrase(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 mb-4 text-[var(--text-primary)]"
          />
          <div className="flex gap-3">
            <Button onClick={handleBackupDownload} disabled={generating || !backupPassphrase.trim()}>
              {generating ? 'Generating…' : backupDone ? '✓ Downloaded' : 'Download backup'}
            </Button>
            <Button variant="secondary" onClick={handleBackupSkip}>
              Skip (not recommended)
            </Button>
          </div>
          {backupDone && (
            <Button className="mt-4" onClick={handleComplete}>
              Enter BGIN AI →
            </Button>
          )}
        </>
      )}

      {step === 8 && agentCard && (
        <>
          <h1 className="text-2xl font-bold mb-4">⚔️ Your Swordsman is ready</h1>
          <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] space-y-2 text-sm">
            {agentCard.displayName && (
              <p><strong>BGIN ID name:</strong> {agentCard.displayName}</p>
            )}
            <p><strong>Participant ID:</strong> {agentCard.participantId}</p>
            <p><strong>Trust tier:</strong> Blade (starting tier)</p>
            <p><strong>Connected Mages:</strong> {agentCard.workingGroups.map((w) => w.toUpperCase()).join(', ')}</p>
            <p><strong>Privacy:</strong> {agentCard.privacy.attributionLevel}</p>
            <p><strong>Key backup:</strong> {backupDone ? '✓ Downloaded' : 'Skipped'}</p>
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">
            Your Swordsman will guard your privacy boundaries in all interactions with the BGIN AI constellation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
        </>
      )}
    </main>
  );
}
