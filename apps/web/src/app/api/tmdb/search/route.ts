import { NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackSearch = {
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || searchParams.get('q');
    const page = searchParams.get('page');

    if (!query || !query.trim()) {
      return NextResponse.json(fallbackSearch);
    }

    const data = await searchMulti(
      query.trim(),
      page ? parseInt(page, 10) : 1,
      request.signal
    );

    if (data && data.results) {
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackSearch);
  } catch (error) {
    console.error('TMDB Search API Error:', error);
    return NextResponse.json(fallbackSearch);
  }
}
