'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { signedFetch, getParticipantId } from '@/lib/swordsman/signedFetch';
import { createPromise, updatePromiseStatus } from '@/lib/promises/client';
import type { PromiseType } from '@/lib/promises/types';
import PromiseCard from './PromiseCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface PromiseRow {
  id: string;
  participantId: string;
  workingGroup: string;
  type: PromiseType;
  description: string;
  relatedTopics: string[];
  status: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  selfAssessmentNote?: string;
  peerAssessments?: Array<{ assessorId: string; assessment: string; timestamp: string }>;
  connectedProverb?: string;
}

const STATUS_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'active', label: 'Active' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'withdrawn', label: 'Withdrawn' },
];

export default function PromiseBoard({ wg }: { wg: string }) {
  const [promises, setPromises] = useState<PromiseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);

  const fetchPromises = useCallback(async () => {
    const pid = await getParticipantId();
    setParticipantId(pid);
    if (!pid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await signedFetch(`/api/promises?wg=${encodeURIComponent(wg)}`, { method: 'GET' });
      const data = await res.json();
      if (data.promises) setPromises(data.promises);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load promises');
    } finally {
      setLoading(false);
    }
  }, [wg]);

  useEffect(() => {
    fetchPromises();
  }, [fetchPromises]);

  const handleStatusChange = useCallback(
    async (promiseId: string, newStatus: 'in_progress' | 'completed') => {
      try {
        await updatePromiseStatus(promiseId, newStatus);
        await fetchPromises();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed');
      }
    },
    [fetchPromises]
  );

  if (loading) {
    return <p className="text-[var(--text-muted)]">Loading promises…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">🤝 Promises — {wg.toUpperCase()}</h2>
        <Button onClick={() => setModalOpen(true)}>+ New Promise</Button>
      </div>
      {error && (
        <p className="text-sm text-[var(--wg-cyber)] mb-3">{error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map((col) => (
          <div
            key={col.key}
            className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-tertiary)] min-h-[200px]"
          >
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">{col.label}</h3>
            <div className="space-y-3">
              {promises
                .filter((p) => p.status === col.key)
                .map((p) => (
                  <PromiseCard
                    key={p.id}
                    id={p.id}
                    type={p.type}
                    description={p.description}
                    dueDate={p.dueDate}
                    status={p.status}
                    workingGroup={p.workingGroup}
                    isMine={p.participantId === participantId}
                    peerAssessments={p.peerAssessments}
                    connectedProverb={p.connectedProverb}
                    onStatusChange={
                      p.participantId === participantId
                        ? (newStatus) => handleStatusChange(p.id, newStatus)
                        : undefined
                    }
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      <NewPromiseModal
        wg={wg}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          fetchPromises();
        }}
      />
    </div>
  );
}

const PROMISE_TYPES: PromiseType[] = [
  'author',
  'review',
  'attend',
  'present',
  'research',
  'coordinate',
  'custom',
];

function NewPromiseModal({
  wg,
  open,
  onClose,
  onCreated,
}: {
  wg: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<PromiseType>('author');
  const [description, setDescription] = useState('');
  const [relatedTopics, setRelatedTopics] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [connectedProverb, setConnectedProverb] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setErr(null);
    try {
      await createPromise({
        workingGroup: wg,
        type,
        description: description.trim(),
        relatedTopics: relatedTopics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        dueDate: dueDate.trim() || undefined,
        connectedProverb: connectedProverb.trim() || undefined,
      });
      setDescription('');
      setRelatedTopics('');
      setDueDate('');
      setConnectedProverb('');
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to create promise');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Promise">
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Voluntary commitment for {wg.toUpperCase()}. You can withdraw at any time.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PromiseType)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm"
          >
            {PROMISE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm"
            placeholder="What you commit to do..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Related topics (comma-separated)</label>
          <input
            type="text"
            value={relatedTopics}
            onChange={(e) => setRelatedTopics(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm"
            placeholder="privacy pools, ZK compliance"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Connect proverb (optional)</label>
          <textarea
            value={connectedProverb}
            onChange={(e) => setConnectedProverb(e.target.value)}
            rows={2}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm"
            placeholder="A proverb that captures your understanding behind this commitment..."
          />
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Links proof of understanding (proverb) to the promise (action). Strengthens the trust graph.
          </p>
        </div>
        {err && <p className="text-sm text-[var(--wg-cyber)]">{err}</p>}
        <div className="flex gap-2 justify-end">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !description.trim()}>
            {submitting ? '…' : 'Make Promise'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
