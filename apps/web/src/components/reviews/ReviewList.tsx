'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Review } from '@cinevault/shared-types';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReviewListProps {
  filmId?: string;
  userId?: string;
  initialData?: Review[];
}

export function ReviewList({ filmId, userId, initialData }: ReviewListProps) {
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', { filmId, userId, sort, page }],
    queryFn: () => {
      const params = new URLSearchParams({ sort, page: page.toString() });
      if (filmId) params.append('filmId', filmId);
      if (userId) params.append('userId', userId);
      return api.get<{ reviews: Review[], hasMore: boolean }>(`/reviews?${params.toString()}`);
    },
    initialData: initialData ? { reviews: initialData, hasMore: false } : undefined,
  });

  const reviews = data?.reviews || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Reviews</h3>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="liked">Most Liked</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading && page === 1 ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-bg-surface rounded-lg"></div>)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-text-muted">No reviews found.</div>
        ) : (
          reviews.map(review => (
            <ReviewCard key={review.id} review={review} showFilm={!filmId} />
          ))
        )}
      </div>

      {data?.hasMore && (
        <Button variant="outline" className="mt-4" onClick={() => setPage(p => p + 1)}>
          Load More
        </Button>
      )}
    </div>
  );
}
