'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { TMDBPaginatedResult, TMDBMovie } from '@/lib/tmdb/types';

export interface SearchFilters {
  genre?: number;
  year?: number;
  language?: string;
  sort_by?: string;
  runtimeMin?: number;
  runtimeMax?: number;
  ratingMin?: number;
  ratingMax?: number;
}

async function fetchMovieSearch(query: string, page: number, filters?: SearchFilters) {
  const searchParams = new URLSearchParams({
    query,
    page: page.toString(),
  });
  
  if (filters?.year) searchParams.set('year', filters.year.toString());
  if (filters?.language) searchParams.set('language', filters.language);
  
  const res = await fetch(`/api/tmdb/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to search movies');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as TMDBPaginatedResult<TMDBMovie>;
}

export function useMovieSearch(query: string, page = 1, filters?: SearchFilters) {
  return useQuery({
    queryKey: queryKeys.tmdb.search(query, page, filters as Record<string, unknown>),
    queryFn: () => fetchMovieSearch(query, page, filters),
    enabled: query.trim().length > 0,
    staleTime: 1 * 60 * 1000,
  });
}

export function useSearchFilters() {
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  return { filters, updateFilter, clearFilters, setFilters };
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to parse recent searches from localStorage', error);
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent searches', error);
      }
      return updated;
    });
  }, []);

  const clearSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      try {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent searches', error);
      }
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Failed to clear recent searches', error);
    }
  }, []);

  return { recentSearches, addSearch, clearSearch, clearAll };
}
