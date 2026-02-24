import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wg: string }> }
) {
  const { wg } = await params;
  return NextResponse.json({ documents: [], wg });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ wg: string }> }
) {
  const { wg } = await params;
  // TODO: create document. 07_API_SPEC.
  return NextResponse.json({ id: 'stub', wg }, { status: 201 });
}
