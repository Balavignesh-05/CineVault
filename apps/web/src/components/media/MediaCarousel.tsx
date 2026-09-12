'use client';

import React from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MediaCard } from "./MediaCard"
import type { MovieCardData, SeriesCardData, TMDBGenre } from "@/lib/tmdb/types"

interface MediaCarouselProps {
  media: (MovieCardData | SeriesCardData)[];
  genres?: TMDBGenre[];
  autoplay?: boolean;
  className?: string;
  title?: string;
}

export function MediaCarousel({
  media,
  genres,
  autoplay = false,
  className,
  title,
}: MediaCarouselProps) {
  const plugins = React.useMemo(() => {
    return autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: true })] : []
  }, [autoplay])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", skipSnaps: false, dragFree: true },
    plugins
  )

  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true)

  const scrollPrev = React.useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  )
  const scrollNext = React.useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  )

  const onSelect = React.useCallback((api: UseEmblaCarouselType[1]) => {
    if (!api) return;
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, [])

  React.useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
  }, [emblaApi, onSelect])

  if (!media || media.length === 0) return null;

  return (
    <div className={cn('relative group/carousel', className)}>
      {title && (
        <h2 className="mb-6 text-2xl font-display font-bold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h2>
      )}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 backface-hidden touch-pan-y">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="pl-4 shrink-0 basis-[40%] sm:basis-[25%] md:basis-[20%] lg:basis-[16.666%] xl:basis-[14.28%]"
            >
              <MediaCard media={item} priority={index < 4} />
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full h-10 w-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-[#14171B]/80 backdrop-blur-sm border border-[var(--color-border-subtle)] shadow-lg hover:bg-surface disabled:hidden",
          prevBtnDisabled && "hidden"
        )}
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full h-10 w-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-[#14171B]/80 backdrop-blur-sm border border-[var(--color-border-subtle)] shadow-lg hover:bg-surface disabled:hidden",
          nextBtnDisabled && "hidden"
        )}
        onClick={scrollNext}
        disabled={nextBtnDisabled}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next slide</span>
      </Button>
    </div>
  )
}
