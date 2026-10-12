import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export interface SuggestionMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
}

export interface SuggestionTv {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average?: number;
}

export interface SuggestionPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface SuggestionMember {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface SuggestionList {
  id: string;
  title: string;
  filmCount?: number;
  likeCount?: number;
  user?: {
    username: string;
    displayName?: string | null;
  };
}

export interface SuggestionsState {
  movies: SuggestionMovie[];
  tv: SuggestionTv[];
  people: SuggestionPerson[];
  members: SuggestionMember[];
  lists: SuggestionList[];
}

export interface FlatSuggestionItem {
  type: 'movie' | 'tv' | 'person' | 'member' | 'list' | 'all';
  id: string | number;
  url: string;
  label: string;
}

export function useSearchAutocomplete(searchQuery: string) {
  const [suggestions, setSuggestions] = useState<SuggestionsState>({
    movies: [],
    tv: [],
    people: [],
    members: [],
    lists: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery.trim().length < 2) {
      setSuggestions({ movies: [], tv: [], people: [], members: [], lists: [] });
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const queryEncoded = encodeURIComponent(debouncedSearchQuery.trim());
        const [tmdbRes, membersRes, listsRes] = await Promise.allSettled([
          fetch(`/api/tmdb/search?query=${queryEncoded}&page=1`, { signal: controller.signal }),
          fetch(`/api/users/search?q=${queryEncoded}`, { signal: controller.signal }),
          fetch(`/api/collections/search?q=${queryEncoded}`, { signal: controller.signal }),
        ]);
        
        let movies: SuggestionMovie[] = [];
        let tv: SuggestionTv[] = [];
        let people: SuggestionPerson[] = [];
        let members: SuggestionMember[] = [];
        let lists: SuggestionList[] = [];

        if (tmdbRes.status === 'fulfilled' && tmdbRes.value.ok) {
          const tmdbJson = await tmdbRes.value.json();
          const results = tmdbJson.results || [];
          movies = results
            .filter((r: any) => r.media_type === 'movie' || (!r.media_type && r.title))
            .slice(0, 3);
          tv = results
            .filter((r: any) => r.media_type === 'tv' || (!r.media_type && r.name && !r.known_for_department))
            .slice(0, 3);
          people = results
            .filter((r: any) => r.media_type === 'person' || (!r.media_type && r.known_for_department))
            .slice(0, 3);
        }

        if (membersRes.status === 'fulfilled' && membersRes.value.ok) {
          const membersJson = await membersRes.value.json();
          const memberItems = Array.isArray(membersJson) ? membersJson : (membersJson.items || []);
          members = memberItems.slice(0, 2);
        }

        if (listsRes.status === 'fulfilled' && listsRes.value.ok) {
          const listsJson = await listsRes.value.json();
          const listItems = Array.isArray(listsJson) ? listsJson : (listsJson.items || []);
          lists = listItems.slice(0, 2);
        }

        setSuggestions({ movies, tv, people, members, lists });
        setShowSuggestions(true);
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

  const allSuggestions: FlatSuggestionItem[] = [
    ...suggestions.movies.map(m => ({ type: 'movie' as const, id: m.id, url: `/movies/${m.id}`, label: m.title })),
    ...suggestions.tv.map(t => ({ type: 'tv' as const, id: t.id, url: `/series/${t.id}`, label: t.name })),
    ...suggestions.people.map(p => ({ type: 'person' as const, id: p.id, url: `/person/${p.id}`, label: p.name })),
    ...suggestions.members.map(u => ({ type: 'member' as const, id: u.id, url: `/profile/${u.username}`, label: u.displayName || u.username })),
    ...suggestions.lists.map(l => ({ type: 'list' as const, id: l.id, url: `/lists/${l.id}`, label: l.title })),
    { type: 'all' as const, id: -1, url: `/search?q=${encodeURIComponent(searchQuery.trim())}`, label: `View all results for "${searchQuery.trim()}"` }
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
