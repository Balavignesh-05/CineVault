'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Film, Star, ShieldAlert } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<{ data: any }>('/admin/stats').then(res => res.data),
    enabled: user?.role === 'admin',
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;

  if (!isAuthenticated || user?.role !== 'admin') {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-10 space-y-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {isStatsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface border border-border-subtle flex flex-col items-center justify-center gap-2">
              <Users className="w-8 h-8 text-accent-amber" />
              <span className="text-sm text-text-muted">Total Users</span>
              <span className="text-2xl font-bold text-white">{statsData?.totalUsers || 0}</span>
            </div>
            <div className="p-6 rounded-xl bg-surface border border-border-subtle flex flex-col items-center justify-center gap-2">
              <Film className="w-8 h-8 text-primary" />
              <span className="text-sm text-text-muted">Films Logged</span>
              <span className="text-2xl font-bold text-white">{statsData?.totalLogs || 0}</span>
            </div>
            <div className="p-6 rounded-xl bg-surface border border-border-subtle flex flex-col items-center justify-center gap-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-sm text-text-muted">Total Reviews</span>
              <span className="text-2xl font-bold text-white">{statsData?.totalReviews || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}