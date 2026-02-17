/**
 * Encrypted key backup for recovery. 02_KEY_CEREMONY Step 7.
 * Private key encrypted with passphrase; recovery requires backup file + passphrase.
 */

import type { SwordsmanKeys } from './keygen';

export async function generateKeyBackup(
  keys: SwordsmanKeys,
  passphrase: string
): Promise<string> {
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keys.privateKey);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const encryptionKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    new TextEncoder().encode(JSON.stringify(privateKeyJwk))
  );

  return btoa(
    JSON.stringify({
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      participantId: keys.participantId,
      publicKeyHex: keys.publicKeyHex,
    })
  );
}
