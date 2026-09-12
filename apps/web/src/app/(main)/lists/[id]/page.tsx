'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import { ArrowLeft, Lock, Globe, Edit, Film } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['list', id],
    queryFn: () => api.get<any>(`/collections/${id}`).then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
        <div className="h-64 bg-surface rounded animate-pulse" />
      </div>
    </div>
  );

  if (error || !list) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-text-muted">
      <div className="text-center space-y-4">
        <Film className="w-12 h-12 mx-auto opacity-30" />
        <p>List not found</p>
        <Link href="/lists" className="text-[#00e054] underline text-sm">Back to Lists</Link>
      </div>
    </div>
  );

  const isOwner = user?.id === list.userId;
  const films = list.films || list.listFilms || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-8 py-10">
        <Link href="/lists" className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Lists
        </Link>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {list.isPublic ? <Globe size={14} className="text-text-muted" /> : <Lock size={14} className="text-text-muted" />}
              <span className="text-xs text-text-muted">{list.isPublic ? 'Public' : 'Private'} List</span>
            </div>
            <h1 className="text-3xl font-black text-white">{list.title}</h1>
            {list.description && (
              <p className="text-text-secondary mt-3 max-w-2xl">{list.description}</p>
            )}
            <p className="text-sm text-text-muted mt-2">{films.length} films</p>
          </div>
          {isOwner && (
            <Link href={`/lists/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-subtle text-white rounded-xl text-sm font-bold hover:border-[#00e054] transition-colors">
              <Edit size={14} /> Edit List
            </Link>
          )}
        </div>

        {films.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted bg-surface rounded-xl border border-border-subtle">
            <Film className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">No films in this list yet.</p>
          </div>
        ) : (
          <div className="space-y-px">
            {films.map((entry: any, index: number) => {
              const film = entry.film || entry;
              const posterUrl = film?.posterUrl
                ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                : null;
              return (
                <div key={entry.id || film.id} className="flex items-center gap-4 py-3 px-2 border-b border-border-subtle/30 hover:bg-surface/50 rounded group">
                  {list.isRanked && (
                    <span className="text-lg font-black text-text-muted w-8 text-right shrink-0">{index + 1}</span>
                  )}
                  <Link href={`/movies/${film.tmdbId || film.id}`}>
                    <div className="w-10 h-14 bg-elevated rounded overflow-hidden shrink-0">
                      {posterUrl && <img src={posterUrl} alt={film.title} className="w-full h-full object-cover" />}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/movies/${film.tmdbId || film.id}`} className="text-white font-bold hover:text-[#00e054] transition-colors">
                      {film.title}
                    </Link>
                    {film.releaseDate && (
                      <span className="ml-2 text-xs text-text-muted">{new Date(film.releaseDate).getFullYear()}</span>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-text-muted mt-1 italic">{entry.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
