/**
 * Signed fetch for authenticated API calls. Uses keys from IndexedDB; add headers per 07_API_SPEC.
 */

import { loadSwordsmanKeys } from '@/lib/ceremony/storeKeys';
import { signRequest } from './sign';
import { localDB } from '@/lib/storage/local';

export async function getParticipantId(): Promise<string | null> {
  if (!localDB) return null;
  const card = await localDB.agentCard.toCollection().first();
  return card?.participantId ?? null;
}

/**
 * Fetch with Ed25519 signed auth headers. Body is stringified for signing.
 */
export async function signedFetch(
  url: string,
  options: RequestInit & { body?: string | object }
): Promise<Response> {
  const participantId = await getParticipantId();
  if (!participantId) {
    throw new Error('No agent card: complete ceremony first');
  }

  const keys = await loadSwordsmanKeys(participantId);
  if (!keys) {
    throw new Error('Keys not found: complete ceremony first');
  }

  const bodyText =
    typeof options.body === 'string'
      ? options.body
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : '';

  const { timestamp, signature } = await signRequest(
    keys.privateKey,
    participantId,
    bodyText
  );

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('X-Participant-Id', participantId);
  headers.set('X-Timestamp', timestamp);
  headers.set('X-Signature', signature);

  const { body: _b, ...rest } = options;
  return fetch(url, {
    ...rest,
    headers,
    body: bodyText || undefined,
  });
}
