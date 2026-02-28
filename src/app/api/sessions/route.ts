/**
 * GET /api/sessions — List privacy budget sessions. Open: no auth required (returns empty when unauthenticated).
 */

import { NextResponse } from 'next/server';
import { verifyRequestNoBody } from '@/lib/auth/middleware';
import { getSessionsForParticipant } from '@/lib/storage/server-store';

export async function GET(request: Request) {
  const auth = await verifyRequestNoBody(request);
  const sessions = auth.valid
    ? await getSessionsForParticipant(auth.participantId)
    : [];

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
