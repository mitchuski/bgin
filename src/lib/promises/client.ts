/**
 * Client helpers for promise CRUD. Signs canonical payload for create/update/assess.
 */

import { loadSwordsmanKeys } from '@/lib/ceremony/storeKeys';
import { signData } from '@/lib/ceremony/signData';
import { signedFetch } from '@/lib/swordsman/signedFetch';
import type { PromiseType } from './types';

function canonicalCreatePayload(o: {
  workingGroup: string;
  type: string;
  description: string;
  relatedTopics: string[];
  dueDate?: string | null;
}): string {
  return JSON.stringify({
    workingGroup: o.workingGroup,
    type: o.type,
    description: o.description,
    relatedTopics: [...(o.relatedTopics ?? [])].sort(),
    dueDate: o.dueDate ?? null,
  });
}

export interface CreatePromiseInput {
  workingGroup: string;
  type: PromiseType;
  description: string;
  relatedTopics?: string[];
  dueDate?: string;
}

export async function createPromise(input: CreatePromiseInput): Promise<{ id: string; createdAt: string }> {
  const { getParticipantId } = await import('@/lib/swordsman/signedFetch');
  const pid = await getParticipantId();
  if (!pid) throw new Error('No agent card');
  const keys = await loadSwordsmanKeys(pid);
  if (!keys) throw new Error('Keys not found');

  const payload = canonicalCreatePayload({
    workingGroup: input.workingGroup,
    type: input.type,
    description: input.description,
    relatedTopics: input.relatedTopics ?? [],
    dueDate: input.dueDate ?? null,
  });
  const signature = await signData(keys.privateKey, payload);
  const body = {
    workingGroup: input.workingGroup,
    type: input.type,
    description: input.description,
    relatedTopics: input.relatedTopics ?? [],
    dueDate: input.dueDate ?? undefined,
    signature,
  };
  const res = await signedFetch('/api/promises', { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);
  return { id: data.id, createdAt: data.createdAt };
}

export async function updatePromiseStatus(
  promiseId: string,
  status: 'active' | 'in_progress' | 'completed' | 'withdrawn',
  selfAssessmentNote?: string
): Promise<unknown> {
  const { getParticipantId } = await import('@/lib/swordsman/signedFetch');
  const pid = await getParticipantId();
  if (!pid) throw new Error('No agent card');
  const keys = await loadSwordsmanKeys(pid);
  if (!keys) throw new Error('Keys not found');

  const payload = JSON.stringify({
    promiseId,
    status,
    selfAssessmentNote: selfAssessmentNote ?? null,
  });
  const signature = await signData(keys.privateKey, payload);
  const body = { status, selfAssessment: selfAssessmentNote ? { note: selfAssessmentNote } : undefined, signature };
  const res = await signedFetch(`/api/promises/${promiseId}`, { method: 'PATCH', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);
  return data;
}

export async function assessPromise(
  promiseId: string,
  assessment: 'verified' | 'partial' | 'not_verified'
): Promise<unknown> {
  const { getParticipantId } = await import('@/lib/swordsman/signedFetch');
  const pid = await getParticipantId();
  if (!pid) throw new Error('No agent card');
  const keys = await loadSwordsmanKeys(pid);
  if (!keys) throw new Error('Keys not found');

  const payload = JSON.stringify({ promiseId, assessment });
  const signature = await signData(keys.privateKey, payload);
  const res = await signedFetch(`/api/promises/${promiseId}/assess`, {
    method: 'POST',
    body: JSON.stringify({ assessment, signature }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);
  return data;
}
