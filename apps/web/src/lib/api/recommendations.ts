import { api } from './client';
import type { RecommendationSection } from '@cinevault/shared-types';
import type { MovieCardData } from '@/lib/tmdb/types';

export async function getRecommendations(): Promise<RecommendationSection[]> {
  const res = await api.get<{ data: RecommendationSection[] }>(`/recommendations`);
  return res.data;
}

export async function getTrendingMovies(): Promise<MovieCardData[]> {
  const res = await api.get<{ data: MovieCardData[] }>(`/recommendations/trending`);
  return res.data;
}
