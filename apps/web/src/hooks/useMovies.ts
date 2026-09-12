'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { TMDBPaginatedResult, TMDBMovie } from '@/lib/tmdb/types';

async function fetchTrending(timeWindow: 'day' | 'week', page: number) {
  const res = await fetch(`/api/tmdb/trending?timeWindow=${timeWindow}&page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as TMDBPaginatedResult<TMDBMovie>;
}

async function fetchPopular(page: number) {
  const res = await fetch(`/api/tmdb/popular?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch popular');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as TMDBPaginatedResult<TMDBMovie>;
}

async function fetchTopRated(page: number) {
  const res = await fetch(`/api/tmdb/top-rated?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch top rated');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as TMDBPaginatedResult<TMDBMovie>;
}

async function fetchUpcoming(page: number) {
  const res = await fetch(`/api/tmdb/upcoming?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch upcoming');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as TMDBPaginatedResult<TMDBMovie>;
}

async function fetchNowPlaying(page: number) {
  const res = await fetch(`/api/tmdb/now-playing?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch now playing');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as TMDBPaginatedResult<TMDBMovie>;
}

export function useTrending(timeWindow: 'day' | 'week' = 'week', page = 1) {
  return useQuery({
    queryKey: queryKeys.tmdb.trending(timeWindow, page),
    queryFn: () => fetchTrending(timeWindow, page),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopular(page = 1) {
  return useQuery({
    queryKey: queryKeys.tmdb.popular(page),
    queryFn: () => fetchPopular(page),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopRated(page = 1) {
  return useQuery({
    queryKey: queryKeys.tmdb.topRated(page),
    queryFn: () => fetchTopRated(page),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpcoming(page = 1) {
  return useQuery({
    queryKey: queryKeys.tmdb.upcoming(page),
    queryFn: () => fetchUpcoming(page),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNowPlaying(page = 1) {
  return useQuery({
    queryKey: queryKeys.tmdb.nowPlaying(page),
    queryFn: () => fetchNowPlaying(page),
    staleTime: 5 * 60 * 1000,
  });
}
