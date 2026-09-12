import { api } from './client';
import type { FilmRatingStats } from '@cinevault/shared-types';

export async function getFilmRatingStats(tmdbId: number): Promise<FilmRatingStats> {
  const res = await api.get<{ data: FilmRatingStats }>(`/ratings/film/${tmdbId}`);
  return res.data;
}

export async function rateFilm(tmdbId: number, rating: number): Promise<{ logId: string; rating: number }> {
  const res = await api.post<{ data: { logId: string; rating: number } }>(`/ratings/film/${tmdbId}`, { rating });
  return res.data;
}

export async function deleteRating(tmdbId: number): Promise<void> {
  await api.delete(`/ratings/film/${tmdbId}`);
}
