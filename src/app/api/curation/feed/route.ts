/**
 * GET /api/curation/feed — Personalized knowledge feed (Spells). 04_PERSONAL_CURATION, 07_API_SPEC.
 * Auth required. Query: workingGroups, limit, offset.
 * Items reference BGIN projects & publications: https://bgin-global.org/projects
 */

import { NextResponse } from 'next/server';
import { verifyRequestNoBody } from '@/lib/auth/middleware';
import { getParticipant } from '@/lib/storage/server-store';
import { BGIN_DOCUMENTS_ALL, type BginDocument } from '@/lib/bgin/documents';

export type FeedItemType =
  | 'new_document'
  | 'discussion_update'
  | 'cross_wg_connection'
  | 'promise_reminder'
  | 'briefing_available'
  | 'trust_milestone';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  workingGroup: string;
  title: string;
  summary: string;
  relevanceScore: number;
  timestamp: string;
  actionable: boolean;
  action?: { label: string; route: string };
}

function docToFeedItem(doc: BginDocument, index: number): FeedItem {
  const type: FeedItemType = doc.type === 'project' ? 'discussion_update' : 'new_document';
  const wgLabel = doc.workingGroup.toUpperCase();
  const timestamp = doc.date ? new Date(doc.date).toISOString() : '1970-01-01T00:00:00.000Z';
  return {
    id: `feed-${doc.id}`,
    type,
    workingGroup: doc.workingGroup,
    title: doc.type === 'project' ? `${doc.title} (project in progress)` : doc.title,
    summary: doc.summary,
    relevanceScore: 0.75 + (index % 5) * 0.04,
    timestamp,
    actionable: true,
    action: { label: `Explore with ${wgLabel} Mage`, route: `/mage/${doc.workingGroup}` },
  };
}

export async function GET(request: Request) {
  const auth = await verifyRequestNoBody(request);
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'unauthorized', message: auth.error ?? 'Authentication required' },
      { status: 401 }
    );
  }

  const participant = await getParticipant(auth.participantId);
  const wgs = participant?.workingGroups?.length
    ? participant.workingGroups
    : ['ikp', 'fase', 'cyber', 'governance'];

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);
  const offset = Number(url.searchParams.get('offset')) || 0;
  const workingGroupsParam = url.searchParams.get('workingGroups');
  const groups = workingGroupsParam ? workingGroupsParam.split(',').map((g) => g.trim()) : wgs;

  const feedItems: FeedItem[] = BGIN_DOCUMENTS_ALL
    .filter((doc) => groups.includes(doc.workingGroup))
    .map((doc, i) => docToFeedItem(doc, i));

  const briefingItem: FeedItem = {
    id: 'feed-briefing-block14',
    type: 'briefing_available',
    workingGroup: 'governance',
    title: 'Block 14 pre-meeting briefing',
    summary: 'Personalized prep based on your knowledge path and BGIN publications.',
    relevanceScore: 0.92,
    timestamp: new Date().toISOString(),
    actionable: true,
    action: { label: 'View briefing', route: '/dashboard/briefing?meetingId=block-14' },
  };

  const allItems = groups.includes('governance')
    ? [briefingItem, ...feedItems]
    : feedItems;

  allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = allItems.length;
  const items = allItems.slice(offset, offset + limit);

  return NextResponse.json({ items, total });
}
