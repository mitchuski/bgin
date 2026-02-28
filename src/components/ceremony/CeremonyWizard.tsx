'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { SwordsmanKeys } from '@/lib/ceremony/keygen';
import type { AgentCard } from '@/lib/ceremony/agentCard';
import type { PrivacyPreferences } from '@/lib/ceremony/privacy';
import { DEFAULT_PRIVACY } from '@/lib/ceremony/privacy';
import { createAgentCard } from '@/lib/ceremony/agentCard';
import { storeSwordsmanKeys } from '@/lib/ceremony/storeKeys';
import { localDB } from '@/lib/storage/local';
import {
  CEREMONY_STEPS,
  buildConstellationPath,
  saveCeremonyConstellation,
  getCeremonyConstellation,
  type CeremonyStepEntry,
} from '@/lib/ceremony/constellation';

import ConstellationHeader from './ConstellationHeader';
import WelcomeStep from './WelcomeStep';
import KeyGenStep from './KeyGenStep';
import PrivacyStep from './PrivacyStep';
import MyTermsStep from './MyTermsStep';
import WGStep from './WGStep';
import AgentCardStep from './AgentCardStep';
import BackupStep from './BackupStep';
import CompletionStep from './CompletionStep';

const STEP_IDS = CEREMONY_STEPS.map((s) => s.id);

