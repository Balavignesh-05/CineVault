"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Plus, Check, MessageSquare, Star, Film, Tv } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { MovieCardData, SeriesCardData } from "@/lib/tmdb/types";

export interface MediaCardProps {
  media: MovieCardData | SeriesCardData;
  rank?: number;
  priority?: boolean;
  onLogClick?: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  className?: string;
}

export function MediaCard({
  media,
  rank,
  priority = false,
  onLogClick,
  className,
}: MediaCardProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const isTv = 'seasons' in media || media.mediaType === 'tv';
  const mediaType = isTv ? 'tv' : 'movie';
  const linkHref = isTv ? `/series/${media.id}` : `/movies/${media.id}`;
  
  const posterUrl = media.posterPath && !hasImageError
    ? (media.posterPath.startsWith('http') ? media.posterPath : `https://image.tmdb.org/t/p/w500${media.posterPath}`)
    : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col gap-2 w-full",
        className
      )}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-surface rounded-xl overflow-hidden border border-border-subtle shadow-sm group-hover:border-border-strong group-hover:shadow-lg transition-all duration-300">
        
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-black/80 border border-white/10 text-xs font-bold font-mono text-primary backdrop-blur-md">
            #{rank}
          </div>
        )}

        {/* Rating Badge */}
        {media.voteAverage > 0 && (
          <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md flex items-center gap-1">
            <Star size={10} className="text-primary fill-primary" />
            <span className="text-[10px] font-bold text-white">{media.voteAverage.toFixed(1)}</span>
          </div>
        )}

        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={media.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            onError={() => setHasImageError(true)}
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-white/20 p-4 text-center">
            {isTv ? <Tv size={24} className="mb-2" /> : <Film size={24} className="mb-2" />}
            <span className="text-xs font-semibold text-white/40">{media.title}</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity duration-200 z-10 flex flex-col justify-center items-center gap-3">
          <Link
            href={linkHref}
            className="bg-primary hover:bg-primary-hover text-black font-bold py-2 px-6 rounded-full text-xs uppercase tracking-wider transition-transform transform hover:scale-105"
          >
            Details
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors border',
                isLiked ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-black/50 text-white/70 border-white/20 hover:text-white hover:bg-black/80'
              )}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setIsWatched(!isWatched); }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors border',
                isWatched ? 'bg-primary/20 text-primary border-primary/50' : 'bg-black/50 text-white/70 border-white/20 hover:text-white hover:bg-black/80'
              )}
            >
              <Eye size={14} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setIsWatchlisted(!isWatchlisted); }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors border',
                isWatchlisted ? 'bg-white/20 text-white border-white/50' : 'bg-black/50 text-white/70 border-white/20 hover:text-white hover:bg-black/80'
              )}
            >
              {isWatchlisted ? <Check size={14} /> : <Plus size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Info Below Poster */}
      <div className="flex flex-col px-1">
        <Link
          href={linkHref}
          className="font-bold text-sm text-text-primary line-clamp-1 group-hover:text-primary transition-colors"
          title={media.title}
        >
          {media.title}
        </Link>
        <span className="text-xs font-medium text-text-muted mt-0.5 uppercase tracking-wider">
          {media.releaseYear || 'TBA'} {isTv && ' • TV'}
        </span>
      </div>
    </motion.div>
  );
}
