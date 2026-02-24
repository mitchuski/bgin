import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ wg: string }> }
) {
  const { wg } = await params;
  // TODO: semantic search in WG knowledge base. 07_API_SPEC.
  return NextResponse.json({ results: [], wg });
}
