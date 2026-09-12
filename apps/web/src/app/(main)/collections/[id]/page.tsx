'use client';
import React, { useState, useEffect, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { MediaCard } from '@/components/media/MediaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Film, Lock, Unlock, Heart, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

import { EditListNoteModal } from '@/components/modals/EditListNoteModal';

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => api.get<{ data: any }>(`/collections/${id}`),
  });
  const collection = data?.data;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (collection) {
      setIsLiked(collection.isLikedByMe ?? false);
      setLikeCount(collection._count?.likes ?? 0);
    }
  }, [collection]);

  const toggleLike = useMutation({
    mutationFn: () =>
      isLiked
        ? api.delete<void>(`/collections/${id}/like`)
        : api.post<void>(`/collections/${id}/like`),
    onMutate: () => {
      setIsLiked((p) => !p);
      setLikeCount((c) => (isLiked ? c - 1 : c + 1));
    },
    onError: () => {
      setIsLiked((p) => !p);
      setLikeCount((c) => (isLiked ? c + 1 : c - 1));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
    },
  });

  const cloneList = useMutation({
    mutationFn: () => api.post<{ data: { id: string } }>(`/collections/${id}/clone`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      router.push(`/collections/${res.data?.id}`);
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-48 w-full" />
      <div className="container py-8"><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">{[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}</div></div>
    </div>
  );

  if (!collection) return <div className="flex items-center justify-center min-h-screen"><p className="text-text-muted">Collection not found.</p></div>;

  const films = collection.films || [];
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-b from-surface to-background border-b border-border-subtle">
        <div className="container py-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              {collection.isPublic ? <Unlock size={12} /> : <Lock size={12} />}
              <span>{collection.isPublic ? 'Public' : 'Private'} collection</span>
              {collection.isRanked && (
                <>
                  <span>·</span>
                  <span className="text-accent-amber font-semibold">Ranked</span>
                </>
              )}
              <span>·</span>
              <span>by {collection.user?.displayName || collection.user?.username}</span>
            </div>
            
            {user && user.id !== collection.userId && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2"
                onClick={() => cloneList.mutate()}
                disabled={cloneList.isPending}
              >
                <Copy size={14} />
                Clone List
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-black text-white">{collection.title}</h1>
          {collection.description && <p className="text-text-secondary max-w-2xl">{collection.description}</p>}
          <div className="flex items-center gap-4 mt-4">
            <p className="text-sm text-text-muted"><Film className="inline mr-1" size={12} />{films.length} films</p>
            {user && (
              <Button
                variant={isLiked ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => toggleLike.mutate()}
                disabled={toggleLike.isPending}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="container py-8">
        {films.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Film size={48} className="text-text-muted opacity-30" />
            <p className="text-text-muted">No films in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {films.map((item: any) => {
              const film = item.film || item;
              return (
                <div key={film.id} className="relative group">
                  {collection.isRanked && (
                    <div className="absolute -left-3 -top-3 w-8 h-8 bg-surface border-2 border-border-default rounded-full flex items-center justify-center font-bold text-sm text-text-primary z-10 shadow-lg shadow-black/50">
                      {item.position}
                    </div>
                  )}
                  <MediaCard media={{
                    id: film.tmdbId || film.id,
                    title: film.title,
                    posterPath: film.posterUrl?.replace('https://image.tmdb.org/t/p/w500', '') || null,
                    backdropPath: null, releaseYear: film.releaseDate ? new Date(film.releaseDate).getFullYear() : null,
                    voteAverage: 0, voteCount: 0, genreIds: [], overview: '', popularity: 0,
                    originalLanguage: 'en', mediaType: 'movie'
                  }} />
                  {item.note && (
                    <div className="mt-2 text-xs text-text-muted italic line-clamp-3 bg-surface p-2 rounded-md border border-border-subtle">
                      {item.note}
                    </div>
                  )}
                  {user?.id === collection.userId && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 shadow-lg"
                        onClick={() => setEditingNoteId(film.id)}
                      >
                        Edit Note
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingNoteId && (
        <EditListNoteModal
          open={!!editingNoteId}
          onClose={() => setEditingNoteId(null)}
          listId={collection.id}
          filmId={editingNoteId}
          filmTitle={films.find((f: any) => f.film.id === editingNoteId)?.film.title || ''}
          initialNote={films.find((f: any) => f.film.id === editingNoteId)?.note || ''}
        />
      )}
    </div>
  );
}
