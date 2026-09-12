import { MediaSection } from './MediaSection';
import { MovieCardData } from '@/lib/tmdb/types';

export function PopularSection({ movies }: { movies: MovieCardData[] }) {
  return (
    <MediaSection
      title="Popular Movies"
      subtitle="What everyone's watching"
      media={movies}
      viewAllHref="/films"
      variant="dark"
    />
  );
}
