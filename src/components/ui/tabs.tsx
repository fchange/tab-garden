import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "motion/react"
import { cn } from "../../lib/cn"

const Tabs = TabsPrimitive.Root

const TabsSelectedContext = React.createContext(false)

function useTabsSelected() {
  return React.useContext(TabsSelectedContext)
}

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
      "relative inline-flex w-fit flex-wrap items-center gap-2 rounded-full border px-[7px] py-[6px]",
      className,
    )}
    style={{
      borderColor: 'var(--theme-border-strong)',
      background: 'var(--theme-surface)',
      boxShadow: 'var(--theme-inset-highlight), 0 10px 28px rgba(0,0,0,0.04)',
    }}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const internalRef = React.useRef<HTMLButtonElement>(null)
  const [selected, setSelected] = React.useState(false)

  React.useEffect(() => {
    const el = internalRef.current
    if (!el) return

    const check = () => setSelected(el.getAttribute("data-state") === "active")
    check()

    const observer = new MutationObserver(check)
    observer.observe(el, { attributes: true, attributeFilter: ["data-state"] })
    return () => observer.disconnect()
  }, [])

  const mergedRef = React.useCallback(
    (node: HTMLButtonElement) => {
      (internalRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
      }
    },
    [ref],
  )

  return (
    <TabsPrimitive.Trigger
      ref={mergedRef}
      className={cn(
        "relative inline-flex min-h-[38px] min-w-[96px] items-center justify-center rounded-full px-5 py-2 text-[14px] leading-[1.4] font-medium transition-[color,transform] duration-250",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "text-muted-foreground/88 hover:text-foreground hover:scale-[1.01]",
        "data-[state=active]:text-primary-foreground",
        className,
      )}
      {...props}
    >
        {selected && (
          <motion.span
            layoutId="tabs-indicator"
          className="absolute inset-0 rounded-full bg-primary"
          style={{
            boxShadow: '0 12px 28px rgba(16,24,28,0.16), inset 0 1px 0 rgba(255,255,255,0.14)',
          }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        />
      )}
      <TabsSelectedContext.Provider value={selected}>
        <span className="relative z-10 flex items-center gap-[6px] whitespace-nowrap">
          {children}
        </span>
      </TabsSelectedContext.Provider>
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("min-h-0 flex-1 outline-none", className)}
    {...props}
  >
    <motion.div
      className="min-h-0 h-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent, useTabsSelected }
