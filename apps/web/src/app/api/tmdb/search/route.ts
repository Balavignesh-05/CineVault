import { NextResponse } from 'next/server';
import { searchMulti, searchMovies, searchTv, searchPeople } from '@/lib/tmdb/client';

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
    const pageParam = searchParams.get('page');
    const type = searchParams.get('type') || 'multi';
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    if (!query || !query.trim()) {
      return NextResponse.json(fallbackSearch);
    }

    const trimmedQuery = query.trim();
    let data;

    if (type === 'movie' || type === 'films') {
      data = await searchMovies({ query: trimmedQuery, page });
    } else if (type === 'tv' || type === 'series') {
      data = await searchTv(trimmedQuery, page, request.signal);
    } else if (type === 'person' || type === 'people') {
      data = await searchPeople(trimmedQuery, page, request.signal);
    } else {
      data = await searchMulti(trimmedQuery, page, request.signal);
    }

    if (data && data.results) {
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackSearch);
  } catch (error: any) {
    if (error?.name !== 'AbortError' && error?.code !== 20) {
      console.error('TMDB Search API Error:', error);
    }
    return NextResponse.json(fallbackSearch);
  }
}
