'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { MediaCard } from '@/components/media';
import { getPopularFilms } from '../../lib/api/films';
import styles from './PopularFilmsSection.module.css';

export function PopularFilmsSection() {
  const { data: films, isLoading } = useQuery({
    queryKey: ['films', 'popular'],
    queryFn: getPopularFilms,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-h2">Popular This Week</h2>
              <p className="text-body-sm text-secondary" style={{ marginTop: 4 }}>
                Films everyone is watching right now
              </p>
            </div>
          </div>
          <Link href="/discovery" className={`btn btn-ghost btn-sm ${styles.seeAll}`}>
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="film-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ height: 14, borderRadius: 4, marginTop: 8 }} />
                <div className="skeleton" style={{ height: 11, width: '60%', borderRadius: 4, marginTop: 4 }} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="film-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {films?.slice(0, 18).map((film, i) => (
              <motion.div
                key={film.tmdbId}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <MediaCard
                  media={{
                    id: film.tmdbId,
                    title: film.title,
                    releaseYear: film.releaseYear,
                    posterPath: film.posterUrl?.replace('https://image.tmdb.org/t/p/w500', '') || film.posterUrl,
                    voteAverage: film.voteAverage,
                    mediaType: 'movie'
                  } as any}
                  priority={i < 6}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
