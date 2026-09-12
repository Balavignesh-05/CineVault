"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  value?: number // 0-10 scale
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingStars({
  value = 0,
  onChange,
  readonly = true,
  size = "md",
  className,
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)
  
  // Convert 0-10 TMDB scale to 0-5 stars
  const displayValue = hoverValue !== null ? hoverValue : value / 2

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    // 0.5 star if left half, 1 star if right half
    const isHalf = x < rect.width / 2
    setHoverValue(index + (isHalf ? 0.5 : 1))
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoverValue(null)
  }

  const handleClick = () => {
    if (readonly || hoverValue === null || !onChange) return
    // Convert 0-5 back to 0-10 scale
    onChange(hoverValue * 2)
  }

  return (
    <div 
      className={cn("flex items-center gap-0.5", !readonly && "cursor-pointer", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fillPercentage = Math.max(0, Math.min(1, displayValue - index)) * 100
        
        return (
          <motion.div
            key={index}
            className="relative"
            whileHover={!readonly ? { scale: 1.1 } : {}}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={handleClick}
            title={!readonly && hoverValue ? `Rate ${hoverValue * 2}/10` : `${value}/10`}
          >
            {/* Background Star */}
            <svg
              className={cn("text-[var(--color-border-subtle)] fill-current", sizeClasses[size])}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>

            {/* Foreground Filled Star */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <svg
                className={cn("text-[var(--color-accent-amber)] fill-current", sizeClasses[size])}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
