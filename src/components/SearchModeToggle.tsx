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
    tabsMenu: string;
    webMenu: string;
  };
  onToggle: () => void;
  className?: string;
}

export function SearchModeToggle({
  mode,
  display,
  accentColor,
  textColor,
  labels,
  onToggle,
  className,
}: SearchModeToggleProps) {
  const isDetailed = display === 'detailed';

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={mode === 'tabs' ? labels.webMenu : labels.tabsMenu}
      title={mode === 'tabs' ? labels.webMenu : labels.tabsMenu}
      className={cn(
        'h-8 rounded-full border-border/50 bg-muted/35 p-0 text-muted-foreground shadow-none hover:border-border hover:bg-muted/55',
        className,
      )}
      onClick={onToggle}
    >
      <span className={cn('relative grid grid-cols-2 rounded-full p-0.5', isDetailed ? 'w-[124px]' : 'w-[66px]')}>
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
          className="relative z-10 flex h-7 items-center justify-center gap-1.5 text-[11px] font-medium transition-colors"
          style={{ color: mode === 'tabs' ? textColor : undefined }}
        >
          <Tags className="size-3.5" />
          {isDetailed && <span>{labels.tabsMode}</span>}
        </span>
        <span
          className="relative z-10 flex h-7 items-center justify-center gap-1.5 text-[11px] font-medium transition-colors"
          style={{ color: mode === 'web' ? textColor : undefined }}
        >
          <Search className="size-3.5" />
          {isDetailed && <span>{labels.webMode}</span>}
        </span>
      </span>
    </Button>
  );
}
