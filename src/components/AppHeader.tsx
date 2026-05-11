import { AccentColorMenu } from './AccentColorMenu';
import { SearchBar } from './SearchBar';
import type { AppCopy } from '../lib/i18n';
import type { ColorSample, SearchEngineId, SearchIconStyle, SearchToggleDisplay } from '../types/settings';

interface AppHeaderProps {
  openTabCount: number;
  duplicateCount: number;
  sleepingTabCount: number;
  summarySeparator: string;
  summaryEnd: string;
  query: string;
  accentColor: string;
  colorSample: ColorSample;
  defaultAccentColor: string | null;
  isDarkMode: boolean;
  searchToggleDisplay: SearchToggleDisplay;
  searchEngine: SearchEngineId;
  searchIconStyle: SearchIconStyle;
  copy: AppCopy;
  onQueryChange: (query: string) => void;
  onUseAccentColor: (hex: string) => void;
  onSetDefaultAccentColor: (hex: string) => void;
  onUseRandomAccentColor: () => void;
  onToggleTheme: () => void;
}

export function AppHeader({
  openTabCount,
  duplicateCount,
  sleepingTabCount,
  summarySeparator,
  summaryEnd,
  query,
  accentColor,
  colorSample,
  defaultAccentColor,
  isDarkMode,
  searchToggleDisplay,
  searchEngine,
  searchIconStyle,
  copy,
  onQueryChange,
  onUseAccentColor,
  onSetDefaultAccentColor,
  onUseRandomAccentColor,
  onToggleTheme,
}: AppHeaderProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between max-[720px]:flex-col max-[720px]:gap-1">
        <span className="text-[16px] tracking-[0.01em] text-foreground/65 dark:text-[rgba(255,255,255,0.60)] transition-colors duration-400">
          {copy.header.openPrefix} <strong className="font-semibold text-[rgba(0,0,0,0.85)] dark:text-[rgba(255,255,255,0.88)]">{openTabCount}</strong> {copy.header.openSuffix}
          {duplicateCount > 0 && (
            <span className="text-foreground/65 dark:text-[rgba(255,255,255,0.60)]">
              {summarySeparator}<strong className="font-semibold text-[rgba(0,0,0,0.85)] dark:text-[rgba(255,255,255,0.88)]">{duplicateCount}</strong> {copy.header.duplicate}
            </span>
          )}
          {sleepingTabCount > 0 && (
            <span className="text-foreground/65 dark:text-[rgba(255,255,255,0.60)]">
              {summarySeparator}<strong className="font-semibold text-[rgba(0,0,0,0.85)] dark:text-[rgba(255,255,255,0.88)]">{sleepingTabCount}</strong> {copy.header.sleeping}
            </span>
          )}
          {summaryEnd}
        </span>
        <AccentColorMenu
          accentColor={accentColor}
          colorSample={colorSample}
          defaultAccentColor={defaultAccentColor}
          isDarkMode={isDarkMode}
          copy={copy}
          onUseAccentColor={onUseAccentColor}
          onSetDefaultAccentColor={onSetDefaultAccentColor}
          onUseRandomAccentColor={onUseRandomAccentColor}
          onToggleTheme={onToggleTheme}
        />
      </div>

      <SearchBar
        value={query}
        onChange={onQueryChange}
        accentColor={accentColor}
        toggleDisplay={searchToggleDisplay}
        searchEngine={searchEngine}
        searchIconStyle={searchIconStyle}
        labels={copy.search}
      />
    </div>
  );
}
