'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  movies: any[];
}

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

export function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0 || !movies[currentIndex]) return null;

  const activeMovie = movies[currentIndex] || movies[0];
  if (!activeMovie) return null;

  // Defensively extract data supporting both camelCase and snake_case TMDB objects
  const backdrop = activeMovie.backdropPath || activeMovie.backdrop_path || null;
  const poster = activeMovie.posterPath || activeMovie.poster_path || null;
  const title = activeMovie.title || activeMovie.name || 'Featured Movie';
  
  const releaseYear = activeMovie.releaseYear ?? (
    activeMovie.release_date
      ? new Date(activeMovie.release_date).getFullYear()
      : activeMovie.first_air_date
      ? new Date(activeMovie.first_air_date).getFullYear()
      : null
  );

  const voteAverage = activeMovie.voteAverage ?? activeMovie.vote_average ?? 0;
  const runtime = activeMovie.runtime ?? 0;
  const overview = activeMovie.overview ?? '';

  // Extract genre cleanly
  const genreList: string[] = Array.isArray(activeMovie.genres)
    ? activeMovie.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : Array.isArray(activeMovie.genre_ids)
    ? activeMovie.genre_ids.map((id: number) => genreMap[id]).filter(Boolean)
    : Array.isArray(activeMovie.genreIds)
    ? activeMovie.genreIds.map((id: number) => genreMap[id]).filter(Boolean)
    : [];

  const primaryGenre = genreList[0] || null;

  const backdropUrl = backdrop
    ? (backdrop.startsWith('http') ? backdrop : `https://image.tmdb.org/t/p/w1280${backdrop}`)
    : poster
    ? (poster.startsWith('http') ? poster : `https://image.tmdb.org/t/p/w1280${poster}`)
    : null;

  return (
    <section className="relative w-full h-[460px] sm:h-[520px] md:h-[580px] lg:h-[620px] overflow-hidden flex items-end bg-[#0b0e14]">
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeMovie.id || currentIndex}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          {backdropUrl ? (
            <Image
              src={backdropUrl}
              alt={title}
              fill
              priority
              className="object-cover object-[center_20%]"
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#161b24] to-[#0b0e14]" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Gradient Overlays:
          - Left-to-right gradient to keep text crisp & readable
          - Bottom-to-top gradient to blend naturally with page background
          - Top subtle vignette
          Artwork on the right and center stays clearly visible and cinematic! */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/75 to-transparent sm:via-[#0b0e14]/50 max-w-4xl" />
      <div className="absolute inset-x-0 bottom-0 h-48 z-10 pointer-events-none bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-20 z-10 pointer-events-none bg-gradient-to-b from-[#0b0e14]/40 to-transparent" />

      {/* Hero Content Container: placed in the lower-left of the hero */}
      <div className="container relative z-20 pb-10 sm:pb-12 md:pb-14 flex flex-col items-start justify-end h-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <motion.div
          key={`content-${activeMovie.id || currentIndex}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl lg:max-w-3xl space-y-3"
        >
          {/* Spotlight Pill & Genre Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,224,84,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              In the Spotlight
            </span>
            {primaryGenre && (
              <Badge className="bg-white/10 text-white border border-white/10 font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider backdrop-blur-md rounded-full">
                {primaryGenre}
              </Badge>
            )}
          </div>
          
          {/* Movie Title */}
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl leading-[1.08] line-clamp-2"
          >
            {title}
          </motion.h1>

          {/* Metadata Row */}
          <motion.div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-white/80 drop-shadow-md">
            {releaseYear && <span>{releaseYear}</span>}
            {voteAverage > 0 && (
              <>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                  <Star size={13} className="fill-amber-400" />
                  {voteAverage.toFixed(1)}
                </span>
              </>
            )}
            {runtime > 0 && (
              <>
                <span className="text-white/30">•</span>
                <span>
                  {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              </>
            )}
          </motion.div>

          {/* Overview summary */}
          {overview && (
            <motion.p className="text-xs sm:text-sm md:text-base text-white/80 line-clamp-2 sm:line-clamp-3 max-w-xl drop-shadow-md leading-relaxed font-normal">
              {overview}
            </motion.p>
          )}

          {/* Dual CTAs */}
          <motion.div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="lg" className="rounded-full px-7 bg-primary text-black hover:bg-primary-hover hover:scale-105 transition-all font-bold gap-2 shadow-[0_0_25px_rgba(0,224,84,0.35)] h-11" asChild>
              <Link href={`/movies/${activeMovie.id}`}>
                <Play size={15} className="fill-black" />
                View Movie
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 bg-black/40 hover:bg-white/10 text-white backdrop-blur-md border-white/20 hover:border-white/40 hover:scale-105 transition-all font-semibold gap-2 h-11" asChild>
              <Link href={`/movies/${activeMovie.id}`}>
                <Plus size={15} />
                Watchlist
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress Indicators at Bottom Right */}
      {movies.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8 z-20 flex items-center gap-1.5">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="py-2 px-1 focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500 ease-out",
                  idx === currentIndex 
                    ? "w-8 bg-primary shadow-[0_0_10px_rgba(0,224,84,0.6)]" 
                    : "w-2 bg-white/30 hover:bg-white/60"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
