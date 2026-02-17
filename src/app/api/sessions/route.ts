/**
 * GET /api/sessions — List privacy budget sessions for authenticated participant. 00 Phase 3.4, 07_API_SPEC.
 * POST not in spec; session create/refresh happens when Mage chat checks budget (Phase 5).
 */

import { NextResponse } from 'next/server';
import { verifyRequestNoBody } from '@/lib/auth/middleware';
import { getSessionsForParticipant } from '@/lib/storage/server-store';

export async function GET(request: Request) {
  const auth = await verifyRequestNoBody(request);
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'signature_invalid', message: auth.error ?? 'Authentication failed' },
      { status: 401 }
    );
  }

  const sessions = await getSessionsForParticipant(auth.participantId);

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      workingGroup: s.workingGroup,
      queriesUsed: s.queriesUsed,
      maxQueries: s.maxQueries,
      expiresAt: s.expiresAt,
    })),
  });
}
