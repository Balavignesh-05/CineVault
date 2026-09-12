import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-accent-primary)] text-white hover:opacity-80",
        secondary:
          "border-transparent bg-surface text-foreground hover:bg-elevated",
        outline: "text-foreground border-[var(--color-border-subtle)]",
        success: "border-transparent bg-emerald-900/30 text-emerald-400",
        warning: "border-transparent bg-yellow-900/30 text-yellow-400",
        amber: "border-transparent bg-[var(--color-accent-amber)]/20 text-[var(--color-accent-amber)]",
        violet: "border-transparent bg-[var(--color-accent-violet)]/20 text-[var(--color-accent-violet)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
