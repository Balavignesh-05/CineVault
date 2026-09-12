'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PersonCardProps {
  id: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string;
  popularity?: number;
  className?: string;
}

export function PersonCard({
  id,
  name,
  profilePath,
  knownForDepartment,
  popularity,
  className,
}: PersonCardProps) {
  const imageUrl = profilePath
    ? `https://image.tmdb.org/t/p/w500${profilePath}`
    : null;

  return (
    <motion.div
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden glass-panel hover-lift hover-glow',
        className
      )}
    >
      <div className="relative aspect-[2/3] w-full bg-background overflow-hidden rounded-t-xl">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-sm text-[#567] bg-background">
            <User className="w-12 h-12 mb-2 opacity-50" />
            No Photo
          </div>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Hover Action Bar */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 backdrop-blur-xs flex flex-col items-center justify-center p-4 transition-opacity duration-200 z-10">
          <Link
            href={`/person/${id}`}
            className="w-full text-center py-2 px-4 rounded-xl bg-accent-amber hover:bg-[#ff9933] text-[#14181c] text-sm font-bold transition-transform hover:scale-105 shadow-lg"
          >
            View Profile
          </Link>
        </div>
      </div>

      <Link
        href={`/person/${id}`}
        className="p-3 flex flex-col justify-between flex-1 bg-transparent group-hover:bg-white/5 transition-colors"
      >
        <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-text-secondary mt-1 font-mono">
          <span>{knownForDepartment}</span>
          {popularity && (
            <span className="text-[#567] font-bold flex items-center gap-1" title="Popularity">
              <Star size={10} className="text-accent-amber" />
              {Math.round(popularity)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
