'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<{ count: number }>('/notifications/unread').then(res => res.count),
    enabled: !!user,
    refetchInterval: 60000, // Poll every 60s
  });

  if (!user) return null;

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-full"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5 text-text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-error rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
