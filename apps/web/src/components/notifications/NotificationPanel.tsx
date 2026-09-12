'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Notification } from '@cinevault/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ data: Notification[] }>('/notifications'),
    enabled: open,
  });
  const notifications = notificationsData?.data ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('All marked as read');
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      markReadMutation.mutate(notification.id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-80 max-h-[400px] flex flex-col bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-base">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllReadMutation.mutate()}
              className="h-8 text-xs text-text-muted hover:text-text-primary gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 flex justify-center text-text-muted text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors flex gap-3 cursor-pointer ${!notification.readAt ? 'bg-[var(--color-bg-base)]' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={notification.actor?.avatarUrl ?? undefined} />
                    <AvatarFallback>{notification.actor?.displayName?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)] leading-tight">
                      <span className="font-semibold">{notification.actor?.displayName}</span>{' '}
                      {notification.message ?? notification.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
