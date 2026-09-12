// ============================================================
// TMDB API — TypeScript Types
// ============================================================

// ── Core Movie Types ──────────────────────────────────────────

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  genres?: TMDBGenre[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  original_language: string;
  video: boolean;
  runtime?: number | null;
  budget?: number;
  revenue?: number;
  tagline?: string | null;
  status?: string;
  homepage?: string | null;
  imdb_id?: string | null;
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  spoken_languages?: TMDBSpokenLanguage[];
  belongs_to_collection?: TMDBCollection | null;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: TMDBGenre[];
  runtime: number | null;
  budget: number;
  revenue: number;
  tagline: string | null;
  status: string;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
  belongs_to_collection: TMDBCollection | null;
  credits?: TMDBCredits;
  videos?: TMDBVideosResult;
  images?: TMDBImagesResult;
  similar?: TMDBPaginatedResult<TMDBMovie>;
  recommendations?: TMDBPaginatedResult<TMDBMovie>;
  release_dates?: TMDBReleaseDatesResult;
}

// ── Genre ─────────────────────────────────────────────────────

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreResult {
  genres: TMDBGenre[];
}

// ── Credits ───────────────────────────────────────────────────

export interface TMDBCastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
  credit_id: string;
  known_for_department: string;
  popularity: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  original_name: string;
  department: string;
  job: string;
  profile_path: string | null;
  credit_id: string;
  known_for_department: string;
  popularity: number;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

// ── Videos ────────────────────────────────────────────────────

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers';
  official: boolean;
  published_at: string;
  size: number;
}

export interface TMDBVideosResult {
  results: TMDBVideo[];
}

// ── Images ────────────────────────────────────────────────────

export interface TMDBImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null;
}

export interface TMDBImagesResult {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
  logos: TMDBImage[];
}

// ── Production ────────────────────────────────────────────────

export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface TMDBCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

// ── Release Dates ─────────────────────────────────────────────

export interface TMDBReleaseDate {
  certification: string;
  release_date: string;
  type: number;
}

export interface TMDBReleaseDateCountry {
  iso_3166_1: string;
  release_dates: TMDBReleaseDate[];
}

export interface TMDBReleaseDatesResult {
  results: TMDBReleaseDateCountry[];
}

// ── Person ────────────────────────────────────────────────────

export interface TMDBPerson {
  id: number;
  name: string;
  gender?: number;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  imdb_id: string;
  homepage: string | null;
  combined_credits?: TMDBPersonCombinedCredits;
  external_ids?: Record<string, string | null>;
  images?: { profiles: TMDBImage[] };
  tagged_images?: { results: TMDBImage[] };
}

export interface TMDBPersonCombinedCredits {
  cast: (TMDBMovie | TMDBTvSeries)[];
  crew: (TMDBMovie | TMDBTvSeries)[];
}

// ── Search ────────────────────────────────────────────────────

export interface TMDBSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity: number;
  genre_ids?: number[];
  known_for_department?: string;
}

export interface TMDBMovieSearchResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  original_language: string;
  video: boolean;
}

// ── Pagination ────────────────────────────────────────────────

export interface TMDBPaginatedResult<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

// ── Query Params ──────────────────────────────────────────────

export type TMDBTimeWindow = 'day' | 'week';

export type TMDBMovieCategory =
  | 'trending'
  | 'popular'
  | 'top_rated'
  | 'upcoming'
  | 'now_playing';

export interface TMDBSearchParams {
  query: string;
  page?: number;
  include_adult?: boolean;
  language?: string;
  primary_release_year?: number;
  year?: number;
  region?: string;
}

export interface TMDBDiscoverParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'vote_count.gte'?: number;
  'vote_count.lte'?: number;
  with_original_language?: string;
  'with_runtime.gte'?: number;
  'with_runtime.lte'?: number;
  with_keywords?: string;
  with_companies?: string;
  with_cast?: string;
  with_crew?: string;
  with_origin_country?: string;
  with_watch_providers?: string;
  watch_region?: string;
}

// ── App-level helpers (normalized from TMDB) ──────────────────

export interface MovieCardData {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: number | null;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  overview: string;
  popularity: number;
  originalLanguage: string;
  runtime?: number | null;
  mediaType?: string;
}

export interface PersonCardData {
  id: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string;
  popularity: number;
  mediaType?: string;
}

export interface PersonDetailsData {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownForDepartment: string;
  popularity: number;
  imdbId: string | null;
  externalIds?: Record<string, string | null>;
  images?: { profiles: TMDBImage[] };
  taggedImages?: { results: TMDBImage[] };
  combinedCredits: {
    cast: (MovieCardData | SeriesCardData)[];
    crew: (MovieCardData | SeriesCardData)[];
  };
}

export interface MovieDetailsData {
  id: number;
  title: string;
  originalTitle: string;
  tagline: string | null;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  runtime: number | null;
  budget: number;
  revenue: number;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  status: string;
  originalLanguage: string;
  genres: TMDBGenre[];
  productionCompanies: TMDBProductionCompany[];
  productionCountries: TMDBProductionCountry[];
  spokenLanguages: TMDBSpokenLanguage[];
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
  director: TMDBCrewMember | null;
  writers: TMDBCrewMember[];
  trailer: TMDBVideo | null;
  images: TMDBImagesResult;
  similar: TMDBMovie[];
  recommendations: TMDBMovie[];
  certification: string | null;
  imdbId: string | null;
  videos: TMDBVideo[];
  belongsToCollection: TMDBCollection | null;
}

// -- Core TV Series Types ----------------------------------------

export interface TMDBTvSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
}

export interface TMDBTvDetails extends TMDBTvSeries {
  genres: TMDBGenre[];
  tagline: string | null;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  networks: TMDBProductionCompany[];
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
  credits?: TMDBCredits;
  videos?: TMDBVideosResult;
  images?: TMDBImagesResult;
  similar?: TMDBPaginatedResult<TMDBTvSeries>;
  recommendations?: TMDBPaginatedResult<TMDBTvSeries>;
  seasons?: TMDBTvSeasonBase[];
  last_air_date?: string;
}

export interface TMDBTvSeasonBase {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TMDBTvEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string | null;
  episode_number: number;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
}

export interface TMDBTvSeason extends TMDBTvSeasonBase {
  _id: string;
  episodes: TMDBTvEpisode[];
  videos?: TMDBVideosResult;
  images?: TMDBImagesResult;
}

export interface SeriesCardData {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: number | null;
  yearRange: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  overview: string;
  popularity: number;
  originalLanguage: string;
  seasons?: number;
  episodes?: number;
  network?: string;
  mediaType?: string;
}

export interface SeriesDetailsData {
  id: number;
  title: string;
  originalTitle: string;
  tagline: string | null;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string | null;
  lastAirDate: string | null;
  status: string;
  genres: TMDBGenre[];
  voteAverage: number;
  voteCount: number;
  popularity: number;
  originalLanguage: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
  trailer: TMDBVideo | null;
  images: TMDBImagesResult;
  similar: TMDBTvSeries[];
  recommendations: TMDBTvSeries[];
  productionCompanies: TMDBProductionCompany[];
  networks: TMDBProductionCompany[];
  videos: TMDBVideo[];
  seasons: TMDBTvSeasonBase[];
}
