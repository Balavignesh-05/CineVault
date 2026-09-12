// ============================================================
// TMDB API Client — Server-side only (never expose API key to browser)
// ============================================================

import type {
  TMDBMovie,
  TMDBMovieDetails,
  TMDBGenreResult,
  TMDBCredits,
  TMDBVideosResult,
  TMDBImagesResult,
  TMDBPaginatedResult,
  TMDBSearchParams,
  TMDBDiscoverParams,
  TMDBTimeWindow,
  MovieCardData,
  MovieDetailsData,
  TMDBCrewMember,
  TMDBVideo,
  TMDBTvSeries,
  TMDBTvDetails,
  TMDBTvSeason,
  TMDBTvSeasonBase,
  TMDBTvEpisode,
  SeriesCardData,
  SeriesDetailsData,
  TMDBPerson,
  PersonCardData,
  PersonDetailsData,
} from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Image size helpers
export const posterSize = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original',
} as const;

export const backdropSize = {
  small: 'w300',
  medium: 'w780',
  large: 'w1280',
  original: 'original',
} as const;

export const profileSize = {
  small: 'w45',
  medium: 'w185',
  large: 'h632',
  original: 'original',
} as const;

export function getPosterUrl(
  path: string | null,
  size: keyof typeof posterSize = 'large',
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${posterSize[size]}${path}`;
}

export function getBackdropUrl(
  path: string | null,
  size: keyof typeof backdropSize = 'large',
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${backdropSize[size]}${path}`;
}

export function getProfileUrl(
  path: string | null,
  size: keyof typeof profileSize = 'medium',
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${profileSize[size]}${path}`;
}

export function getLogoUrl(path: string | null): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/w500${path}`;
}

function getApiKey(): string {
  return process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || 'demo_key';
}

