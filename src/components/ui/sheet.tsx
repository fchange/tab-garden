import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { AnimatePresence, motion, type Transition } from "motion/react"
import { cn } from "../../lib/cn"

type SheetSide = "right" | "left" | "top" | "bottom" | "center"

const SheetOpenContext = React.createContext(false)

function Sheet({ open, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  return (
    <SheetOpenContext.Provider value={currentOpen}>
      <SheetPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </SheetOpenContext.Provider>
  )
}

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const overlayTransition: Transition = { duration: 0.22, ease: "easeOut" }
const contentEnterTransition: Transition = { type: "spring", stiffness: 430, damping: 34, mass: 0.86 }
const contentExitTransition: Transition = { duration: 0.2, ease: [0.4, 0, 1, 1] }

function getContentOffset(side: SheetSide) {
  if (side === "right") return { x: 28, y: 0, scale: 0.98 }
  if (side === "left") return { x: -28, y: 0, scale: 0.98 }
  if (side === "top") return { x: 0, y: -24, scale: 0.98 }
  if (side === "bottom") return { x: 0, y: 24, scale: 0.98 }
  return { x: 0, y: 0, scale: 0.96 }
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay forceMount asChild {...props}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={overlayTransition}
        className={cn("fixed inset-0 z-40 bg-[rgba(4,10,14,0.18)]", className)}
      />
    </SheetPrimitive.Overlay>
  )
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: SheetSide
  }
>(({ side = "right", className, children, ...props }, ref) => {
  const open = React.useContext(SheetOpenContext)
  const offset = getContentOffset(side)

  return (
    <SheetPortal forceMount>
      <AnimatePresence>
        {open && <SheetOverlay key="overlay" />}
        {open && (
          <SheetPrimitive.Content
            key="content"
            forceMount
            asChild
            aria-describedby={undefined}
            data-side={side}
            {...props}
          >
            <motion.div
              ref={ref}
              initial={{ opacity: 0, ...offset }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, ...offset, transition: contentExitTransition }}
              transition={contentEnterTransition}
              className={cn(
                "fixed z-50 gap-4 border bg-popover/95 p-6 shadow-[var(--theme-shadow-elevated),var(--theme-inset-highlight)] backdrop-blur-xl backdrop-saturate-150",
                side === "right" &&
                  "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
                side === "left" &&
                  "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
                side === "top" &&
                  "inset-x-0 top-0 h-auto border-b",
                side === "bottom" &&
                  "inset-x-0 bottom-0 h-auto border-t",
                side === "center" &&
                  "left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-2xl rounded-lg border",
                className,
              )}
              style={side === "center" ? { translate: "-50% -50%" } : undefined}
            >
              {children}
              <SheetPrimitive.Close className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-black/40 transition hover:bg-black/[0.04] hover:text-black/55 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none dark:text-muted-foreground dark:hover:bg-[var(--theme-surface-strong)] dark:hover:text-foreground">
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            </motion.div>
          </SheetPrimitive.Content>
        )}
      </AnimatePresence>
    </SheetPortal>
  )
})
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
      className={cn("text-lg font-semibold text-foreground", className)}
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
      className={cn("text-sm text-muted-foreground", className)}
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
