import { NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/tmdb/client';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await getMovieDetails(Number(id));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
  }
}