// ── Core Fetch ────────────────────────────────────────────────

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
  revalidate: number = 3600,
  retries = 3,
  externalSignal?: AbortSignal
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'en-US');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const abortHandler = () => controller.abort();
      if (externalSignal) {
        externalSignal.addEventListener('abort', abortHandler);
        if (externalSignal.aborted) controller.abort();
      }
      
      const response = await fetch(url.toString(), {
        next: { revalidate },
        headers: { 
          Accept: 'application/json',
          'User-Agent': 'CineVault/1.0 (Next.js Node Fetch)'
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      if (externalSignal) externalSignal.removeEventListener('abort', abortHandler);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        // Don't retry 4xx errors
        if (response.status >= 400 && response.status < 500) {
          throw new TMDBError(
            `TMDB API error: ${response.status} ${response.statusText}`,
            response.status,
            errorBody,
          );
        }
        throw new TMDBError(
          `TMDB API error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody,
        );
      }

      return response.json() as Promise<T>;
    } catch (err: any) {
      lastError = err;
      if (err instanceof TMDBError && err.status >= 400 && err.status < 500) {
        throw err; // No retry for 404, 401 etc.
      }
      if (attempt < retries - 1) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('TMDB fetch failed for unknown reasons');
}

// ── Error Class ───────────────────────────────────────────────

export class TMDBError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: string = '',
  ) {
    super(message);
    this.name = 'TMDBError';
  }
}

// ── Normalizers ───────────────────────────────────────────────

export function normalizeMovieCard(movie: TMDBMovie): MovieCardData {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseYear,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    genreIds: movie.genre_ids ?? movie.genres?.map((g) => g.id) ?? [],
    overview: movie.overview,
    popularity: movie.popularity,
    originalLanguage: movie.original_language,
    runtime: movie.runtime ?? 0,
  };
}

export function normalizeMovieDetails(
  movie: TMDBMovieDetails,
): MovieDetailsData {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const credits = movie.credits ?? { cast: [], crew: [] };

  const director =
    credits.crew.find(
      (c) => c.job === 'Director',
    ) ?? null;

  const writers = credits.crew.filter((c) =>
    ['Writer', 'Screenplay', 'Story', 'Author'].includes(c.job),
  );

  const trailer =
    movie.videos?.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official,
    ) ??
    movie.videos?.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube',
    ) ??
    movie.videos?.results.find(
      (v) => v.site === 'YouTube',
    ) ??
    null;

  // Get US certification
  const usRelease = movie.release_dates?.results.find(
    (r) => r.iso_3166_1 === 'US',
  );
  const certification =
    usRelease?.release_dates.find((d) => d.certification)?.certification ??
    null;

  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    tagline: movie.tagline ?? null,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date || null,
    releaseYear,
    runtime: movie.runtime ?? null,
    budget: movie.budget ?? 0,
    revenue: movie.revenue ?? 0,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    status: movie.status ?? 'Unknown',
    originalLanguage: movie.original_language,
    genres: movie.genres ?? [],
    productionCompanies: movie.production_companies ?? [],
    productionCountries: movie.production_countries ?? [],
    spokenLanguages: movie.spoken_languages ?? [],
    cast: credits.cast.slice(0, 20),
    crew: credits.crew,
    director,
    writers,
    trailer,
    images: movie.images ?? { backdrops: [], posters: [], logos: [] },
    similar: movie.similar?.results ?? [],
    recommendations: movie.recommendations?.results ?? [],
    certification,
    imdbId: movie.imdb_id ?? null,
    videos: movie.videos?.results ?? [],
    belongsToCollection: movie.belongs_to_collection ?? null,
  };
}

export function normalizeSeriesCard(series: TMDBTvSeries): SeriesCardData {
  const releaseYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : null;
  return {
    id: series.id,
    title: series.name,
    posterPath: series.poster_path,
    backdropPath: series.backdrop_path,
    releaseYear,
    yearRange: releaseYear ? `${releaseYear}-Present` : 'Unknown',
    voteAverage: series.vote_average,
    voteCount: series.vote_count,
    genreIds: series.genre_ids ?? [],
    overview: series.overview,
    popularity: series.popularity,
    originalLanguage: series.original_language,
  };
}

export function normalizePersonCard(person: TMDBPerson): PersonCardData {
  return {
    id: person.id,
    name: person.name,
    profilePath: person.profile_path,
    knownForDepartment: person.known_for_department,
    popularity: person.popularity,
    mediaType: 'person',
  };
}

// ── Trending ──────────────────────────────────────────────────

export async function getTrending(
  timeWindow: TMDBTimeWindow = 'week',
  page = 1,
): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>(
    `/trending/movie/${timeWindow}`,
    { page },
    1800, // 30-minute cache for trending
  );
}

// ── Popular / Top Rated / Upcoming / Now Playing ──────────────

export async function getPopular(page = 1): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>('/movie/popular', { page });
}

export async function getTopRated(page = 1): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>('/movie/top_rated', { page });
}

export async function getUpcoming(): Promise<TMDBPaginatedResult<TMDBMovie>> {
  const [page1, page2] = await Promise.all([
    tmdbFetch<TMDBPaginatedResult<TMDBMovie>>('/movie/upcoming', { page: 1 }),
    tmdbFetch<TMDBPaginatedResult<TMDBMovie>>('/movie/upcoming', { page: 2 })
  ]);
  
  return {
    page: 1,
    results: [...(page1.results || []), ...(page2.results || [])],
    total_pages: page1.total_pages,
    total_results: page1.total_results
  };
}

export async function getNowPlaying(page = 1): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>('/movie/now_playing', { page });
}

// ── Movie Details ─────────────────────────────────────────────

export async function getMovieDetails(
  movieId: number,
): Promise<TMDBMovieDetails> {
  try {
    return await tmdbFetch<TMDBMovieDetails>(
      `/movie/${movieId}`,
      {
        append_to_response: 'credits,videos,images,keywords,release_dates,recommendations,similar,watch/providers,external_ids,belongs_to_collection',
        include_image_language: 'en,null',
      },
      86400,
    );
  } catch (err) {
    return tmdbFetch<TMDBMovieDetails>(
      `/movie/${movieId}`,
      {
        append_to_response: 'credits,videos,images,watch/providers',
      },
      86400,
    );
  }
}

export async function getMovieCredits(movieId: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/movie/${movieId}/credits`, {}, 86400);
}

export async function getMovieVideos(movieId: number): Promise<TMDBVideosResult> {
  return tmdbFetch<TMDBVideosResult>(`/movie/${movieId}/videos`, {}, 86400);
}

export async function getMovieImages(movieId: number): Promise<TMDBImagesResult> {
  return tmdbFetch<TMDBImagesResult>(
    `/movie/${movieId}/images`,
    { include_image_language: 'en,null' },
    86400,
  );
}

export async function getSimilarMovies(
  movieId: number,
  page = 1,
): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>(
    `/movie/${movieId}/similar`,
    { page },
    3600,
  );
}

export async function getMovieRecommendations(
  movieId: number,
  page = 1,
): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>(
    `/movie/${movieId}/recommendations`,
    { page },
    3600,
  );
}

