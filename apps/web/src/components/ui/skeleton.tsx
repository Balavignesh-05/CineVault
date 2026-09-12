import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface border border-[var(--color-border-subtle)]/50", className)}
      {...props}
    />
  )
}

function SkeletonText({ className, lines = 1, ...props }: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4 w-full", i === lines - 1 && lines > 1 ? "w-2/3" : "")} />
      ))}
    </div>
  )
}

function SkeletonPoster({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("aspect-[2/3] w-full rounded-xl", className)} {...props} />
  )
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-3", className)} {...props}>
      <SkeletonPoster />
      <div className="space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonPoster, SkeletonCard }
