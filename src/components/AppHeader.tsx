import { AccentColorMenu } from './AccentColorMenu';
import { SearchBar } from './SearchBar';
import { useCopy, useSettingsContext } from '../lib/appContext';

interface AppHeaderProps {
  openTabCount: number;
  duplicateCount: number;
  sleepingTabCount: number;
  query: string;
  onQueryChange: (query: string) => void;
}

export function AppHeader({
  openTabCount,
  duplicateCount,
  sleepingTabCount,
  query,
  onQueryChange,
}: AppHeaderProps) {
  const copy = useCopy();
  const { settings } = useSettingsContext();
  const summarySeparator = settings.language === 'zh' ? '，' : ', ';
  const summaryEnd = settings.language === 'zh' ? '。' : '.';

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between max-[720px]:flex-col max-[720px]:gap-1">
        <span className="font-ornament-2 text-[16px] tracking-[0.01em] text-foreground/65 dark:text-[rgba(255,255,255,0.60)] transition-colors duration-400">
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
        <AccentColorMenu />
      </div>

      <SearchBar
        value={query}
        onChange={onQueryChange}
      />
    </div>
  );
}
