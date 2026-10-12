import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, User, Users, List, Search, Star, ArrowRight, Loader2 } from 'lucide-react';
import { SuggestionsState, FlatSuggestionItem } from '@/hooks/useSearchAutocomplete';

interface SearchAutocompleteProps {
  showSuggestions: boolean;
  suggestions: SuggestionsState;
  selectedIndex: number;
  searchQuery: string;
  onClose: () => void;
  isLoading?: boolean;
  allSuggestions: FlatSuggestionItem[];
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-[#35D6A0] font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function SearchAutocomplete({
  showSuggestions,
  suggestions,
  selectedIndex,
  searchQuery,
  onClose,
  isLoading,
  allSuggestions,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const hasResults =
    (suggestions.movies?.length ?? 0) > 0 ||
    (suggestions.tv?.length ?? 0) > 0 ||
    (suggestions.people?.length ?? 0) > 0 ||
    (suggestions.members?.length ?? 0) > 0 ||
    (suggestions.lists?.length ?? 0) > 0;

  return (
    <AnimatePresence>
      {showSuggestions && (
        <motion.div
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          ref={suggestionsRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute top-full left-0 right-0 mt-2 bg-[#131A22] border border-[#273442] rounded-xl shadow-2xl shadow-black/80 z-50 overflow-hidden max-h-[520px] overflow-y-auto flex flex-col backdrop-blur-xl"
        >
          {isLoading && !hasResults ? (
            <div className="p-6 text-center text-[#9AA8B7] flex items-center justify-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-[#35D6A0]" />
              <span className="text-sm font-medium">Searching films, people & community…</span>
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-[#9AA8B7]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#9AA8B7]" />
              <p className="text-sm font-semibold text-[#F4F3EC]">No instant matches for &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-[#9AA8B7] mt-1">Press <kbd className="px-1.5 py-0.5 bg-[#1A2430] border border-[#273442] rounded text-[10px] text-[#35D6A0]">Enter</kbd> to view full results</p>
            </div>
          ) : (
            <>
              {/* Movies */}
              {suggestions.movies && suggestions.movies.length > 0 && (
                <div className="shrink-0">
                  <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#9AA8B7] bg-[#0B0F14]/70 border-b border-[#1C2633] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#35D6A0]">
                      <Film size={12} /> Films
                    </span>
                    <span className="text-[9px] text-[#6B7D90] font-normal">Press Enter</span>
                  </div>
                  {suggestions.movies.map((movie) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'movie' && s.id === movie.id);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={`movie-${movie.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          router.push(`/movies/${movie.id}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent transition-all text-left border-b border-[#1C2633] last:border-b-0 group ${
                          isSelected ? 'bg-[#1A2430] border-l-2 border-l-[#35D6A0]' : 'hover:bg-[#1A2430]'
                        }`}
                      >
                        <div className="relative w-8 h-12 rounded overflow-hidden bg-[#0B0F14] shrink-0 border border-[#273442]">
                          {movie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6B7D90]">
                              <Film size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                            <HighlightMatch text={movie.title} query={searchQuery} />
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#9AA8B7]">
                            {movie.release_date && (
                              <span>{new Date(movie.release_date).getFullYear()}</span>
                            )}
                            {movie.vote_average && movie.vote_average > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                                <Star size={10} className="fill-amber-400" />
                                {movie.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TV Shows */}
              {suggestions.tv && suggestions.tv.length > 0 && (
                <div className="shrink-0 border-t border-[#1C2633]">
                  <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#9AA8B7] bg-[#0B0F14]/70 border-b border-[#1C2633] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#35D6A0]">
                      <Tv size={12} /> TV Shows
                    </span>
                  </div>
                  {suggestions.tv.map((show) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'tv' && s.id === show.id);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={`tv-${show.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          router.push(`/series/${show.id}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent transition-all text-left border-b border-[#1C2633] last:border-b-0 group ${
                          isSelected ? 'bg-[#1A2430] border-l-2 border-l-[#35D6A0]' : 'hover:bg-[#1A2430]'
                        }`}
                      >
                        <div className="relative w-8 h-12 rounded overflow-hidden bg-[#0B0F14] shrink-0 border border-[#273442]">
                          {show.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                              alt={show.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6B7D90]">
                              <Tv size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                            <HighlightMatch text={show.name} query={searchQuery} />
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#9AA8B7]">
                            {show.first_air_date && (
                              <span>{new Date(show.first_air_date).getFullYear()}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cast & Crew */}
              {suggestions.people && suggestions.people.length > 0 && (
                <div className="shrink-0 border-t border-[#1C2633]">
                  <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#9AA8B7] bg-[#0B0F14]/70 border-b border-[#1C2633] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#35D6A0]">
                      <User size={12} /> Cast & Crew
                    </span>
                  </div>
                  {suggestions.people.map((person) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'person' && s.id === person.id);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={`person-${person.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          router.push(`/person/${person.id}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent transition-all text-left border-b border-[#1C2633] last:border-b-0 group ${
                          isSelected ? 'bg-[#1A2430] border-l-2 border-l-[#35D6A0]' : 'hover:bg-[#1A2430]'
                        }`}
                      >
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#0B0F14] shrink-0 border border-[#273442]">
                          {person.profile_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w45${person.profile_path}`}
                              alt={person.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6B7D90]">
                              <User size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                            <HighlightMatch text={person.name} query={searchQuery} />
                          </p>
                          <p className="text-xs text-[#9AA8B7]">{person.known_for_department || 'Artist'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Members */}
              {suggestions.members && suggestions.members.length > 0 && (
                <div className="shrink-0 border-t border-[#1C2633]">
                  <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#9AA8B7] bg-[#0B0F14]/70 border-b border-[#1C2633] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#35D6A0]">
                      <Users size={12} /> Members
                    </span>
                  </div>
                  {suggestions.members.map((member) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'member' && s.id === member.id);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={`member-${member.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          router.push(`/profile/${member.username}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent transition-all text-left border-b border-[#1C2633] last:border-b-0 group ${
                          isSelected ? 'bg-[#1A2430] border-l-2 border-l-[#35D6A0]' : 'hover:bg-[#1A2430]'
                        }`}
                      >
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#1A2430] shrink-0 border border-[#273442] flex items-center justify-center text-xs font-bold text-[#35D6A0]">
                          {member.avatarUrl ? (
                            <Image
                              src={member.avatarUrl}
                              alt={member.username}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            member.username.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                            <HighlightMatch text={member.displayName || member.username} query={searchQuery} />
                          </p>
                          <p className="text-xs text-[#9AA8B7]">@{member.username}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Lists */}
              {suggestions.lists && suggestions.lists.length > 0 && (
                <div className="shrink-0 border-t border-[#1C2633]">
                  <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#9AA8B7] bg-[#0B0F14]/70 border-b border-[#1C2633] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#35D6A0]">
                      <List size={12} /> Lists
                    </span>
                  </div>
                  {suggestions.lists.map((list) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'list' && s.id === list.id);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={`list-${list.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          router.push(`/lists/${list.id}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent transition-all text-left border-b border-[#1C2633] last:border-b-0 group ${
                          isSelected ? 'bg-[#1A2430] border-l-2 border-l-[#35D6A0]' : 'hover:bg-[#1A2430]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded bg-[#1A2430] border border-[#273442] flex items-center justify-center shrink-0 text-[#35D6A0]">
                          <List size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F4F3EC] truncate group-hover:text-[#35D6A0] transition-colors">
                            <HighlightMatch text={list.title} query={searchQuery} />
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#9AA8B7]">
                            <span>{list.filmCount ?? 0} films</span>
                            {list.user && <span>by {list.user.displayName || list.user.username}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Footer CTA */}
              <div className="border-t border-[#273442] bg-[#0B0F14] shrink-0 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      onClose();
                    }
                  }}
                  className={`w-full px-4 py-3 text-xs font-bold text-[#F4F3EC] bg-transparent transition-all text-center flex items-center justify-center gap-2 ${
                    selectedIndex === allSuggestions.length - 1 ? 'bg-[#1A2430] text-[#35D6A0]' : 'hover:bg-[#1A2430] hover:text-[#35D6A0]'
                  }`}
                >
                  <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                  <ArrowRight size={14} className="text-[#35D6A0]" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
