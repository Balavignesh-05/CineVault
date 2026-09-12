'use client';

import { useQuery } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getDashboardData, getUserStats } from '@/lib/api/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: socialQueryKeys.dashboard.mine(),
    queryFn: () => getDashboardData(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserStats(username: string | undefined) {
  return useQuery({
    queryKey: socialQueryKeys.dashboard.stats(username!),
    queryFn: () => getUserStats(username!),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}
