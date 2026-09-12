'use client';

import React from 'react';
import type { ActivityEvent } from '@cinevault/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Star, BookOpen, Eye, UserPlus, List } from 'lucide-react';

interface ActivityItemProps {
  event: ActivityEvent;
}

function ActivityContent({ event }: { event: ActivityEvent }) {
  const filmLink = event.film ? (
    <Link
      href={`/movies/${event.film.tmdbId}`}
      className="font-semibold hover:underline text-[var(--color-text-primary)]"
    >
      {event.film.title}
    </Link>
  ) : null;

  switch (event.type) {
    case 'rated_film':
      return (
        <>
          rated {filmLink}
          {event.rating != null && (
            <span className="text-amber-400 font-medium ml-1">★ {event.rating}</span>
          )}
        </>
      );
    case 'reviewed_film':
      return <>reviewed {filmLink}</>;
    case 'liked_film':
      return <>liked {filmLink}</>;
    case 'added_to_watchlist':
      return <>added {filmLink} to their watchlist</>;
    case 'watched_film':
      return <>watched {filmLink}</>;
    case 'followed_user':
      return (
        <>
          started following{' '}
          <Link
            href={`/profile/${event.targetUser?.username}`}
            className="font-semibold hover:underline text-[var(--color-text-primary)]"
          >
            {event.targetUser?.displayName ?? event.targetUser?.username}
          </Link>
        </>
      );
    case 'created_collection':
      return (
        <>
          created a collection{' '}
          <Link
            href={`/collections/${event.collectionId}`}
            className="font-semibold hover:underline text-[var(--color-text-primary)]"
          >
            {(event.metadata?.collectionTitle as string) ?? 'a collection'}
          </Link>
        </>
      );
    case 'liked_review':
      return (
        <>
          liked a review
          {filmLink && <> of {filmLink}</>}
        </>
      );
    case 'commented_review':
      return (
        <>
          commented on a review
          {filmLink && <> of {filmLink}</>}
        </>
      );
    default:
      return <span>performed an action</span>;
  }
}

function activityIcon(type: ActivityEvent['type']) {
  switch (type) {
    case 'rated_film':       return <Star className="w-3 h-3" />;
    case 'reviewed_film':    return <BookOpen className="w-3 h-3" />;
    case 'watched_film':     return <Eye className="w-3 h-3" />;
    case 'followed_user':    return <UserPlus className="w-3 h-3" />;
    case 'created_collection': return <List className="w-3 h-3" />;
    default:                 return null;
  }
}

export function ActivityItem({ event }: ActivityItemProps) {
  const actor = event.actor;

  return (
    <div className="flex gap-3 p-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors">
      <Link href={`/profile/${actor?.username}`} className="shrink-0">
        <Avatar className="w-10 h-10 ring-2 ring-[var(--color-bg-surface)]">
          <AvatarImage src={actor?.avatarUrl ?? undefined} />
          <AvatarFallback className="text-sm">
            {actor?.displayName?.[0] ?? '?'}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--color-text-primary)] leading-tight mb-1">
          <Link href={`/profile/${actor?.username}`} className="font-bold hover:underline mr-1">
            {actor?.displayName ?? actor?.username}
          </Link>
          <ActivityContent event={event} />
        </div>

        {Boolean(event.metadata?.reviewBody) && (
          <div className="mt-2 mb-3 text-sm text-[var(--color-text-secondary)] italic line-clamp-3">
            &ldquo;{String(event.metadata!.reviewBody)}&rdquo;
          </div>
        )}

        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          {activityIcon(event.type)}
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </div>
      </div>

      {event.film?.posterUrl && (
        <Link href={`/movies/${event.film.tmdbId}`} className="shrink-0 hidden sm:block">
          <div className="relative w-10 h-15 rounded overflow-hidden">
            <Image
              src={event.film.posterUrl}
              alt={event.film.title}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        </Link>
      )}
    </div>
  );
}
