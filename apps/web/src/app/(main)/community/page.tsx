'use client';

import { Film, Users, MessageSquare, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="border-b border-border-subtle bg-gradient-to-b from-surface to-background">
        <div className="container py-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Users className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Community</h1>
              <p className="text-sm text-text-muted">Discover, discuss, and connect with fellow film lovers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="text-primary" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Discussions</h2>
            <p className="text-sm text-text-muted">Join conversations about your favourite films, directors, and genres.</p>
            <span className="inline-block text-xs text-text-muted italic">Coming soon</span>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-amber/10 flex items-center justify-center">
              <Trophy className="text-accent-amber" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Challenges</h2>
            <p className="text-sm text-text-muted">Weekly cinema challenges to expand your film vocabulary.</p>
            <span className="inline-block text-xs text-text-muted italic">Coming soon</span>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Film className="text-blue-400" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Film Clubs</h2>
            <p className="text-sm text-text-muted">Create or join curated film clubs and watch together.</p>
            <span className="inline-block text-xs text-text-muted italic">Coming soon</span>
          </div>
        </div>

        <div className="flex flex-col items-center py-12 gap-4 text-center">
          <Users size={48} className="text-text-muted opacity-30" />
          <p className="text-lg font-bold text-text-secondary">Community features are coming soon</p>
          <p className="text-sm text-text-muted max-w-md">
            In the meantime, follow other film lovers from their profile pages and discover what they&apos;re watching.
          </p>
          <Link
            href="/search"
            className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            Find Film Lovers
          </Link>
        </div>
      </div>
    </div>
  );
}