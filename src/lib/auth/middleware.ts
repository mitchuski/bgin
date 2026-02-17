/**
 * Auth middleware — verify Ed25519 signature, extract participantId. 00 Phase 3.1, 07_API_SPEC.
 * Expects headers: X-Participant-Id, X-Timestamp, X-Signature. Body is the signed payload suffix.
 */

import { getParticipant } from '@/lib/storage/server-store';
import { verifySignature, isTimestampValid } from './verify';

export interface AuthResult {
  participantId: string;
  valid: boolean;
  error?: string;
}

export async function verifyRequest(
  request: Request,
  bodyText: string
): Promise<AuthResult> {
  const participantId = request.headers.get('x-participant-id') ?? '';
  const timestamp = request.headers.get('x-timestamp') ?? '';
  const signature = request.headers.get('x-signature') ?? '';

  if (!participantId || !timestamp || !signature) {
    return { participantId: '', valid: false, error: 'Missing auth headers' };
  }

  if (!isTimestampValid(timestamp)) {
    return { participantId, valid: false, error: 'Timestamp expired or invalid' };
  }

  const participant = await getParticipant(participantId);
  if (!participant) {
    return { participantId, valid: false, error: 'Participant not registered' };
  }

  const payload = `${participantId}:${timestamp}:${bodyText}`;
  const ok = await verifySignature(participant.publicKeyHex, payload, signature);
  if (!ok) {
    return { participantId, valid: false, error: 'Invalid signature' };
  }

  return { participantId, valid: true };
}

/**
 * For routes that don't have a body (e.g. GET), use empty body.
 */
export async function verifyRequestNoBody(request: Request): Promise<AuthResult> {
  return verifyRequest(request, '');
}
