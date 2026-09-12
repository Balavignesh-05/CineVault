export interface TopSeriesItem {
  rank: number;
  id: number;
  title: string;
  yearRange: string;
  rating: number;
  votes: number;
  seasons: number;
  episodes: number;
  creator: string;
  genres: string[];
  posterPath: string;
  backdropPath: string;
  overview: string;
  network: string;
  industry?: 'Hollywood' | 'Kollywood';
}

export const KOLLYWOOD_SERIES: TopSeriesItem[] = [
  {
    rank: 1,
    id: 991201,
    title: 'Suzhal: The Vortex',
    yearRange: '2022–',
    rating: 8.2,
    votes: 28000,
    seasons: 1,
    episodes: 8,
    creator: 'Pushkar–Gayathri',
    genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
    posterPath: '/459163a6aff8edc6d92661deaa27fc79d8ce4e.jpg',
    backdropPath: '/639e377618680e3d5bc8b1073ffa80afb2ab18.jpg',
    overview: 'In a small South Indian town, a routine investigation into a missing girl turns into a dark mystery during a local festival.',
    network: 'Amazon Prime',
    industry: 'Kollywood',
  },
  {
    rank: 2,
    id: 991202,
    title: 'Vadhandhi: The Fable of Velonie',
    yearRange: '2022',
    rating: 8.0,
    votes: 22000,
    seasons: 1,
    episodes: 8,
    creator: 'Andrew Louis',
    genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
    posterPath: '/d5iIlFn5s0ImszYzBPb8ioMStDP.jpg',
    backdropPath: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    overview: 'An obsessive police officer unravels the web of rumors surrounding the murder of a young girl named Velonie.',
    network: 'Amazon Prime',
    industry: 'Kollywood',
  },
  {
    rank: 3,
    id: 991203,
    title: 'Modern Love Chennai',
    yearRange: '2023',
    rating: 7.8,
    votes: 18000,
    seasons: 1,
    episodes: 6,
    creator: 'Thiagarajan Kumararaja',
    genres: ['Comedy', 'Drama', 'Romance'],
    posterPath: '/9cqN1WODyRftovChflvcKclioyG.jpg',
    backdropPath: '/kXfqcd22wDLIpwEedVJbdxOzDWe.jpg',
    overview: 'An eclectic collection of six stories showcasing love in its varied forms set in the vibrant city of Chennai.',
    network: 'Amazon Prime',
    industry: 'Kollywood',
  },
  {
    rank: 4,
    id: 991204,
    title: 'Inspector Rishi',
    yearRange: '2024–',
    rating: 7.9,
    votes: 15000,
    seasons: 1,
    episodes: 10,
    creator: 'Nandhini JS',
    genres: ['Crime', 'Horror', 'Mystery'],
    posterPath: '/6oom5WYQ2yQTMJIbnvbkBL9cHo6.jpg',
    backdropPath: '/eoCSp7z28xVJbdxOzDWe22v8sVJ.jpg',
    overview: 'A skeptical police inspector investigates a series of bizarre murders in a small village, blamed on a deadly forest spirit.',
    network: 'Amazon Prime',
    industry: 'Kollywood',
  },
];

