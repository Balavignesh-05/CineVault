'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images, Maximize2 } from 'lucide-react';

interface TMDBImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
}

interface ImageGalleryProps {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
  movieTitle: string;
}

export function ImageGallery({ backdrops, posters, movieTitle }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'backdrops' | 'posters'>('backdrops');

  const images = activeTab === 'backdrops' ? backdrops : posters;
  const displayImages = images.slice(0, 12);

  if (backdrops.length === 0 && posters.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const prev = () => setCurrentIndex(i => (i > 0 ? i - 1 : displayImages.length - 1));
  const next = () => setCurrentIndex(i => (i < displayImages.length - 1 ? i + 1 : 0));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Images className="text-[#40bcf4]" size={22} />
          Gallery
        </h2>
        <div className="flex items-center gap-1 bg-surface rounded-xl border border-border-subtle p-1">
          {(['backdrops', 'posters'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-[#40bcf4] text-[#14181c]' : 'text-text-secondary hover:text-white'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'backdrops' ? backdrops.length : posters.length})
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-2 ${activeTab === 'backdrops' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'}`}>
        {displayImages.map((img, idx) => (
          <motion.button
            key={img.file_path}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-xl bg-surface group cursor-pointer"
            style={{ aspectRatio: activeTab === 'backdrops' ? '16/9' : '2/3' }}
            onClick={() => openLightbox(idx)}
          >
            <Image
              src={`https://image.tmdb.org/t/p/${activeTab === 'backdrops' ? 'w780' : 'w342'}${img.file_path}`}
              alt={`${movieTitle} ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <Maximize2 size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
              <X size={20} />
            </button>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white text-sm">
              {currentIndex + 1} / {displayImages.length}
            </div>
            {displayImages.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={next} className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl max-h-[90vh] w-full px-16 flex items-center justify-center"
            >
              <div className="relative w-full" style={{ aspectRatio: activeTab === 'backdrops' ? '16/9' : '2/3', maxHeight: '85vh' }}>
                {displayImages[currentIndex] && (
                  <Image
                    src={`https://image.tmdb.org/t/p/original${displayImages[currentIndex].file_path}`}
                    alt={`${movieTitle} ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                )}
              </div>
            </motion.div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 max-w-[80vw] overflow-x-auto pb-1">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative shrink-0 rounded overflow-hidden transition-all ${idx === currentIndex ? 'ring-2 ring-[#00e054]' : 'opacity-50 hover:opacity-100'}`}
                  style={{ width: 48, height: 30 }}
                >
                  <Image src={`https://image.tmdb.org/t/p/w92${img.file_path}`} alt="" fill className="object-cover" sizes="48px" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
