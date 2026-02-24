/**
 * POST /api/promises/[id]/assess — Peer assessment (verified | partial | not_verified). 05, 07_API_SPEC.
 */

import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth/middleware';
import { getParticipant, getPromise, addPeerAssessment } from '@/lib/storage/server-store';
import { verifySignature } from '@/lib/auth/verify';

const VALID_ASSESSMENTS = ['verified', 'partial', 'not_verified'] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const bodyText = await request.text();
  const auth = await verifyRequest(request, bodyText);
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'unauthorized', message: auth.error ?? 'Authentication failed' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const promise = await getPromise(id);
  if (!promise) {
    return NextResponse.json(
      { error: 'not_found', message: 'Promise not found' },
      { status: 404 }
    );
  }
  if (promise.participantId === auth.participantId) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Cannot assess your own promise' },
      { status: 403 }
    );
  }

  let body: { assessment?: string; signature?: string };
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const assessment = body.assessment;
  if (!assessment || !VALID_ASSESSMENTS.includes(assessment as typeof VALID_ASSESSMENTS[number])) {
    return NextResponse.json(
      { error: 'invalid_assessment', message: 'assessment must be verified | partial | not_verified' },
      { status: 400 }
    );
  }
  const signature = body.signature ?? '';
  if (!signature) {
    return NextResponse.json(
      { error: 'missing_signature', message: 'signature required' },
      { status: 400 }
    );
  }

  const participant = await getParticipant(auth.participantId);
  if (!participant) {
    return NextResponse.json(
      { error: 'participant_not_found', message: 'Register first' },
      { status: 400 }
    );
  }

  const payload = JSON.stringify({
    promiseId: id,
    assessment,
  });
  const ok = await verifySignature(participant.publicKeyHex, payload, signature);
  if (!ok) {
    return NextResponse.json(
      { error: 'invalid_signature', message: 'Assessment signature verification failed' },
      { status: 400 }
    );
  }

  const updated = await addPeerAssessment(
    id,
    auth.participantId,
    assessment as 'verified' | 'partial' | 'not_verified'
  );
  return NextResponse.json(updated ?? { promiseId: id });
}
