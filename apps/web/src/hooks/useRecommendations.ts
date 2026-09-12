'use client';

import { useQuery } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getRecommendations } from '@/lib/api/recommendations';

export function useRecommendations() {
  return useQuery({
    queryKey: socialQueryKeys.recommendations.mine(),
    queryFn: () => getRecommendations(),
    staleTime: 30 * 60 * 1000,
  });
}
