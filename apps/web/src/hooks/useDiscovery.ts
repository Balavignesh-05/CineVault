'use client';

import { useQuery } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { discoverByGenre, discoverByDecade, getOscarWinners, getAwardWinners } from '@/lib/api/discovery';

export function useDiscoverByGenre(genreId: number | undefined, page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.discovery.genre(genreId!, page),
    queryFn: () => discoverByGenre(genreId!, page),
    enabled: !!genreId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDiscoverByDecade(decade: number | undefined, page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.discovery.decade(decade!, page),
    queryFn: () => discoverByDecade(decade!, page),
    enabled: !!decade,
    staleTime: 30 * 60 * 1000,
  });
}

export function useOscarWinners(page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.discovery.oscar(page),
    queryFn: () => getOscarWinners(page),
    staleTime: 30 * 60 * 1000,
  });
}

export function useAwardWinners(page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.discovery.awards(page),
    queryFn: () => getAwardWinners(page),
    staleTime: 30 * 60 * 1000,
  });
}
