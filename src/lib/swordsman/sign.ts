/**
 * Request signing for API auth. 07_API_SPEC: sign `${participantId}:${timestamp}:${body}`.
 */

export async function signRequest(
  privateKey: CryptoKey,
  participantId: string,
  body: string
): Promise<{ timestamp: string; signature: string }> {
  const timestamp = new Date().toISOString();
  const payload = `${participantId}:${timestamp}:${body}`;
  const encoded = new TextEncoder().encode(payload);
  const signature = await crypto.subtle.sign('Ed25519', privateKey, encoded);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { timestamp, signature: signatureHex };
}
