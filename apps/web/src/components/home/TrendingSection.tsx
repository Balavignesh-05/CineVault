import { MediaSection } from './MediaSection';
import { MovieCardData } from '@/lib/tmdb/types';

export function TrendingSection({ movies }: { movies: MovieCardData[] }) {
  return (
    <MediaSection
      title="Trending This Week"
      subtitle="The most popular movies right now"
      media={movies}
      viewAllHref="/films"
    />
  );
}
