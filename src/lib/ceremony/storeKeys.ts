/**
 * Persist Swordsman keys to IndexedDB (as JWK strings). 02_KEY_CEREMONY Step 7.
 */

import type { SwordsmanKeys } from './keygen';
import { localDB } from '@/lib/storage/local';

export async function storeSwordsmanKeys(keys: SwordsmanKeys): Promise<void> {
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keys.privateKey);

  await localDB.swordsmanKeys.put({
    id: keys.participantId,
    publicKeyJwk: JSON.stringify(publicKeyJwk),
    privateKeyJwk: JSON.stringify(privateKeyJwk),
    publicKeyHex: keys.publicKeyHex,
    participantId: keys.participantId,
    createdAt: keys.createdAt,
  });
}

export async function loadSwordsmanKeys(
  participantId: string
): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey } | null> {
  const row = await localDB.swordsmanKeys.get(participantId);
  if (!row) return null;

  const publicKeyJwk = JSON.parse(row.publicKeyJwk) as JsonWebKey;
  const privateKeyJwk = JSON.parse(row.privateKeyJwk) as JsonWebKey;

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    { name: 'Ed25519' },
    true,
    ['verify']
  );
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'Ed25519' },
    true,
    ['sign']
  );

  return { publicKey, privateKey };
}