export default function CeremonyWizard({ returnTo = '/' }: { returnTo?: string }) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [keys, setKeys] = useState<SwordsmanKeys | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(DEFAULT_PRIVACY);
  const [selectedWgs, setSelectedWgs] = useState<string[]>([]);
  const [agentCard, setAgentCard] = useState<AgentCard | null>(null);
  const [backupDone, setBackupDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Constellation state: init empty so server and first client paint match (avoids hydration error from localStorage)
  const [constellationSteps, setConstellationSteps] = useState<CeremonyStepEntry[]>([]);
  const [currentChosenEmoji, setCurrentChosenEmoji] = useState<string | null>(null);
  const [currentInscription, setCurrentInscription] = useState('');

  useEffect(() => {
    const saved = getCeremonyConstellation();
    if (saved?.steps?.length) setConstellationSteps(saved.steps);
  }, []);

  const currentStepId = step >= 1 && step <= STEP_IDS.length ? STEP_IDS[step - 1]! : null;
  const completedStepIds = constellationSteps.map((s) => s.stepId);
  const chosenEmojis: Record<string, string> = {};
  constellationSteps.forEach((e) => {
    chosenEmojis[e.stepId] = e.chosenEmoji;
  });
  if (currentChosenEmoji && currentStepId) chosenEmojis[currentStepId] = currentChosenEmoji;

  const commitStepAndNext = useCallback(
    (nextStep: number) => {
      if (!currentStepId) {
        setStep(nextStep);
        return;
      }
      const def = CEREMONY_STEPS.find((d) => d.id === currentStepId);
      const emoji = currentChosenEmoji ?? def?.emojiOptions[0] ?? '✨';
      const entry: CeremonyStepEntry = {
        stepId: currentStepId,
        chosenEmoji: emoji,
        inscription: currentInscription.trim(),
        completedAt: new Date().toISOString(),
      };
      setConstellationSteps((prev) => {
        const filtered = prev.filter((s) => s.stepId !== currentStepId);
        const next = [...filtered, entry];
        const path = buildConstellationPath(next);
        saveCeremonyConstellation({ steps: next, constellationPath: path });
        return next;
      });
      setCurrentChosenEmoji(null);
      setCurrentInscription('');
      setStep(nextStep);
    },
    [currentStepId, currentChosenEmoji, currentInscription]
  );

  const handleKeyGenerated = useCallback((k: SwordsmanKeys) => {
    setKeys(k);
  }, []);

  const handleAgentCardCreate = useCallback(async () => {
    if (!keys) return;
    setError(null);
    setGenerating(true);
    try {
      const card = await createAgentCard(keys, privacy, selectedWgs, displayName || undefined);
      await storeSwordsmanKeys(keys);
      if (!localDB) throw new Error('IndexedDB not available');
      await localDB.privacyPreferences.put({ ...privacy, id: 'default' });
      await localDB.agentCard.put(card);
      setAgentCard(card);

      // Save final constellation with all steps including seal and activation
      const finalSteps: CeremonyStepEntry[] = [
        ...constellationSteps,
        ...(currentStepId
          ? [
              {
                stepId: currentStepId,
                chosenEmoji: currentChosenEmoji ?? CEREMONY_STEPS.find((d) => d.id === currentStepId)?.emojiOptions[0] ?? '✨',
                inscription: currentInscription.trim(),
                completedAt: new Date().toISOString(),
              },
            ]
          : []),
      ];
      const path = buildConstellationPath(finalSteps);
      saveCeremonyConstellation({ steps: finalSteps, constellationPath: path });
      setConstellationSteps(finalSteps);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('agentCardUpdated'));
      }

      // Register with server
      const registerRes = await fetch('/api/ceremony/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentCard: card }),
      });
      if (!registerRes.ok) {
        const data = await registerRes.json().catch(() => ({}));
        throw new Error(data.message ?? `Registration failed (${registerRes.status})`);
      }

      setCurrentChosenEmoji(null);
      setCurrentInscription('');
      setStep(7); // Go to backup step
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create agent card.');
    } finally {
      setGenerating(false);
    }
  }, [keys, privacy, selectedWgs, displayName, constellationSteps, currentStepId, currentChosenEmoji, currentInscription]);

  const handleBackupComplete = useCallback(() => {
    setBackupDone(true);
    // Commit backup step
    const backupEntry: CeremonyStepEntry = {
      stepId: 'backup',
      chosenEmoji: currentChosenEmoji ?? CEREMONY_STEPS.find((d) => d.id === 'backup')?.emojiOptions[0] ?? '💾',
      inscription: currentInscription.trim(),
      completedAt: new Date().toISOString(),
    };
    const activationEntry: CeremonyStepEntry = {
      stepId: 'activation',
      chosenEmoji: CEREMONY_STEPS.find((d) => d.id === 'activation')?.emojiOptions[0] ?? '✨',
      inscription: '',
      completedAt: new Date().toISOString(),
    };
    setConstellationSteps((prev) => {
      const filtered = prev.filter((s) => s.stepId !== 'backup' && s.stepId !== 'activation');
      const next = [...filtered, backupEntry, activationEntry];
      const path = buildConstellationPath(next);
      saveCeremonyConstellation({ steps: next, constellationPath: path });
      return next;
    });
    setCurrentChosenEmoji(null);
    setCurrentInscription('');
    setStep(8);
  }, [currentChosenEmoji, currentInscription]);

  const handleBackupSkip = useCallback(() => {
    // Commit activation without backup
    const activationEntry: CeremonyStepEntry = {
      stepId: 'activation',
      chosenEmoji: CEREMONY_STEPS.find((d) => d.id === 'activation')?.emojiOptions[0] ?? '✨',
      inscription: '',
      completedAt: new Date().toISOString(),
    };
    setConstellationSteps((prev) => {
      const filtered = prev.filter((s) => s.stepId !== 'activation');
      const next = [...filtered, activationEntry];
      const path = buildConstellationPath(next);
      saveCeremonyConstellation({ steps: next, constellationPath: path });
      return next;
    });
    setStep(8);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)]">
          ← Home
        </Link>
      </div>

      <ConstellationHeader
        completedStepIds={completedStepIds}
        currentStepId={currentStepId}
        chosenEmojis={chosenEmojis}
        onStepSelect={(stepIndex) => {
          // Only allow navigation to completed steps or current step
          const targetStepId = STEP_IDS[stepIndex];
          if (targetStepId && (completedStepIds.includes(targetStepId) || stepIndex + 1 === step)) {
            setStep(stepIndex + 1);
          }
        }}
      />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CEREMONY_STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (completedStepIds.includes(s.id) || i + 1 === step) {
                setStep(i + 1);
              }
            }}
            disabled={!completedStepIds.includes(s.id) && i + 1 !== step}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              step === i + 1
                ? 'bg-[var(--mage)]/20 text-[var(--mage)]'
                : completedStepIds.includes(s.id)
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/80'
                : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-[var(--wg-cyber)] bg-[var(--wg-cyber)]/10 text-sm text-[var(--wg-cyber)]">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
        {step === 1 && (
          <WelcomeStep
            displayName={displayName}
            setDisplayName={setDisplayName}
            onNext={() => commitStepAndNext(2)}
            constellationStep={CEREMONY_STEPS[0]}
            chosenEmoji={currentChosenEmoji}
            onChosenEmoji={setCurrentChosenEmoji}
            inscription={currentInscription}
            setInscription={setCurrentInscription}
          />
        )}

        {step === 2 && (
          <KeyGenStep
            onKeyGenerated={handleKeyGenerated}
            onNext={() => commitStepAndNext(3)}
            constellationStep={CEREMONY_STEPS[1]}
            chosenEmoji={currentChosenEmoji}
            onChosenEmoji={setCurrentChosenEmoji}
            inscription={currentInscription}
            setInscription={setCurrentInscription}
          />
        )}

        {step === 3 && (
          <PrivacyStep
            privacy={privacy}
            setPrivacy={setPrivacy}
            onNext={() => commitStepAndNext(4)}
            constellationStep={CEREMONY_STEPS[2]}
            chosenEmoji={currentChosenEmoji}
            onChosenEmoji={setCurrentChosenEmoji}
            inscription={currentInscription}
            setInscription={setCurrentInscription}
          />
        )}

        {step === 4 && (
          <MyTermsStep
            onNext={() => commitStepAndNext(5)}
            constellationStep={CEREMONY_STEPS[3]}
            chosenEmoji={currentChosenEmoji}
            onChosenEmoji={setCurrentChosenEmoji}
            inscription={currentInscription}
            setInscription={setCurrentInscription}
          />
        )}

        {step === 5 && (
          <WGStep
            selectedWgs={selectedWgs}
            setSelectedWgs={setSelectedWgs}
            onNext={() => commitStepAndNext(6)}
            constellationStep={CEREMONY_STEPS[4]}
            chosenEmoji={currentChosenEmoji}
            onChosenEmoji={setCurrentChosenEmoji}
            inscription={currentInscription}
            setInscription={setCurrentInscription}
          />
        )}

        {step === 6 && keys && (
          <AgentCardStep
            card={{
              participantId: keys.participantId,
              displayName: displayName.trim() || undefined,
              publicKeyHex: keys.publicKeyHex,
              workingGroups: selectedWgs,
              privacy,
              trustTier: 'blade',
            }}
            onNext={handleAgentCardCreate}
            generating={generating}
            error={error}
            constellationStep={CEREMONY_STEPS[5]}
            chosenEmoji={currentChosenEmoji}
            onChosenEmoji={setCurrentChosenEmoji}
            inscription={currentInscription}
            setInscription={setCurrentInscription}
          />
        )}

        {step === 7 && keys && (
          <BackupStep
            keys={keys}
            onNext={handleBackupComplete}
            onSkip={handleBackupSkip}
            constellationStep={CEREMONY_STEPS[6]}
            chosenEmoji={currentChosenEmoji}
            onChosenEmoji={setCurrentChosenEmoji}
            inscription={currentInscription}
            setInscription={setCurrentInscription}
          />
        )}

        {step === 8 && agentCard && (
          <CompletionStep agentCard={agentCard} backupDone={backupDone} />
        )}
      </div>
    </div>
  );
}
