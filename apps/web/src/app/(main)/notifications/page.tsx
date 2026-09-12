'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, Star, Heart, MessageSquare, UserPlus, List, CheckCheck, Film, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ data: any[] }>('/notifications').then(res => res.data),
    enabled: isAuthenticated,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-20 w-full" /></div>;
  if (!isAuthenticated) return <div className="p-8 text-center text-text-secondary">Please sign in to view notifications.</div>;

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <Button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <Bell className="w-12 h-12 mb-4 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications?.map((notif: any) => {
              const typeStyles: Record<string, string> = {
                like: 'text-red-400',
                follow: 'text-[#00e054]',
                comment: 'text-[#40bcf4]',
                system: 'text-[#ff8000]',
              };
              const colorCls = typeStyles[notif.type] || 'text-text-muted';
              const isRead = notif.isRead;
              return (
                <div key={notif.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${
                  isRead ? 'bg-surface/50 border-border-subtle opacity-70' : 'bg-surface border-border-default'
                }`}>
                  <div className={`${colorCls} mt-0.5 shrink-0`}>
                    {notif.type === 'like' && <Heart className="w-5 h-5" />}
                    {notif.type === 'follow' && <UserPlus className="w-5 h-5" />}
                    {notif.type === 'comment' && <MessageSquare className="w-5 h-5" />}
                    {notif.type === 'review' && <Film className="w-5 h-5" />}
                    {notif.type === 'system' && <Bell className="w-5 h-5" />}
                    {!['like','follow','comment','review','system'].includes(notif.type) && <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{notif.message}</p>
                    <span className="text-[11px] text-text-muted mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#00e054] shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}