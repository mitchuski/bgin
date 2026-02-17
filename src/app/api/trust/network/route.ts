import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: aggregate network viz data (no individual positions). 06_TRUST_DISPLAY, 07_API_SPEC.
  return NextResponse.json({ workingGroups: [], crossWgEdges: [] });
}
