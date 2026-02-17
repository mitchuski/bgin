/**
 * GET/POST /api/spellbook/entries — List or add Block14 Spellbook entries.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listSpellbookEntries,
  addSpellbookEntry,
  getParticipant,
  type SpellbookEntryRow,
} from '@/lib/storage/server-store';
import { verifyRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') ?? undefined;
  const workingGroup = searchParams.get('workingGroup') ?? undefined;

  try {
    const entries = await listSpellbookEntries(sessionId, workingGroup);
    return NextResponse.json({ entries });
  } catch (e) {
    console.error('Failed to list spellbook entries:', e);
    return NextResponse.json(
      { error: 'Failed to list entries' },
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
      sessionId?: string;
      sessionTitle?: string;
      workingGroup?: string;
      mageQuery?: string;
      mageResponse?: string;
      sources?: Array<{ documentTitle: string; documentDate: string; relevanceScore?: number }>;
      crossWgRefs?: Array<{ workingGroup: string; topic: string; hint?: string }>;
    };

    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { error: 'invalid_json', message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { sessionId, sessionTitle, workingGroup, mageQuery, mageResponse, sources, crossWgRefs } =
      body;

    if (!sessionId || !workingGroup || !mageQuery || !mageResponse) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'sessionId, workingGroup, mageQuery, and mageResponse are required' },
        { status: 400 }
      );
    }

    const entry: SpellbookEntryRow = {
      id: crypto.randomUUID(),
      sessionId,
      sessionTitle: sessionTitle ?? sessionId,
      workingGroup,
      participantId: auth.participantId,
      participantTier: participant.trustTier,
      mageQuery,
      mageResponse,
      sources: sources ?? [],
      crossWgRefs: crossWgRefs ?? [],
      addedAt: new Date().toISOString(),
      attributionLevel: participant.attributionLevel,
    };

    await addSpellbookEntry(entry);

    return NextResponse.json({
      success: true,
      entryId: entry.id,
    });
  } catch (e) {
    console.error('Failed to add spellbook entry:', e);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to add entry' },
      { status: 500 }
    );
  }
}
