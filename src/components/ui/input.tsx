import * as React from "react"
import { cn } from "../../lib/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border px-4 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow] file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        style={{
          borderColor: 'var(--theme-border-strong)',
          background: 'var(--theme-input)',
          boxShadow: 'var(--theme-inset-highlight), var(--theme-shadow-soft)',
        }}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
