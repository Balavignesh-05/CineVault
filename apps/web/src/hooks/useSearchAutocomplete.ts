import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export interface SuggestionMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export interface SuggestionTv {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
}

export interface SuggestionPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface SuggestionsState {
  movies: SuggestionMovie[];
  tv: SuggestionTv[];
  people: SuggestionPerson[];
}

export function useSearchAutocomplete(searchQuery: string) {
  const [suggestions, setSuggestions] = useState<SuggestionsState>({ movies: [], tv: [], people: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery.trim().length < 2) {
      setSuggestions({ movies: [], tv: [], people: [] });
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(debouncedSearchQuery.trim())}&page=1`, {
          signal: controller.signal
        });
        
        if (res.ok) {
          const data = await res.json();
          const results = data.results || [];
          setSuggestions({
            movies: results.filter((r: any) => r.media_type === 'movie' || r.title).slice(0, 3),
            tv: results.filter((r: any) => r.media_type === 'tv' || (r.name && !r.known_for_department)).slice(0, 3),
            people: results.filter((r: any) => r.media_type === 'person' || r.known_for_department).slice(0, 3),
          });
          setShowSuggestions(true);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search fetch failed:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [debouncedSearchQuery]);

  const allSuggestions = [
    ...suggestions.movies.map(m => ({ type: 'movie' as const, id: m.id, url: `/movies/${m.id}` })),
    ...suggestions.tv.map(t => ({ type: 'tv' as const, id: t.id, url: `/series/${t.id}` })),
    ...suggestions.people.map(p => ({ type: 'person' as const, id: p.id, url: `/person/${p.id}` })),
    { type: 'all' as const, id: -1, url: `/search?q=${encodeURIComponent(searchQuery.trim())}` }
  ];

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoading,
    allSuggestions,
    debouncedSearchQuery
  };
}
