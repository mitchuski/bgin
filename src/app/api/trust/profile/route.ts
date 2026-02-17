import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: trust metrics, tier, progress. 06_TRUST_DISPLAY, 07_API_SPEC.
  return NextResponse.json({
    currentTier: 'blade',
    progressToNext: 0,
    criteria: {},
    capabilitiesUnlocked: [],
  });
}
