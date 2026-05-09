import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "../../lib/cn"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />
}

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      style={{ background: 'rgba(4, 10, 14, 0.26)' }}
      {...props}
    />
  )
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: "right" | "left" | "top" | "bottom"
  }
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 border border-border bg-card p-5 transition ease-in-out",
        side === "right" &&
          "right-4 top-4 bottom-4 w-[min(420px,calc(100vw-32px))] rounded-[30px] data-[state=closed]:translate-x-8 data-[state=open]:translate-x-0",
        side === "left" &&
          "left-4 top-4 bottom-4 w-[min(420px,calc(100vw-32px))] rounded-[30px] data-[state=closed]:-translate-x-8 data-[state=open]:translate-x-0",
        side === "top" &&
          "inset-x-4 top-4 h-auto rounded-[30px] data-[state=closed]:-translate-y-8 data-[state=open]:translate-y-0",
        side === "bottom" &&
          "inset-x-4 bottom-4 h-auto rounded-[30px] data-[state=closed]:translate-y-8 data-[state=open]:translate-y-0",
        className,
      )}
      style={{
        borderColor: 'var(--theme-border-strong)',
        boxShadow: 'var(--theme-shadow-elevated), var(--theme-inset-highlight)',
      }}
      {...props}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: side === "right" ? 32 : side === "left" ? -32 : 0, y: side === "top" ? -32 : side === "bottom" ? 32 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: side === "right" ? 32 : side === "left" ? -32 : 0, y: side === "top" ? -32 : side === "bottom" ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-xl font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-base text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
