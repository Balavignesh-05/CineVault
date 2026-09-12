'use client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Layers, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CollectionsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.get<{ data: any }>('/collections/me?limit=50').then(res => res.data),
    enabled: isAuthenticated,
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  if (!isAuthenticated) return <div className="p-8 text-center text-text-secondary">Please sign in to view your collections.</div>;

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Collections</h1>
          </div>
          <Link href="/collections/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Collection
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : collections?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted bg-surface rounded-xl border border-border-subtle">
            <Layers className="w-12 h-12 mb-4 opacity-50" />
            <p>You have no collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {collections?.map((col: any) => (
              <div key={col.id} className="p-6 rounded-xl bg-surface border border-border-subtle hover:border-primary transition-colors cursor-pointer">
                <h3 className="text-lg font-bold text-white mb-2">{col.name}</h3>
                <p className="text-sm text-text-muted">{col.itemsCount || 0} items</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}