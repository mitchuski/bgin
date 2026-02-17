import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: { wg: string } }
) {
  // TODO: Codex agent — draft_section, format_bgin, check_compliance, etc. 00 Phase 7.4, 07_API_SPEC.
  return NextResponse.json({
    suggestion: '',
    sources: [],
    complianceFlags: [],
    wg: params.wg,
  });
}
