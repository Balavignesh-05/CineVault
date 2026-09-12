'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface FansSectionProps {
  tmdbId: number;
}

export function FansSection({ tmdbId }: FansSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['fans', tmdbId],
    queryFn: () => api.get<{ data: any[] }>(`/films/${tmdbId}/fans`).then(res => res.data)
  });

  if (isLoading || !data || data.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold text-white uppercase tracking-wider">Fans</h3>
      <div className="flex flex-wrap gap-4">
        {data.map((user) => (
          <Link key={user.id} href={`/profile/${user.username}`} className="flex flex-col items-center gap-2 group">
            <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary transition-colors">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-text-muted group-hover:text-white transition-colors max-w-[60px] truncate text-center">
              {user.displayName || user.username}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
