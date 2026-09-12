// ============================================================
// CineVault — Shared TypeScript Types (Extended)
// ============================================================

// ---- Auth & Users ------------------------------------------

export type UserRole = 'guest' | 'member' | 'moderator' | 'admin';
export type WatchlistStatus = 'planned' | 'watching' | 'watched';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  profileBackdropUrl: string | null;
  isPrivate: boolean;
  isVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  profileBackdropUrl: string | null;
  isPrivate: boolean;
  isVerified: boolean;
  role: UserRole;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
    filmLogs: number;
    reviews: number;
    lists: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

// ---- Films -------------------------------------------------

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Person {
  id: string;
  tmdbId: number;
  name: string;
  slug: string;
  profileUrl: string | null;
  biography: string | null;
  birthday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
}

export interface FilmCredit {
  person: Person;
  role: 'actor' | 'director' | 'writer' | 'producer' | 'composer' | 'cinematographer' | 'editor';
  character: string | null;
  order: number | null;
}

export interface Film {
  id: string;
  tmdbId: number;
  imdbId: string | null;
  title: string;
  originalTitle: string;
  slug: string;
  releaseDate: string | null;
  releaseYear: number | null;
  runtime: number | null;
  overview: string | null;
  tagline: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  language: string | null;
  country: string | null;
  budget: number | null;
  revenue: number | null;
  avgRating: number | null;
  ratingCount: number;
  genres: Genre[];
  credits?: FilmCredit[];
}

export interface FilmSearchResult {
  id: string;
  tmdbId: number;
  title: string;
  slug: string;
  releaseYear: number | null;
  posterUrl: string | null;
  avgRating: number | null;
  ratingCount: number;
  genres: Genre[];
}

// ---- Film Logs & Ratings -----------------------------------

export interface FilmLog {
  id: string;
  userId: string;
  filmId: string;
  film?: FilmSearchResult;
  watchedDate: string | null;
  isRewatch: boolean;
  rating: number | null;
  liked: boolean;
  createdAt: string;
}

export interface CreateFilmLogRequest {
  filmId: string;
  watchedDate?: string;
  isRewatch?: boolean;
  rating?: number;
  liked?: boolean;
}

export interface UpdateFilmLogRequest {
  watchedDate?: string;
  isRewatch?: boolean;
  rating?: number;
  liked?: boolean;
}

export interface RatingDistribution {
  star: number; // 0.5 to 5.0
  count: number;
  percentage: number;
}

export interface FilmRatingStats {
  avgRating: number | null;
  ratingCount: number;
  distribution: RatingDistribution[];
  userRating: number | null;
  userLogId: string | null;
}

// ---- Reviews -----------------------------------------------

export interface Review {
  id: string;
  userId: string;
  author?: PublicUser;
  filmId: string;
  film?: FilmSearchResult;
  logId: string | null;
  title?: string | null;
  body: string;
  containsSpoilers: boolean;
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  readingTimeMinutes?: number;
  helpfulCount?: number;
  isLikedByMe?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  filmId: string;
  title?: string;
  body: string;
  containsSpoilers?: boolean;
  logId?: string;
  isDraft?: boolean;
}

export interface UpdateReviewRequest {
  title?: string;
  body?: string;
  containsSpoilers?: boolean;
  isPublished?: boolean;
}

// ---- Comments ----------------------------------------------

export interface ReviewComment {
  id: string;
  reviewId: string;
  userId: string;
  parentId: string | null;
  author?: PublicUser;
  body: string;
  likeCount: number;
  isLikedByMe?: boolean;
  replies?: ReviewComment[];
  createdAt: string;
}

export interface CreateCommentRequest {
  reviewId: string;
  body: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  body: string;
}

// ---- Watchlist ---------------------------------------------

export interface WatchlistItem {
  id: string;
  userId: string;
  filmId: string;
  status: WatchlistStatus;
  film?: FilmSearchResult;
  addedAt: string;
}

export interface UpdateWatchlistStatusRequest {
  status: WatchlistStatus;
}

// ---- Collections (Lists) -----------------------------------

export interface Collection {
  id: string;
  userId: string;
  author?: PublicUser;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  isRanked: boolean;
  isPublished: boolean;
  likeCount: number;
  filmCount: number;
  films?: CollectionFilm[];
  isLikedByMe?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionFilm {
  filmId: string;
  film: FilmSearchResult;
  position: number;
  note: string | null;
}

export interface CreateCollectionRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  isRanked?: boolean;
}

export interface UpdateCollectionRequest {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  isRanked?: boolean;
  isPublished?: boolean;
}

// ---- Activity Feed -----------------------------------------

export type ActivityEventType =
  | 'rated_film'
  | 'reviewed_film'
  | 'liked_film'
  | 'added_to_watchlist'
  | 'watched_film'
  | 'followed_user'
  | 'created_collection'
  | 'liked_review'
  | 'commented_review';

