export const queryKeys = {
  tmdb: {
    trending: (timeWindow: 'day' | 'week' = 'week', page = 1) => ['tmdb', 'trending', timeWindow, page] as const,
    popular: (page = 1) => ['tmdb', 'popular', page] as const,
    topRated: (page = 1) => ['tmdb', 'top_rated', page] as const,
    upcoming: (page = 1) => ['tmdb', 'upcoming', page] as const,
    nowPlaying: (page = 1) => ['tmdb', 'now_playing', page] as const,
    movie: (id: number) => ['tmdb', 'movie', id] as const,
    genres: () => ['tmdb', 'genres'] as const,
    search: (query: string, page = 1, filters?: Record<string, unknown>) => ['tmdb', 'search', query, page, filters] as const,
    discover: (params: Record<string, unknown>) => ['tmdb', 'discover', params] as const,
  },
  auth: {
    user: () => ['auth', 'me'] as const,
  },
  profile: {
    byUsername: (username: string) => ['profile', username] as const,
  },
  watchlist: {
    mine: () => ['watchlist', 'mine'] as const,
  },
} as const;

export const socialQueryKeys = {
  ratings: {
    film: (tmdbId: number) => ['ratings', 'film', tmdbId] as const,
  },
  reviews: {
    film: (filmId: string, page?: number) => ['reviews', 'film', filmId, page] as const,
    single: (reviewId: string) => ['reviews', reviewId] as const,
    mine: (page?: number) => ['reviews', 'mine', page] as const,
  },
  comments: {
    review: (reviewId: string, page?: number) => ['comments', reviewId, page] as const,
  },
  watchlist: {
    list: (params?: object) => ['watchlist', params] as const,
    status: (tmdbId: number) => ['watchlist', 'status', tmdbId] as const,
  },
  collections: {
    mine: (page?: number) => ['collections', 'mine', page] as const,
    user: (userId: string, page?: number) => ['collections', 'user', userId, page] as const,
    single: (id: string) => ['collections', id] as const,
  },
  activity: {
    user: (userId: string, page?: number) => ['activity', userId, page] as const,
    feed: (page?: number) => ['activity', 'feed', page] as const,
  },
  notifications: {
    list: (page?: number) => ['notifications', page] as const,
    count: () => ['notifications', 'count'] as const,
  },
  achievements: {
    all: () => ['achievements'] as const,
    mine: () => ['achievements', 'mine'] as const,
  },
  recommendations: {
    mine: () => ['recommendations', 'mine'] as const,
  },
  dashboard: {
    mine: () => ['dashboard', 'mine'] as const,
    stats: (username: string) => ['stats', username] as const,
  },
  discovery: {
    genre: (genreId: number, page?: number) => ['discovery', 'genre', genreId, page] as const,
    decade: (decade: number, page?: number) => ['discovery', 'decade', decade, page] as const,
    oscar: (page?: number) => ['discovery', 'oscar', page] as const,
    awards: (page?: number) => ['discovery', 'awards', page] as const,
  },
};
