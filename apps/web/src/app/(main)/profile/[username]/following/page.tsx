'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data, isLoading } = useQuery({
    queryKey: ['following', username],
    queryFn: () => api.get<{ data: { items: any[] } }>(`/users/${username}/following`),
  });
  const users = data?.data?.items || [];
  return (
    <div className="min-h-screen bg-background text-text-secondary">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl font-black text-white">@{username} is following</h1>
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <Users size={40} className="text-text-muted" />
            <p className="text-text-muted">Not following anyone yet.</p>
          </div>
        ) : (
          users.map((u: any) => (
            <Link key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border-subtle hover:border-primary transition-colors">
              <img src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-white">{u.displayName || u.username}</p>
                <p className="text-xs text-text-muted">@{u.username}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