// ── Genres ────────────────────────────────────────────────────

export async function getGenres(): Promise<TMDBGenreResult> {
  return tmdbFetch<TMDBGenreResult>('/genre/movie/list', {}, 86400 * 7); // 7-day cache
}

// ── Search ────────────────────────────────────────────────────

export async function searchMovies(
  params: TMDBSearchParams,
): Promise<TMDBPaginatedResult<TMDBMovie>> {
  const { query, page = 1, include_adult = false, ...rest } = params;
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>(
    '/search/movie',
    { query, page, include_adult, ...rest },
    0, // No cache for search results
  );
}

// ── Discover ──────────────────────────────────────────────────

export async function discoverMovies(
  params: TMDBDiscoverParams = {},
): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>(
    '/discover/movie',
    params as Record<string, string | number | boolean>,
    3600,
  );
}

// ── Multi-search (movies + people + tv) ───────────────────────

export async function searchMulti(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<TMDBPaginatedResult<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBMovie>>(
    '/search/multi',
    { query, page, include_adult: false },
    0,
    3,
    signal
  );
}

// ── TV Series ──────────────────────────────────────────────────

export async function getTrendingTv(
  timeWindow: TMDBTimeWindow = 'week',
  page = 1,
): Promise<TMDBPaginatedResult<TMDBTvSeries>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBTvSeries>>(
    `/trending/tv/${timeWindow}`,
    { page },
    1800, // 30-minute cache for trending
  );
}

export async function discoverTv(
  params: TMDBDiscoverParams = {},
): Promise<TMDBPaginatedResult<TMDBTvSeries>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBTvSeries>>(
    '/discover/tv',
    params as Record<string, string | number | boolean>,
    3600,
  );
}

export async function getTvTopRated(page = 1): Promise<TMDBPaginatedResult<TMDBTvSeries>> {
  return tmdbFetch<TMDBPaginatedResult<TMDBTvSeries>>('/tv/top_rated', { page });
}

export async function getTvDetails(
  seriesId: number,
): Promise<TMDBTvDetails> {
  try {
    return await tmdbFetch<TMDBTvDetails>(
      `/tv/${seriesId}`,
      {
        append_to_response: 'credits,videos,images,similar,recommendations,watch/providers',
        include_image_language: 'en,null',
      },
      86400,
    );
  } catch (err) {
    return tmdbFetch<TMDBTvDetails>(
      `/tv/${seriesId}`,
      {
        append_to_response: 'credits,videos,images,watch/providers',
      },
      86400,
    );
  }
}

export async function getTvSeasonDetails(
  seriesId: number,
  seasonNumber: number,
): Promise<TMDBTvSeason> {
  return tmdbFetch<TMDBTvSeason>(
    `/tv/${seriesId}/season/${seasonNumber}`,
    {
      append_to_response: 'videos,images',
    },
    86400,
  );
}

