import { motion } from 'framer-motion';
import { BookOpen, Star, Users, List, BarChart2, Search } from 'lucide-react';
import styles from './FeaturesSection.module.css';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Personal Film Diary',
    description: 'Log every film you watch with dates. Build your cinematic history, one entry at a time.',
    color: 'var(--color-accent-primary)',
    bg: 'var(--color-accent-primary-muted)',
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'Half-star precision ratings and long-form reviews with Markdown. Your voice, your critique.',
    color: 'var(--color-accent-secondary)',
    bg: 'rgba(196, 150, 61, 0.12)',
  },
  {
    icon: Users,
    title: 'Social Feed',
    description: 'Follow fellow cinephiles. See what your friends are watching in a curated activity feed.',
    color: 'var(--color-accent-tertiary)',
    bg: 'var(--color-accent-tertiary-muted)',
  },
  {
    icon: List,
    title: 'Curated Lists',
    description: 'Create ranked or unranked lists. The greatest films ever made — according to you.',
    color: 'var(--color-success)',
    bg: 'var(--color-success-muted)',
  },
  {
    icon: BarChart2,
    title: 'Watch Statistics',
    description: 'Deep analytics on your watching habits. Genres, decades, countries — all visualised.',
    color: 'var(--color-info)',
    bg: 'rgba(74, 144, 217, 0.12)',
  },
  {
    icon: Search,
    title: 'Discover Films',
    description: 'Search 900K+ films with advanced filters. Find your next obsession by genre, decade, or director.',
    color: 'var(--color-accent-primary)',
    bg: 'var(--color-accent-primary-muted)',
  },
];

export function FeaturesSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headline}>Everything a cinephile needs</h2>
          <p className={styles.subline}>
            CineVault is built by film lovers, for film lovers. Every feature is designed to
            deepen your relationship with cinema.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          className={styles.grid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              className={styles.featureCard}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div
                className={styles.featureIcon}
                style={{ background: feature.bg, color: feature.color }}
              >
                <feature.icon size={22} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
