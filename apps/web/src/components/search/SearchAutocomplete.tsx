import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, User, Search } from 'lucide-react';
import { SuggestionsState } from '@/hooks/useSearchAutocomplete';

interface SearchAutocompleteProps {
  showSuggestions: boolean;
  suggestions: SuggestionsState;
  selectedIndex: number;
  searchQuery: string;
  onClose: () => void;
  isLoading?: boolean;
  allSuggestions: Array<{ type: string; id: number; url: string }>;
}

export function SearchAutocomplete({
  showSuggestions,
  suggestions,
  selectedIndex,
  searchQuery,
  onClose,
  isLoading,
  allSuggestions
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

  const hasResults = suggestions.movies.length > 0 || suggestions.tv.length > 0 || suggestions.people.length > 0;

  return (
    <AnimatePresence>
      {showSuggestions && (hasResults || isLoading) && (
        <motion.div
          ref={suggestionsRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 mt-2 bg-[#1B1F24] border border-border-subtle rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col"
        >
          {isLoading ? (
            <div className="p-6 text-center text-text-muted flex items-center justify-center gap-2">
              <Search className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-text-muted">
              No matching movies, shows or people.
            </div>
          ) : (
            <>
              {suggestions.movies.length > 0 && (
                <div className="shrink-0">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-black/20 border-b border-border-subtle">Movies</p>
                  {suggestions.movies.map((movie) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'movie' && s.id === movie.id);
                    return (
                      <button
                        key={`movie-${movie.id}`}
                        type="button"
                        onClick={() => {
                          router.push(`/movies/${movie.id}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 bg-transparent transition-colors text-left border-b border-border-subtle last:border-b-0 ${flatIndex === selectedIndex ? 'bg-[#23282F]' : 'hover:bg-[#23282F]'}`}
                      >
                        <div className="relative w-8 h-12 rounded overflow-hidden bg-[#0B0D0F] shrink-0 border border-border-subtle">
                          {movie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <Film size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{movie.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {movie.release_date && (
                              <p className="text-xs text-text-muted">{new Date(movie.release_date).getFullYear()}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {suggestions.tv.length > 0 && (
                <div className="shrink-0 border-t border-border-subtle">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-black/20 border-b border-border-subtle">TV Shows</p>
                  {suggestions.tv.map((show) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'tv' && s.id === show.id);
                    return (
                      <button
                        key={`tv-${show.id}`}
                        type="button"
                        onClick={() => {
                          router.push(`/series/${show.id}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 bg-transparent transition-colors text-left border-b border-border-subtle last:border-b-0 ${flatIndex === selectedIndex ? 'bg-[#23282F]' : 'hover:bg-[#23282F]'}`}
                      >
                        <div className="relative w-8 h-12 rounded overflow-hidden bg-[#0B0D0F] shrink-0 border border-border-subtle">
                          {show.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                              alt={show.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <Tv size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{show.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {show.first_air_date && (
                              <p className="text-xs text-text-muted">{new Date(show.first_air_date).getFullYear()}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {suggestions.people.length > 0 && (
                <div className="shrink-0 border-t border-border-subtle">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-black/20 border-b border-border-subtle">People</p>
                  {suggestions.people.map((person) => {
                    const flatIndex = allSuggestions.findIndex(s => s.type === 'person' && s.id === person.id);
                    return (
                      <button
                        key={`person-${person.id}`}
                        type="button"
                        onClick={() => {
                          router.push(`/person/${person.id}`);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 bg-transparent transition-colors text-left border-b border-border-subtle last:border-b-0 ${flatIndex === selectedIndex ? 'bg-[#23282F]' : 'hover:bg-[#23282F]'}`}
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#0B0D0F] shrink-0 border border-border-subtle">
                          {person.profile_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w45${person.profile_path}`}
                              alt={person.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <User size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{person.name}</p>
                          <p className="text-xs text-text-muted">{person.known_for_department}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-border-subtle bg-[#14171B] shrink-0 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      onClose();
                    }
                  }}
                  className={`w-full px-4 py-3 text-sm font-bold text-white bg-transparent transition-colors text-center flex items-center justify-center gap-2 ${selectedIndex === allSuggestions.length - 1 ? 'bg-[#23282F]' : 'hover:bg-[#23282F]'}`}
                >
                  View all results for &quot;{searchQuery}&quot; <span aria-hidden="true" className="text-text-muted">&rarr;</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
