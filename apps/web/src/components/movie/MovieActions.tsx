'use client';

import { useState } from 'react';
import { Play, Heart, Star, Share2, PenSquare, BookOpen, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TrailerModal } from './TrailerModal';
import { CompactRatingPopover } from '@/components/rating/CompactRatingPopover';

import { ReviewComposerModal } from '@/components/modals/ReviewComposerModal';
import { AddToCollectionModal } from '@/components/collections/AddToCollectionModal';
import { AddToWatchlistButton } from '@/components/watchlist/AddToWatchlistButton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface MovieActionsProps {
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  trailerKey?: string;
  year?: string;
  releaseYear?: number | null;
}

export function MovieActions({ movieId, movieTitle, posterPath, trailerKey, year, releaseYear }: MovieActionsProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  // Check if liked
  const { data: likedData } = useQuery({
    queryKey: ['film-liked', movieId],
    queryFn: () => api.get<{ liked: boolean }>(`/logs/liked/${movieId}`).catch(() => ({ liked: false }))
  });

  // Check user rating
  const { data: ratingData } = useQuery({
    queryKey: ['user-rating', movieId],
    queryFn: () => api.get<{ data: { userRating: number | null } }>(`/ratings/film/${movieId}`).then(res => ({ data: { rating: res.data?.userRating } })).catch(() => ({ data: { rating: null } }))
  });

  const toggleFavorite = useMutation({
    mutationFn: () => api.post('/logs', { tmdbId: movieId, liked: !(likedData?.liked) }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['film-liked', movieId] });
      const prev = queryClient.getQueryData(['film-liked', movieId]);
      queryClient.setQueryData(['film-liked', movieId], { liked: !(likedData?.liked) });
      return { prev };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['film-liked', movieId], context?.prev);
      toast.error('Failed to update favorites');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['film-liked', movieId] });
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
        {trailerKey && (
          <Button 
            size="lg" 
            className="w-full bg-[#35D6A0] hover:bg-[#6BE8BC] text-[#0B0F14] font-bold h-14 rounded-xl text-lg group transition-colors shadow-sm"
            onClick={() => setIsTrailerOpen(true)}
          >
            <Play className="w-6 h-6 mr-2 fill-current group-hover:scale-110 transition-transform" />
            Watch Trailer
          </Button>
        )}
        
        <div className="grid grid-cols-5 gap-2">
          {/* Watchlist */}
          <div className="h-14 [&>button]:h-full [&>button]:w-full [&>button]:bg-[#131A22] [&>button]:border-[#273442] hover:[&>button]:bg-[#1A2430] hover:[&>button]:border-[#35D6A0]/40 flex items-stretch rounded-xl overflow-hidden">
            <AddToWatchlistButton 
              tmdbId={movieId} 
              filmTitle={movieTitle} 
              posterPath={posterPath || undefined} 
              year={year} 
              stacked={true}
            />
          </div>

          {/* Log / Watched - opens review modal */}
          <Button 
            variant="outline" 
            className="h-14 border-[#273442] bg-[#131A22] hover:bg-[#1A2430] hover:border-[#35D6A0]/40 text-[#F4F3EC] flex flex-col items-center justify-center gap-1 transition-colors"
            onClick={() => {
              if (!isAuthenticated) return router.push('/signin');
              setIsDiaryOpen(true);
            }}
          >
            <BookOpen className="w-5 h-5 text-[#9AA8B7]" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Log</span>
          </Button>

          {/* Like/Heart */}
          <Button 
            variant="outline" 
            className={`h-14 border-[#273442] bg-[#131A22] hover:bg-[#1A2430] hover:border-[#35D6A0]/40 transition-colors flex flex-col items-center justify-center gap-1 ${isFavorite ? 'text-red-500 border-red-500/40 bg-red-500/10' : 'text-[#F4F3EC]'}`}
            onClick={() => {
              if (!isAuthenticated) return router.push('/signin');
              toggleFavorite.mutate();
            }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'text-[#9AA8B7]'}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Like</span>
          </Button>

          {/* Rate */}
          <CompactRatingPopover movieId={movieId} movieTitle={movieTitle}>
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
              onClick={() => {
                if (!isAuthenticated) return router.push('/signin');
                setIsListOpen(true);
              }}
              className="cursor-pointer hover:bg-[#1A2430] focus:bg-[#1A2430] hover:text-[#35D6A0] focus:text-[#35D6A0] gap-2 py-3 border-b border-[#273442] font-bold"
            >
              <ListPlus size={16} /> Add to Lists...
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                const url = window.location.href;
                window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${movieTitle} on CineVault: ${url}`)}`, '_blank');
              }}
              className="cursor-pointer hover:bg-[#1A2430] focus:bg-[#1A2430] hover:text-[#35D6A0] focus:text-[#35D6A0]"
            >
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                const url = window.location.href;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${movieTitle} on CineVault!`)}&url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="cursor-pointer hover:bg-[#1A2430] focus:bg-[#1A2430] hover:text-[#35D6A0] focus:text-[#35D6A0]"
            >
              X (Twitter)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                const url = window.location.href;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
              }}
              className="cursor-pointer hover:bg-[#1A2430] focus:bg-[#1A2430] hover:text-[#35D6A0] focus:text-[#35D6A0]"
            >
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleShare}
              className="cursor-pointer hover:bg-[#1A2430] focus:bg-[#1A2430] hover:text-[#35D6A0] focus:text-[#35D6A0]"
            >
              Copy Link
            </DropdownMenuItem>
            {typeof navigator !== 'undefined' && navigator.share && (
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: movieTitle,
                      text: `Check out ${movieTitle} on CineVault!`,
                      url: window.location.href,
                    });
                  } catch (err) {
                    console.error('Error sharing', err);
                  }
                }}
                className="cursor-pointer hover:bg-[#1A2430] focus:bg-[#1A2430] hover:text-[#35D6A0] focus:text-[#35D6A0]"
              >
                More Options...
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {trailerKey && (
        <TrailerModal 
          isOpen={isTrailerOpen} 
          onClose={() => setIsTrailerOpen(false)} 
          trailerKey={trailerKey} 
          title={`${movieTitle} - Trailer`} 
        />
      )}




      <ReviewComposerModal
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        mediaType="movie"
        tmdbId={movieId}
        title={movieTitle}
        posterPath={posterPath}
        releaseYear={releaseYear}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['user-rating', movieId] });
        }}
      />

      <AddToCollectionModal
        open={isListOpen}
        onClose={() => setIsListOpen(false)}
        tmdbId={movieId}
        filmTitle={movieTitle}
      />
    </>
  );
}
