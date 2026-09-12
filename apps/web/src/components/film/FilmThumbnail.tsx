'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Film, Star, Clapperboard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilmThumbnailProps {
  src: string | null | undefined;
  title: string;
  year?: number | string;
  rating?: number;
  alt?: string;
  priority?: boolean;
  className?: string;
}

export function FilmThumbnail({
  src,
  title,
  year,
  rating,
  alt,
  priority = false,
  className,
}: FilmThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  let formattedUrl: string | null = null;
  if (src && !hasError) {
    if (src.startsWith('http')) {
      formattedUrl = src;
    } else {
      formattedUrl = `https://image.tmdb.org/t/p/w500${src.startsWith('/') ? src : `/${src}`}`;
    }
  }

  if (formattedUrl && !hasError) {
    return (
      <Image
        src={formattedUrl}
        alt={alt || title}
        fill
        unoptimized
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        priority={priority}
        onError={() => setHasError(true)}
        className={cn('object-cover transition-transform duration-300 group-hover:scale-105', className)}
      />
    );
  }

  // Stylish Fallback Cinema Poster Thumbnail with Glowing Letterboxd Borders
  return (
    <div
      className={cn(
        'w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-[#1c2228] via-[#14181c] to-[#0d1013] border border-border-subtle text-center select-none relative overflow-hidden group-hover:border-primary/60 transition-colors',
        className
      )}
    >
      {/* Background Decorative Pattern & Glow */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00e054_1.5px,transparent_1.5px)] [background-size:14px_14px]" />
      <div className="absolute -top-12 -left-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-accent-amber/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Icon & Year */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-primary border-b border-border-subtle pb-2">
        <Clapperboard size={15} />
        {year && <span className="font-bold tracking-wider">{year}</span>}
      </div>

      {/* Center: Film Title & Icon */}
      <div className="relative z-10 my-auto py-2 space-y-2">
        <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
          <Film size={20} />
        </div>
        <h4 className="font-bold text-sm text-white line-clamp-3 leading-snug font-display tracking-wide group-hover:text-primary transition-colors">
          {title}
        </h4>
      </div>

      {/* Bottom Bar: Star Rating */}
      <div className="relative z-10 pt-2 border-t border-border-subtle text-xs font-mono font-bold text-accent-amber flex items-center justify-center gap-1">
        <Star size={12} fill="currentColor" /> {rating ? rating.toFixed(1) : '8.4'} / 10
      </div>
    </div>
  );
}
