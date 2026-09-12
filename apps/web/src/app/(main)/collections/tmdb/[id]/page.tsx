import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Film } from 'lucide-react';
import { MediaCard } from '@/components/media/MediaCard';

export const dynamic = 'force-dynamic';

async function getCollectionDetails(id: number) {
  const res = await fetch(`https://api.themoviedb.org/3/collection/${id}?api_key=${process.env.TMDB_API_KEY}`, {
    next: { revalidate: 86400 } // Cache for 24 hours
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TMDBCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collectionId = Number(id);
  
  if (isNaN(collectionId)) {
    return <div className="p-8 text-center text-text-muted">Invalid collection ID.</div>;
  }

  const collection = await getCollectionDetails(collectionId);

  if (!collection) {
    return <div className="p-8 text-center text-text-muted">Collection not found.</div>;
  }

  const backdropUrl = collection.backdrop_path ? `https://image.tmdb.org/t/p/w1280${collection.backdrop_path}` : null;
  const posterUrl = collection.poster_path ? `https://image.tmdb.org/t/p/w500${collection.poster_path}` : null;

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      {/* Hero Backdrop */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-surface overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={collection.name}
            fill
            priority
            className="object-cover opacity-50"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-24 relative z-10 space-y-8">
        <Link href="/films" className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Movies
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-48 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border-subtle bg-surface aspect-[2/3] relative">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={collection.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">No Poster</div>
            )}
          </div>

          <div className="flex-1 pt-4 space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-white">{collection.name}</h1>
            {collection.overview && (
              <p className="text-text-muted max-w-3xl leading-relaxed">{collection.overview}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-text-muted font-semibold bg-surface border border-border-subtle px-4 py-2 rounded-lg w-fit">
              <Film size={16} className="text-primary" />
              {collection.parts?.length || 0} Films
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Movies in Collection</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {collection.parts?.sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()).map((movie: any) => (
              <MediaCard key={movie.id} media={{
                id: movie.id,
                title: movie.title,
                posterPath: movie.poster_path,
                releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                voteAverage: movie.vote_average,
                mediaType: 'movie'
              } as any} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
