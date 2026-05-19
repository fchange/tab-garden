import type { CSSProperties, MouseEvent } from 'react';
import { Check, ChevronDown, Moon, Shuffle, Star, Sun } from 'lucide-react';

import { ACCENT_COLORS } from '../lib/accentColors';
import { useAccent, useCopy, useSettingsContext, useTheme } from '../lib/appContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const stopMenuEvent = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

export function AccentColorMenu() {
  const copy = useCopy();
  const { settings } = useSettingsContext();
  const {
    accentColor,
    colorSample,
    setDefaultAccentColor,
    useAccentColor,
    useRandomAccentColor,
  } = useAccent();
  const { isDarkMode, toggleTheme } = useTheme();
  const defaultAccentColor = settings.defaultAccentColor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 cursor-pointer rounded-full border-none bg-transparent px-3 text-[16px] font-normal tracking-[0.04em] opacity-85 shadow-none hover:bg-accent/15 hover:opacity-100"
          title={copy.accents.choose}
          style={{ color: accentColor }}
        >
          <span className="font-ornament-2 leading-[1.15]">{colorSample.name}</span>
          <ChevronDown className="size-3.5 opacity-70" strokeWidth={1.8} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] max-h-[min(520px,calc(100vh-180px))] overflow-y-auto p-2"
      >
        <DropdownMenuLabel className="flex items-center justify-between gap-3 px-2.5 py-2 text-[14px]">
          <span>{copy.accents.title}</span>
          <span className="inline-flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(event) => {
                stopMenuEvent(event);
                useRandomAccentColor();
              }}
              title={copy.controls.randomAccent}
              aria-label={copy.controls.randomAccent}
              className="size-7 rounded-full"
            >
              <Shuffle size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(event) => {
                stopMenuEvent(event);
                toggleTheme();
              }}
              title={isDarkMode ? copy.controls.light : copy.controls.dark}
              aria-label={isDarkMode ? copy.controls.light : copy.controls.dark}
              className="size-7 rounded-full"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-1">
          {ACCENT_COLORS.map((color) => {
            const active = color.hex === accentColor;
            const isDefault = color.hex === defaultAccentColor;

            return (
              <DropdownMenuItem
                key={color.hex}
                onSelect={(event) => event.preventDefault()}
                className="group/color relative flex items-center gap-2.5 min-w-0 overflow-hidden rounded-xl px-2.5 py-2.5 cursor-default transition-all duration-200 focus:bg-[color-mix(in_srgb,var(--item-accent)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--item-accent)_8%,transparent)]"
                style={{ '--item-accent': color.hex } as CSSProperties}
              >
                <span
                  className="size-[24px] shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.08)]"
                  style={{ background: color.hex }}
                />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground transition-colors duration-200 group-hover/color:text-[var(--item-accent)]">
                    <span className="font-ornament-2 truncate">{color.name}</span>
                  </span>
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {color.hex} · {color.pinyin}
                  </span>
                </span>

                <span className={`flex items-center gap-1.5 shrink-0 transition-opacity duration-150 ${active || isDefault ? '' : 'opacity-0'} group-hover/color:opacity-0`}>
                  {active && (
                    <Badge
                      variant="accent"
                      style={{
                        background: `color-mix(in srgb, ${color.hex} 16%, transparent)`,
                        color: color.hex,
                      }}
                    >
                      <Check size={12} />
                      {copy.accents.current}
                    </Badge>
                  )}
                  {isDefault && (
                    <Badge
                      variant="accent"
                      style={{
                        background: `color-mix(in srgb, ${color.hex} 16%, transparent)`,
                        color: color.hex,
                      }}
                    >
                      <Star size={11} className="fill-current" />
                      {copy.accents.default}
                    </Badge>
                  )}
                </span>

                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 shrink-0 rounded-lg p-0.5 opacity-0 pointer-events-none transition-all duration-150 group-hover/color:opacity-100 group-hover/color:pointer-events-auto"
                  style={{ background: color.hex }}
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 rounded-md border-none bg-transparent px-2 text-[12px] text-white opacity-75 shadow-none hover:bg-[rgba(255,255,255,0.14)] hover:text-white hover:opacity-100"
                    onClick={(event) => {
                      stopMenuEvent(event);
                      useAccentColor(color.hex);
                    }}
                  >
                    {copy.accents.use}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 rounded-md border-none bg-transparent px-2 text-[12px] text-white opacity-75 shadow-none hover:bg-[rgba(255,255,255,0.14)] hover:text-white hover:opacity-100"
                    onClick={(event) => {
                      stopMenuEvent(event);
                      setDefaultAccentColor(color.hex);
                    }}
                  >
                    {copy.accents.setDefault}
                  </Button>
                </span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
