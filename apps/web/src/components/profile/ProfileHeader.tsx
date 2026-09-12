'use client';

import React from 'react';
import { PublicUser } from '@cinevault/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BadgeCheck, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

interface ProfileHeaderProps {
  user: PublicUser;
  isOwnProfile: boolean;
  followersCount: number;
  followingCount: number;
  filmCount: number;
  isFollowing?: boolean;
}

export function ProfileHeader({ 
  user, 
  isOwnProfile, 
  followersCount, 
  followingCount, 
  filmCount,
  isFollowing = false
}: ProfileHeaderProps) {
  const queryClient = useQueryClient();

  const toggleFollow = useMutation({
    mutationFn: () => api.post(`/users/${user.username}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
    }
  });

  return (
    <div className="relative pt-12 pb-8 border-b border-border-subtle mb-8">
      {/* Backdrop */}
      {user.profileBackdropUrl && (
        <div className="absolute inset-0 top-0 w-full h-[200px] md:h-[250px] overflow-hidden rounded-t-3xl border border-border-subtle opacity-30 mt-[-20px] pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={user.profileBackdropUrl} 
            alt="Profile backdrop" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10 px-4 md:px-0">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 shadow-xl ring-2 ring-border-subtle bg-surface">
          <AvatarImage src={user.avatarUrl ?? undefined} className="object-cover" />
          <AvatarFallback className="text-3xl font-black bg-surface text-text-muted">{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      
      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        {/* Left side: Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              {user.displayName || user.username}
            </h1>
            {user.isVerified && <BadgeCheck className="w-6 h-6 text-primary" />}
          </div>
          
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="text-text-muted">@{user.username}</span>
            {user.location && (
              <span className="flex items-center gap-1 text-text-secondary">
                <MapPin className="w-4 h-4" />
                {user.location}
              </span>
            )}
            {user.website && (
              <span className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4 text-text-muted" />
                <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </span>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="pt-2">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" asChild className="rounded-xl border-border-subtle bg-surface hover:bg-elevated text-white">
                <Link href="/settings">Edit Profile</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant={isFollowing ? 'secondary' : 'default'}
                  size="sm"
                  className={`rounded-xl px-6 font-bold ${isFollowing ? 'bg-surface text-white border border-border-subtle hover:bg-elevated' : 'bg-primary text-background hover:bg-primary-hover'}`}
                  onClick={() => toggleFollow.mutate()}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-border-subtle bg-transparent text-text-muted hover:text-error hover:border-error/50 hover:bg-error/10 px-3"
                  onClick={() => alert('User blocked.')}
                  title="Block User"
                >
                  Block
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Stats Block */}
        <div className="flex gap-6 md:gap-10 shrink-0 border-t md:border-t-0 md:border-l border-border-subtle pt-6 md:pt-0 md:pl-10">
          <Link href={`/profile/${user.username}/films`} className="flex flex-col items-center group">
            <span className="text-2xl font-black text-white group-hover:text-primary transition-colors">{filmCount}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 group-hover:text-text-secondary transition-colors">Films</span>
          </Link>
          <Link href={`/profile/${user.username}/following`} className="flex flex-col items-center group">
            <span className="text-2xl font-black text-white group-hover:text-primary transition-colors">{followingCount}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 group-hover:text-text-secondary transition-colors">Following</span>
          </Link>
          <Link href={`/profile/${user.username}/followers`} className="flex flex-col items-center group">
            <span className="text-2xl font-black text-white group-hover:text-primary transition-colors">{followersCount}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 group-hover:text-text-secondary transition-colors">Followers</span>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
