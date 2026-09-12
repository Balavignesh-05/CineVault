'use client';

import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { ProfileRecentActivity } from '@/components/profile/ProfileRecentActivity';
import { ProfileReviews } from '@/components/profile/ProfileReviews';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import Link from 'next/link';

// Shows a single favorite film poster fetched by TMDB ID
function FavoriteFilmSlot({ tmdbId }: { tmdbId: string }) {
  const { data } = useQuery({
    queryKey: ['tmdb-poster', tmdbId],
    queryFn: () => fetch(`/api/tmdb/movies/${tmdbId}`).then(r => r.ok ? r.json() : null).catch(() => null),
    staleTime: 3600000,
  });

  const posterUrl = data?.poster_path
    ? `https://image.tmdb.org/t/p/w185${data.poster_path}`
    : null;

  return (
    <Link href={`/movies/${tmdbId}`} className="aspect-[2/3] bg-surface rounded overflow-hidden block group">
      {posterUrl ? (
        <img src={posterUrl} alt={data?.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-text-muted text-xs p-1 text-center">{data?.title || '...'}</div>
      )}
    </Link>
  );
}


export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user } = useAuth();
  const isOwnProfile = user?.username === username;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get<any>(`/users/${username}`).then(res => res.data),
  });

  if (isLoading) return <div className="min-h-screen bg-background pt-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!profile) return <div className="p-12 text-center text-text-muted">Profile not found</div>;

  // Render a private profile warning if necessary
  if (profile.isPrivate && !profile.isOwner && !profile.isFollowing) {
    return (
      <div className="min-h-screen bg-background text-white pb-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <ProfileHeader 
            user={profile} 
            isOwnProfile={false} 
            followersCount={0} 
            followingCount={0} 
            filmCount={0} 
          />
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold mb-2">This account is private</h2>
            <p className="text-text-muted">Follow {profile.username} to see their films and reviews.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-8">
        
        {/* Header */}
        <ProfileHeader 
          user={profile} 
          isOwnProfile={isOwnProfile} 
          followersCount={profile._count?.followers || 0} 
          followingCount={profile._count?.following || 0} 
          filmCount={profile._count?.filmLogs || 0}
          isFollowing={profile.isFollowing}
        />

        {/* Navigation */}
        <ProfileNavigation username={username} activeTab="profile" />

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mt-8">
          
          {/* Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Favorite Films */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Favorite Films</h2>
              <div className="grid grid-cols-4 gap-2">
                {profile.favoriteFilmIds && profile.favoriteFilmIds.length > 0 ? (
                  profile.favoriteFilmIds.slice(0, 4).map((tmdbId: string) => (
                    <FavoriteFilmSlot key={tmdbId} tmdbId={tmdbId} />
                  ))
                ) : (
                  // Empty slots shown even when none selected (Letterboxd style)
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] bg-surface rounded border-2 border-dashed border-border-subtle flex items-center justify-center text-text-muted opacity-40 hover:opacity-70 transition-opacity"
                    >
                      <span className="text-xs">+</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <ProfileRecentActivity username={username} />

            {/* Recent Reviews */}
            <ProfileReviews username={username} />

          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="lg:col-span-1">
            <ProfileSidebar username={username} />
          </div>

        </div>

      </div>
    </div>
  );
}