export function normalizeSeriesDetails(series: TMDBTvDetails): SeriesDetailsData {
  const credits = series.credits ?? { cast: [], crew: [] };

  const trailer =
    series.videos?.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official,
    ) ??
    series.videos?.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube',
    ) ??
    series.videos?.results.find(
      (v) => v.site === 'YouTube',
    ) ??
    null;

  return {
    id: series.id,
    title: series.name,
    originalTitle: series.original_name,
    tagline: series.tagline ?? null,
    overview: series.overview,
    posterPath: series.poster_path,
    backdropPath: series.backdrop_path,
    firstAirDate: series.first_air_date || null,
    lastAirDate: series.last_air_date || null,
    status: series.status ?? 'Unknown',
    genres: series.genres ?? [],
    voteAverage: series.vote_average,
    voteCount: series.vote_count,
    popularity: series.popularity,
    originalLanguage: series.original_language,
    numberOfSeasons: series.number_of_seasons,
    numberOfEpisodes: series.number_of_episodes,
    cast: credits.cast.slice(0, 20),
    crew: credits.crew,
    trailer,
    images: series.images ?? { backdrops: [], posters: [], logos: [] },
    similar: series.similar?.results ?? [],
    recommendations: series.recommendations?.results ?? [],
    productionCompanies: series.production_companies ?? [],
    networks: series.networks ?? [],
    videos: series.videos?.results ?? [],
    seasons: series.seasons ?? [],
  };
}

// ── Person ────────────────────────────────────────────────────

export async function getPersonDetails(
  personId: number,
): Promise<TMDBPerson> {
  try {
    return await tmdbFetch<TMDBPerson>(
      `/person/${personId}`,
      {
        append_to_response: 'external_ids,images,combined_credits,tagged_images',
      },
      86400,
    );
  } catch (err) {
    return tmdbFetch<TMDBPerson>(
      `/person/${personId}`,
      {
        append_to_response: 'combined_credits',
      },
      86400,
    );
  }
}

export function normalizePersonDetails(person: TMDBPerson): PersonDetailsData {
  const credits = person.combined_credits || { cast: [], crew: [] };
  
  const mapCredit = (credit: any) => {
    // Media type can be movie or tv
    if (credit.media_type === 'movie' || credit.title) {
      return normalizeMovieCard(credit as any);
    } else {
      return normalizeSeriesCard(credit as any);
    }
  };

  return {
    id: person.id,
    name: person.name,
    biography: person.biography,
    birthday: person.birthday,
    deathday: person.deathday,
    placeOfBirth: person.place_of_birth,
    profilePath: person.profile_path,
    knownForDepartment: person.known_for_department,
    popularity: person.popularity,
    imdbId: person.imdb_id,
    externalIds: person.external_ids,
    images: person.images,
    taggedImages: person.tagged_images,
    combinedCredits: {
      cast: credits.cast.map(mapCredit),
      crew: credits.crew.map(mapCredit),
    }
  };
}

export interface TMDBWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TMDBWatchProviderCountry {
  link: string;
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
}

export interface TMDBWatchProvidersResult {
  id: number;
  results: Record<string, TMDBWatchProviderCountry>;
}

export async function getMovieWatchProviders(movieId: number): Promise<TMDBWatchProvidersResult> {
  return tmdbFetch<TMDBWatchProvidersResult>(
    `/movie/${movieId}/watch/providers`,
    {},
    86400, // 24-hour cache
  );
}

export async function getMovieKeywords(movieId: number): Promise<{ id: number; keywords: Array<{ id: number; name: string }> }> {
  return tmdbFetch<{ id: number; keywords: Array<{ id: number; name: string }> }>(
    `/movie/${movieId}/keywords`,
    {},
    86400 * 7,
  );
}

export interface TMDBProviderDetails {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export async function getWatchProvidersList(watchRegion = 'US'): Promise<TMDBProviderDetails[]> {
  const res = await tmdbFetch<{ results: TMDBProviderDetails[] }>(
    '/watch/providers/movie',
    { watch_region: watchRegion },
    86400 * 7,
  ).catch(() => ({ results: [] }));
  return res.results || [];
}

export async function getProviderDetailsById(
  providerId: number | string,
  watchRegion = 'US',
): Promise<TMDBProviderDetails | null> {
  const idNum = Number(providerId);
  const providers = await getWatchProvidersList(watchRegion);
  const match = providers.find((p) => p.provider_id === idNum);
  if (match) return match;

  const globalProviders = await tmdbFetch<{ results: TMDBProviderDetails[] }>(
    '/watch/providers/movie',
    {},
    86400 * 7,
  ).catch(() => ({ results: [] }));
  return globalProviders.results?.find((p) => p.provider_id === idNum) || null;
}
