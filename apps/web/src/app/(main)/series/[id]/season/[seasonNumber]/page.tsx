import { notFound } from 'next/navigation';
import Image from 'next/image';

interface Props { params: Promise<{ id: string; seasonNumber: string }> }

async function getSeasonDetails(seriesId: number, seasonNumber: number) {
  const TMDB_KEY = process.env.TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${TMDB_KEY}`, { 
    next: { revalidate: 3600 },
    headers: { 'User-Agent': 'CineVault/1.0 (Next.js Node Fetch)' }
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SeasonPage({ params }: Props) {
  const { id, seasonNumber } = await params;
  const season = await getSeasonDetails(Number(id), Number(seasonNumber));
  if (!season) notFound();
  return (
    <main className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-12 space-y-8">
        <h1 className="text-3xl font-black text-white">{season.name}</h1>
        {season.overview && <p className="text-text-secondary max-w-3xl">{season.overview}</p>}
        <div className="space-y-4">
          {(season.episodes || []).map((ep: any) => (
            <div key={ep.id} className="flex gap-4 p-4 rounded-xl bg-surface border border-border-subtle">
              {ep.still_path && (
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0">
                  <Image src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted font-mono">Episode {ep.episode_number}</p>
                <h3 className="font-bold text-white">{ep.name}</h3>
                {ep.overview && <p className="text-sm text-text-secondary line-clamp-2 mt-1">{ep.overview}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
