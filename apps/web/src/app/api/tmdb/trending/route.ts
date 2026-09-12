import { NextResponse } from 'next/server';
import { getTrending } from '@/lib/tmdb/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeWindow = (searchParams.get('timeWindow') ?? 'week') as 'day' | 'week';
  try {
    const data = await getTrending(timeWindow);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trending' }, { status: 500 });
  }
}
