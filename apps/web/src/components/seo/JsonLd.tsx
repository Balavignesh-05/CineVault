'use client';

import React from 'react';

interface MovieJsonLdProps {
  type: 'Movie';
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
  director?: string;
  ratingValue?: number;
  ratingCount?: number;
}

interface ReviewJsonLdProps {
  type: 'Review';
  author: string;
  itemReviewedName: string;
  reviewBody: string;
  ratingValue?: number;
}

type JsonLdProps = MovieJsonLdProps | ReviewJsonLdProps;

export function JsonLd(props: JsonLdProps) {
  let schemaData: Record<string, any> = {};

  if (props.type === 'Movie') {
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: props.title,
      description: props.description,
      ...(props.image && { image: props.image }),
      ...(props.datePublished && { datePublished: props.datePublished }),
      ...(props.director && {
        director: {
          '@type': 'Person',
          name: props.director,
        },
      }),
      ...(props.ratingValue && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: props.ratingValue,
          ratingCount: props.ratingCount || 1,
          bestRating: 10,
          worstRating: 1,
        },
      }),
    };
  } else if (props.type === 'Review') {
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: props.author,
      },
      itemReviewed: {
        '@type': 'Movie',
        name: props.itemReviewedName,
      },
      reviewBody: props.reviewBody,
      ...(props.ratingValue && {
        reviewRating: {
          '@type': 'Rating',
          ratingValue: props.ratingValue,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
