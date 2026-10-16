'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TMDBCastMember, TMDBCrewMember, MovieDetailsData } from '@/lib/tmdb/types';

interface MovieInfoTabsProps {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
  movie: MovieDetailsData;
  rawMovie?: any;
}

type TabKey = 'CAST' | 'CREW' | 'DETAILS' | 'GENRES' | 'RELEASES';

export function MovieInfoTabs({ cast = [], crew = [], movie, rawMovie }: MovieInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('CAST');

  const tabs: TabKey[] = ['CAST', 'CREW', 'DETAILS', 'GENRES', 'RELEASES'];

  // Currency formatter
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  // Extract crew groupings
  const directors = crew.filter((c) => c.job === 'Director');
  const writers = crew.filter((c) =>
    ['Writer', 'Screenplay', 'Story', 'Author'].includes(c.job)
  );
  const producers = crew.filter((c) =>
    ['Producer', 'Executive Producer'].includes(c.job)
  );
  const cinematographers = crew.filter((c) =>
    ['Director of Photography', 'Cinematography'].includes(c.job)
  );
  const composers = crew.filter((c) =>
    ['Original Music Composer', 'Music', 'Composer'].includes(c.job)
  );
  const editors = crew.filter((c) => ['Editor'].includes(c.job));

  // Release dates / certifications
  const releaseDatesResults = rawMovie?.release_dates?.results || [];
  const usRelease = releaseDatesResults.find((r: any) => r.iso_3166_1 === 'US');
  const usCertification =
    usRelease?.release_dates?.find((d: any) => d.certification)?.certification || null;

  const spokenLanguages =
    (rawMovie?.spoken_languages || []).map((l: any) => l.english_name || l.name) || [];

  return (
    <div className="space-y-4">
      {/* Tabs header */}
      <div className="flex items-center gap-6 border-b border-[#273442] overflow-x-auto scrollbar-none pb-0 text-xs font-black tracking-[0.14em] uppercase">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-colors relative whitespace-nowrap ${
                isActive
                  ? 'text-[#35D6A0]'
                  : 'text-[#9AA8B7] hover:text-[#F4F3EC]'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              {tab}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#35D6A0] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[140px] pt-1">
        {/* ── CAST ──────────────────────── */}
        {activeTab === 'CAST' && (
          <div>
            {cast.length === 0 ? (
              <p className="text-xs text-[#9AA8B7]">No cast members listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cast.slice(0, 24).map((member) => (
                  <Link
                    key={`${member.id}-${member.character}`}
                    href={`/person/${member.id}`}
                    className="inline-flex items-center px-3 py-1.5 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0]/50 rounded-lg text-xs font-semibold text-[#F4F3EC] hover:text-[#35D6A0] transition-all group"
                    title={member.character ? `as ${member.character}` : member.name}
                  >
                    <span>{member.name}</span>
                    {member.character && (
                      <span className="ml-1.5 text-[10px] text-[#9AA8B7]/70 font-normal hidden sm:inline truncate max-w-[120px]">
                        {member.character}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREW ──────────────────────── */}
        {activeTab === 'CREW' && (
          <div className="space-y-4 text-xs">
            {directors.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="w-28 text-[#9AA8B7] font-bold uppercase tracking-wider shrink-0">
                  Director:
                </span>
                <div className="flex flex-wrap gap-2">
                  {directors.map((c) => (
                    <Link
                      key={c.id}
                      href={`/person/${c.id}`}
                      className="px-2.5 py-1 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0]/50 rounded-lg text-[#F4F3EC] hover:text-[#35D6A0] font-semibold transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {writers.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="w-28 text-[#9AA8B7] font-bold uppercase tracking-wider shrink-0">
                  Writers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {writers.slice(0, 6).map((c) => (
                    <Link
                      key={`${c.id}-${c.job}`}
                      href={`/person/${c.id}`}
                      className="px-2.5 py-1 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0]/50 rounded-lg text-[#F4F3EC] hover:text-[#35D6A0] font-semibold transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {producers.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="w-28 text-[#9AA8B7] font-bold uppercase tracking-wider shrink-0">
                  Producers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {producers.slice(0, 6).map((c) => (
                    <Link
                      key={`${c.id}-${c.job}`}
                      href={`/person/${c.id}`}
                      className="px-2.5 py-1 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0]/50 rounded-lg text-[#F4F3EC] hover:text-[#35D6A0] font-semibold transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {cinematographers.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="w-28 text-[#9AA8B7] font-bold uppercase tracking-wider shrink-0">
                  Cinematography:
                </span>
                <div className="flex flex-wrap gap-2">
                  {cinematographers.map((c) => (
                    <Link
                      key={c.id}
                      href={`/person/${c.id}`}
                      className="px-2.5 py-1 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0]/50 rounded-lg text-[#F4F3EC] hover:text-[#35D6A0] font-semibold transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {composers.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="w-28 text-[#9AA8B7] font-bold uppercase tracking-wider shrink-0">
                  Music:
                </span>
                <div className="flex flex-wrap gap-2">
                  {composers.map((c) => (
                    <Link
                      key={c.id}
                      href={`/person/${c.id}`}
                      className="px-2.5 py-1 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0]/50 rounded-lg text-[#F4F3EC] hover:text-[#35D6A0] font-semibold transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {editors.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="w-28 text-[#9AA8B7] font-bold uppercase tracking-wider shrink-0">
                  Editor:
                </span>
                <div className="flex flex-wrap gap-2">
                  {editors.map((c) => (
                    <Link
                      key={c.id}
                      href={`/person/${c.id}`}
                      className="px-2.5 py-1 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0]/50 rounded-lg text-[#F4F3EC] hover:text-[#35D6A0] font-semibold transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DETAILS ───────────────────── */}
        {activeTab === 'DETAILS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs bg-[#131A22]/50 border border-[#273442] rounded-xl p-4">
            <div className="flex justify-between py-1 border-b border-[#273442]/50">
              <span className="text-[#9AA8B7]">Status</span>
              <span className="text-[#F4F3EC] font-semibold">{movie.status}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#273442]/50">
              <span className="text-[#9AA8B7]">Runtime</span>
              <span className="text-[#F4F3EC] font-semibold">
                {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m (${movie.runtime} mins)` : '—'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#273442]/50">
              <span className="text-[#9AA8B7]">Original Language</span>
              <span className="text-[#F4F3EC] font-semibold uppercase">{movie.originalLanguage || 'en'}</span>
            </div>

            {spokenLanguages.length > 0 && (
              <div className="flex justify-between py-1 border-b border-[#273442]/50">
                <span className="text-[#9AA8B7]">Spoken Languages</span>
                <span className="text-[#F4F3EC] font-semibold truncate max-w-[180px] text-right">
                  {spokenLanguages.join(', ')}
                </span>
              </div>
            )}

            {movie.budget > 0 && (
              <div className="flex justify-between py-1 border-b border-[#273442]/50">
                <span className="text-[#9AA8B7]">Budget</span>
                <span className="text-[#F4F3EC] font-semibold">{currencyFormatter.format(movie.budget)}</span>
              </div>
            )}

            {movie.revenue > 0 && (
              <div className="flex justify-between py-1 border-b border-[#273442]/50">
                <span className="text-[#9AA8B7]">Box Office</span>
                <span className="text-[#35D6A0] font-semibold">{currencyFormatter.format(movie.revenue)}</span>
              </div>
            )}

            {movie.productionCompanies.length > 0 && (
              <div className="col-span-full py-2">
                <span className="text-[#9AA8B7] block mb-2 font-bold uppercase tracking-wider text-[10px]">
                  Production Studios
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.productionCompanies.map((c) => (
                    <Link
                      key={c.id}
                      href={`/studios/${c.id}`}
                      className="px-2.5 py-1 bg-[#1A2430] hover:bg-[#222E3D] border border-[#273442] hover:border-[#35D6A0]/40 rounded-lg text-[#F4F3EC] text-xs font-medium transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GENRES ────────────────────── */}
        {activeTab === 'GENRES' && (
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <Link
                key={g.id}
                href={`/discovery/genre/${encodeURIComponent(g.name.toLowerCase().replace(/\s+/g, '-'))}`}
                className="px-3.5 py-1.5 bg-[#131A22] hover:bg-[#1A2430] border border-[#273442] hover:border-[#35D6A0] rounded-xl text-xs font-bold text-[#F4F3EC] hover:text-[#35D6A0] transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}

        {/* ── RELEASES ──────────────────── */}
        {activeTab === 'RELEASES' && (
          <div className="space-y-3 text-xs bg-[#131A22]/50 border border-[#273442] rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#273442]">
              <span className="text-[#9AA8B7]">Primary Release Date</span>
              <span className="text-[#F4F3EC] font-bold" suppressHydrationWarning>
                {movie.releaseDate
                  ? new Date(movie.releaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })
                  : 'TBA'}
              </span>
            </div>

            {usCertification && (
              <div className="flex items-center justify-between pb-2 border-b border-[#273442]">
                <span className="text-[#9AA8B7]">Age Rating / Certification</span>
                <span className="px-2 py-0.5 rounded bg-[#1A2430] border border-[#273442] text-[#35D6A0] font-black">
                  {usCertification}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[#9AA8B7]">Release Year</span>
              <span className="text-[#F4F3EC] font-semibold">{movie.releaseYear || '—'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
