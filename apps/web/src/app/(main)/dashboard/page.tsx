'use client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import { Film, Eye, BookOpen, User, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-[1600px] px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 rounded-2xl bg-surface border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mx-auto">
            <User size={22} />
          </div>
          <h2 className="text-xl font-bold text-white">Sign In to View Dashboard</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Your personal dashboard aggregates recent diary logs, watchlist statistics, and cinema activity.
          </p>
          <Button asChild className="w-full bg-primary text-black font-bold hover:bg-primary-hover rounded-xl">
            <Link href="/signin">Sign In to CineVault</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.displayName || user?.username}!
            </h1>
            <p className="text-xs text-text-muted mt-1">Here is a summary of your cinema logs and watchlist</p>
          </div>
          <Link
            href={`/profile/${user?.username}`}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View Public Profile <ArrowRight size={13} />
          </Link>
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link 
            href="/diary" 
            className="group block p-6 rounded-2xl bg-surface/80 border border-white/[0.08] hover:border-primary/50 hover:bg-surface transition-all shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">Digital Diary</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Films Logged: <span className="font-semibold text-white">{logsData?.total ?? 0}</span>
                </p>
              </div>
            </div>
          </Link>

          <Link 
            href="/watchlist" 
            className="group block p-6 rounded-2xl bg-surface/80 border border-white/[0.08] hover:border-accent-amber/50 hover:bg-surface transition-all shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Eye size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Watchlist</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Saved Titles: <span className="font-semibold text-white">{watchlistData?.total ?? 0}</span>
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Diary Entries</h2>
            <Link href="/diary" className="text-xs font-semibold text-primary hover:underline">
              See all entries →
            </Link>
          </div>

          {isLogsLoading ? (
            <Skeleton className="h-28 w-full rounded-2xl" />
          ) : !logsData?.logs || logsData.logs.length === 0 ? (
            <div className="p-8 text-center text-text-muted bg-surface/50 rounded-2xl border border-white/[0.06] space-y-2">
              <Film className="w-8 h-8 mx-auto opacity-40 text-text-muted" />
              <p className="text-xs font-semibold text-white">No recent entries</p>
              <p className="text-[11px]">When you log movies or TV shows, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {logsData.logs.map((log: any) => (
                <div key={log.id} className="p-4 rounded-xl bg-surface/80 border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{log.movieTitle}</p>
                    <p className="text-xs text-text-muted mt-0.5">Watched on {new Date(log.watchedOn).toLocaleDateString()}</p>
                  </div>
                  {log.rating && (
                    <span className="text-xs font-black text-amber-400">★ {log.rating}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}