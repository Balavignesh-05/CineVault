'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WatchlistItem } from '@cinevault/shared-types';

interface AddToWatchlistButtonProps {
  tmdbId: number;
  filmTitle?: string;
  posterPath?: string;
  year?: string;
  compact?: boolean;
  stacked?: boolean;
}

export function AddToWatchlistButton({ 
  tmdbId, 
  filmTitle = '', 
  posterPath = '',
  year = '',
  compact = false,
  stacked = false
}: AddToWatchlistButtonProps) {
  const queryClient = useQueryClient();

  const { data: watchlistItem, isLoading } = useQuery({
    queryKey: ['watchlist', tmdbId],
    queryFn: () => api.get<WatchlistItem>(`/watchlist/check/${tmdbId}`).catch(() => null),
  });

  const addMutation = useMutation({
    mutationFn: (status: 'planned' | 'watching' | 'watched') => 
      api.post('/watchlist', { tmdbId, filmTitle, posterPath, year, status }),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist', tmdbId] });
      const previous = queryClient.getQueryData(['watchlist', tmdbId]);
      queryClient.setQueryData(['watchlist', tmdbId], { status, tmdbId });
      return { previous };
    },
    onError: (err, status, context) => {
      queryClient.setQueryData(['watchlist', tmdbId], context?.previous);
      toast.error('Failed to update watchlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: () => api.delete(`/watchlist/${tmdbId}`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['watchlist', tmdbId] });
      const previous = queryClient.getQueryData(['watchlist', tmdbId]);
      queryClient.setQueryData(['watchlist', tmdbId], null);
      return { previous };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['watchlist', tmdbId], context?.previous);
      toast.error('Failed to remove from watchlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    }
  });

  if (isLoading) {
    return (
      <Button variant="outline" size={compact ? 'icon' : 'default'} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const inWatchlist = !!watchlistItem;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={inWatchlist ? "secondary" : "outline"} size={compact ? 'icon' : 'default'} className={`gap-1 ${stacked ? 'flex-col justify-center' : 'gap-2'}`}>
          {inWatchlist ? <BookmarkCheck className={`${stacked ? 'w-5 h-5' : 'w-4 h-4'} text-accent-primary`} /> : <Bookmark className={`${stacked ? 'w-5 h-5' : 'w-4 h-4'}`} />}
          {!compact && (
            <span className={stacked ? 'text-[10px] uppercase font-bold tracking-wider' : ''}>
              {inWatchlist 
                ? (watchlistItem?.status ? watchlistItem.status.charAt(0).toUpperCase() + watchlistItem.status.slice(1) : 'Watchlist')
                : (stacked ? 'Watchlist' : 'Add to Watchlist')}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => addMutation.mutate('planned')}>
          Planned
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addMutation.mutate('watching')}>
          Watching
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addMutation.mutate('watched')}>
          Watched
        </DropdownMenuItem>
        {inWatchlist && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-error focus:text-error"
              onClick={() => removeMutation.mutate()}
            >
              Remove
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
