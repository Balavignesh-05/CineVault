import { MediaSection } from './MediaSection';
import { MovieCardData } from '@/lib/tmdb/types';

export function TopRatedSection({ movies }: { movies: MovieCardData[] }) {
  return (
    <MediaSection
      title="Top Rated"
      subtitle="All-time cinema classics and modern masterpieces"
      media={movies}
      viewAllHref="/films"
    />
  );
}
