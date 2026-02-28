/**
 * GET /api/promises?wg=ikp&status=active — List promises.
 * POST /api/promises — Create promise (auth + body signature). 05, 07_API_SPEC.
 */

import { NextResponse } from 'next/server';
import { verifyRequest, verifyRequestNoBody } from '@/lib/auth/middleware';
import { getParticipant, addPromise, listPromises } from '@/lib/storage/server-store';
import type { PromiseRow, PromiseStatus } from '@/lib/storage/server-store';
import { verifySignature } from '@/lib/auth/verify';

const VALID_WGS = ['ikp', 'fase', 'cyber', 'governance'];
const VALID_TYPES: PromiseRow['type'][] = [
  'author', 'review', 'attend', 'present', 'research', 'coordinate', 'custom',
];

function canonicalPromisePayload(body: {
  workingGroup: string;
  type: string;
  description: string;
  relatedTopics: string[];
  dueDate?: string | null;
  connectedProverb?: string | null;
}): string {
  return JSON.stringify({
    workingGroup: body.workingGroup,
    type: body.type,
    description: body.description,
    relatedTopics: [...(body.relatedTopics ?? [])].sort(),
    dueDate: body.dueDate ?? null,
    connectedProverb: body.connectedProverb ?? null,
  });
}

/** GET is open: list promises without auth. POST (create) still requires ceremony + register for attribution. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const wg = (url.searchParams.get('wg') ?? '').toLowerCase();
  if (!VALID_WGS.includes(wg)) {
    return NextResponse.json(
      { error: 'invalid_wg', message: 'workingGroup required (ikp|fase|cyber|governance)' },
      { status: 400 }
    );
  }
  const status = url.searchParams.get('status') as PromiseStatus | null;
  const validStatuses: PromiseStatus[] = ['active', 'in_progress', 'completed', 'withdrawn'];
  const statusFilter = status && validStatuses.includes(status) ? status : undefined;

  const promises = await listPromises(wg, statusFilter);
  return NextResponse.json({ promises });
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const auth = await verifyRequest(request, bodyText);
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'unauthorized', message: auth.error ?? 'Authentication failed' },
      { status: 401 }
    );
  }

  let body: {
    workingGroup?: string;
    type?: string;
    description?: string;
    relatedTopics?: string[];
    dueDate?: string;
    connectedProverb?: string;
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

  const workingGroup = (body.workingGroup ?? '').toLowerCase();
  if (!VALID_WGS.includes(workingGroup)) {
    return NextResponse.json(
      { error: 'invalid_wg', message: 'workingGroup required' },
      { status: 400 }
    );
  }
  if (!VALID_TYPES.includes(body.type as PromiseRow['type'])) {
    return NextResponse.json(
      { error: 'invalid_type', message: 'type required' },
      { status: 400 }
    );
  }
  const description = (body.description ?? '').trim();
  if (!description) {
    return NextResponse.json(
      { error: 'missing_description', message: 'description required' },
      { status: 400 }
    );
  }
  const relatedTopics = Array.isArray(body.relatedTopics) ? body.relatedTopics : [];
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

  const connectedProverb = typeof body.connectedProverb === 'string' ? body.connectedProverb.trim() || undefined : undefined;

  const payload = canonicalPromisePayload({
    workingGroup,
    type: body.type!,
    description,
    relatedTopics,
    dueDate: body.dueDate ?? null,
    connectedProverb: connectedProverb ?? null,
  });
  const sigValid = await verifySignature(participant.publicKeyHex, payload, signature);
  if (!sigValid) {
    return NextResponse.json(
      { error: 'invalid_signature', message: 'Promise signature verification failed' },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row: PromiseRow = {
    id,
    participantId: auth.participantId,
    workingGroup,
    type: body.type as PromiseRow['type'],
    description,
    relatedTopics,
    status: 'active',
    dueDate: body.dueDate?.trim() || undefined,
    createdAt: now,
    signature,
    peerAssessments: [],
    connectedProverb,
  };
  await addPromise(row);
  return NextResponse.json({ id, createdAt: now }, { status: 201 });
}
