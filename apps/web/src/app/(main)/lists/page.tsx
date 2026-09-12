'use client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { List, Plus, Lock, Globe, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ListsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: lists, isLoading } = useQuery({
    queryKey: ['my-lists', user?.id],
    queryFn: () => api.get<{ data: { items: any[] } }>(`/collections?userId=${user?.id}`).then(res => res.data.items),
    enabled: isAuthenticated && !!user?.id,
  });

  const deleteList = useMutation({
    mutationFn: (id: string) => api.delete(`/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      toast.success('List deleted');
    },
    onError: () => toast.error('Failed to delete list'),
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <List className="w-12 h-12 text-text-muted mx-auto" />
        <p className="text-text-secondary">Please <Link href="/signin" className="text-[#00e054] underline">sign in</Link> to view your lists.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-10 space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">My Lists</h1>
            <p className="text-sm text-text-muted mt-1">{lists?.length || 0} lists</p>
          </div>
          <Link href="/lists/new">
            <Button className="bg-[#00e054] text-black hover:bg-[#00e054]/90 font-bold rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> New List
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : !lists || lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted bg-surface rounded-xl border border-border-subtle">
            <List className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-bold text-white mb-2">No lists yet</p>
            <p className="text-sm mb-6">Create a list to organise and share your films.</p>
            <Link href="/lists/new">
              <Button className="bg-[#00e054] text-black font-bold hover:bg-[#00e054]/90 rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Create your first list
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list: any) => (
              <div key={list.id} className="group flex items-center gap-4 p-4 bg-surface border border-border-subtle rounded-xl hover:border-border-default transition-colors relative">
                {/* Poster previews */}
                <Link href={`/lists/${list.id}`} className="flex gap-1 shrink-0">
                  {(list.films || []).slice(0, 4).map((film: any, i: number) => {
                    const url = film?.posterUrl
                      ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                      : null;
                    return (
                      <div key={i} className="w-10 h-14 bg-elevated rounded overflow-hidden">
                        {url && <img src={url} alt="" className="w-full h-full object-cover" />}
                      </div>
                    );
                  })}
                  {(!list.films || list.films.length === 0) && (
                    <div className="w-10 h-14 bg-elevated rounded flex items-center justify-center">
                      <List size={16} className="text-text-muted" />
                    </div>
                  )}
                </Link>
                <Link href={`/lists/${list.id}`} className="flex-1 min-w-0">
                  <h3 className="text-white font-bold group-hover:text-[#00e054] transition-colors truncate">{list.title}</h3>
                  <p className="text-xs text-text-muted mt-1">
                    {list.filmCount || list.films?.length || 0} films
                    <span className="mx-2">·</span>
                    {list.isPublic ? <span className="inline-flex items-center gap-1"><Globe size={10} /> Public</span> : <span className="inline-flex items-center gap-1"><Lock size={10} /> Private</span>}
                  </p>
                  {list.description && (
                    <p className="text-xs text-text-muted mt-1 truncate">{list.description}</p>
                  )}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error"
                  onClick={(e) => { e.preventDefault(); if (confirm('Delete this list?')) deleteList.mutate(list.id); }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}