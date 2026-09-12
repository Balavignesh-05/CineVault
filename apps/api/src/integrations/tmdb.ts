import { config } from '../config/env';

const TMDB_BASE = config.tmdb.baseUrl;
const IMAGE_BASE = config.tmdb.imageBaseUrl;

interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline?: string;
  release_date?: string;
  runtime?: number;
  poster_path?: string;
  backdrop_path?: string;
  original_language?: string;
  production_countries?: { iso_3166_1: string }[];
  budget?: number;
  revenue?: number;
  vote_average?: number;
  vote_count?: number;
  imdb_id?: string;
  genres?: { id: number; name: string }[];
  credits?: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
}

interface TmdbSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline?: string;
  first_air_date?: string;
  last_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  original_language?: string;
  vote_average?: number;
  vote_count?: number;
  imdb_id?: string;
  status?: string;
  genres?: { id: number; name: string }[];
  seasons?: { id: number; season_number: number; name: string; air_date?: string; episode_count?: number; poster_path?: string; overview?: string }[];
}

interface TmdbSeason {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  air_date?: string;
  poster_path?: string;
  episodes?: TmdbEpisode[];
}

interface TmdbEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  air_date?: string;
  still_path?: string;
  runtime?: number;
}

interface TmdbCastMember {
  id: number;
  name: string;
  profile_path?: string;
  character?: string;
  order?: number;
  known_for_department?: string;
}

interface TmdbCrewMember {
  id: number;
  name: string;
  profile_path?: string;
  job: string;
  department: string;
  known_for_department?: string;
}

interface TmdbSearchResult {
  results: TmdbMovie[];
  total_results: number;
  total_pages: number;
  page: number;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', config.tmdb.apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function buildImageUrl(path: string | null | undefined, size: string = 'w500'): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function buildSlug(title: string, year: number | null, tmdbId: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return year ? `${base}-${year}-${tmdbId}` : `${base}-${tmdbId}`;
}

export async function searchMovies(query: string, page: number = 1): Promise<TmdbSearchResult> {
  return tmdbFetch<TmdbSearchResult>('/search/movie', {
    query,
    page: String(page),
    include_adult: 'false',
  });
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovie> {
  return tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, {
    append_to_response: 'credits',
  });
}

export async function getPopularMovies(page: number = 1): Promise<TmdbSearchResult> {
  return tmdbFetch<TmdbSearchResult>('/movie/popular', { page: String(page) });
}

export async function getTrendingMovies(): Promise<TmdbSearchResult> {
  return tmdbFetch<TmdbSearchResult>('/trending/movie/week');
}

export async function getMovieWatchProviders(tmdbId: number) {
  return tmdbFetch(`/movie/${tmdbId}/watch/providers`);
}

export async function getPersonDetails(tmdbId: number) {
  return tmdbFetch(`/person/${tmdbId}`, { append_to_response: 'movie_credits' });
}

export async function getSeriesDetails(tmdbId: number): Promise<TmdbSeries> {
  return tmdbFetch<TmdbSeries>(`/tv/${tmdbId}`);
}

export async function getSeasonDetails(seriesId: number, seasonNumber: number): Promise<TmdbSeason> {
  return tmdbFetch<TmdbSeason>(`/tv/${seriesId}/season/${seasonNumber}`);
}

export { TmdbMovie, TmdbSeries, TmdbSeason, TmdbEpisode, TmdbCastMember, TmdbCrewMember };
