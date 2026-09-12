import Image from 'next/image';
import Link from 'next/link';
import { SeriesDetailsData } from '@/lib/tmdb/types';
import { Star } from 'lucide-react';

interface SeriesDetailsSectionProps {
  series: SeriesDetailsData;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-border-subtle last:border-0">
      <dt className="text-text-muted text-sm font-medium shrink-0 mr-4">{label}</dt>
      <dd className="text-white text-sm font-semibold text-right">{value}</dd>
    </div>
  );
}

function RatingHistogram({ voteCount, voteAverage }: { voteCount: number; voteAverage: number }) {
  const avg = Math.round(voteAverage);
  const bars = [1,2,3,4,5,6,7,8,9,10].map(rating => {
    const diff = Math.abs(rating - avg);
    const weight = Math.max(5, 100 - diff * 18);
    return { rating, weight: Math.min(100, Math.round(weight)) };
  });
  const maxW = Math.max(...bars.map(b => b.weight));

  return (
    <div className="space-y-1.5">
      {bars.map(({ rating, weight }) => (
        <div key={rating} className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted w-4 text-right font-mono">{rating}</span>
          <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff8000] to-[#00e054] rounded-full"
              style={{ width: `${(weight / maxW) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SeriesDetailsSection({ series }: SeriesDetailsSectionProps) {
  const firstAirFormatted = series.firstAirDate
    ? new Date(series.firstAirDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
    
  const lastAirFormatted = series.lastAirDate
    ? new Date(series.lastAirDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const creators = series.crew.filter(c => c.job === 'Creator' || c.job === 'Executive Producer');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left: Overview + Creators */}
      <div className="lg:col-span-2 space-y-8">
        {series.overview && (
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-white">Storyline</h2>
            {series.tagline && (
              <p className="text-accent-amber italic font-medium text-base">&ldquo;{series.tagline}&rdquo;</p>
            )}
            <p className="text-base text-text-secondary leading-relaxed">{series.overview}</p>
          </section>
        )}

        {creators.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white">Creators & Key Crew</h2>
            <div className="flex flex-wrap gap-2">
              {creators.slice(0, 6).map(creator => (
                <Link
                  key={`${creator.id}-${creator.job}`}
                  href={`/person/${creator.id}`}
                  className="bg-surface px-4 py-2 rounded-xl border border-border-subtle hover:border-primary/40 transition-all group"
                >
                  <p className="font-semibold text-white text-sm group-hover:text-primary transition-colors">{creator.name}</p>
                  <p className="text-xs text-text-muted">{creator.job}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right: Info Sidebar */}
      <aside className="space-y-6">
        {/* Series Info Card */}
        <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-1">
          <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider mb-3">Series Info</h3>
          <dl>
            {series.status && <InfoRow label="Status" value={
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                series.status === 'Ended' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
              }`}>{series.status}</span>
            } />}
            {firstAirFormatted && <InfoRow label="First Aired" value={firstAirFormatted} />}
            {lastAirFormatted && <InfoRow label="Last Aired" value={lastAirFormatted} />}
            <InfoRow label="Seasons" value={series.numberOfSeasons} />
            <InfoRow label="Episodes" value={series.numberOfEpisodes} />
            {series.originalLanguage && <InfoRow label="Language" value={series.originalLanguage.toUpperCase()} />}
            {series.voteCount > 0 && <InfoRow label="Vote Count" value={series.voteCount.toLocaleString()} />}
          </dl>
        </div>

        {/* Rating Histogram */}
        {series.voteAverage > 0 && (
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider">Ratings</h3>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-[#ff8000] text-accent-amber" />
                <span className="text-white font-bold text-sm">{series.voteAverage.toFixed(1)}</span>
              </div>
            </div>
            <RatingHistogram voteCount={series.voteCount} voteAverage={series.voteAverage} />
          </div>
        )}

        {/* Networks */}
        {series.networks.length > 0 && (
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-3">
            <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider">Networks</h3>
            <div className="space-y-3">
              {series.networks.slice(0, 5).map(network => (
                <div key={network.id} className="flex items-center gap-3">
                  {network.logo_path ? (
                    <div className="relative w-12 h-8 bg-white rounded overflow-hidden shrink-0">
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                        alt={network.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-8 bg-elevated rounded flex items-center justify-center shrink-0">
                      <span className="text-[8px] text-text-muted font-bold text-center leading-tight">{network.name.substring(0, 3)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-white">{network.name}</p>
                    {network.origin_country && <p className="text-[10px] text-text-muted">{network.origin_country}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </aside>
    </div>
  );
}
