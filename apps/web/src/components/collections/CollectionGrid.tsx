'use client';

import React from 'react';
import { Collection } from '@cinevault/shared-types';
import { CollectionCard } from './CollectionCard';

interface CollectionGridProps {
  collections: Collection[];
  loading?: boolean;
}

export function CollectionGrid({ collections, loading }: CollectionGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted bg-bg-surface rounded-xl border border-border-subtle flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-xl font-semibold mb-2">No Collections Found</h3>
        <p>Create a collection to start organizing your favorite films.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
