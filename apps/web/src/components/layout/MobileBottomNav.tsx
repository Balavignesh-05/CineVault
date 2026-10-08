'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Compass, Bookmark, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { name: 'Home', href: '/', icon: Home, exact: true },
    { name: 'Movies', href: '/films', icon: Film, exact: false },
    { name: 'TV', href: '/series', icon: Tv, exact: false },
    { name: 'Discover', href: '/discovery', icon: Compass, exact: false },
    isAuthenticated
      ? { name: 'Watchlist', href: '/watchlist', icon: Bookmark, exact: false }
      : { name: 'Sign In', href: '/signin', icon: User, exact: false },
  ];

  return (
    <nav 
      aria-label="Mobile navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0f14]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 safe-area-pb"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative group",
                isActive 
                  ? "text-primary" 
                  : "text-text-muted hover:text-white"
              )}
            >
              <div className="relative">
                <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-semibold tracking-tight transition-colors",
                isActive ? "text-white" : "text-text-muted"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
