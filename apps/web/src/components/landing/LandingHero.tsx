'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Users, BookOpen, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './LandingHero.module.css';

const HERO_TAGLINES = [
  'Your cinema. Your story. Your vault.',
  'Log every film. Track every feeling.',
  'Cinema is a mirror by which we often see ourselves.',
  'The world\'s best film tracking community.',
];

const STATS = [
  { icon: BookOpen, label: 'Films Logged', value: '2.4M+' },
  { icon: Star, label: 'Reviews Written', value: '890K+' },
  { icon: Users, label: 'Cinephiles', value: '340K+' },
  { icon: TrendingUp, label: 'Lists Created', value: '1.2M+' },
];

export function LandingHero() {
  const router = useRouter();
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discovery?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.bgGradient1} />
        <div className={styles.bgGradient2} />
        <div className={styles.bgGradient3} />
        <div className={styles.bgNoise} />
      </div>

      <div className={`container ${styles.content}`}>
        {/* Badge */}
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="badge badge-accent">Now in Beta — Free to Join</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className={styles.headline}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Track Films.
          <br />
          <span className={styles.headlineAccent}>Share Stories.</span>
        </motion.h1>

        {/* Rotating Tagline */}
        <div className={styles.taglineWrap}>
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIdx}
              className={styles.tagline}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {HERO_TAGLINES[taglineIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Search */}
        <motion.form
          className={styles.searchForm}
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search for a film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search films"
            />
            <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>
              Search
            </button>
          </div>
        </motion.form>

        {/* CTAs */}
        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/signup" className={`btn btn-primary btn-lg ${styles.ctaPrimary}`}>
            Start Your Vault — Free
          </Link>
          <Link href="/discovery" className={`btn btn-secondary btn-lg`}>
            Explore Films
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.stats}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className={styles.stat}>
              <Icon size={18} className={styles.statIcon} />
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
