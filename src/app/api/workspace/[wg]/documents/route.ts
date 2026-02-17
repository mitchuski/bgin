import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { wg: string } }
) {
  return NextResponse.json({ documents: [], wg: params.wg });
}

export async function POST(
  _request: Request,
  { params }: { params: { wg: string } }
) {
  // TODO: create document. 07_API_SPEC.
  return NextResponse.json({ id: 'stub', wg: params.wg }, { status: 201 });
}
