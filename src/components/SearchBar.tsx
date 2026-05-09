import { useEffect, useRef, useState } from 'react';
import { Command, Globe2, Tags } from 'lucide-react';

import { cn } from '../lib/cn';
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
  accentColor: string;
  toggleDisplay: 'compact' | 'detailed';
  labels: {
    placeholder: string;
    webPlaceholder: string;
    tabsMode: string;
    webMode: string;
    tabsMenu: string;
    webMenu: string;
  };
}

export function SearchBar({ value, onChange, accentColor, toggleDisplay, labels }: SearchBarProps) {
  const [mode, setMode] = useState<SearchMode>('tabs');
  const [webQuery, setWebQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValue = mode === 'tabs' ? value : webQuery;
  const modeTextColor = getReadableTextColor(accentColor);
  const nextMode = mode === 'tabs' ? 'web' : 'tabs';
  const isDetailedToggle = toggleDisplay === 'detailed';

  const handleSubmit = () => {
    const searchValue = inputValue.trim();
    if (!searchValue || mode === 'tabs') return;

    const url = `https://www.google.com/search?q=${encodeURIComponent(searchValue)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
    <div className="relative w-full" style={{ '--theme-ring': accentColor } as React.CSSProperties}>
      <div className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 overflow-hidden">
        <Tags
          className={cn(
            'absolute inset-0 size-[18px] transition-[opacity,transform,color] duration-200 ease-out',
            mode === 'tabs' ? 'translate-y-0 scale-100 opacity-100 rotate-0' : 'translate-y-1 scale-75 opacity-0 -rotate-12',
          )}
          style={{ color: accentColor }}
        />
        <Globe2
          className={cn(
            'absolute inset-0 size-[18px] transition-[opacity,transform,color] duration-200 ease-out',
            mode === 'web' ? 'translate-y-0 scale-100 opacity-100 rotate-0' : '-translate-y-1 scale-75 opacity-0 rotate-12',
          )}
          style={{ color: accentColor }}
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
          'h-12 pl-10 text-[15px] focus-visible:!border-[var(--theme-ring)] focus-visible:ring-2',
          isDetailedToggle ? 'pr-[174px] sm:pr-[224px]' : 'pr-[116px]',
        )}
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        <SearchModeToggle
          mode={mode}
          display={toggleDisplay}
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
