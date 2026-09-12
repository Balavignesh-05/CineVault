import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://cinevault.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://cinevault.app/films', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://cinevault.app/series', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://cinevault.app/discovery', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://cinevault.app/search', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];
}
