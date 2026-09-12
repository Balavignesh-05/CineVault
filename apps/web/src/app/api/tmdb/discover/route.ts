import { NextResponse } from 'next/server';
import { discoverMovies } from '@/lib/tmdb/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => { params[key] = value; });
  try {
    const data = await discoverMovies(params);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to discover movies' }, { status: 500 });
  }
}
