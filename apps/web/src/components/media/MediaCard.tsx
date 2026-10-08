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

  const rawMedia = media as any;
  const isTv = 'seasons' in media || media.mediaType === 'tv' || rawMedia.first_air_date || rawMedia.name;
  const mediaType = isTv ? 'tv' : 'movie';
  const linkHref = isTv ? `/series/${media.id}` : `/movies/${media.id}`;
  
  const posterPath = media.posterPath || rawMedia.poster_path || null;
  const title = media.title || rawMedia.title || rawMedia.name || 'Untitled';
  const voteAverage = media.voteAverage ?? rawMedia.vote_average ?? 0;
  const releaseYear = media.releaseYear ?? (
    rawMedia.release_date
      ? new Date(rawMedia.release_date).getFullYear()
      : rawMedia.first_air_date
      ? new Date(rawMedia.first_air_date).getFullYear()
      : null
  );

  const posterUrl = posterPath && !hasImageError
    ? (posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`)
    : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col gap-2.5 w-full",
        className
      )}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-[#161a22] rounded-2xl overflow-hidden border border-white/[0.08] shadow-md group-hover:border-primary/50 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.7)] transition-all duration-300">
        
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full bg-black/85 border border-white/10 text-xs font-black font-mono text-primary backdrop-blur-md">
            #{rank}
          </div>
        )}

        {/* Rating Badge */}
        {voteAverage > 0 && (
          <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-md">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black text-white">{voteAverage.toFixed(1)}</span>
          </div>
        )}

        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            onError={() => setHasImageError(true)}
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#1b212b] to-[#0f1318] text-white/30 p-4 text-center">
            {isTv ? <Tv size={28} className="mb-2 text-primary/60" /> : <Film size={28} className="mb-2 text-primary/60" />}
            <span className="text-xs font-semibold text-white/60 line-clamp-2">{title}</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity duration-200 z-10 flex flex-col justify-end p-3 gap-2.5">
          <Link
            href={linkHref}
            className="w-full text-center bg-primary hover:bg-primary-hover text-black font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Details
          </Link>
          
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors border',
                isLiked ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-black/60 text-white/80 border-white/20 hover:text-white hover:bg-black/90'
              )}
              aria-label="Like"
            >
              <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setIsWatched(!isWatched); }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors border',
                isWatched ? 'bg-primary/20 text-primary border-primary/50' : 'bg-black/60 text-white/80 border-white/20 hover:text-white hover:bg-black/90'
              )}
              aria-label="Mark watched"
            >
              <Eye size={13} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setIsWatchlisted(!isWatchlisted); }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors border',
                isWatchlisted ? 'bg-white/20 text-white border-white/50' : 'bg-black/60 text-white/80 border-white/20 hover:text-white hover:bg-black/90'
              )}
              aria-label="Add to watchlist"
            >
              {isWatchlisted ? <Check size={13} /> : <Plus size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Info Below Poster */}
      <div className="flex flex-col px-0.5">
        <Link
          href={linkHref}
          className="font-bold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors tracking-tight"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mt-0.5">
          <span>{releaseYear || 'TBA'}</span>
          {isTv && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-primary font-bold text-[10px] uppercase">TV</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
