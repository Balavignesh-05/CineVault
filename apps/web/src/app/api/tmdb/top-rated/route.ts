import { NextResponse } from 'next/server';
import { getTopRated } from '@/lib/tmdb/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  try {
    const data = await getTopRated(page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch top rated' }, { status: 500 });
  }
}
