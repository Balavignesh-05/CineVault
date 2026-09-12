'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Heart, BookOpen, Eye, RotateCcw, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACTION_LABELS: Record<string, { icon: any; label: string }> = {
  logged: { icon: Eye, label: 'watched' },
  reviewed: { icon: BookOpen, label: 'reviewed' },
  liked: { icon: Heart, label: 'liked' },
  rewatched: { icon: RotateCcw, label: 'rewatched' },
  watchlisted: { icon: Star, label: 'added to watchlist' },
};

export default function FeedPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => api.get<any>('/social/feed?limit=50').then(r => r.data).catch(() => ({ items: [] })),
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  if (isAuthLoading) return <div className="min-h-screen bg-background" />;

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <Users className="w-16 h-16 text-text-muted mx-auto opacity-30" />
        <h2 className="text-xl font-black text-white">Sign in to see what friends are watching</h2>
        <p className="text-text-muted text-sm">Follow other members to see their reviews, ratings, and diary entries here.</p>
        <Link href="/signin" className="inline-block px-8 py-3 bg-[#00e054] text-black font-bold rounded-xl hover:bg-[#00e054]/90 transition-colors mt-4">
          Sign In
        </Link>
      </div>
    </div>
  );

  const feedItems = data?.items || data || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 max-w-2xl py-10 space-y-6">
        <h1 className="text-2xl font-black text-white">Activity</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-3 p-4 bg-surface rounded-xl animate-pulse">
                <div className="w-10 h-10 rounded-full bg-elevated shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-elevated rounded w-2/3" />
                  <div className="h-3 bg-elevated rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted bg-surface rounded-xl border border-border-subtle">
            <Users className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-bold text-white">Nothing here yet.</p>
            <p className="text-sm mt-2">Follow other members to see their activity.</p>
            <Link href="/discovery" className="mt-6 px-6 py-2 bg-[#00e054] text-black font-bold rounded-xl text-sm hover:bg-[#00e054]/90 transition-colors">
              Discover Members
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {feedItems.map((item: any, i: number) => {
              const user = item.user || {};
              const film = item.film || item.series || {};
              const action = ACTION_LABELS[item.actionType] || { icon: Eye, label: item.actionType || 'watched' };
              const ActionIcon = action.icon;
              const posterUrl = film.posterUrl
                ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                : null;
              const timeAgo = item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : '';

              return (
                <article key={item.id || i} className="flex gap-3 py-4 px-3 border-b border-border-subtle/30 hover:bg-surface/40 rounded-lg group">
                  {/* Avatar */}
                  <Link href={`/profile/${user.username}`} className="shrink-0">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="text-xs bg-surface">{(user.username || '?')[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link href={`/profile/${user.username}`} className="font-bold text-white hover:text-[#00e054] transition-colors">
                        {user.displayName || user.username}
                      </Link>
                      {' '}
                      <span className="text-text-muted">{action.label}</span>
                      {' '}
                      {film.title && (
                        <Link href={film.tmdbId ? `/movies/${film.tmdbId}` : '#'} className="font-bold text-white hover:text-[#00e054] transition-colors">
                          {film.title}
                        </Link>
                      )}
                      {film.releaseDate && (
                        <span className="text-text-muted ml-1">{new Date(film.releaseDate).getFullYear()}</span>
                      )}
                    </p>
                    {item.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={10} className={s <= item.rating ? 'fill-[#ff8000] text-[#ff8000]' : 'text-text-muted'} />
                        ))}
                      </div>
                    )}
                    {item.reviewBody && (
                      <p className="text-xs text-text-muted mt-1.5 line-clamp-2 italic">&ldquo;{item.reviewBody}&rdquo;</p>
                    )}
                    <p className="text-[10px] text-text-muted mt-1.5">{timeAgo}</p>
                  </div>

                  {/* Poster thumbnail */}
                  {posterUrl && (
                    <Link href={film.tmdbId ? `/movies/${film.tmdbId}` : '#'} className="shrink-0">
                      <img src={posterUrl} alt={film.title} className="w-8 h-12 object-cover rounded" />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}