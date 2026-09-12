import { NextResponse } from 'next/server';
import { getUpcoming } from '@/lib/tmdb/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  try {
    const data = await getUpcoming();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch upcoming' }, { status: 500 });
  }
}
