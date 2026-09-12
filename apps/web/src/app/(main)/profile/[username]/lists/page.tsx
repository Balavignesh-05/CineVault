'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { List, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ProfileListsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const { data: profileData } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get<any>(`/users/${username}`).then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['profile-lists', username],
    queryFn: () => api.get<any>(`/collections?username=${username}`).then(r => r.data).catch(() => ({ items: [] })),
    enabled: !!profileData,
  });

  const lists = data?.items || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-white">{username}</span>
          <span className="text-text-muted">&apos;s Lists</span>
        </div>
        <ProfileNavigation username={username} activeTab="lists" counts={{ lists: lists.length }} />

        {isLoading ? (
          <div className="space-y-3 mt-6">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-surface rounded animate-pulse" />)}
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <List className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">{username} hasn&apos;t created any lists yet.</p>
          </div>
        ) : (
          <div className="space-y-3 mt-6">
            {lists.map((list: any) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="flex items-center gap-4 p-4 bg-surface border border-border-subtle rounded-xl hover:border-border-default transition-colors group"
              >
                <div className="flex gap-1 shrink-0">
                  {(list.films || []).slice(0, 3).map((film: any, i: number) => {
                    const url = film.posterUrl
                      ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                      : null;
                    return (
                      <div key={i} className="w-10 h-14 bg-elevated rounded overflow-hidden">
                        {url && <img src={url} alt="" className="w-full h-full object-cover" />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold group-hover:text-[#00e054] transition-colors truncate">{list.title}</h3>
                  <p className="text-xs text-text-muted mt-1">
                    {list.filmCount || 0} films
                    {list.description && ` · ${list.description.slice(0, 60)}...`}
                  </p>
                </div>
                <div className="shrink-0 text-text-muted">
                  {list.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
