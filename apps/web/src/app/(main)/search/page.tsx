'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Film,
  Tv,
  User,
  Users,
  List as ListIcon,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';

type TabType = 'films' | 'tv' | 'people' | 'members' | 'lists';
type SortOption = 'popular' | 'rating' | 'date_desc' | 'date_asc' | 'title';

const SUGGESTED_SEARCHES = [
  'Christopher Nolan',
  'Dune',
  'Studio Ghibli',
  'Denis Villeneuve',
  'Parasite',
  'Interstellar',
  'Succession',
  'Quentin Tarantino',
  'Oppenheimer',
  'Hayao Miyazaki',
];

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const tab = (searchParams.get('tab') as TabType) || 'films';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const sort = (searchParams.get('sort') as SortOption) || 'popular';

  const [inputVal, setInputVal] = useState(query);

  const updateUrl = (updates: Partial<{ q: string; tab: TabType; page: number; sort: SortOption }>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.q !== undefined) {
      if (updates.q.trim()) params.set('q', updates.q.trim());
      else params.delete('q');
      params.set('page', '1');
    }
    if (updates.tab !== undefined) {
      params.set('tab', updates.tab);
      params.set('page', '1');
    }
    if (updates.sort !== undefined) {
      params.set('sort', updates.sort);
      params.set('page', '1');
    }
    if (updates.page !== undefined) {
      params.set('page', updates.page.toString());
    }
    router.push(`/search?${params.toString()}`);
  };

  // 1. TMDB Multi Search (for initial counts and broad query)
  const {
    data: multiData,
    isLoading: isMultiLoading,
    error: multiError,
    refetch: refetchMulti,
  } = useQuery({
    queryKey: ['search-multi', query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&page=1`);
      if (!res.ok) throw new Error('Failed to fetch multi-search results');
      return res.json();
    },
    enabled: !!query.trim(),
    staleTime: 60000,
  });

  // 2. Tab-specific Paginated Search
  const {
    data: tabData,
    isLoading: isTabLoading,
    error: tabError,
    refetch: refetchTab,
  } = useQuery({
    queryKey: ['search-tab', query, tab, page],
    queryFn: async () => {
      if (!query.trim()) return null;
      if (tab === 'films') {
        const res = await fetch(`/api/tmdb/search?type=movie&query=${encodeURIComponent(query)}&page=${page}`);
        if (!res.ok) throw new Error('Failed to fetch films');
        return res.json();
      }
      if (tab === 'tv') {
        const res = await fetch(`/api/tmdb/search?type=tv&query=${encodeURIComponent(query)}&page=${page}`);
        if (!res.ok) throw new Error('Failed to fetch TV shows');
        return res.json();
      }
      if (tab === 'people') {
        const res = await fetch(`/api/tmdb/search?type=person&query=${encodeURIComponent(query)}&page=${page}`);
        if (!res.ok) throw new Error('Failed to fetch cast and crew');
        return res.json();
      }
      if (tab === 'members') {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) return { items: [] };
        const data = await res.json();
        return { items: Array.isArray(data) ? data : data.items || [] };
      }
      if (tab === 'lists') {
        const res = await fetch(`/api/collections/search?q=${encodeURIComponent(query)}&page=${page}`);
        if (!res.ok) return { items: [], total: 0 };
        return res.json();
      }
      return null;
    },
    enabled: !!query.trim(),
    staleTime: 60000,
  });

  // 3. Trending for empty query discovery state
  const { data: trendingData } = useQuery({
    queryKey: ['search-empty-trending'],
    queryFn: async () => {
      const res = await fetch('/api/tmdb/trending?page=1');
      if (!res.ok) return { results: [] };
      return res.json();
    },
    enabled: !query.trim(),
    staleTime: 300000,
  });

  // Multi counts extraction
  const multiMovies = useMemo(
    () => (multiData?.results || []).filter((r: any) => r.media_type === 'movie' || (!r.media_type && r.title)),
    [multiData]
  );
  const multiTv = useMemo(
    () => (multiData?.results || []).filter((r: any) => r.media_type === 'tv' || (!r.media_type && r.name && !r.known_for_department)),
    [multiData]
  );
  const multiPeople = useMemo(
    () => (multiData?.results || []).filter((r: any) => r.media_type === 'person' || (!r.media_type && r.known_for_department)),
    [multiData]
  );

  const TABS: { id: TabType; label: string; icon: any; count: number | null }[] = [
    { id: 'films', label: 'Films', icon: Film, count: tab === 'films' ? (tabData?.total_results ?? multiMovies.length) : (multiMovies.length || null) },
    { id: 'tv', label: 'TV Shows', icon: Tv, count: tab === 'tv' ? (tabData?.total_results ?? multiTv.length) : (multiTv.length || null) },
    { id: 'people', label: 'Cast & Crew', icon: User, count: tab === 'people' ? (tabData?.total_results ?? multiPeople.length) : (multiPeople.length || null) },
    { id: 'members', label: 'Members', icon: Users, count: tab === 'members' ? (tabData?.items?.length ?? null) : null },
    { id: 'lists', label: 'Lists', icon: ListIcon, count: tab === 'lists' ? (tabData?.total ?? tabData?.items?.length ?? null) : null },
  ];

  // Sorting helper for client-side refinement
  const sortedItems = useMemo(() => {
    if (!tabData) return [];
    if (tab === 'members' || tab === 'lists') {
      const items = [...(tabData.items || [])];
      if (tab === 'lists') {
        if (sort === 'rating') items.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        else if (sort === 'popular') items.sort((a, b) => (b.filmCount || 0) - (a.filmCount || 0));
      }
      return items;
    }

    const items = [...(tabData.results || [])];
    if (sort === 'rating') {
      items.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sort === 'date_desc') {
      items.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
        const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
        return dateB - dateA;
      });
    } else if (sort === 'date_asc') {
      items.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
        const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
        return dateA - dateB;
      });
    } else if (sort === 'title') {
      items.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    }
    return items;
  }, [tabData, tab, sort]);

  // Total pages
  const totalPages = tabData?.total_pages ? Math.min(tabData.total_pages, 500) : 1;

  // -------------------------------------------------------------
  // EMPTY QUERY STATE — Letterboxd-inspired Discovery
  // -------------------------------------------------------------
  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-[#9AA8B7] py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          {/* Hero Header */}
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#131A22] border border-[#273442] text-[#35D6A0] shadow-[0_0_24px_rgba(53,214,160,0.15)] mb-2">
              <Search size={26} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#F4F3EC] tracking-tight">
              Search CineVault
            </h1>
            <p className="text-sm md:text-base text-[#9AA8B7] leading-relaxed">
              Find films, TV series, actors, directors, community members, and curated lists.
            </p>

            {/* In-page search bar */}
            <div className="pt-2 max-w-lg mx-auto">
              <SearchBar
                value={inputVal}
                onChange={setInputVal}
                onSubmit={(val) => updateUrl({ q: val })}
                placeholder="Search films, people, members…"
                autoFocus
              />
            </div>
          </div>

          {/* Suggested Search Pills */}
          <div className="space-y-3 bg-[#131A22] border border-[#273442] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4F3EC]">
              <Sparkles size={14} className="text-[#35D6A0]" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTED_SEARCHES.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setInputVal(item);
                    updateUrl({ q: item });
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#1A2430] border border-[#273442] text-xs font-medium text-[#F4F3EC] hover:border-[#35D6A0] hover:text-[#35D6A0] transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Discovery Grid */}
          {trendingData?.results && trendingData.results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#273442] pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F3EC] flex items-center gap-2">
                  <Compass size={16} className="text-[#35D6A0]" />
                  Popular Right Now
                </h2>
                <Link
                  href="/films"
                  className="text-xs text-[#35D6A0] hover:text-[#6BE8BC] font-semibold transition-colors"
                >
                  Browse all films &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {trendingData.results.slice(0, 12).map((movie: any) => (
                  <Link
                    key={movie.id}
                    href={`/movies/${movie.id}`}
                    className="group flex flex-col gap-1.5 focus:outline-none"
                  >
                    <div className="aspect-[2/3] bg-[#131A22] rounded-xl overflow-hidden relative border border-[#273442] shadow-md group-hover:border-[#35D6A0] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                          alt={movie.title || 'Movie'}
                          fill
                          sizes="(max-width: 640px) 33vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#6B7D90] p-2 text-center">
                          {movie.title}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                      {movie.title}
                    </p>
                    {movie.release_date && (
                      <p className="text-[10px] text-[#6B7D90] font-mono">
                        {movie.release_date.slice(0, 4)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE SEARCH RESULTS VIEW
  // -------------------------------------------------------------
  const isLoading = isTabLoading || isMultiLoading;
  const isError = tabError || multiError;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#9AA8B7] pb-24">
      <div className="container mx-auto px-4 max-w-6xl py-8 md:py-10 space-y-6">
        {/* Search Header Bar */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-[#273442] pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[#F4F3EC] tracking-tight">
              Results for <span className="text-[#35D6A0]">&ldquo;{query}&rdquo;</span>
            </h1>
            <p className="text-xs text-[#6B7D90]">
              Showing matching cinema titles, cast, members, and curated community lists.
            </p>
          </div>

          <div className="w-full md:w-80">
            <SearchBar
              value={inputVal}
              onChange={setInputVal}
              onSubmit={(val) => updateUrl({ q: val })}
              placeholder="Refine search…"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="border-b border-[#273442] flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
          <nav className="flex gap-1" aria-label="Search categories">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => updateUrl({ tab: t.id })}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#35D6A0] text-[#F4F3EC] bg-[#131A22]/60'
                      : 'border-transparent text-[#9AA8B7] hover:text-[#F4F3EC] hover:border-[#273442]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={14} className={isActive ? 'text-[#35D6A0]' : 'text-[#6B7D90]'} />
                  <span>{t.label}</span>
                  {t.count !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-[#35D6A0]/20 text-[#35D6A0]' : 'bg-[#1A2430] text-[#6B7D90]'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sort Dropdown */}
          {tab !== 'people' && tab !== 'members' && (
            <div className="hidden sm:flex items-center gap-2 shrink-0 pr-1">
              <ArrowUpDown size={13} className="text-[#6B7D90]" />
              <select
                value={sort}
                onChange={(e) => updateUrl({ sort: e.target.value as SortOption })}
                className="bg-[#131A22] border border-[#273442] text-xs text-[#F4F3EC] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#35D6A0] cursor-pointer"
                aria-label="Sort search results"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <div className="p-8 rounded-2xl bg-[#131A22] border border-[#E05252]/40 text-center space-y-4">
            <AlertCircle size={32} className="mx-auto text-[#E05252]" />
            <h3 className="text-base font-bold text-[#F4F3EC]">Failed to load search results</h3>
            <p className="text-xs text-[#9AA8B7] max-w-sm mx-auto">
              We encountered a network issue while searching. Please check your connection or retry.
            </p>
            <button
              onClick={() => {
                refetchTab();
                refetchMulti();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0] text-xs font-bold text-[#F4F3EC] transition-colors"
            >
              <RefreshCw size={13} />
              Retry Search
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && !isError && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="aspect-[2/3] bg-[#131A22] border border-[#273442] rounded-xl" />
                <div className="h-3 bg-[#1A2430] rounded w-3/4" />
                <div className="h-2 bg-[#1A2430] rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Content Views */}
        {!isLoading && !isError && (
          <>
            {/* 1. FILMS TAB */}
            {tab === 'films' && (
              sortedItems.length === 0 ? (
                <div className="py-24 text-center text-[#9AA8B7] space-y-3 bg-[#131A22] rounded-2xl border border-[#273442]">
                  <Film className="w-12 h-12 mx-auto text-[#6B7D90] opacity-40" />
                  <p className="text-base font-bold text-[#F4F3EC]">No films found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-[#9AA8B7] max-w-sm mx-auto">
                    Check spelling or try searching for another title, director, or franchise.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {sortedItems.map((movie: any) => (
                    <Link
                      key={movie.id}
                      href={`/movies/${movie.id}`}
                      className="group flex flex-col gap-1.5 focus:outline-none"
                    >
                      <div className="aspect-[2/3] bg-[#131A22] rounded-xl overflow-hidden relative border border-[#273442] shadow-md group-hover:border-[#35D6A0] group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-all">
                        {movie.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                            alt={movie.title || 'Movie'}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#6B7D90] p-2 text-center bg-[#131A22]">
                            {movie.title}
                          </div>
                        )}
                        {movie.vote_average && movie.vote_average > 0 && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] font-black text-amber-400">
                            <Star size={9} className="fill-amber-400" />
                            <span>{movie.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                        {movie.title}
                      </p>
                      {movie.release_date && (
                        <p className="text-[10px] text-[#6B7D90] font-mono">
                          {movie.release_date.slice(0, 4)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* 2. TV SHOWS TAB */}
            {tab === 'tv' && (
              sortedItems.length === 0 ? (
                <div className="py-24 text-center text-[#9AA8B7] space-y-3 bg-[#131A22] rounded-2xl border border-[#273442]">
                  <Tv className="w-12 h-12 mx-auto text-[#6B7D90] opacity-40" />
                  <p className="text-base font-bold text-[#F4F3EC]">No TV shows found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-[#9AA8B7] max-w-sm mx-auto">
                    Try searching for the official series title.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {sortedItems.map((show: any) => (
                    <Link
                      key={show.id}
                      href={`/series/${show.id}`}
                      className="group flex flex-col gap-1.5 focus:outline-none"
                    >
                      <div className="aspect-[2/3] bg-[#131A22] rounded-xl overflow-hidden relative border border-[#273442] shadow-md group-hover:border-[#35D6A0] group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-all">
                        {show.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w342${show.poster_path}`}
                            alt={show.name || 'Series'}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#6B7D90] p-2 text-center bg-[#131A22]">
                            {show.name}
                          </div>
                        )}
                        {show.vote_average && show.vote_average > 0 && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] font-black text-amber-400">
                            <Star size={9} className="fill-amber-400" />
                            <span>{show.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                        {show.name}
                      </p>
                      {show.first_air_date && (
                        <p className="text-[10px] text-[#6B7D90] font-mono">
                          {show.first_air_date.slice(0, 4)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* 3. CAST & CREW TAB */}
            {tab === 'people' && (
              sortedItems.length === 0 ? (
                <div className="py-24 text-center text-[#9AA8B7] space-y-3 bg-[#131A22] rounded-2xl border border-[#273442]">
                  <User className="w-12 h-12 mx-auto text-[#6B7D90] opacity-40" />
                  <p className="text-base font-bold text-[#F4F3EC]">No people found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-[#9AA8B7]">Try checking name spelling.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {sortedItems.map((person: any) => (
                    <Link
                      key={person.id}
                      href={`/person/${person.id}`}
                      className="group flex flex-col gap-2 p-3 rounded-2xl bg-[#131A22] border border-[#273442] hover:border-[#35D6A0] transition-all text-center items-center"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#0B0F14] border border-[#273442] group-hover:border-[#35D6A0] transition-colors">
                        {person.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#6B7D90]">
                            <User size={32} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="text-xs font-bold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                          {person.name}
                        </p>
                        <p className="text-[10px] text-[#6B7D90] truncate">
                          {person.known_for_department || 'Artist'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* 4. MEMBERS TAB */}
            {tab === 'members' && (
              sortedItems.length === 0 ? (
                <div className="py-24 text-center text-[#9AA8B7] space-y-3 bg-[#131A22] rounded-2xl border border-[#273442]">
                  <Users className="w-12 h-12 mx-auto text-[#6B7D90] opacity-40" />
                  <p className="text-base font-bold text-[#F4F3EC]">No members found matching &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-[#9AA8B7]">Try searching by exact username or display name.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedItems.map((member: any) => (
                    <Link
                      key={member.id}
                      href={`/profile/${member.username}`}
                      className="flex items-center gap-3.5 p-4 bg-[#131A22] border border-[#273442] rounded-2xl hover:border-[#35D6A0] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#1A2430] border border-[#273442] overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm text-[#35D6A0]">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.username} className="w-full h-full object-cover" />
                        ) : (
                          member.username.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#F4F3EC] group-hover:text-[#35D6A0] transition-colors truncate">
                          {member.displayName || member.username}
                        </p>
                        <p className="text-xs text-[#9AA8B7]">@{member.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* 5. LISTS TAB */}
            {tab === 'lists' && (
              sortedItems.length === 0 ? (
                <div className="py-24 text-center text-[#9AA8B7] space-y-3 bg-[#131A22] rounded-2xl border border-[#273442]">
                  <ListIcon className="w-12 h-12 mx-auto text-[#6B7D90] opacity-40" />
                  <p className="text-base font-bold text-[#F4F3EC]">No lists found matching &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-[#9AA8B7]">
                    Try searching for broader cinema topics or curated themes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedItems.map((list: any) => (
                    <Link
                      key={list.id}
                      href={`/lists/${list.id}`}
                      className="flex flex-col justify-between p-5 bg-[#131A22] border border-[#273442] rounded-2xl hover:border-[#35D6A0] transition-all group space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#6B7D90] mb-2 font-mono">
                          <span className="text-[#35D6A0] font-bold">{list.filmCount ?? 0} films</span>
                          {list.likeCount !== undefined && <span>{list.likeCount} likes</span>}
                        </div>
                        <h3 className="font-bold text-sm text-[#F4F3EC] group-hover:text-[#35D6A0] transition-colors line-clamp-1">
                          {list.title}
                        </h3>
                        {list.description && (
                          <p className="text-xs text-[#9AA8B7] line-clamp-2 mt-1 leading-relaxed">
                            {list.description}
                          </p>
                        )}
                      </div>

                      {list.user && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#1C2633] text-xs text-[#9AA8B7]">
                          <div className="w-5 h-5 rounded-full bg-[#1A2430] flex items-center justify-center text-[10px] text-[#35D6A0] font-bold shrink-0">
                            {list.user.avatarUrl ? (
                              <img src={list.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              list.user.username?.[0]?.toUpperCase() ?? 'U'
                            )}
                          </div>
                          <span className="truncate">by {list.user.displayName || list.user.username}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (tab === 'films' || tab === 'tv' || tab === 'people') && (
              <div className="pt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => updateUrl({ page: Math.max(1, page - 1) })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#131A22] border border-[#273442] text-xs font-bold text-[#F4F3EC] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#35D6A0] transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-[#9AA8B7] font-mono px-3">
                  Page <strong className="text-[#F4F3EC]">{page}</strong> of <strong className="text-[#F4F3EC]">{totalPages}</strong>
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => updateUrl({ page: Math.min(totalPages, page + 1) })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#131A22] border border-[#273442] text-xs font-bold text-[#F4F3EC] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#35D6A0] transition-colors"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#35D6A0] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
