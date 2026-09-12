'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MovieCardData, MovieDetailsData } from '@/lib/tmdb/types';

interface HeroSectionProps {
  movies: any[]; // Using any to accept both MovieCardData and MovieDetailsData
}

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Science Fiction', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

export function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0 || !movies[currentIndex]) return null;

  const activeMovie = movies[currentIndex];
  const primaryGenre = activeMovie?.genreIds?.[0] ? genreMap[activeMovie.genreIds[0]] : null;

  return (
    <section className="relative w-full h-[100vh] min-h-[600px] max-h-[1000px] overflow-hidden flex items-end">
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          {activeMovie.backdropPath && (
            <Image
              src={`https://image.tmdb.org/t/p/w1280${activeMovie.backdropPath}`}
              alt={activeMovie.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Film Grain Texture overlay */}
      <div className="absolute inset-0 z-0 noise-overlay pointer-events-none opacity-40 mix-blend-overlay" />

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--color-bg-base) 0%, rgba(10,10,15,0.8) 40%, rgba(10,10,15,0.2) 100%)'
        }}
      />

      {/* Content */}
      <div className="container relative z-20 pb-24 pt-32 flex flex-col items-start justify-end h-full gap-4">
        <motion.div
          key={`content-${activeMovie.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl space-y-5"
        >
          {primaryGenre && (
            <Badge className="bg-white/10 text-white hover:bg-white/20 border border-white/10 font-bold px-3 py-1 text-[11px] uppercase tracking-widest backdrop-blur-md rounded-full shadow-lg">
              {primaryGenre}
            </Badge>
          )}
          
          <motion.h1 
            className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl [text-shadow:_0_8px_32px_rgb(0_0_0_/_60%)] leading-[1.1] line-clamp-2"
          >
            {activeMovie.title}
          </motion.h1>

          <motion.div className="flex items-center gap-4 text-sm font-bold text-white/70 drop-shadow-md">
            {activeMovie.releaseYear && <span>{activeMovie.releaseYear}</span>}
            <span className="flex items-center gap-1 text-amber-400">
              <Star size={14} className="fill-amber-400" />
              {activeMovie.voteAverage ? activeMovie.voteAverage.toFixed(1) : 'NR'}
            </span>
            {activeMovie.runtime && (
              <>
                <span className="text-white/30">•</span>
                <span>
                  {Math.floor(activeMovie.runtime / 60)}h {activeMovie.runtime % 60}m
                </span>
              </>
            )}
          </motion.div>

          {activeMovie.tagline && (
            <motion.p className="text-xl md:text-2xl font-serif italic text-white/90 drop-shadow-lg opacity-90">
              &ldquo;{activeMovie.tagline}&rdquo;
            </motion.p>
          )}

          {activeMovie.overview && (
            <motion.p className="text-base md:text-lg text-white/80 line-clamp-3 max-w-2xl drop-shadow-md leading-relaxed">
              {activeMovie.overview}
            </motion.p>
          )}

          <motion.div 
            className="flex flex-wrap items-center gap-4 pt-6"
          >
            <Button size="lg" className="rounded-full px-8 bg-primary text-black hover:bg-primary-hover hover:scale-105 transition-all font-bold gap-2 shadow-[0_0_30px_rgba(0,230,118,0.3)]" asChild>
              <Link href={`/movies/${activeMovie.id}`}>
                <Play size={18} className="fill-black" />
                Watch Trailer
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-white/20 hover:border-white/40 hover:scale-105 transition-all font-bold gap-2" asChild>
              <Link href={`/movies/${activeMovie.id}`}>
                View Details
              </Link>
            </Button>
            <Button size="icon" variant="outline" className="rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-white/20 hover:border-white/40 hover:scale-105 transition-all">
              <Star size={18} />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-white/20 hover:border-white/40 hover:scale-105 transition-all">
              <Plus size={18} />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="group py-2 px-1 focus:outline-none"
            aria-label={`Go to slide ${idx + 1}`}
          >
            <div 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-out",
                idx === currentIndex 
                  ? "w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                  : "w-2 bg-white/20 group-hover:bg-white/40"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
