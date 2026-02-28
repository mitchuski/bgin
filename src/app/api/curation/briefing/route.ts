/**
 * GET /api/curation/briefing?meetingId=block-14 — Pre-meeting briefing. 04_PERSONAL_CURATION, 07_API_SPEC.
 * Open: no auth required. Uses default WGs when unauthenticated.
 */

import { NextResponse } from 'next/server';
import { verifyRequestNoBody } from '@/lib/auth/middleware';
import { getParticipant } from '@/lib/storage/server-store';

export interface BriefingSection {
  workingGroup: string;
  agendaTopics: string[];
  yourKnowledgeLevel: 'deep' | 'familiar' | 'new';
  suggestedPrep: string;
  relevantMageQueries: string[];
}

export interface BriefingResponse {
  meetingTitle: string;
  meetingDate: string;
  sections: BriefingSection[];
}

const STUB_AGENDA: Record<string, string[]> = {
  ikp: [
    'Privacy pools implementation',
    'Agent identity standards',
    'Wallet governance update',
  ],
  fase: [
    'Stablecoin compliance framework',
    'DeFi risk disclosure',
    'Cross-border settlement',
  ],
  cyber: [
    'Incident response framework',
    'Smart contract security',
    'Key compromise procedures',
  ],
  governance: [
    'Bylaws amendment process',
    'Working group coordination',
    'Block #14 deliverables',
  ],
};

export async function GET(request: Request) {
  const auth = await verifyRequestNoBody(request);
  const participant = auth.valid ? await getParticipant(auth.participantId) : null;
  const wgs = participant?.workingGroups?.length
    ? participant.workingGroups
    : ['ikp', 'fase', 'cyber', 'governance'];

  const url = new URL(request.url);
  const meetingId = url.searchParams.get('meetingId') ?? 'block-14';

  const meetingTitle = meetingId === 'block-14' ? 'BGIN Block #14' : meetingId;
  const meetingDate = '2026-03-01';

  const sections: BriefingSection[] = wgs.map((wg) => ({
    workingGroup: wg,
    agendaTopics: STUB_AGENDA[wg] ?? [],
    yourKnowledgeLevel: 'familiar',
    suggestedPrep: `Review recent ${wg.toUpperCase()} outputs and prepare questions for the Mage.`,
    relevantMageQueries: [
      `What are the key ${wg.toUpperCase()} deliverables for Block #14?`,
      `How does ${wg.toUpperCase()} work connect to other WGs?`,
    ],
  }));

  const body: BriefingResponse = {
    meetingTitle,
    meetingDate,
    sections,
  };

  return NextResponse.json(body);
}
