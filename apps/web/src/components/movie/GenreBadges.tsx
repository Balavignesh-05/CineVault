"use client"

import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TMDBGenre } from "@/lib/tmdb/types"

interface GenreBadgesProps {
  genreIds?: number[]
  genreMap?: Map<number, string>
  genres?: TMDBGenre[]
  max?: number
  className?: string
}

export function GenreBadges({
  genreIds,
  genreMap,
  genres,
  max = 3,
  className,
}: GenreBadgesProps) {
  let displayGenres: TMDBGenre[] = []

  if (genres) {
    displayGenres = genres
  } else if (genreIds && genreMap) {
    displayGenres = genreIds
      .map((id) => ({ id, name: genreMap.get(id) || "" }))
      .filter((g) => g.name !== "")
  }

  if (displayGenres.length === 0) return null

  const visibleGenres = displayGenres.slice(0, max)
  const remainingCount = displayGenres.length - max

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visibleGenres.map((genre) => (
        <Link key={genre.id} href={`/search?genre=${genre.id}`}>
          <Badge
            variant="secondary"
            className="hover:bg-[var(--color-accent-primary)] hover:text-white transition-colors cursor-pointer text-[10px] sm:text-xs"
          >
            {genre.name}
          </Badge>
        </Link>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}
