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

  try {
    // Build payload in same key order as client (createAgentCard) so signature verification matches
    const payloadForVerification = {
      version: card.version ?? '1.0',
      type: card.type ?? 'swordsman',
      participantId: card.participantId,
      ...(card.displayName !== undefined && card.displayName !== '' ? { displayName: String(card.displayName).trim() } : {}),
      publicKeyHex: card.publicKeyHex,
      createdAt: card.createdAt,
      privacy: card.privacy ?? { attributionLevel: 'anonymous' as const, maxQueriesPerSession: 16 },
      workingGroups: Array.isArray(card.workingGroups) ? card.workingGroups : [],
      trustTier: card.trustTier ?? 'blade',
    };
    const cardJson = JSON.stringify(payloadForVerification);
    const valid = await verifySignature(card.publicKeyHex, cardJson, card.signature);
    if (!valid) {
      return NextResponse.json(
        { error: 'signature_invalid', message: 'Agent card signature verification failed' },
        { status: 400 }
      );
    }

    const attributionLevel = card.privacy?.attributionLevel;
    const safeAttribution = attributionLevel === 'full' || attributionLevel === 'role_only' || attributionLevel === 'anonymous'
      ? attributionLevel
      : 'anonymous';

    await upsertParticipant({
      participantId: card.participantId,
      displayName: card.displayName?.trim() || undefined,
      publicKeyHex: card.publicKeyHex,
      trustTier: 'blade',
      workingGroups: Array.isArray(card.workingGroups) ? card.workingGroups : [],
      attributionLevel: safeAttribution,
      maxQueriesPerSession: card.privacy?.maxQueriesPerSession ?? 16,
      registeredAt: card.createdAt ?? new Date().toISOString(),
    });

    return NextResponse.json(
      {
        participantId: card.participantId,
        registered: true,
        connectedMages: Array.isArray(card.workingGroups) ? card.workingGroups : [],
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[ceremony/register]', err);
    return NextResponse.json(
      { error: 'registration_failed', message: 'Registration failed. Please try again or complete the ceremony locally first.' },
      { status: 500 }
    );
  }
}
