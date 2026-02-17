/**
 * GET /api/promises/[id] — Get one promise.
 * PATCH /api/promises/[id] — Update status (auth + signature). 05, 07_API_SPEC.
 */

import { NextResponse } from 'next/server';
import { verifyRequest, verifyRequestNoBody } from '@/lib/auth/middleware';
import { getParticipant, getPromise, updatePromise } from '@/lib/storage/server-store';
import { verifySignature } from '@/lib/auth/verify';

const VALID_STATUSES = ['active', 'in_progress', 'completed', 'withdrawn'] as const;

export async function GET(
  req: Request,
  ctx: { params: { id: string } }
) {
  const auth = await verifyRequestNoBody(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'unauthorized', message: auth.error ?? 'Authentication required' },
      { status: 401 }
    );
  }
  const promise = await getPromise(ctx.params.id);
  if (!promise) {
    return NextResponse.json(
      { error: 'not_found', message: 'Promise not found' },
      { status: 404 }
    );
  }
  return NextResponse.json(promise);
}

export async function PATCH(
  request: Request,
  ctx: { params: { id: string } }
) {
  const bodyText = await request.text();
  const auth = await verifyRequest(request, bodyText);
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'unauthorized', message: auth.error ?? 'Authentication failed' },
      { status: 401 }
    );
  }

  const promise = await getPromise(ctx.params.id);
  if (!promise) {
    return NextResponse.json(
      { error: 'not_found', message: 'Promise not found' },
      { status: 404 }
    );
  }
  if (promise.participantId !== auth.participantId) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Only the promise-maker can update status' },
      { status: 403 }
    );
  }

  let body: {
    status?: string;
    selfAssessment?: { note: string };
    signature?: string;
  };
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const status = body.status;
  const updates: { status?: typeof promise.status; completedAt?: string; selfAssessmentNote?: string } = {};
  if (status && VALID_STATUSES.includes(status as typeof promise.status)) {
    updates.status = status as typeof promise.status;
    if (updates.status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
  }
  if (body.selfAssessment?.note) {
    updates.selfAssessmentNote = body.selfAssessment.note.trim();
  }

  const signature = body.signature ?? '';
  if (Object.keys(updates).length > 0 && signature) {
    const participant = await getParticipant(auth.participantId);
    if (participant) {
      const payload = JSON.stringify({
        promiseId: ctx.params.id,
        status: updates.status ?? promise.status,
        selfAssessmentNote: updates.selfAssessmentNote ?? promise.selfAssessmentNote ?? null,
      });
      const ok = await verifySignature(participant.publicKeyHex, payload, signature);
      if (!ok) {
        return NextResponse.json(
          { error: 'invalid_signature', message: 'Update signature verification failed' },
          { status: 400 }
        );
      }
    }
  }

  const updated = await updatePromise(ctx.params.id, updates);
  return NextResponse.json(updated ?? { id: ctx.params.id });
}
