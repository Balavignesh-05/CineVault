'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ReviewComment } from '@cinevault/shared-types';
import { CommentItem } from './CommentItem';
import { CommentComposer } from './CommentComposer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CommentListProps {
  reviewId: string;
  commentCount: number;
}

export function CommentList({ reviewId, commentCount }: CommentListProps) {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['comments', reviewId, page],
    queryFn: () => api.get<{ comments: ReviewComment[], hasMore: boolean }>(`/reviews/${reviewId}/comments?page=${page}`)
  });

  const comments = data?.comments || [];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="mb-4">
        <h4 className="font-semibold mb-2">{commentCount} Comments</h4>
        <CommentComposer reviewId={reviewId} />
      </div>

      <div className="flex flex-col">
        {isLoading && page === 1 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            Be the first to share your thoughts!
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {data?.hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => setPage(p => p + 1)}>
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
}
