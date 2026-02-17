/**
 * GET /api/sessions/collaborative — List shared workspace sessions for Block 14 homepage.
 */

import { NextResponse } from 'next/server';
import { listCollaborativeSessions } from '@/lib/storage/collaborative-sessions';

export async function GET() {
  const sessions = await listCollaborativeSessions();
  return NextResponse.json({ sessions });
}
