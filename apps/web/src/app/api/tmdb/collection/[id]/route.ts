import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const TMDB_KEY = process.env.TMDB_API_KEY;
    const res = await fetch(`https://api.themoviedb.org/3/collection/${id}?api_key=${TMDB_KEY}`, { 
      next: { revalidate: 86400 },
      headers: { 'User-Agent': 'CineVault/1.0 (Next.js Node Fetch)' }
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}
