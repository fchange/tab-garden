interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-6 py-16 text-center text-muted-foreground">
      <div className="flex size-16 items-center justify-center rounded-[22px] bg-white/45 shadow-[var(--theme-shadow-soft),var(--theme-inset-highlight)] ring-1 ring-white/50 dark:bg-white/[0.045] dark:ring-white/[0.08]">
        <img src="/logo.png" alt="" className="size-11 object-contain opacity-75 grayscale-[0.1]" draggable={false} />
      </div>
      <div className="space-y-3">
        <p className="font-ornament-2 text-[20px] font-normal tracking-[0.08em] text-foreground/70 dark:text-foreground/75">
          {title}
        </p>
        {description && <p className="text-[13px] text-muted-foreground/75">{description}</p>}
      </div>
    </div>
  );
}
