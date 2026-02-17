/**
 * GET/POST /api/proverbs — List (feed) or create proverbs (RPP).
 * Proverbs can be from Mage response (inscribe), or agreement on a cast (cast_agreement / cast_inscription).
 */

import { NextRequest, NextResponse } from 'next/server';
import { listProverbs, addProverb, getParticipant, getSpellbookEntry } from '@/lib/storage/server-store';
import type { ProverbSourceType } from '@/lib/storage/server-store';
import { verifyRequest, verifyRequestNoBody } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workingGroup = searchParams.get('workingGroup') ?? undefined;
  const castEntryId = searchParams.get('castEntryId') ?? undefined;
  const sourceType = searchParams.get('sourceType') as ProverbSourceType | undefined;
  const mine = searchParams.get('mine') === '1' || searchParams.get('mine') === 'true';
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

  let participantId: string | undefined;
  if (mine) {
    const auth = await verifyRequestNoBody(request);
    if (auth.valid) participantId = auth.participantId;
  }

  try {
    const proverbs = await listProverbs({
      workingGroup,
      castEntryId,
      sourceType,
      participantId,
      limit: Math.min(limit, 100),
      offset,
    });
    return NextResponse.json({ proverbs });
  } catch (e) {
    console.error('Failed to list proverbs:', e);
    return NextResponse.json(
      { error: 'Failed to list proverbs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const auth = await verifyRequest(request, bodyText);

    if (!auth.valid) {
      return NextResponse.json(
        { error: 'auth_failed', message: auth.error ?? 'Authentication failed' },
        { status: 401 }
      );
    }

    const participant = await getParticipant(auth.participantId);
    if (!participant) {
      return NextResponse.json(
        { error: 'participant_not_found', message: 'Participant not found' },
        { status: 404 }
      );
    }

    let body: {
      content?: string;
      workingGroup?: string;
      sourceType?: ProverbSourceType;
      castEntryId?: string;
    };
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { error: 'invalid_json', message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const content = body.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: 'missing_content', message: 'content is required' },
        { status: 400 }
      );
    }

    const workingGroup = (body.workingGroup ?? '').toLowerCase();
    const validWgs = ['ikp', 'fase', 'cyber', 'governance'];
    if (!validWgs.includes(workingGroup)) {
      return NextResponse.json(
        { error: 'invalid_wg', message: 'workingGroup must be one of: ikp, fase, cyber, governance' },
        { status: 400 }
      );
    }

    const sourceType: ProverbSourceType = body.sourceType ?? 'mage_response';
    const castEntryId = body.castEntryId ?? undefined;

    if ((sourceType === 'cast_agreement' || sourceType === 'cast_inscription') && castEntryId) {
      const entry = await getSpellbookEntry(castEntryId);
      if (!entry) {
        return NextResponse.json(
          { error: 'cast_not_found', message: 'Spellbook entry not found' },
          { status: 404 }
        );
      }
    }

    const row = {
      id: crypto.randomUUID(),
      participantId: auth.participantId,
      workingGroup,
      content,
      sourceType,
      castEntryId,
      createdAt: new Date().toISOString(),
    };

    await addProverb(row);

    return NextResponse.json({
      success: true,
      proverbId: row.id,
    });
  } catch (e) {
    console.error('Failed to add proverb:', e);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to add proverb' },
      { status: 500 }
    );
  }
}
