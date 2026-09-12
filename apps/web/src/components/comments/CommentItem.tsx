'use client';

import React, { useState } from 'react';
import { ReviewComment } from '@cinevault/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Heart, Reply, Trash2, Edit2 } from 'lucide-react';
import { CommentComposer } from './CommentComposer';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: ReviewComment;
  depth?: number;
}

export function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  
  const isOwn = user?.id === comment.userId;

  const toggleLike = useMutation({
    mutationFn: () => api.post(`/comments/${comment.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.reviewId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/comments/${comment.id}`),
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['comments', comment.reviewId] });
    }
  });

  const renderContent = (text: string) => {
    // Simple @mention highlighting
    return text.replace(/@(\w+)/g, '<span class="text-accent-primary font-medium">@$1</span>');
  };

  return (
    <div className={`flex gap-3 py-4 ${depth > 0 ? 'ml-8 md:ml-12 border-l border-border-subtle pl-4' : 'border-b border-border-subtle'}`}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={comment.author?.avatarUrl ?? undefined} />
        <AvatarFallback>{comment.author?.username?.[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm">{comment.author?.username}</span>
          <span className="text-xs text-text-muted">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div 
          className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderContent(comment.body) }}
        />
        
        <div className="flex items-center gap-3 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 px-2 gap-1 ${comment.isLikedByMe ? 'text-red-500' : 'text-[var(--color-text-muted)]'}`}
            onClick={() => toggleLike.mutate()}
          >
            <Heart className={`w-3 h-3 ${comment.isLikedByMe ? 'fill-current' : ''}`} />
            <span className="text-xs">{comment.likeCount}</span>
          </Button>
          
          {depth === 0 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 text-text-muted" onClick={() => setIsReplying(!isReplying)}>
              <Reply className="w-3 h-3" />
              <span className="text-xs">Reply</span>
            </Button>
          )}

          {isOwn && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-text-muted hover:text-error" onClick={() => deleteMutation.mutate()}>
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>

        {isReplying && (
          <div className="mt-2">
            <CommentComposer 
              reviewId={comment.reviewId} 
              parentId={comment.id} 
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {!showReplies ? (
              <Button variant="link" className="text-xs p-0 h-auto text-accent-secondary" onClick={() => setShowReplies(true)}>
                Show {comment.replies.length} replies
              </Button>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
                <Button variant="link" className="text-xs p-0 h-auto text-text-muted mt-2" onClick={() => setShowReplies(false)}>
                  Hide replies
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
