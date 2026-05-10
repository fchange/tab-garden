import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/cn"

const badgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full border border-transparent font-medium leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "text-foreground border-border",
        pill: "rounded-full px-3 py-1 text-sm bg-muted text-muted-foreground",
        inline:
          "rounded-full bg-muted text-muted-foreground text-[11px] px-1.5 py-px",
        status: "h-4 px-1.5 text-[12px]",
        tag: "px-2 py-0.5 text-[12px] tracking-[0.01em] opacity-70",
        count: "h-4 min-w-4 px-[5px] text-[12px] font-semibold",
        accent: "h-5 gap-1 px-2 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
