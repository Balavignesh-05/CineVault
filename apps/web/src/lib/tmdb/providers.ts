export interface StreamingProviderInfo {
  id: number;
  name: string;
  logoPath: string | null;
  description: string;
}

export const STREAMING_PROVIDERS_MAP: Record<string, StreamingProviderInfo> = {
  '8': {
    id: 8,
    name: 'Netflix',
    logoPath: '/pbpMk2JmcoNBBKjW3iYHNdhLflE.jpg',
    description: 'Stream popular movies, TV series, documentaries, and Netflix Originals.',
  },
  '119': {
    id: 119,
    name: 'Amazon Prime Video',
    logoPath: '/dQeA35BByy3yEwLpBxvhY9u6Wv6.jpg',
    description: 'Stream exclusive Amazon Originals, hit movies, and popular TV series included with Prime Video.',
  },
  '9': {
    id: 9,
    name: 'Amazon Video',
    logoPath: '/dQeA35BByy3yEwLpBxvhY9u6Wv6.jpg',
    description: 'Rent or buy top-rated movies and television shows on Amazon Video.',
  },
  '337': {
    id: 337,
    name: 'Disney+',
    logoPath: '/97yvRBw1GzX74C140iT6fPftWio.jpg',
    description: 'The home for movies and shows from Disney, Pixar, Marvel, Star Wars, and National Geographic.',
  },
  '15': {
    id: 15,
    name: 'Hulu',
    logoPath: '/bxBlRwb4G2VBHBxppxBx47jW920.jpg',
    description: 'Stream current season episodes, original series, movies, and TV favorites on Hulu.',
  },
  '384': {
    id: 384,
    name: 'Max',
    logoPath: '/nEz6Jz7p80w3p59n1r2GzX74C14.jpg',
    description: 'Stream iconic HBO series, Max Originals, Warner Bros movies, and DC Universe content.',
  },
  '350': {
    id: 350,
    name: 'Apple TV+',
    logoPath: '/2E03x9GiVUd2BvEwLpBxvhY9u6W.jpg',
    description: 'Stream Apple Original movies, drama series, comedies, and documentaries.',
  },
  '11': {
    id: 11,
    name: 'MUBI',
    logoPath: '/qT1B4z7p80w3p59n1r2GzX74C14.jpg',
    description: 'Stream hand-picked visionary cinema, international classics, and festival gems on MUBI.',
  },
  '283': {
    id: 283,
    name: 'Crunchyroll',
    logoPath: '/mXe81GzX74C140iT6fPftWio.jpg',
    description: 'Stream the world’s largest library of anime series and movies on Crunchyroll.',
  },
  '531': {
    id: 531,
    name: 'Paramount+',
    logoPath: '/2E03x9GiVUd2BvEwLpBxvhY9u6W.jpg',
    description: 'A mountain of entertainment — stream blockbuster movies, Paramount+ Originals, and CBS shows.',
  },
  '192': {
    id: 192,
    name: 'YouTube',
    logoPath: '/vDCg81GzX74C140iT6fPftWio.jpg',
    description: 'Rent or buy top feature films and television series on YouTube Movies.',
  },
  '3': {
    id: 3,
    name: 'Google Play Movies',
    logoPath: '/tb8w81GzX74C140iT6fPftWio.jpg',
    description: 'Discover, rent, or buy movies and TV shows on Google Play.',
  },
  '238': {
    id: 238,
    name: 'Peacock',
    logoPath: '/peacock.jpg',
    description: 'Stream classic TV, NBC current hits, blockbuster movies, and Peacock Originals.',
  },
  '122': {
    id: 122,
    name: 'Disney+ Hotstar',
    logoPath: '/hotstar.jpg',
    description: 'Stream Indian movies, live sports, Hotstar Specials, and Disney+ content.',
  },
  '619': {
    id: 619,
    name: 'JioCinema',
    logoPath: '/jiocinema.jpg',
    description: 'Stream movies, HBO series, live sports, and original web shows on JioCinema.',
  },
  '237': {
    id: 237,
    name: 'Zee5',
    logoPath: '/zee5.jpg',
    description: 'Stream original web series, latest movies, and TV shows in multiple Indian languages.',
  },
  '230': {
    id: 230,
    name: 'Sony LIV',
    logoPath: '/sonyliv.jpg',
    description: 'Stream original Indian web series, live sports matches, and popular movies on Sony LIV.',
  },
};

export function getProviderInfo(providerId: string | number): StreamingProviderInfo {
  const idStr = String(providerId);
  if (STREAMING_PROVIDERS_MAP[idStr]) {
    return STREAMING_PROVIDERS_MAP[idStr];
  }
  return {
    id: Number(providerId),
    name: `Streaming Service`,
    logoPath: null,
    description: `Discover movies and series available to stream on this platform.`,
  };
}
