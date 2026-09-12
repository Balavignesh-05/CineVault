import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Star, Film } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileRecentActivityProps {
  username: string;
}

export function ProfileRecentActivity({ username }: ProfileRecentActivityProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile', username, 'activity', 'recent'],
    queryFn: () => api.get<any>(`/users/${username}/films?limit=4`).then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle pb-2">Recent Activity</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4 p-4 bg-surface rounded-xl">
              <div className="w-12 h-16 bg-elevated rounded"></div>
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 bg-elevated rounded w-1/3"></div>
                <div className="h-3 bg-elevated rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.items || data.items.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle pb-2">Recent Activity</h2>
        <p className="text-text-muted text-sm py-4">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Recent Activity</h2>
        <Link href={`/profile/${username}/activity`} className="text-xs font-bold text-primary hover:text-white transition-colors">
          All
        </Link>
      </div>

      <div className="space-y-2">
        {data.items.map((log: any) => (
          <Link key={log.id} href={`/movies/${log.film.id}`} className="group flex items-center gap-4 p-3 bg-surface hover:bg-elevated rounded-xl transition-colors border border-transparent hover:border-border-subtle">
            <div className="relative w-12 h-16 bg-elevated rounded overflow-hidden shadow-md shrink-0">
              {log.film.posterUrl ? (
                <Image src={`https://image.tmdb.org/t/p/w92${log.film.posterUrl}`} alt={log.film.title} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted"><Film size={16} /></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="font-bold text-white group-hover:text-primary transition-colors truncate">{log.film.title}</h3>
                {log.film.releaseDate && <span className="text-xs text-text-muted">{new Date(log.film.releaseDate).getFullYear()}</span>}
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                {log.rating && (
                  <div className="flex items-center text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < log.rating / 2 ? "fill-current" : "opacity-30"} />
                    ))}
                  </div>
                )}
                {log.like && <span className="text-orange-500 font-bold">♥</span>}
                <span className="text-text-muted">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
