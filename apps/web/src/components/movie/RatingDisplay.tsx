"use client"

import React from "react"
import { RatingStars } from "./RatingStars"
import { cn } from "@/lib/utils"

interface RatingDisplayProps {
  rating: number // 0-10 scale
  count?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingDisplay({ rating, count, size = "md", className }: RatingDisplayProps) {
  const formattedRating = rating > 0 ? rating.toFixed(1) : "NR"
  
  const textSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RatingStars value={rating} size={size} readonly />
      <div className={cn("flex items-baseline gap-1 font-medium", textSizeClass[size])}>
        <span className="text-foreground">{formattedRating}</span>
        {count !== undefined && count > 0 && (
          <span className="text-[var(--color-text-muted)] font-normal text-xs">
            ({count.toLocaleString()})
          </span>
        )}
      </div>
    </div>
  )
}
