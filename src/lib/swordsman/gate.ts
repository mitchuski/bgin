/**
 * Swordsman privacy gate — filters outgoing requests, attaches MyTerms headers, signs.
 * 00 Phase 1.5, 01_ARCHITECTURE Swordsman-Mage Mediation.
 */

export async function applyGate(
  _url: string,
  _options: RequestInit,
  _participantContext: { participantId: string; privacy: unknown }
): Promise<RequestInit> {
  // TODO: apply privacy prefs, attach MRPAZ headers, sign request. See lib/swordsman/sign.
  return _options;
}
