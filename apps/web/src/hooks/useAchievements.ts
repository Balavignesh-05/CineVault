'use client';

import { useQuery } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getAllAchievements, getMyAchievements } from '@/lib/api/achievements';

export function useAllAchievements() {
  return useQuery({
    queryKey: socialQueryKeys.achievements.all(),
    queryFn: () => getAllAchievements(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useMyAchievements() {
  return useQuery({
    queryKey: socialQueryKeys.achievements.mine(),
    queryFn: () => getMyAchievements(),
    staleTime: 5 * 60 * 1000,
  });
}
