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
          <div className="h-14 [&>button]:h-full [&>button]:w-full [&>button]:bg-[#131A22] [&>button]:border-[#273442] hover:[&>button]:bg-[#1A2430] hover:[&>button]:border-[#35D6A0]/40 flex items-stretch rounded-xl overflow-hidden">
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
            className={`h-14 border-[#273442] bg-[#131A22] hover:bg-[#1A2430] hover:border-[#35D6A0]/40 transition-colors flex flex-col items-center justify-center gap-1 ${isFavorite ? 'text-[#35D6A0] border-[#35D6A0]/40 bg-[#35D6A0]/10' : 'text-[#F4F3EC]'}`}
            onClick={() => {
              if (!isAuthenticated) return router.push('/signin');
              toggleFavorite.mutate();
            }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'text-[#9AA8B7]'}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider">{isFavorite ? 'Watched' : 'Log'}</span>
          </Button>
          
          {/* Rate */}
          <CompactRatingPopover movieId={seriesId} movieTitle={seriesTitle} mediaType="tv">
            <Button 
              variant="outline" 
              className="h-14 border-[#273442] bg-[#131A22] hover:bg-[#1A2430] hover:border-[#35D6A0]/40 text-[#F4F3EC] w-full flex flex-col items-center justify-center gap-1 transition-colors"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/signin');
                }
              }}
            >
              <Star className={`w-5 h-5 ${ratingData?.data?.rating ? 'fill-[#35D6A0] text-[#35D6A0]' : 'text-[#9AA8B7]'}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider">{ratingData?.data?.rating ? `${(ratingData.data.rating / 2).toFixed(1)}★` : 'Rate'}</span>
            </Button>
          </CompactRatingPopover>
          
          {/* Review */}
          <Button 
            variant="outline" 
            className="h-14 border-[#273442] bg-[#131A22] hover:bg-[#1A2430] hover:border-[#35D6A0]/40 text-[#F4F3EC] flex flex-col items-center justify-center gap-1 transition-colors"
            onClick={() => {
              if (!isAuthenticated) return router.push('/signin');
              setIsDiaryOpen(true);
            }}
          >
            <PenSquare className="w-5 h-5 text-[#9AA8B7]" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Review</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full text-[#9AA8B7] hover:text-[#F4F3EC] hover:bg-[#131A22] border border-[#273442] h-12 rounded-xl transition-colors"
              aria-label="Share options"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#131A22] border-[#273442] text-[#F4F3EC]">
            <DropdownMenuItem 
              onClick={handleShare}
              className="cursor-pointer hover:bg-[#1A2430] focus:bg-[#1A2430] hover:text-[#35D6A0] focus:text-[#35D6A0]"
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
