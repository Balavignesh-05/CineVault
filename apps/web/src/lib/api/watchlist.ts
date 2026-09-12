import { api } from './client';
import type { WatchlistItem, PaginatedResult, WatchlistStatus } from '@cinevault/shared-types';

export async function getWatchlist(params?: { status?: string; search?: string; page?: number }): Promise<PaginatedResult<WatchlistItem>> {
  const res = await api.get<{ data: PaginatedResult<WatchlistItem> }>(`/watchlist`, { params });
  return res.data;
}

export async function addToWatchlist(filmId: string, status?: WatchlistStatus): Promise<WatchlistItem> {
  const res = await api.post<{ data: WatchlistItem }>(`/watchlist`, { filmId, status });
  return res.data;
}

export async function updateWatchlistStatus(filmId: string, status: WatchlistStatus): Promise<WatchlistItem> {
  const res = await api.patch<{ data: WatchlistItem }>(`/watchlist/${filmId}`, { status });
  return res.data;
}

export async function removeFromWatchlist(filmId: string): Promise<void> {
  await api.delete(`/watchlist/${filmId}`);
}

export async function checkWatchlistStatus(tmdbId: number): Promise<{ inWatchlist: boolean; status: WatchlistStatus | null; itemId: string | null }> {
  const res = await api.get<{ data: { inWatchlist: boolean; status: WatchlistStatus | null; itemId: string | null } }>(`/watchlist/status/${tmdbId}`);
  return res.data;
}
