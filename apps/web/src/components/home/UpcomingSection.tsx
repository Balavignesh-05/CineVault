import { MediaSection } from './MediaSection';
import { MovieCardData } from '@/lib/tmdb/types';

export function UpcomingSection({ movies }: { movies: MovieCardData[] }) {
  return (
    <MediaSection
      title="Coming Soon"
      subtitle="Movies to look forward to"
      media={movies}
      viewAllHref="/films"
    />
  );
}
