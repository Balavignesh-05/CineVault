import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MovieCardData, SeriesCardData } from '@/lib/tmdb/types';
import { MediaCarousel } from '@/components/media';

interface MediaSectionProps {
  title: string;
  subtitle?: string;
  media: (MovieCardData | SeriesCardData)[];
  viewAllHref?: string;
  variant?: 'default' | 'dark';
}

export function MediaSection({
  title,
  subtitle,
  media,
  viewAllHref,
  variant = 'default'
}: MediaSectionProps) {
  if (!media || media.length === 0) return null;

  return (
    <section className={cn(
      "py-4 md:py-6 w-full",
      variant === 'dark' ? "bg-black/20" : ""
    )}>
      <div className="container space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-text-muted font-medium text-xs">
                {subtitle}
              </p>
            )}
          </div>
          
          {viewAllHref && (
            <Link 
              href={viewAllHref}
              className="group flex items-center gap-1 text-xs font-semibold text-primary hover:text-white transition-colors"
            >
              See all
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="-mx-4 sm:mx-0">
          <MediaCarousel media={media} />
        </div>
      </div>
    </section>
  );
}
