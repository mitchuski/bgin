'use client';

import { CEREMONY_STEPS } from '@/lib/ceremony/constellation';

export default function ConstellationHeader({
  completedStepIds,
  currentStepId,
  chosenEmojis,
  onStepSelect,
}: {
  completedStepIds: string[];
  currentStepId: string | null;
  chosenEmojis: Record<string, string>;
  onStepSelect?: (stepIndex: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 py-4 mb-4 overflow-x-auto">
      {CEREMONY_STEPS.map((step, i) => {
        const isCompleted = completedStepIds.includes(step.id);
        const isCurrent = step.id === currentStepId;
        const emoji = chosenEmojis[step.id] || step.emojiOptions[0];

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onStepSelect?.(i)}
              disabled={!isCompleted && !isCurrent}
              className={`text-xl p-1 rounded transition-all ${
                isCurrent
                  ? 'ring-2 ring-[var(--mage)] bg-[var(--mage)]/20 scale-110'
                  : isCompleted
                  ? 'opacity-100 hover:scale-105'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title={step.title}
            >
              {isCompleted || isCurrent ? emoji : '○'}
            </button>
            {i < CEREMONY_STEPS.length - 1 && (
              <span className={`mx-0.5 text-sm ${isCompleted ? 'text-[var(--mage)]' : 'text-[var(--text-muted)]'}`}>
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
