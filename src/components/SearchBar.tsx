import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Command, Search, Tags } from 'lucide-react';

import { cn } from '../lib/cn';
import { queryDefaultSearchProvider } from '../lib/defaultSearch';
import { useAccent, useCopy, useSettingsContext } from '../lib/appContext';
import { SearchModeToggle, type SearchMode } from './SearchModeToggle';
import { Input } from './ui/input';

function getReadableTextColor(hex: string) {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const luminance = 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);

  return luminance > 0.58 ? '#17211f' : '#ffffff';
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  const copy = useCopy();
  const { settings } = useSettingsContext();
  const { accentColor } = useAccent();
  const labels = copy.search;
  const [mode, setMode] = useState<SearchMode>('tabs');
  const [webQuery, setWebQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValue = mode === 'tabs' ? value : webQuery;
  const modeTextColor = getReadableTextColor(accentColor);
  const nextMode = mode === 'tabs' ? 'web' : 'tabs';
  const isDetailedToggle = settings.searchToggleDisplay === 'detailed';

  const handleSubmit = () => {
    if (mode === 'tabs') return;
    void queryDefaultSearchProvider(webQuery);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="group relative w-full overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--search-accent,var(--theme-border-strong))_22%,var(--theme-border-strong))] bg-[var(--theme-input)] shadow-[var(--theme-inset-highlight),0_8px_24px_rgba(15,23,42,0.035)] backdrop-blur-md transition-all duration-500 ease-out hover:border-[color-mix(in_srgb,var(--search-accent,var(--theme-border-strong))_36%,var(--theme-border-strong))] hover:bg-[var(--theme-surface-strong)] hover:shadow-[var(--theme-inset-highlight),0_10px_28px_rgba(15,23,42,0.06)] focus-within:border-[color-mix(in_srgb,var(--search-accent,var(--theme-ring))_46%,transparent)] focus-within:bg-[var(--theme-surface-strong)] focus-within:shadow-[var(--theme-inset-highlight),var(--theme-shadow-soft),0_0_0_2px_color-mix(in_srgb,var(--search-accent,var(--theme-ring))_10%,transparent),0_0_0_5px_color-mix(in_srgb,var(--search-accent,var(--theme-ring))_12%,transparent),0_10px_42px_color-mix(in_srgb,var(--search-accent,var(--theme-ring))_14%,transparent)] focus-within:hover:border-[color-mix(in_srgb,var(--search-accent,var(--theme-ring))_46%,transparent)] focus-within:hover:bg-[var(--theme-surface-strong)] focus-within:hover:shadow-[var(--theme-inset-highlight),var(--theme-shadow-soft),0_0_0_2px_color-mix(in_srgb,var(--search-accent,var(--theme-ring))_10%,transparent),0_0_0_5px_color-mix(in_srgb,var(--search-accent,var(--theme-ring))_12%,transparent),0_10px_42px_color-mix(in_srgb,var(--search-accent,var(--theme-ring))_14%,transparent)]"
      style={{ '--theme-ring': accentColor, '--search-accent': accentColor } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-focus-within:opacity-100">
        <div className="h-full w-full rounded-full bg-[color-mix(in_srgb,var(--search-accent)_20%,transparent)] animate-[search-breathe_5s_ease-in-out_infinite]" />
      </div>

      <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-[18px] -translate-y-1/2 overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:scale-[1.03]">
        <Tags
          className={cn(
            'absolute inset-0 size-[18px] text-muted-foreground/65 will-change-transform transition-[opacity,transform,color] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:text-[var(--search-accent)]',
            mode === 'tabs' ? 'translate-y-0 scale-100 opacity-100 rotate-0' : 'translate-y-0.5 scale-90 opacity-0 -rotate-6',
          )}
        />
        <Search
          className={cn(
            'absolute inset-0 size-[18px] text-muted-foreground/65 will-change-transform transition-[opacity,transform,color] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:text-[var(--search-accent)]',
            mode === 'web' ? 'translate-y-0 scale-100 opacity-100 rotate-0' : '-translate-y-0.5 scale-90 opacity-0 rotate-6',
          )}
        />
      </div>

      <Input
        ref={inputRef}
        type="text"
        placeholder={mode === 'tabs' ? labels.placeholder : labels.webPlaceholder}
        value={inputValue}
        onChange={(e) => {
          if (mode === 'tabs') {
            onChange(e.target.value);
            return;
          }

          setWebQuery(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            setMode(nextMode);
            window.requestAnimationFrame(() => inputRef.current?.focus());
            return;
          }

          if (e.key === 'Enter') handleSubmit();
        }}
        className={cn(
          'relative z-10 h-12 border-0 bg-transparent pl-10 text-[15px] shadow-none focus-visible:ring-0',
          isDetailedToggle ? 'pr-[174px] sm:pr-[224px]' : 'pr-[116px]',
        )}
        style={{ background: 'transparent', borderColor: 'transparent', boxShadow: 'none' }}
      />

      <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5">
        <SearchModeToggle
          mode={mode}
          display={settings.searchToggleDisplay}
          accentColor={accentColor}
          textColor={modeTextColor}
          labels={labels}
          onToggle={() => {
            setMode(nextMode);
            window.requestAnimationFrame(() => inputRef.current?.focus());
          }}
        />

        <div className="hidden h-7 items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-2 text-[11px] font-medium text-muted-foreground/80 sm:flex">
          <Command className="size-3" strokeWidth={1.8} />
          <span>K</span>
        </div>
      </div>
    </div>
  );
}
