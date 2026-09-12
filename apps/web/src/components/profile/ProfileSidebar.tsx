import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ChevronRight, Calendar, BookmarkPlus, ListVideo, BarChart3, Star, Heart, Film } from 'lucide-react';

interface ProfileSidebarProps {
  username: string;
}

export function ProfileSidebar({ username }: ProfileSidebarProps) {
  const { data: stats } = useQuery({
    queryKey: ['profile', username, 'stats'],
    queryFn: () => api.get<any>(`/stats/${username}`).then(res => res.data).catch(() => null),
    retry: false
  });

  const { data: filmsData } = useQuery({
    queryKey: ['profile-films-count', username],
    queryFn: () => api.get<any>(`/users/${username}/films?limit=1`).then(r => r.data).catch(() => null),
    retry: false,
  });

  const sidebarLinks = [
    { label: 'Watchlist', href: `/profile/${username}/watchlist`, icon: BookmarkPlus },
    { label: 'Diary', href: `/profile/${username}/diary`, icon: Calendar },
    { label: 'Lists', href: `/profile/${username}/lists`, icon: ListVideo },
  ];

  // Build rating distribution from stats
  // API returns `ratings` (not `ratingDistribution`) and `avgRatingGiven` (not `avgRating`)
  const ratingDist: Record<string, number> = stats?.ratings || {};
  const maxCount = Math.max(...Object.values(ratingDist).map(Number), 1);
  const ratingSteps = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

  return (
    <div className="space-y-6">
      {/* Navigation Links */}
      <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden">
        {sidebarLinks.map((link, idx) => (
          <Link 
            key={link.label}
            href={link.href}
            className={`flex items-center justify-between p-4 hover:bg-elevated transition-colors ${idx !== sidebarLinks.length - 1 ? 'border-b border-border-subtle' : ''}`}
          >
            <div className="flex items-center gap-3">
              <link.icon className="w-4 h-4 text-text-muted" />
              <span className="font-bold text-white text-sm">{link.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="bg-surface rounded-xl border border-border-subtle p-4 space-y-3">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Film className="w-3.5 h-3.5" /> Stats
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Films', value: filmsData?.total || stats?.moviesWatched || '—' },
            { label: 'This Year', value: stats?.filmsByYear?.[new Date().getFullYear()] || '—' },
            { label: 'Avg Rating', value: stats?.avgRatingGiven ? `★${Number(stats.avgRatingGiven).toFixed(1)}` : '—' },
            { label: 'Reviews', value: stats?.reviewsWritten || '—' },
          ].map(s => (
            <div key={s.label} className="text-center py-2">
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings Distribution */}
      <div>
        <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-4">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Ratings
          </h2>
          <Link href={`/profile/${username}/stats`} className="text-[10px] text-text-muted hover:text-white transition-colors">
            More stats
          </Link>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-1.5">
          {ratingSteps.map(rating => {
            const count = ratingDist[String(rating)] || 0;
            const pct = (count / maxCount) * 100;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-[9px] text-text-muted font-mono w-5 text-right shrink-0">{rating}</span>
                <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00e054] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[9px] text-text-muted w-4 tabular-nums">{count > 0 ? count : ''}</span>
              </div>
            );
          })}
          {Object.values(ratingDist).every(v => !v) && (
            <p className="text-[10px] text-text-muted text-center py-2">No ratings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
