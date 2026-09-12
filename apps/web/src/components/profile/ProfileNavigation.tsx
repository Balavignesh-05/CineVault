import React from 'react';
import Link from 'next/link';

interface ProfileNavigationProps {
  username: string;
  activeTab: 'profile' | 'activity' | 'films' | 'diary' | 'reviews' | 'watchlist' | 'lists' | 'likes';
  counts?: {
    films?: number;
    diary?: number;
    reviews?: number;
    watchlist?: number;
    lists?: number;
    likes?: number;
  };
}

export function ProfileNavigation({ username, activeTab, counts = {} }: ProfileNavigationProps) {
  const tabs = [
    { id: 'profile', label: 'Profile', href: `/profile/${username}` },
    { id: 'films', label: 'Films', href: `/profile/${username}/films`, count: counts.films },
    { id: 'diary', label: 'Diary', href: `/profile/${username}/diary`, count: counts.diary },
    { id: 'reviews', label: 'Reviews', href: `/profile/${username}/reviews`, count: counts.reviews },
    { id: 'watchlist', label: 'Watchlist', href: `/profile/${username}/watchlist`, count: counts.watchlist },
    { id: 'lists', label: 'Lists', href: `/profile/${username}/lists`, count: counts.lists },
    { id: 'likes', label: 'Likes', href: `/profile/${username}/likes`, count: counts.likes },
    { id: 'activity', label: 'Activity', href: `/profile/${username}/activity` },
  ];

  return (
    <nav className="border-b border-border-subtle overflow-x-auto">
      <ul className="flex items-center min-w-max">
        {tabs.map(tab => (
          <li key={tab.id}>
            <Link
              href={tab.href}
              className={`block py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors relative ${
                activeTab === tab.id ? 'text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-text-muted font-normal normal-case tracking-normal">({tab.count})</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00e054] rounded-t-full" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
