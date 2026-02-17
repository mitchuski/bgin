/**
 * Ed25519 signature verification (server). 07_API_SPEC.
 * Payload: `${participantId}:${timestamp}:${requestBody}`
 */

function hexToBytes(hex: string): Uint8Array {
  const match = hex.match(/.{2}/g);
  if (!match) return new Uint8Array(0);
  return new Uint8Array(match.map((b) => parseInt(b, 16)));
}

export async function verifySignature(
  publicKeyHex: string,
  payload: string,
  signatureHex: string
): Promise<boolean> {
  try {
    const keyRaw = hexToBytes(publicKeyHex);
    const publicKey = await crypto.subtle.importKey(
      'raw',
      keyRaw as unknown as ArrayBuffer,
      { name: 'Ed25519' },
      false,
      ['verify']
    );
    const signatureBytes = hexToBytes(signatureHex);
    const payloadBytes = new TextEncoder().encode(payload);
    return crypto.subtle.verify(
      'Ed25519',
      publicKey,
      signatureBytes as unknown as ArrayBuffer,
      payloadBytes
    );
  } catch {
    return false;
  }
}

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

export function isTimestampValid(isoTimestamp: string): boolean {
  const t = new Date(isoTimestamp).getTime();
  const now = Date.now();
  return Math.abs(now - t) <= TIMESTAMP_TOLERANCE_MS;
}
