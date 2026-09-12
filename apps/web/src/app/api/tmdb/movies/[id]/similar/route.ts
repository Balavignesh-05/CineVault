import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}&language=en-US&page=1`);
    if (!res.ok) return NextResponse.json({ results: [] });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ results: [] });
  }
}
