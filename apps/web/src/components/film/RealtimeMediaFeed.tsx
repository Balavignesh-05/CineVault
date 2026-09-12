'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Film, Tv, Clock, RefreshCw, Star, Sparkles, ChevronRight } from 'lucide-react';
import { MediaCard } from '@/components/media';

type FeedTab = 'trending' | 'now_playing' | 'tv_airing' | 'upcoming';

export function RealtimeMediaFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('trending');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRealtimeData = async (tab: FeedTab) => {
    setIsLoading(true);
    try {
      let endpoint = '/api/tmdb/trending';
      if (tab === 'now_playing') endpoint = '/api/tmdb/now-playing';
      if (tab === 'upcoming') endpoint = '/api/tmdb/upcoming';
      if (tab === 'tv_airing') endpoint = '/api/tmdb/popular'; // Proxy endpoint for series/shows

      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        const results = json.data?.results ?? json.data ?? [];
        setItems(results.slice(0, 12));
      }
    } catch (err) {
      console.error('Failed to fetch real-time media feed:', err);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchRealtimeData(activeTab);
  }, [activeTab]);

  return (
    <section className="space-y-6 p-6 rounded-3xl bg-surface border border-border-subtle shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              Real-Time Global Feed
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Live Movies & Web Series
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-text-muted">
              Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={() => fetchRealtimeData(activeTab)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-background border border-border-subtle text-text-secondary hover:text-primary hover:border-primary transition-colors"
            title="Refresh Realtime Feed"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
            activeTab === 'trending'
              ? 'bg-primary text-[#14181c] shadow-[0_0_12px_rgba(0,224,84,0.3)]'
              : 'bg-background border border-border-subtle text-text-secondary hover:text-white'
          }`}
        >
          <Flame size={14} /> Trending Today
        </button>

        <button
          onClick={() => setActiveTab('now_playing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
            activeTab === 'now_playing'
              ? 'bg-accent-amber text-white shadow-[0_0_12px_rgba(255,128,0,0.3)]'
              : 'bg-background border border-border-subtle text-text-secondary hover:text-white'
          }`}
        >
          <Film size={14} /> In Theaters Now
        </button>

        <button
          onClick={() => setActiveTab('tv_airing')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'tv_airing' ? 'bg-[#40bcf4] text-[#14181c] shadow-[0_0_15px_rgba(64,188,244,0.4)]' : 'bg-surface border border-border-subtle hover:border-[#40bcf4]'
          }`}
        >
          <Tv size={14} /> Airing Web Series
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'bg-background border border-border-subtle text-text-secondary hover:text-white'
          }`}
        >
          <Clock size={14} /> Upcoming Releases
        </button>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-background animate-pulse border border-border-subtle" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center space-y-2 text-text-muted">
          <Sparkles size={32} className="mx-auto" />
          <p className="text-xs font-mono">Real-time data feeds loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {items.map((item, idx) => {
            const mediaType = activeTab === 'tv_airing' ? 'tv' : 'movie';
            const mediaItem = {
              id: item.id,
              title: item.name || item.title,
              posterPath: item.poster_path,
              releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear() : (item.release_date ? new Date(item.release_date).getFullYear() : 2026),
              voteAverage: item.vote_average || 8.2,
              mediaType: mediaType,
            } as any;
            return (
              <MediaCard
                key={item.id || idx}
                media={mediaItem}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