export interface ActivityEvent {
  id: string;
  userId: string;
  actor?: PublicUser;
  type: ActivityEventType;
  filmId?: string;
  film?: FilmSearchResult;
  reviewId?: string;
  collectionId?: string;
  targetUserId?: string;
  targetUser?: PublicUser;
  rating?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---- Notifications -----------------------------------------

export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'reply'
  | 'collection_like'
  | 'review_like'
  | 'achievement_unlocked'
  | 'recommendation_updated'
  | 'milestone_reached';

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  actor?: PublicUser;
  type: NotificationType;
  entityType: string;
  entityId: string;
  message?: string;
  readAt: string | null;
  createdAt: string;
}

// ---- Achievements ------------------------------------------

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  tier: AchievementTier;
  iconName: string;
  requirement: number;
  category: string;
  isAnimated: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  progress: number;
  unlockedAt: string | null;
  createdAt: string;
}

// ---- Recommendations ---------------------------------------

export interface Recommendation {
  id: string;
  userId: string;
  tmdbId: number;
  score: number;
  reason: string;
  category: RecommendationCategory;
  isViewed: boolean;
  expiresAt: string;
  createdAt: string;
  // Populated client-side from TMDB
  movie?: {
    id: number;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseYear: number | null;
    voteAverage: number;
    overview: string;
    genreIds: number[];
  };
}

export type RecommendationCategory =
  | 'because_you_watched'
  | 'similar_taste'
  | 'trending_for_you'
  | 'hidden_gems'
  | 'new_releases_for_you'
  | 'critically_acclaimed'
  | 'underrated'
  | 'based_on_genres'
  | 'continue_watching';

export interface RecommendationSection {
  category: RecommendationCategory;
  title: string;
  subtitle: string;
  recommendations: Recommendation[];
}

// ---- Dashboard Statistics ----------------------------------

export interface UserStats {
  moviesWatched: number;
  hoursWatched: number;
  avgRatingGiven: number | null;
  reviewsWritten: number;
  collectionsCreated: number;
  watchlistCount: number;
  followersCount: number;
  followingCount: number;
  achievementsEarned: number;
  favoriteGenre: Genre | null;
  favoriteActor: Person | null;
  favoriteDirector: Person | null;
}

export interface RatingsDistributionPoint {
  rating: string;
  count: number;
}

export interface MonthlyActivityPoint {
  month: string;
  watched: number;
  reviews: number;
}

export interface GenreWatchedPoint {
  genre: string;
  count: number;
  percentage: number;
}

export interface DecadeWatchedPoint {
  decade: string;
  count: number;
}

export interface LanguageWatchedPoint {
  language: string;
  count: number;
}

export interface TopDirectorPoint {
  name: string;
  count: number;
  avgRating: number;
}

export interface TopActorPoint {
  name: string;
  count: number;
}

export interface UserDashboardData {
  stats: UserStats;
  recentActivity: ActivityEvent[];
  recentRatings: FilmLog[];
  recentReviews: Review[];
  collections: Collection[];
  achievements: UserAchievement[];
  monthlyActivity: MonthlyActivityPoint[];
  ratingsDistribution: RatingsDistributionPoint[];
  genresWatched: GenreWatchedPoint[];
  decadesWatched: DecadeWatchedPoint[];
  topDirectors: TopDirectorPoint[];
}

// ---- API Response Envelope ---------------------------------

export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ---- Pagination --------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ---- FilmList (legacy alias for Collection) ----------------

export type FilmList = Collection;
export type ListFilm = CollectionFilm;

// ---- Reports & Moderation ----------------------------------

export type ReportEntityType = 'movie' | 'review' | 'comment' | 'collection' | 'profile';
export type ReportReason = 'spam' | 'harassment' | 'hate_speech' | 'nsfw' | 'fake_info' | 'other';
export type ReportStatus = 'pending' | 'approved' | 'dismissed' | 'warned' | 'suspended' | 'deleted';

export interface Report {
  id: string;
  reporterId: string;
  reporter?: PublicUser;
  entityType: ReportEntityType;
  entityId: string;
  reviewId?: string | null;
  review?: Review | null;
  reason: ReportReason | string;
  status: ReportStatus;
  resolvedBy?: string | null;
  createdAt: string;
}

export interface CreateReportRequest {
  entityType: ReportEntityType;
  entityId: string;
  reason: ReportReason | string;
  reviewId?: string;
}

// ---- Admin & Analytics -------------------------------------

export interface AdminStats {
  totalUsers: number;
  totalReviews: number;
  totalFilmsLogged: number;
  totalCollections: number;
  totalReportsPending: number;
  activeUsers24h: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string | null;
  createdAt: string;
}

// ---- User Settings -----------------------------------------

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  privacy: {
    isPrivate: boolean;
    allowDirectMessages: boolean;
    showWatchHistory: boolean;
  };
  notifications: {
    emailLikes: boolean;
    emailComments: boolean;
    emailFollows: boolean;
    emailRecommendations: boolean;
    pushNotifications: boolean;
  };
}

