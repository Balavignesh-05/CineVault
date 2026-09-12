'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { MovieDetailsData } from '@/lib/tmdb/types';

async function fetchMovieDetails(id: number) {
  const res = await fetch(`/api/tmdb/movies/${id}`);
  if (!res.ok) throw new Error('Failed to fetch movie details');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as MovieDetailsData;
}

export function useMovieDetails(movieId: number) {
  return useQuery({
    queryKey: queryKeys.tmdb.movie(movieId),
    queryFn: () => fetchMovieDetails(movieId),
    staleTime: 30 * 60 * 1000,
  });
}
