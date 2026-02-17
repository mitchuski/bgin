/**
 * POST /api/myterms/negotiate — Swordsman proffers terms, server responds. 00 Phase 3.3, 07_API_SPEC.
 * For Phase 3 we accept SD-BASE, generate a stub platform signature, store agreement.
 */

import { NextResponse } from 'next/server';
import { addAgreementRecord } from '@/lib/storage/server-store';
import { verifyRequest } from '@/lib/auth/middleware';

const PLATFORM_SIGNATURE_STUB = 'platform-sig-stub'; // Replace with real key when MYTERMS_PLATFORM_KEYPAIR is set

export async function POST(request: Request) {
  const bodyText = await request.text();
  let body: { agreementId?: string; version?: string; participantSignature?: string; mrpazHeaders?: Record<string, string> };
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const auth = await verifyRequest(request, bodyText);
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'signature_invalid', message: auth.error ?? 'Authentication failed' },
      { status: 401 }
    );
  }

  const agreementId = body.agreementId ?? 'SD-BASE';
  const version = body.version ?? '1.0';
  const participantSignature = body.participantSignature ?? '';

  if (!participantSignature) {
    return NextResponse.json(
      { error: 'missing_signature', message: 'participantSignature required' },
      { status: 400 }
    );
  }

  const agreementRecordId = crypto.randomUUID();
  const agreementHash = `sha256-${Buffer.from(bodyText).toString('base64').slice(0, 16)}`;

  await addAgreementRecord({
    id: agreementRecordId,
    participantId: auth.participantId,
    agreementId,
    agreementVersion: version,
    status: 'active',
    signedAt: new Date().toISOString(),
    participantSignature,
    platformSignature: PLATFORM_SIGNATURE_STUB,
    agreementHash,
    regionalFramework: body.mrpazHeaders?.MRPAZ_R ?? 'GLOBAL',
  });

  return NextResponse.json({
    status: 'accepted',
    agreementRecordId,
    platformSignature: PLATFORM_SIGNATURE_STUB,
  });
}
