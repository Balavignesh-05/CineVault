'use client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import { Film, Eye, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ['my-logs-recent'],
    queryFn: () => api.get<{ data: any }>('/logs/me?limit=10').then(res => res.data),
    enabled: isAuthenticated,
  });

  const { data: watchlistData, isLoading: isWatchlistLoading } = useQuery({
    queryKey: ['my-watchlist-count'],
    queryFn: () => api.get<{ data: any }>('/watchlist?limit=1').then(res => res.data),
    enabled: isAuthenticated,
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  if (!isAuthenticated) return <div className="p-8 text-center text-text-secondary">Please sign in to view your dashboard.</div>;

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-10 space-y-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.displayName || user?.username}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/diary" className="block p-6 rounded-xl bg-surface border border-border-subtle hover:border-primary transition-colors">
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-lg font-medium text-white">Diary</h3>
                <p className="text-text-muted">Films Logged: {logsData?.total || 0}</p>
              </div>
            </div>
          </Link>

          <Link href="/watchlist" className="block p-6 rounded-xl bg-surface border border-border-subtle hover:border-primary transition-colors">
            <div className="flex items-center gap-4">
              <Eye className="w-8 h-8 text-accent-amber" />
              <div>
                <h3 className="text-lg font-medium text-white">Watchlist</h3>
                <p className="text-text-muted">Items: {watchlistData?.total || 0}</p>
              </div>
            </div>
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Diary Entries</h2>
          {isLogsLoading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : logsData?.logs?.length === 0 ? (
            <div className="p-8 text-center text-text-muted bg-surface rounded-xl border border-border-subtle">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent entries.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logsData?.logs?.map((log: any) => (
                <div key={log.id} className="p-4 rounded-xl bg-surface border border-border-subtle">
                  <p className="text-white font-medium">{log.movieTitle}</p>
                  <p className="text-sm text-text-muted">Watched on {new Date(log.watchedOn).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}