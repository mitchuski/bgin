/**
 * POST /api/ceremony/register — Register participant after key ceremony. 00 Phase 3.2, 07_API_SPEC.
 * Verifies agent card self-signature, stores participant (no auth headers required for this route).
 */

import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/auth/verify';
import { upsertParticipant } from '@/lib/storage/server-store';

interface AgentCardBody {
  version: string;
  type: string;
  participantId: string;
  displayName?: string;
  publicKeyHex: string;
  createdAt: string;
  privacy: {
    attributionLevel: 'full' | 'role_only' | 'anonymous';
    maxQueriesPerSession?: number;
  };
  workingGroups: string[];
  trustTier: string;
  signature: string;
}

export async function POST(request: Request) {
  let body: { agentCard?: AgentCardBody };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const card = body?.agentCard;
  if (!card?.participantId || !card?.publicKeyHex || !card?.signature) {
    return NextResponse.json(
      { error: 'missing_agent_card', message: 'agentCard with participantId, publicKeyHex, signature required' },
      { status: 400 }
    );
  }

  const { signature: _sig, ...cardPayload } = card;
  const cardJson = JSON.stringify(cardPayload);
  const valid = await verifySignature(card.publicKeyHex, cardJson, card.signature);
  if (!valid) {
    return NextResponse.json(
      { error: 'signature_invalid', message: 'Agent card signature verification failed' },
      { status: 400 }
    );
  }

  await upsertParticipant({
    participantId: card.participantId,
    displayName: card.displayName?.trim() || undefined,
    publicKeyHex: card.publicKeyHex,
    trustTier: 'blade',
    workingGroups: card.workingGroups ?? [],
    attributionLevel: card.privacy?.attributionLevel ?? 'anonymous',
    maxQueriesPerSession: card.privacy?.maxQueriesPerSession ?? 16,
    registeredAt: card.createdAt ?? new Date().toISOString(),
  });

  return NextResponse.json(
    {
      participantId: card.participantId,
      registered: true,
      connectedMages: card.workingGroups ?? [],
    },
    { status: 201 }
  );
}
