import { NextResponse } from 'next/server';

export async function PATCH() {
  // TODO: update Swordsman privacy preferences. 07_API_SPEC.
  return NextResponse.json({ ok: true });
}
