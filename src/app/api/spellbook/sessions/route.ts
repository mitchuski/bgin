/**
 * GET /api/spellbook/sessions — List spellbook (Block 14) sessions.
 */

import { NextResponse } from 'next/server';
import { listCollaborativeSessions } from '@/lib/storage/collaborative-sessions';

export async function GET() {
  const sessions = await listCollaborativeSessions();
  return NextResponse.json({ sessions });
}
