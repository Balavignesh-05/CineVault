import { MediaSection } from './MediaSection';
import { MovieCardData } from '@/lib/tmdb/types';

export function NowPlayingSection({ movies }: { movies: MovieCardData[] }) {
  return (
    <MediaSection
      title="Now Playing"
      subtitle="In theaters right now"
      media={movies}
      viewAllHref="/films"
      variant="dark"
    />
  );
}
