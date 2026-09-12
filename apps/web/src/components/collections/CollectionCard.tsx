'use client';

import React from 'react';
import type { Collection } from '@cinevault/shared-types';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Unlock, Film, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col h-full rounded-xl overflow-hidden border border-border-subtle bg-surface shadow-sm transition-shadow hover:shadow-lg"
      >
        {/* Cover image */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-elevated to-background overflow-hidden">
          {collection.coverImageUrl ? (
            <Image
              src={collection.coverImageUrl}
              alt={collection.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
              <Film className="w-12 h-12 opacity-20" />
            </div>
          )}

          {/* Visibility badge */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md flex items-center gap-1 text-xs font-medium text-white">
            {collection.isPublic ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            <span>{collection.isPublic ? 'Public' : 'Private'}</span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            <p className="text-white text-sm line-clamp-3 text-center">
              {collection.description ?? 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-text-primary line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {collection.title}
          </h3>
          <p className="text-xs text-text-muted mb-2 line-clamp-1">
            by {collection.author?.displayName ?? collection.author?.username ?? 'Unknown'}
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted mt-auto pt-2 border-t border-border-subtle">
            <div className="flex items-center gap-1">
              <Film className="w-4 h-4" />
              <span>{collection.filmCount} films</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{collection.likeCount}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
