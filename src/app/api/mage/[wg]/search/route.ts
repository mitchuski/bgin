import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: { wg: string } }
) {
  // TODO: semantic search in WG knowledge base. 07_API_SPEC.
  return NextResponse.json({ results: [], wg: params.wg });
}
