'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Film, Tv, User, List, Users } from 'lucide-react';
import { MediaCard } from '@/components/media/MediaCard';
import Link from 'next/link';
import Image from 'next/image';

type TabType = 'films' | 'tv' | 'people' | 'members' | 'lists';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const tab = (searchParams.get('tab') as TabType) || 'films';

  const setTab = (t: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', t);
    router.push(`/search?${params.toString()}`);
  };

  const { data: tmdbData, isLoading: isTmdbLoading } = useQuery({
    queryKey: ['search-tmdb', query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&page=1`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: !!query.trim(),
  });

  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ['search-members', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!query.trim() && tab === 'members',
  });

  if (!query) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 text-text-muted">
        <Search className="w-16 h-16 mx-auto opacity-30" />
        <p className="text-xl font-bold text-white">Search CineVault</p>
        <p className="text-sm">Find films, shows, actors, members, and lists.</p>
      </div>
    </div>
  );

  const movies = (tmdbData?.results || []).filter((r: any) => r.media_type === 'movie' || (!r.media_type && r.title));
  const tvShows = (tmdbData?.results || []).filter((r: any) => r.media_type === 'tv' || (!r.media_type && r.name && !r.title));
  const people = (tmdbData?.results || []).filter((r: any) => r.media_type === 'person' || r.known_for_department);
  const members = membersData || [];

  const TABS = [
    { id: 'films' as TabType, label: 'Films', icon: Film, count: movies.length },
    { id: 'tv' as TabType, label: 'TV Shows', icon: Tv, count: tvShows.length },
    { id: 'people' as TabType, label: 'Cast & Crew', icon: User, count: people.length },
    { id: 'members' as TabType, label: 'Members', icon: Users, count: null },
    { id: 'lists' as TabType, label: 'Lists', icon: List, count: null },
  ];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 max-w-6xl py-10 space-y-6">
        <h1 className="text-2xl font-black text-white">
          Search results for <span className="text-[#00e054]">&#x201c;{query}&#x201d;</span>
        </h1>

        {/* Tabs */}
        <div className="border-b border-border-subtle flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-[#00e054] text-white'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              <t.icon size={14} />
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className="text-text-muted font-normal">({t.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isTmdbLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'films' && (
              movies.length === 0 ? (
                <div className="py-24 text-center text-text-muted"><Film className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No films found for &quot;{query}&quot;.</p></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movies.map((movie: any) => (
                    <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
                      <div className="aspect-[2/3] bg-surface rounded overflow-hidden relative">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs text-center p-2">{movie.title}</div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white mt-1 truncate group-hover:text-[#00e054] transition-colors">{movie.title}</p>
                      {movie.release_date && <p className="text-[10px] text-text-muted">{movie.release_date.slice(0,4)}</p>}
                    </Link>
                  ))}
                </div>
              )
            )}

            {tab === 'tv' && (
              tvShows.length === 0 ? (
                <div className="py-24 text-center text-text-muted"><Tv className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No TV shows found.</p></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {tvShows.map((show: any) => (
                    <Link key={show.id} href={`/series/${show.id}`} className="group">
                      <div className="aspect-[2/3] bg-surface rounded overflow-hidden">
                        {show.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w185${show.poster_path}`} alt={show.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs text-center p-2">{show.name}</div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white mt-1 truncate group-hover:text-[#00e054] transition-colors">{show.name}</p>
                    </Link>
                  ))}
                </div>
              )
            )}

            {tab === 'people' && (
              people.length === 0 ? (
                <div className="py-24 text-center text-text-muted"><User className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No people found.</p></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {people.map((person: any) => (
                    <Link key={person.id} href={`/person/${person.id}`} className="group">
                      <div className="aspect-[2/3] bg-surface rounded overflow-hidden">
                        {person.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface">
                            <User className="w-8 h-8 text-text-muted opacity-50" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white mt-1 truncate group-hover:text-[#00e054] transition-colors">{person.name}</p>
                      <p className="text-[10px] text-text-muted">{person.known_for_department}</p>
                    </Link>
                  ))}
                </div>
              )
            )}

            {tab === 'members' && (
              isMembersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-surface rounded animate-pulse" />)}
                </div>
              ) : members.length === 0 ? (
                <div className="py-24 text-center text-text-muted">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No members found for &quot;{query}&quot;.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {members.map((member: any) => (
                    <Link key={member.id} href={`/profile/${member.username}`} className="flex items-center gap-3 p-4 bg-surface border border-border-subtle rounded-xl hover:border-border-default transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-elevated overflow-hidden shrink-0">
                        {member.avatarUrl && <img src={member.avatarUrl} alt={member.username} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-[#00e054] transition-colors">{member.displayName || member.username}</p>
                        <p className="text-xs text-text-muted">@{member.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {tab === 'lists' && (
              <div className="py-24 text-center text-text-muted">
                <List className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>List search coming soon.</p>
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
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchResults />
    </Suspense>
  );
}
