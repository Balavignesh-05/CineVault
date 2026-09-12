'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { WatchlistItem, WatchlistStatus } from '@cinevault/shared-types';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface WatchlistItemCardProps {
  item: WatchlistItem;
  onStatusChange?: (newStatus: WatchlistStatus) => void;
  onRemove?: () => void;
}

const statusColors: Record<WatchlistStatus, string> = {
  planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  watching: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  watched: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function WatchlistItemCard({ item, onStatusChange, onRemove }: WatchlistItemCardProps) {
  const film = item.film;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative flex gap-4 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-colors"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-[var(--color-text-muted)] hover:text-red-400"
        onClick={onRemove}
        title="Remove from watchlist"
      >
        <X className="h-4 w-4" />
      </Button>

      {film && (
        <Link href={`/movies/${film.tmdbId}`} className="shrink-0">
          <div className="relative w-24 h-36 rounded-lg overflow-hidden shadow-sm">
            {film.posterUrl ? (
              <Image
                src={film.posterUrl}
                alt={film.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-xs text-[var(--color-text-muted)] text-center p-2">
                No Image
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="flex flex-col flex-1 min-w-0 py-1 pr-6">
        {film && (
          <Link href={`/movies/${film.tmdbId}`} className="hover:underline">
            <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
              {film.title}
            </h3>
          </Link>
        )}
        <p className="text-sm text-[var(--color-text-muted)] mb-2">
          {film?.releaseYear ?? '—'}
        </p>

        {film?.genres && film.genres.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-auto">
            {film.genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre.id}
                variant="secondary"
                className="text-xs bg-[var(--color-bg-base)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]"
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Badge className={`text-xs border ${statusColors[item.status]}`}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : ''}
          </Badge>

          <Select value={item.status} onValueChange={onStatusChange as (v: string) => void}>
            <SelectTrigger className="w-[120px] h-7 text-xs bg-[var(--color-bg-base)] border-[var(--color-border-subtle)]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="watching">Watching</SelectItem>
              <SelectItem value="watched">Watched</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
