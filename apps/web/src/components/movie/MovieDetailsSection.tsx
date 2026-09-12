import Image from 'next/image';
import Link from 'next/link';
import { MovieDetailsData } from '@/lib/tmdb/types';
import { Separator } from '@/components/ui/separator';
import { Clock, Globe, DollarSign, TrendingUp, Calendar, Star } from 'lucide-react';

interface MovieDetailsSectionProps {
  movie: MovieDetailsData;
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
  // Generate simulated distribution around the average
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

export function MovieDetailsSection({ movie }: MovieDetailsSectionProps) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const releaseFormatted = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const runtimeHours = movie.runtime ? Math.floor(movie.runtime / 60) : 0;
  const runtimeMins = movie.runtime ? movie.runtime % 60 : 0;
  const runtimeStr = movie.runtime
    ? `${runtimeHours > 0 ? `${runtimeHours}h ` : ''}${runtimeMins}m`
    : null;

  // Spoken languages from raw movie data (may be in movie directly)
  const spokenLangs = (movie as any).spokenLanguages || (movie as any).spoken_languages || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left: Overview + Director + Writers */}
      <div className="lg:col-span-2 space-y-8">
        {movie.overview && (
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-white">Storyline</h2>
            {(movie as any).tagline && (
              <p className="text-accent-amber italic font-medium text-base">&ldquo;{(movie as any).tagline}&rdquo;</p>
            )}
            <p className="text-base text-text-secondary leading-relaxed">{movie.overview}</p>
          </section>
        )}

        {movie.director && (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white">Director</h2>
            <Link
              href={`/person/${movie.director.id}`}
              className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border-subtle hover:border-primary/40 transition-all w-fit group"
            >
              {movie.director.profile_path ? (
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${movie.director.profile_path}`}
                    alt={movie.director.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-elevated flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-text-secondary">{movie.director?.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">{movie.director.name}</h3>
                <p className="text-sm text-text-muted">Director</p>
              </div>
            </Link>
          </section>
        )}

        {movie.writers.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white">Writers</h2>
            <div className="flex flex-wrap gap-2">
              {movie.writers.map(writer => (
                <Link
                  key={`${writer.id}-${writer.job}`}
                  href={`/person/${writer.id}`}
                  className="bg-surface px-4 py-2 rounded-xl border border-border-subtle hover:border-primary/40 transition-all group"
                >
                  <p className="font-semibold text-white text-sm group-hover:text-primary transition-colors">{writer.name}</p>
                  <p className="text-xs text-text-muted">{writer.job}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right: Info Sidebar */}
      <aside className="space-y-6">
        {/* Movie Info Card */}
        <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-1">
          <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider mb-3">Movie Info</h3>
          <dl>
            {movie.status && <InfoRow label="Status" value={
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                movie.status === 'Released' ? 'bg-primary/10 text-primary' : 'bg-accent-amber/10 text-accent-amber'
              }`}>{movie.status}</span>
            } />}
            {releaseFormatted && <InfoRow label="Release Date" value={releaseFormatted} />}
            {runtimeStr && <InfoRow label="Runtime" value={runtimeStr} />}
            {movie.originalLanguage && <InfoRow label="Language" value={movie.originalLanguage.toUpperCase()} />}
            {movie.budget > 0 && <InfoRow label="Budget" value={currencyFormatter.format(movie.budget)} />}
            {movie.revenue > 0 && <InfoRow label="Revenue" value={currencyFormatter.format(movie.revenue)} />}
            {movie.voteCount > 0 && <InfoRow label="Vote Count" value={movie.voteCount.toLocaleString()} />}
          </dl>
        </div>

        {/* Rating Histogram */}
        {movie.voteAverage > 0 && (
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider">Ratings</h3>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-[#ff8000] text-accent-amber" />
                <span className="text-white font-bold text-sm">{movie.voteAverage.toFixed(1)}</span>
              </div>
            </div>
            <RatingHistogram voteCount={movie.voteCount} voteAverage={movie.voteAverage} />
          </div>
        )}

        {/* Production Companies */}
        {movie.productionCompanies.length > 0 && (
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-3">
            <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider">Production</h3>
            <div className="space-y-3">
              {movie.productionCompanies.slice(0, 5).map(company => (
                <Link key={company.id} href={`/studios/${company.id}`} className="flex items-center gap-3 group">
                  {company.logo_path ? (
                    <div className="relative w-12 h-8 bg-white rounded overflow-hidden shrink-0 group-hover:ring-2 group-hover:ring-primary transition-all">
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                        alt={company.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-8 bg-elevated rounded flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-primary transition-all">
                      <span className="text-[8px] text-text-muted font-bold text-center leading-tight">{company.name.substring(0, 3)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-white group-hover:text-primary transition-colors">{company.name}</p>
                    {company.origin_country && <p className="text-[10px] text-text-muted">{company.origin_country}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Countries */}
        {movie.productionCountries.length > 0 && (
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-3">
            <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider">Countries</h3>
            <div className="flex flex-wrap gap-2">
              {movie.productionCountries.map(country => (
                <Link
                  key={country.iso_3166_1}
                  href={`/films?language=${country.iso_3166_1}`}
                  className="px-2.5 py-1 bg-elevated hover:bg-[#3d4a56] rounded-lg text-xs font-medium text-white transition-colors"
                >
                  {country.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Spoken Languages */}
        {spokenLangs.length > 0 && (
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle space-y-3">
            <h3 className="text-sm font-black text-text-secondary uppercase tracking-wider">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {spokenLangs.map((lang: any) => (
                <span
                  key={lang.iso_639_1 || lang.english_name}
                  className="px-2.5 py-1 bg-elevated rounded-lg text-xs font-medium text-white"
                >
                  {lang.english_name || lang.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
