'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { TMDBGenre, TMDBGenreResult } from '@/lib/tmdb/types';
import { useMemo } from 'react';

async function fetchGenres() {
  const res = await fetch('/api/tmdb/genres');
  if (!res.ok) throw new Error('Failed to fetch genres');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as TMDBGenreResult;
}

export function useGenres() {
  return useQuery({
    queryKey: queryKeys.tmdb.genres(),
    queryFn: fetchGenres,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function useGenreMap() {
  const { data } = useGenres();
  
  return useMemo(() => {
    const map = new Map<number, string>();
    if (data?.genres) {
      data.genres.forEach(genre => {
        map.set(genre.id, genre.name);
      });
    }
    return map;
  }, [data]);
}
