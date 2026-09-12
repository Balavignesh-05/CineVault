'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, X, Plus, Lock, Globe, ListOrdered, List } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
}

interface AddedFilm {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  notes: string;
}

export default function NewListPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isRanked, setIsRanked] = useState(false);
  const [addedFilms, setAddedFilms] = useState<AddedFilm[]>([]);
  const [filmSearch, setFilmSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(filmSearch, 300);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['list-film-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim() || debouncedSearch.length < 2) return [];
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(debouncedSearch)}&page=1`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).filter((r: any) => r.media_type === 'movie' || r.title).slice(0, 8) as SearchResult[];
    },
    enabled: debouncedSearch.length >= 2,
  });

  const createList = useMutation({
    mutationFn: (data: any) => api.post('/lists', data),
    onSuccess: (res: any) => {
      toast.success('List created!');
      const listId = res?.data?.id || res?.id;
      router.push(listId ? `/lists/${listId}` : '/lists');
    },
    onError: () => toast.error('Failed to create list'),
  });

  const addFilm = (film: SearchResult) => {
    if (addedFilms.some(f => f.tmdbId === film.id)) {
      toast.info('Already in list');
      return;
    }
    setAddedFilms(prev => [...prev, {
      tmdbId: film.id,
      title: film.title,
      posterPath: film.poster_path,
      notes: '',
    }]);
    setFilmSearch('');
    setShowResults(false);
  };

  const removeFilm = (tmdbId: number) => {
    setAddedFilms(prev => prev.filter(f => f.tmdbId !== tmdbId));
  };

  const updateNotes = (tmdbId: number, notes: string) => {
    setAddedFilms(prev => prev.map(f => f.tmdbId === tmdbId ? { ...f, notes } : f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    createList.mutate({
      title: title.trim(),
      description: description.trim() || null,
      isPublic,
      isRanked,
      films: addedFilms.map(f => ({ tmdbId: f.tmdbId, notes: f.notes || null })),
    });
  };

  if (isAuthLoading) return null;
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-text-secondary">Please <Link href="/signin" className="text-[#00e054] underline">sign in</Link> to create a list.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container max-w-2xl mx-auto py-10 px-4 space-y-8">
        <Link href="/lists" className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Lists
        </Link>

        <h1 className="text-2xl font-black text-white">Create New List</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle space-y-5">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">List Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. My All-Time Favourites"
                className="w-full bg-elevated text-white px-4 py-3 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-[#00e054] transition-all"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
              <textarea
                placeholder="Describe your list..."
                className="w-full bg-elevated text-white px-4 py-3 rounded-xl border border-border-subtle focus:outline-none focus:ring-1 focus:ring-[#00e054] min-h-[90px] transition-all resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={2000}
              />
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(p => !p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${isPublic ? 'border-[#00e054] text-[#00e054] bg-[#00e054]/10' : 'border-border-subtle text-text-muted hover:border-border-default'}`}
              >
                {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                {isPublic ? 'Public' : 'Private'}
              </button>
              <button
                type="button"
                onClick={() => setIsRanked(r => !r)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${isRanked ? 'border-[#40bcf4] text-[#40bcf4] bg-[#40bcf4]/10' : 'border-border-subtle text-text-muted hover:border-border-default'}`}
              >
                {isRanked ? <ListOrdered size={14} /> : <List size={14} />}
                {isRanked ? 'Ranked' : 'Unranked'}
              </button>
            </div>
          </div>

          {/* Add Films */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle space-y-4">
            <h2 className="text-sm font-bold text-white">Add Films</h2>

            <div className="relative">
              <div className="flex items-center gap-2 bg-elevated rounded-xl border border-border-subtle px-3 focus-within:ring-1 focus-within:ring-[#00e054] transition-all">
                <Search size={14} className="text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search for a film..."
                  className="flex-1 bg-transparent text-white py-3 text-sm focus:outline-none"
                  value={filmSearch}
                  onChange={e => { setFilmSearch(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                {filmSearch && (
                  <button type="button" onClick={() => { setFilmSearch(''); setShowResults(false); }}>
                    <X size={14} className="text-text-muted" />
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              {showResults && debouncedSearch.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-elevated border border-border-subtle rounded-xl overflow-hidden z-50 shadow-xl">
                  {isSearching ? (
                    <div className="p-4 text-center text-text-muted text-sm">Searching...</div>
                  ) : !searchResults?.length ? (
                    <div className="p-4 text-center text-text-muted text-sm">No results found</div>
                  ) : (
                    searchResults.map(film => {
                      const alreadyAdded = addedFilms.some(f => f.tmdbId === film.id);
                      return (
                        <button
                          key={film.id}
                          type="button"
                          onClick={() => addFilm(film)}
                          disabled={alreadyAdded}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-hover transition-colors text-left disabled:opacity-50"
                        >
                          <div className="w-8 h-11 bg-surface rounded overflow-hidden shrink-0">
                            {film.poster_path && (
                              <img src={`https://image.tmdb.org/t/p/w92${film.poster_path}`} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{film.title}</p>
                            {film.release_date && <p className="text-text-muted text-xs">{film.release_date.slice(0,4)}</p>}
                          </div>
                          {alreadyAdded ? (
                            <span className="text-[10px] text-[#00e054] font-bold shrink-0">Added</span>
                          ) : (
                            <Plus size={14} className="text-text-muted shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Added Films */}
            {addedFilms.length > 0 && (
              <div className="space-y-2 mt-2">
                {addedFilms.map((film, idx) => (
                  <div key={film.tmdbId} className="flex items-start gap-3 p-3 bg-elevated rounded-xl group">
                    {isRanked && (
                      <span className="text-text-muted font-black text-sm w-5 text-right shrink-0 pt-1">{idx + 1}</span>
                    )}
                    {film.posterPath && (
                      <img src={`https://image.tmdb.org/t/p/w92${film.posterPath}`} alt="" className="w-8 h-12 object-cover rounded shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{film.title}</p>
                      <input
                        type="text"
                        placeholder="Add a note about this film..."
                        value={film.notes}
                        onChange={e => updateNotes(film.tmdbId, e.target.value)}
                        className="w-full bg-transparent text-text-muted text-xs mt-1 focus:outline-none focus:text-white transition-colors placeholder:text-text-muted/50"
                        maxLength={500}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFilm(film.tmdbId)}
                      className="text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={createList.isPending || !title.trim()}
            className="w-full bg-[#00e054] text-[#14181c] font-bold hover:bg-[#00c745] rounded-xl h-12 text-sm"
          >
            {createList.isPending ? 'Creating...' : `Create List${addedFilms.length > 0 ? ` (${addedFilms.length} film${addedFilms.length > 1 ? 's' : ''})` : ''}`}
          </Button>
        </form>
      </div>
    </div>
  );
}