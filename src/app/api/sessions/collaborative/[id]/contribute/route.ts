/**
 * POST /api/sessions/collaborative/[id]/contribute — Cast Mage response into session + spellbook.
 * Body: { content, workingGroup?, mageQuery?, sources?, crossWgRefs? }
 */

import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth/middleware';
import { getParticipant } from '@/lib/storage/server-store';
import { addContribution, getCollaborativeSession } from '@/lib/storage/collaborative-sessions';
import { addSpellbookEntry, type SpellbookEntryRow } from '@/lib/storage/server-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionIdParam } = await params;
  const sessionId = sessionIdParam ?? '';
  const session = await getCollaborativeSession(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: 'not_found', message: 'Session not found' },
      { status: 404 }
    );
  }

  const bodyText = await request.text();
  let participantId: string | undefined;
  try {
    const auth = await verifyRequest(request, bodyText);
    if (auth.valid) participantId = auth.participantId;
  } catch {
    // optional auth
  }

  let body: {
    content?: string;
    workingGroup?: string;
    mageQuery?: string;
    sources?: Array<{ documentTitle: string; documentDate: string; relevanceScore?: number }>;
    crossWgRefs?: Array<{ workingGroup: string; topic: string; hint?: string }>;
  };
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const content = (body.content ?? '').trim();
  if (!content) {
    return NextResponse.json(
      { error: 'missing_content', message: 'content required' },
      { status: 400 }
    );
  }

  const workingGroup = (body.workingGroup ?? session.workingGroup ?? 'ikp').toLowerCase();
  const updated = await addContribution(sessionId, {
    content,
    workingGroup,
    participantId,
  });

  // Also add to spellbook (Block14 Spellbook workspace)
  const participant = participantId ? await getParticipant(participantId) : null;
  const spellbookEntry: SpellbookEntryRow = {
    id: crypto.randomUUID(),
    sessionId,
    sessionTitle: session.title,
    workingGroup,
    participantId: participantId ?? '',
    participantTier: participant?.trustTier ?? 'blade',
    mageQuery: (body.mageQuery ?? '').trim() || '(no query)',
    mageResponse: content,
    sources: body.sources ?? [],
    crossWgRefs: body.crossWgRefs ?? [],
    addedAt: new Date().toISOString(),
    attributionLevel: participant?.attributionLevel ?? 'anonymous',
  };
  await addSpellbookEntry(spellbookEntry);

  return NextResponse.json(updated ?? { sessionId });
}