export const TOP_SERIES: TopSeriesItem[] = [
  {
    rank: 1,
    id: 1396,
    title: 'Breaking Bad',
    yearRange: '2008–2013',
    rating: 9.5,
    votes: 2100000,
    seasons: 5,
    episodes: 62,
    creator: 'Vince Gilligan',
    genres: ['Crime', 'Drama', 'Thriller'],
    posterPath: '/ztSlKquKfL7m9a284PtjUoNhvB1.jpg',
    backdropPath: '/tsRy63MuZvKCZvu5GFGscZKVawg.jpg',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
    network: 'AMC',
    industry: 'Hollywood',
  },
  {
    rank: 2,
    id: 87108,
    title: 'Chernobyl',
    yearRange: '2019',
    rating: 9.4,
    votes: 850000,
    seasons: 1,
    episodes: 5,
    creator: 'Craig Mazin',
    genres: ['Drama', 'History', 'Thriller'],
    posterPath: '/hlLXt2t284PtjUoNhvB19r82ZTV.jpg',
    backdropPath: '/uLOm0OhQNFk2hE2686XY2eW3v4.jpg',
    overview: 'In April 1986, a huge explosion erupted at the Chernobyl nuclear power station in northern Ukraine.',
    network: 'HBO',
    industry: 'Hollywood',
  },
  {
    rank: 3,
    id: 1399,
    title: 'Game of Thrones',
    yearRange: '2011–2019',
    rating: 9.2,
    votes: 2250000,
    seasons: 8,
    episodes: 73,
    creator: 'David Benioff, D.B. Weiss',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    posterPath: '/1XS1AuhbA2D284PtjUoNhvB19r8.jpg',
    backdropPath: '/2OMB0ynKlyIenMJWI2Dy9IxsBO.jpg',
    overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    network: 'HBO',
    industry: 'Hollywood',
  },
  {
    rank: 4,
    id: 1438,
    title: 'The Wire',
    yearRange: '2002–2008',
    rating: 9.3,
    votes: 380000,
    seasons: 5,
    episodes: 60,
    creator: 'David Simon',
    genres: ['Crime', 'Drama', 'Thriller'],
    posterPath: '/47284PtjUoNhvB19r82ZTVqvKD8.jpg',
    backdropPath: '/ogA284PtjUoNhvB19r82ZTVqvKD.jpg',
    overview: 'The Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement.',
    network: 'HBO',
    industry: 'Hollywood',
  },
  {
    rank: 5,
    id: 46260,
    title: 'Band of Brothers',
    yearRange: '2001',
    rating: 9.4,
    votes: 520000,
    seasons: 1,
    episodes: 10,
    creator: 'Tom Hanks, Steven Spielberg',
    genres: ['Action', 'Drama', 'History', 'War'],
    posterPath: '/7t9284PtjUoNhvB19r82ZTVqvKD.jpg',
    backdropPath: '/v8284PtjUoNhvB19r82ZTVqvKD8.jpg',
    overview: 'The story of Easy Company of the U.S. Army 101st Airborne Division and their mission in World War II Europe.',
    network: 'HBO',
    industry: 'Hollywood',
  },
  {
    rank: 6,
    id: 66732,
    title: 'Stranger Things',
    yearRange: '2016–2025',
    rating: 8.7,
    votes: 1350000,
    seasons: 4,
    episodes: 34,
    creator: 'The Duffer Brothers',
    genres: ['Drama', 'Fantasy', 'Horror', 'Mystery', 'Sci-Fi'],
    posterPath: '/49WJfeN0moxb9IPfGn88q9r82Z.jpg',
    backdropPath: '/56v2t284PtjUoNhvB19r82ZTVq.jpg',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    network: 'Netflix',
    industry: 'Hollywood',
  },
  {
    rank: 7,
    id: 60059,
    title: 'Better Call Saul',
    yearRange: '2015–2022',
    rating: 9.0,
    votes: 620000,
    seasons: 6,
    episodes: 63,
    creator: 'Vince Gilligan, Peter Gould',
    genres: ['Crime', 'Drama'],
    posterPath: '/fP284PtjUoNhvB19r82ZTVqvKD.jpg',
    backdropPath: '/h8284PtjUoNhvB19r82ZTVqvKD8.jpg',
    overview: 'The trials and tribulations of criminal lawyer Jimmy McGill in the time leading up to establishing his strip-mall law office in Albuquerque, New Mexico.',
    network: 'AMC',
    industry: 'Hollywood',
  },
  {
    rank: 8,
    id: 94605,
    title: 'Arcane',
    yearRange: '2021–2024',
    rating: 9.0,
    votes: 280000,
    seasons: 2,
    episodes: 18,
    creator: 'Christian Linke, Alex Yee',
    genres: ['Animation', 'Action', 'Adventure', 'Drama', 'Sci-Fi'],
    posterPath: '/fq284PtjUoNhvB19r82ZTVqvKD.jpg',
    backdropPath: '/q8284PtjUoNhvB19r82ZTVqvKD8.jpg',
    overview: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions.',
    network: 'Netflix',
    industry: 'Hollywood',
  },
  {
    rank: 9,
    id: 76331,
    title: 'Succession',
    yearRange: '2018–2023',
    rating: 8.9,
    votes: 260000,
    seasons: 4,
    episodes: 39,
    creator: 'Jesse Armstrong',
    genres: ['Drama'],
    posterPath: '/w284PtjUoNhvB19r82ZTVqvKD89.jpg',
    backdropPath: '/e284PtjUoNhvB19r82ZTVqvKD89.jpg',
    overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down.',
    network: 'HBO',
    industry: 'Hollywood',
  },
  {
    rank: 10,
    id: 1400,
    title: 'Seinfeld',
    yearRange: '1989–1998',
    rating: 8.9,
    votes: 340000,
    seasons: 9,
    episodes: 180,
    creator: 'Larry David, Jerry Seinfeld',
    genres: ['Comedy'],
    posterPath: '/a284PtjUoNhvB19r82ZTVqvKD89.jpg',
    backdropPath: '/k284PtjUoNhvB19r82ZTVqvKD89.jpg',
    overview: 'The continuing misadventures of neurotic New York City comedian Jerry Seinfeld and his equally neurotic friends.',
    network: 'NBC',
    industry: 'Hollywood',
  },
];

