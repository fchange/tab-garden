import { useEffect, useRef, useState } from 'react';
import { Command, Globe2, Tags } from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';

type SearchMode = 'tabs' | 'web';

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
  labels: {
    placeholder: string;
    webPlaceholder: string;
    tabsMode: string;
    webMode: string;
    tabsMenu: string;
    webMenu: string;
  };
}

export function SearchBar({ value, onChange, accentColor, labels }: SearchBarProps) {
  const [mode, setMode] = useState<SearchMode>('tabs');
  const [webQuery, setWebQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValue = mode === 'tabs' ? value : webQuery;
  const LeadingIcon = mode === 'tabs' ? Tags : Globe2;
  const modeTextColor = getReadableTextColor(accentColor);
  const nextMode = mode === 'tabs' ? 'web' : 'tabs';

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
      <LeadingIcon
        className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 transition-colors"
        style={{ color: accentColor }}
      />

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
          if (e.key === 'Enter') handleSubmit();
        }}
        className="h-12 pl-10 pr-[116px] text-[15px] focus-visible:ring-2"
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          aria-label={mode === 'tabs' ? labels.webMenu : labels.tabsMenu}
          title={mode === 'tabs' ? labels.webMenu : labels.tabsMenu}
          className="h-8 rounded-full border-border/50 bg-muted/35 p-0 text-muted-foreground shadow-none hover:border-border hover:bg-muted/55"
          onClick={() => {
            setMode(nextMode);
            window.requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          <span className="relative grid w-[66px] grid-cols-2 rounded-full p-0.5">
            <span
              className="absolute inset-y-0.5 w-[31px] rounded-full transition-transform duration-200 ease-out"
              style={{
                background: accentColor,
                transform: mode === 'tabs' ? 'translateX(2px)' : 'translateX(33px)',
              }}
            />
            <span
              className="relative z-10 flex h-7 items-center justify-center transition-colors"
              style={{ color: mode === 'tabs' ? modeTextColor : undefined }}
            >
              <Tags className="size-3.5" />
            </span>
            <span
              className="relative z-10 flex h-7 items-center justify-center transition-colors"
              style={{ color: mode === 'web' ? modeTextColor : undefined }}
            >
              <Globe2 className="size-3.5" />
            </span>
          </span>
        </Button>

        <div className="hidden h-7 items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-2 text-[11px] font-medium text-muted-foreground/80 sm:flex">
          <Command className="size-3" strokeWidth={1.8} />
          <span>K</span>
        </div>
      </div>
    </div>
  );
}
