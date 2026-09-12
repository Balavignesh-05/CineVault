import { api } from './client';
import type { MovieCardData } from '@/lib/tmdb/types';

export async function discoverByGenre(genreId: number, page?: number): Promise<{ results: MovieCardData[]; hasMore: boolean }> {
  const res = await api.get<{ data: { results: MovieCardData[]; hasMore: boolean } }>(`/discovery/genre/${genreId}`, { params: { page } });
  return res.data;
}

export async function discoverByDecade(decade: number, page?: number): Promise<{ results: MovieCardData[]; hasMore: boolean }> {
  const res = await api.get<{ data: { results: MovieCardData[]; hasMore: boolean } }>(`/discovery/decade/${decade}`, { params: { page } });
  return res.data;
}

export async function discoverByLanguage(lang: string, page?: number): Promise<{ results: MovieCardData[]; hasMore: boolean }> {
  const res = await api.get<{ data: { results: MovieCardData[]; hasMore: boolean } }>(`/discovery/language/${lang}`, { params: { page } });
  return res.data;
}

export async function getOscarWinners(page?: number): Promise<{ results: MovieCardData[]; hasMore: boolean }> {
  const res = await api.get<{ data: { results: MovieCardData[]; hasMore: boolean } }>(`/discovery/oscars`, { params: { page } });
  return res.data;
}

export async function getAwardWinners(page?: number): Promise<{ results: MovieCardData[]; hasMore: boolean }> {
  const res = await api.get<{ data: { results: MovieCardData[]; hasMore: boolean } }>(`/discovery/awards`, { params: { page } });
  return res.data;
}

export async function discoverByPerson(tmdbPersonId: number, page?: number): Promise<{ results: MovieCardData[]; hasMore: boolean }> {
  const res = await api.get<{ data: { results: MovieCardData[]; hasMore: boolean } }>(`/discovery/person/${tmdbPersonId}`, { params: { page } });
  return res.data;
}
