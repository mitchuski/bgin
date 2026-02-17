/**
 * Ed25519 sign a string (for agent card and API requests). 02_KEY_CEREMONY, 07_API_SPEC.
 */

export async function signData(privateKey: CryptoKey, data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const signature = await crypto.subtle.sign('Ed25519', privateKey, encoded);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifySignature(
  publicKey: CryptoKey,
  data: string,
  signatureHex: string
): Promise<boolean> {
  const encoded = new TextEncoder().encode(data);
  const sigBytes = new Uint8Array(
    signatureHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  );
  return crypto.subtle.verify('Ed25519', publicKey, sigBytes, encoded);
}
