'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface CommentComposerProps {
  reviewId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentComposer({ reviewId, parentId, onSuccess, onCancel }: CommentComposerProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post('/comments', { reviewId, body: content, parentId }),
    onSuccess: () => {
      setContent('');
      toast.success('Comment posted');
      queryClient.invalidateQueries({ queryKey: ['comments', reviewId] });
      onSuccess?.();
    },
    onError: () => toast.error('Failed to post comment')
  });

  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <textarea
        className="w-full min-h-[80px] p-3 text-sm rounded-md bg-bg-surface border border-border-default focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none resize-y"
        placeholder="Write a comment... (use @ to mention users)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
        <Button 
          size="sm" 
          disabled={!content.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </div>
  );
}
