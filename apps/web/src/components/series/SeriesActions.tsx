'use client';

import { useState } from 'react';
import { Heart, Star, Share2, BookOpen, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ReviewComposerModal } from '@/components/modals/ReviewComposerModal';
import { AddToWatchlistButton } from '@/components/watchlist/AddToWatchlistButton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { CompactRatingPopover } from '@/components/rating/CompactRatingPopover';
import { PenSquare } from 'lucide-react';

interface SeriesActionsProps {
  seriesId: number;
  seriesTitle: string;
  posterPath: string | null;
  firstAirYear?: number | null;
}

export function SeriesActions({ seriesId, seriesTitle, posterPath, firstAirYear }: SeriesActionsProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  const { data: likedData } = useQuery({
    queryKey: ['series-liked', seriesId],
    queryFn: () => api.get<{ liked: boolean }>(`/logs/liked/${seriesId}?type=tv`).catch(() => ({ liked: false }))
  });

  const { data: ratingData } = useQuery({
    queryKey: ['series-user-rating', seriesId],
    queryFn: () => api.get<{ data: { userRating: number | null } }>(`/ratings/series/${seriesId}`).then(res => ({ data: { rating: res.data?.userRating } })).catch(() => ({ data: { rating: null } }))
  });

  const toggleFavorite = useMutation({
    mutationFn: () => api.post('/logs/series', { tmdbId: seriesId, liked: !(likedData?.liked) }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['series-liked', seriesId] });
      const prev = queryClient.getQueryData(['series-liked', seriesId]);
      queryClient.setQueryData(['series-liked', seriesId], { liked: !(likedData?.liked) });
      return { prev };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['series-liked', seriesId], context?.prev);
      toast.error('Failed to update favorites');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['series-liked', seriesId] });
    }
  });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const isFavorite = likedData?.liked || false;

  return (
    <>
      <div className="flex flex-col gap-3 w-full sm:min-w-[240px]">
        <div className="grid grid-cols-4 gap-2">
          {/* Watchlist */}
          <div className="h-14 [&>button]:h-full [&>button]:w-full [&>button]:bg-[#14171B]/80 [&>button]:backdrop-blur [&>button]:border-border-subtle hover:[&>button]:bg-elevated flex items-stretch">
            <AddToWatchlistButton 
              tmdbId={seriesId} 
              filmTitle={seriesTitle} 
              posterPath={posterPath || undefined} 
              year={firstAirYear?.toString()} 
              stacked={true}
            />
          </div>

          {/* Log / Watched */}
          <Button 
            variant="outline" 
            className={`h-14 border-border-subtle bg-[#14171B]/80 backdrop-blur hover:bg-elevated transition-all flex flex-col items-center justify-center gap-1 ${isFavorite ? 'text-success border-success/50' : 'text-foreground'}`}
            onClick={() => {
              if (!isAuthenticated) return router.push('/signin');
              toggleFavorite.mutate();
            }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider">{isFavorite ? 'Watched' : 'Log'}</span>
          </Button>
          
          {/* Rate */}
          <CompactRatingPopover movieId={seriesId} movieTitle={seriesTitle} mediaType="tv">
            <Button 
              variant="outline" 
              className="h-14 border-border-subtle bg-[#14171B]/80 backdrop-blur hover:bg-elevated text-foreground w-full flex flex-col items-center justify-center gap-1"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/signin');
                }
              }}
            >
              <Star className={`w-5 h-5 ${ratingData?.data?.rating ? 'fill-[#ff8000] text-accent-amber' : ''}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider">{ratingData?.data?.rating ? `${(ratingData.data.rating / 2).toFixed(1)}★` : 'Rate'}</span>
            </Button>
          </CompactRatingPopover>
          
          {/* Review */}
          <Button 
            variant="outline" 
            className="h-14 border-border-subtle bg-[#14171B]/80 backdrop-blur hover:bg-elevated text-foreground flex flex-col items-center justify-center gap-1 text-white hover:text-white"
            onClick={() => {
              if (!isAuthenticated) return router.push('/signin');
              setIsDiaryOpen(true);
            }}
          >
            <PenSquare className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Review</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full text-text-muted hover:text-white h-12"
              aria-label="Share options"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-elevated border-[#3D3D55] text-white">
            <DropdownMenuItem 
              onClick={handleShare}
              className="cursor-pointer hover:bg-surface focus:bg-surface"
            >
              Copy Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReviewComposerModal
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        mediaType="tv"
        tmdbId={seriesId}
        title={seriesTitle}
        posterPath={posterPath}
        releaseYear={firstAirYear}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['series-user-rating', seriesId] });
        }}
      />
    </>
  );
}
