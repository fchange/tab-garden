import { Search, Tags } from 'lucide-react';

import { cn } from '../lib/cn';
import type { SearchToggleDisplay } from '../types/settings';
import { Button } from './ui/button';

export type SearchMode = 'tabs' | 'web';

interface SearchModeToggleProps {
  mode: SearchMode;
  display: SearchToggleDisplay;
  accentColor: string;
  textColor: string;
  labels: {
    tabsMode: string;
    webMode: string;
    toggleMode: string;
  };
  onToggle: () => void;
  className?: string;
  variant?: 'pill' | 'preview';
}

export function SearchModeToggle({
  mode,
  display,
  accentColor,
  textColor,
  labels,
  onToggle,
  className,
  variant = 'pill',
}: SearchModeToggleProps) {
  const isDetailed = display === 'detailed';
  const isPreview = variant === 'preview';

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={labels.toggleMode}
      title={labels.toggleMode}
      className={cn(
        isPreview
          ? 'h-8 rounded-full border-[rgba(34,54,50,0.14)] bg-[rgba(34,54,50,0.07)] p-0 text-muted-foreground shadow-[var(--theme-inset-highlight)] hover:border-[rgba(34,54,50,0.22)] hover:bg-[rgba(34,54,50,0.09)] dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]'
          : 'h-8 rounded-full border-border/50 bg-muted/35 p-0 text-muted-foreground shadow-none hover:border-border hover:bg-muted/55',
        className,
      )}
      onClick={onToggle}
    >
      <span
        className={cn(
          'relative grid grid-cols-2 p-0.5',
          'rounded-full',
          isDetailed ? 'w-[124px]' : 'w-[66px]',
        )}
      >
        <span
          className={cn(
            'absolute inset-y-0.5 rounded-full transition-transform duration-200 ease-out',
            isDetailed ? 'w-[60px]' : 'w-[31px]',
          )}
          style={{
            background: accentColor,
            transform: mode === 'tabs' ? 'translateX(2px)' : `translateX(${isDetailed ? 62 : 33}px)`,
          }}
        />
        <span
          className={cn(
            'relative z-10 flex h-7 items-center justify-center gap-1.5 text-[11px] font-medium transition-colors',
            isPreview && 'font-semibold',
          )}
          style={{ color: mode === 'tabs' ? textColor : undefined }}
        >
          <Tags className="size-3.5" />
          {isDetailed && <span>{labels.tabsMode}</span>}
        </span>
        <span
          className={cn(
            'relative z-10 flex h-7 items-center justify-center gap-1.5 text-[11px] font-medium transition-colors',
            isPreview && 'font-semibold',
          )}
          style={{ color: mode === 'web' ? textColor : undefined }}
        >
          <Search className="size-3.5" />
          {isDetailed && <span>{labels.webMode}</span>}
        </span>
      </span>
    </Button>
  );
}