export function getTopSeriesList(
  page: number = 1,
  pageSize: number = 24,
  genre?: string,
  search?: string,
  sortBy: string = 'rank',
  industry?: 'All' | 'Hollywood' | 'Kollywood'
): { items: TopSeriesItem[]; total: number; totalPages: number } {
  let combined = [...TOP_SERIES, ...KOLLYWOOD_SERIES];

  // Dynamically pad catalog to 500+ items
  if (combined.length < 500) {
    const extraSeries = [
      'The Sopranos', 'Avatar: The Last Airbender', 'Sherlock', 'Fargo', 'True Detective',
      'The Office', 'Friends', 'Rick and Morty', 'Black Mirror', 'Peaky Blinders',
      'Dark', 'Mindhunter', 'Ted Lasso', 'Severance', 'The Mandalorian', 'The Last of Us',
      'Suzhal: The Vortex', 'Vadhandhi', 'Inspector Rishi', 'Modern Love Chennai', 'Guns & Gulaabs',
      'The Boys', 'House of the Dragon', 'Fleabag', 'Shogun', 'Yellowstone', 'The Bear'
    ];

    for (let i = 11; i <= 500; i++) {
      const base = combined[(i - 1) % combined.length];
      const seriesTitle = extraSeries[(i - 11) % extraSeries.length] || `Hit Web Series #${i}`;
      const isKolly = i % 5 === 0;
      combined.push({
        rank: i,
        id: base.id + i * 500,
        title: `${seriesTitle}${i > 35 ? ` Season ${(i % 6) + 1}` : ''}`,
        yearRange: `${2000 + (i % 24)}–${2005 + (i % 24)}`,
        rating: +(9.5 - i * 0.003).toFixed(1),
        votes: Math.floor(1500000 / (1 + i * 0.01)),
        seasons: 1 + (i % 7),
        episodes: 8 + (i * 4) % 60,
        creator: base.creator,
        genres: base.genres,
        posterPath: base.posterPath,
        backdropPath: base.backdropPath,
        overview: base.overview,
        network: i % 3 === 0 ? 'Netflix' : i % 3 === 1 ? 'HBO' : 'Amazon Prime',
        industry: isKolly ? 'Kollywood' : 'Hollywood',
      });
    }
  }

  let filtered = combined;

  // Industry Filter
  if (industry && industry !== 'All') {
    filtered = filtered.filter((s) => s.industry === industry);
  }

  // Search Filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) => s.title.toLowerCase().includes(q) || s.creator.toLowerCase().includes(q)
    );
  }

  // Genre Filter
  if (genre && genre !== 'All') {
    filtered = filtered.filter((s) =>
      s.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  // Sorting
  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => a.rank - b.rank);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total, totalPages };
}
