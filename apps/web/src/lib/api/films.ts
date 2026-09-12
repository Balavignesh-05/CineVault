import { api } from './client';
import type { ApiResponse, Film, FilmSearchResult, PaginatedResult } from '@cinevault/shared-types';

export interface TmdbSearchItem {
  tmdbId: number;
  title: string;
  releaseYear: number | null;
  posterUrl: string | null;
  overview: string;
}

export async function searchFilms(query: string, page = 1) {
  const res = await api.get<ApiResponse<{ items: TmdbSearchItem[]; total: number; page: number; hasMore: boolean }>>(
    `/films/search?q=${encodeURIComponent(query)}&page=${page}`,
  );
  return res.data;
}

export async function getFilm(identifier: string) {
  const res = await api.get<ApiResponse<Film & { releaseYear: number | null; userFilmState: unknown }>>(
    `/films/${identifier}`,
  );
  return res.data;
}

export async function getPopularFilms() {
  const res = await api.get<ApiResponse<(TmdbSearchItem & { backdropUrl: string | null; voteAverage: number })[]>>(
    '/films/popular',
  );
  return res.data;
}
