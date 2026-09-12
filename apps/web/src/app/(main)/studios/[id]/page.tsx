import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Film } from 'lucide-react';
import { MediaCard } from '@/components/media/MediaCard';
import { discoverMovies, normalizeMovieCard } from '@/lib/tmdb/client';

export const dynamic = 'force-dynamic';

async function getCompanyDetails(id: number) {
  const res = await fetch(`https://api.themoviedb.org/3/company/${id}?api_key=${process.env.TMDB_API_KEY}`, {
    next: { revalidate: 86400 } // Cache for 24 hours
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function StudioPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { id } = await params;
  const companyId = Number(id);
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  
  if (isNaN(companyId)) {
    return <div className="p-8 text-center text-text-muted">Invalid studio ID.</div>;
  }

  const [company, moviesRes] = await Promise.all([
    getCompanyDetails(companyId),
    discoverMovies({ with_companies: companyId.toString(), page })
  ]);

  if (!company) {
    return <div className="p-8 text-center text-text-muted">Studio not found.</div>;
  }

  const logoUrl = company.logo_path ? `https://image.tmdb.org/t/p/w500${company.logo_path}` : null;
  const movies = moviesRes.results?.map(normalizeMovieCard) || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary py-12 pb-24">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        
        <Link href="/discovery" className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Discovery
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8 items-center bg-surface p-8 rounded-2xl border border-border-subtle">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 bg-white rounded-xl overflow-hidden p-4 relative shadow-lg">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={company.name}
                fill
                className="object-contain p-4"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black font-black text-2xl text-center">
                {company.name}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-white">{company.name}</h1>
            {company.origin_country && (
              <p className="text-text-muted font-bold tracking-widest uppercase">{company.origin_country}</p>
            )}
            <div className="inline-flex items-center gap-2 text-sm text-primary font-bold bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg">
              <Film size={16} />
              {moviesRes.total_results.toLocaleString()} Films Produced
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-6 border-b border-border-subtle pb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Produced Films</h2>
            <div className="text-xs text-text-muted font-mono">Page {page} of {moviesRes.total_pages}</div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MediaCard key={movie.id} media={movie} />
            ))}
          </div>
          
          {moviesRes.total_pages > 1 && (
            <div className="flex justify-center gap-4 pt-12">
              {page > 1 && (
                <Link 
                  href={`/studios/${companyId}?page=${page - 1}`}
                  className="px-6 py-3 bg-surface border border-border-subtle rounded-xl text-white font-bold hover:border-primary transition-colors"
                >
                  Previous Page
                </Link>
              )}
              {page < moviesRes.total_pages && (
                <Link 
                  href={`/studios/${companyId}?page=${page + 1}`}
                  className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary-hover transition-colors"
                >
                  Next Page
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
