'use client';

import React, { useRef } from 'react';
import { MediaCard } from '@/components/media';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  TrendingUp,
  Gem,
  Rocket,
  Award,
  ThumbsUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Matches the actual shape returned by /recommendations */
export interface ApiRecommendationSection {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  items: any[];
}

interface RecommendationSectionProps {
  section: ApiRecommendationSection;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  because_you_watched: Eye,
  trending_for_you: TrendingUp,
  hidden_gems: Gem,
  new_releases_for_you: Rocket,
  critically_acclaimed: Award,
  underrated: ThumbsUp,
  similar_taste: Sparkles,
  based_on_genres: Sparkles,
  continue_watching: Eye,
};

export function RecommendationSection({ section }: RecommendationSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = CATEGORY_ICONS[section.category] ?? Sparkles;

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -620 : 620,
        behavior: 'smooth',
      });
    }
  };

  if (!section.items || section.items.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--color-text-primary)]">
            <Icon className="w-6 h-6 text-[var(--color-accent-primary)]" />
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{section.subtitle}</p>
          )}
        </div>

        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8 rounded-full border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8 rounded-full border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)]"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {section.items.map((item) => (
          <div key={item.id} className="shrink-0 w-[180px] sm:w-[200px] relative group">
            <MediaCard 
              media={{
                id: item.id,
                title: item.title,
                posterPath: item.poster_path,
                releaseYear: item.release_date ? parseInt(item.release_date.substring(0, 4)) : undefined,
                voteAverage: item.vote_average,
                mediaType: 'movie'
              } as any} 
            />
            {section.subtitle && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-[var(--color-accent-secondary)] backdrop-blur max-w-[90%] z-10 line-clamp-2">
                {section.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
