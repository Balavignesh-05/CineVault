import Link from 'next/link';
import { Sparkles, Film, Tv, Compass, Users } from 'lucide-react';

interface CategoryTabsProps {
  activeTab?: string;
}

export function CategoryTabs({ activeTab = 'For You' }: CategoryTabsProps) {
  const tabs = [
    { name: 'For You', href: '/', icon: Sparkles },
    { name: 'Movies', href: '/films', icon: Film },
    { name: 'TV Shows', href: '/series', icon: Tv },
    { name: 'Discover', href: '/discovery', icon: Compass },
    { name: 'People', href: '/person', icon: Users },
  ];

  return (
    <div className="w-full border-b border-white/[0.06] bg-background/60 backdrop-blur-md sticky top-16 z-30 py-3">
      <div className="container max-w-[1600px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.name === activeTab;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all shrink-0 border ${
                  isActive
                    ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,224,84,0.3)]'
                    : 'bg-surface/80 hover:bg-surface border-white/[0.08] text-white/80 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-primary'} />
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Cinematic subtle live indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-text-muted font-semibold shrink-0">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Curated for You</span>
        </div>
      </div>
    </div>
  );
}
