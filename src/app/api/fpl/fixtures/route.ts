import { NextRequest, NextResponse } from 'next/server';
import { FPL_API_BASE } from '@/lib/config';

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('event');
  const path = eventId ? `/fixtures/?event=${eventId}` : '/fixtures/';

  const res = await fetch(`${FPL_API_BASE}${path}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch fixtures' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
