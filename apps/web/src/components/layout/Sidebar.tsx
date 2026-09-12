"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, Compass, Film, Tv, Users, 
  ListOrdered, Bookmark, FolderHeart, BookOpen,
  Settings, User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Discover', href: '/discovery', icon: Compass },
  { name: 'Movies', href: '/films', icon: Film },
  { name: 'TV Shows', href: '/series', icon: Tv },
  { name: 'People', href: '/person', icon: Users },
];

const USER_ITEMS = [
  { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
  { name: 'Collections', href: '/collections', icon: FolderHeart },
  { name: 'Diary', href: '/diary', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] border-r border-border-subtle bg-background fixed left-0 top-0 bottom-0 overflow-y-auto overflow-x-hidden z-40 pb-6 pt-20">
      
      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider pl-3">Menu</p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-text-secondary hover:bg-surface hover:text-text-primary"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    isActive ? "text-primary" : "text-text-muted group-hover:text-text-primary"
                  )} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {isAuthenticated && (
        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider pl-3">Your Vault</p>
          <nav className="space-y-1">
            {USER_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      isActive ? "text-primary" : "text-text-muted group-hover:text-text-primary"
                    )} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="mt-auto px-4 pt-4">
        <p className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider pl-3">General</p>
        <nav className="space-y-1">
          {isAuthenticated && (
            <Link
              href={`/profile/${user?.username}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-all duration-200 group"
            >
              <User className="h-[18px] w-[18px] text-text-muted group-hover:text-text-primary transition-colors" />
              Profile
            </Link>
          )}
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-all duration-200 group"
          >
            <Settings className="h-[18px] w-[18px] text-text-muted group-hover:text-text-primary transition-colors" />
            Settings
          </Link>
        </nav>
      </div>
    </aside>
  );
}
