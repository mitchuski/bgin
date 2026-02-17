/**
 * Key ceremony — Ed25519 keypair generation (WebCrypto).
 * See block14_updates/02_KEY_CEREMONY.md
 */

export interface SwordsmanKeys {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyHex: string;
  participantId: string;
  createdAt: string;
}

export async function generateSwordsmanKeys(): Promise<SwordsmanKeys> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify']
  );

  const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyHex = Array.from(new Uint8Array(publicKeyRaw))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const participantId = `bgin-${publicKeyHex.substring(0, 16)}`;

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyHex,
    participantId,
    createdAt: new Date().toISOString(),
  };
}
