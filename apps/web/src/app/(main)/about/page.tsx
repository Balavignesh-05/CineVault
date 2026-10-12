import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Film, ShieldCheck, Database, Heart, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About & TMDB Legal Attribution',
  description: 'Learn more about CineVault, platform credits, privacy details, and official TMDB data attribution.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text-secondary py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="space-y-4 text-center sm:text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
          <Film className="text-primary" size={32} /> About CineVault
        </h1>
        <p className="text-base text-text-muted leading-relaxed">
          CineVault is a modern movie discovery, tracking, and social media platform built for cinema enthusiasts worldwide.
        </p>
      </div>

      {/* TMDB Legal Attribution Section */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 bg-surface/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-primary">
          <Database size={24} />
          <h2 className="text-xl font-bold text-white">TMDB Data & API Attribution</h2>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          CineVault uses movie metadata, poster artwork, backdrops, cast & crew details, and popularity rankings powered by The Movie Database (TMDB).
        </p>

        {/* Required TMDB Wording & Logo */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <p className="text-xs sm:text-sm text-white font-medium italic">
            &ldquo;This product uses the TMDB API but is not endorsed or certified by TMDB.&rdquo;
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-text-muted">Data provider</span>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
            >
              The Movie Database (TMDB) <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Platform Architecture & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ShieldCheck size={20} />
            <h3 className="text-white">Security & Privacy</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            User credentials and personal tokens are protected with industry-standard bcrypt hashing, secure HTTP-only cookies, and encrypted transport layers.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Heart size={20} />
            <h3 className="text-white">Built for Cinephiles</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Organize watchlists, write detailed reviews, explore genre discoveries, and leverage AI recommendations tailored to your watching habits.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-8 border-t border-white/5 space-y-2">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} CineVault. All rights reserved.
        </p>
      </div>
    </div>
  );
}
