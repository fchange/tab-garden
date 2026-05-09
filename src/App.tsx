import { useCallback, useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import { Check, ChevronDown, Layers, Moon, Shuffle, Star, Sun } from 'lucide-react';
import { toast, Toaster } from 'sonner';

import { Tabs, TabsContent } from './components/ui/tabs';

import { SearchBar } from './components/SearchBar';
import { DomainCard } from './components/DomainCard';
import { SettingsSheet } from './components/settings/SettingsSheet';
import { ViewToggle } from './components/ViewToggle';
import { VirtualTabList } from './components/VirtualTabList';
import { WaveBackground } from './components/WaveBackground';
import { useSettings } from './hooks/useSettings';
import { useTabs } from './hooks/useTabs';
import { Button } from './components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { ACCENT_COLORS, DEFAULT_ACCENT_COLOR, getAccentColorByHex, getNextAccentColor } from './lib/accentColors';
import { buildDomainGroups, buildWindowGroups, filterTabs } from './lib/groups';
import { getCopy, getViewOptions } from './lib/i18n';
import { cn } from './lib/cn';
import { DEFAULT_SETTINGS } from './lib/storage';
import { buildDuplicateGroups, isDiscardable } from './lib/tabs';
import { getThemePalette, paletteToShadcnVars } from './lib/theme';
import type { ThemePreference } from './types/settings';
import type { ActionFeedback, BrowserTab, ViewMode } from './types/tab';

function useResolvedMode(theme: ThemePreference): 'light' | 'dark' {
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

function getReadableTextColor(hex: string) {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const luminance = 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);

  return luminance > 0.58 ? '#17211f' : '#ffffff';
}

function getRandomAccentColor(excludedHex?: string) {
  const candidates = ACCENT_COLORS.filter((color) => color.hex !== excludedHex);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? ACCENT_COLORS[0];
}

export default function App() {
  const { ready, settings, updateSettings } = useSettings();
  const copy = useMemo(() => getCopy(settings.language), [settings.language]);
  const viewOptions = useMemo(() => getViewOptions(copy), [copy]);
  const resolvedMode = useResolvedMode(settings.theme);
  const isDarkMode = resolvedMode === 'dark';
  const currentPalette = useMemo(
    () => getThemePalette(resolvedMode),
    [resolvedMode],
  );

  const [colorSample, setColorSample] = useState(() => getAccentColorByHex(DEFAULT_ACCENT_COLOR));
  const accentColor = colorSample.hex;
  const accentTextColor = getReadableTextColor(accentColor);

  const [view, setView] = useState<ViewMode>('all');
  const [query, setQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const randomAccentInitializedRef = useRef(false);

  const deferredQuery = useDeferredValue(query);
  const tabState = useTabs(settings, copy);
  const customSlogan = settings.customSlogan.trim();

  useEffect(() => {
    if (ready) {
      setView(settings.defaultView);
    }
  }, [ready, settings.defaultView]);

  useEffect(() => {
    if (ready) {
      if (settings.randomAccentColor) {
        if (!randomAccentInitializedRef.current) {
          randomAccentInitializedRef.current = true;
          setColorSample(getRandomAccentColor(accentColor));
        }

        return;
      }

      randomAccentInitializedRef.current = false;
      setColorSample(
        getAccentColorByHex(settings.defaultAccentColor ?? DEFAULT_ACCENT_COLOR),
      );
    }
  }, [ready, settings.defaultAccentColor, settings.randomAccentColor]);

  useEffect(() => {
    const root = document.documentElement;
    const themeVars = {
      ...paletteToShadcnVars(currentPalette),
      '--accent': accentColor,
      '--theme-accent': accentColor,
      '--theme-ring': accentColor,
      '--theme-primary': accentColor,
      '--theme-primary-fg': getReadableTextColor(accentColor),
    };

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    document.documentElement.dataset.theme = resolvedMode;
    document.documentElement.style.colorScheme = resolvedMode;
    document.body.style.background = currentPalette.bg;
  }, [accentColor, currentPalette, resolvedMode]);

  const filteredTabs = useMemo(
    () => filterTabs(tabState.tabs, deferredQuery),
    [deferredQuery, tabState.tabs],
  );

  const allDuplicateGroups = useMemo(
    () => buildDuplicateGroups(tabState.tabs, settings),
    [settings, tabState.tabs],
  );
  const domainGroups = useMemo(
    () => buildDomainGroups(filteredTabs, settings, { unnamedPage: copy.domainCard.unnamedPage }),
    [copy, filteredTabs, settings],
  );
  const windowGroups = useMemo(
    () => buildWindowGroups(filteredTabs, settings, { windowLabel: copy.domainCard.windowLabel }),
    [copy, filteredTabs, settings],
  );

  const duplicateCount = useMemo(
    () =>
      allDuplicateGroups.reduce(
        (count, group) => count + group.closable.length + group.protectedTabs.length,
        0,
      ),
    [allDuplicateGroups],
  );
  const sleepingTabs = useMemo(
    () => tabState.tabs.filter((tab) => tab.discarded),
    [tabState.tabs],
  );
  const duplicateTabIds = useMemo(
    () =>
      new Set(
        allDuplicateGroups.flatMap((group) =>
          [...group.closable, ...group.protectedTabs].map((tab) => tab.id),
        ),
      ),
    [allDuplicateGroups],
  );
  const duplicateTabs = useMemo(
    () => filteredTabs.filter((tab) => duplicateTabIds.has(tab.id)),
    [duplicateTabIds, filteredTabs],
  );
  const summarySeparator = settings.language === 'zh' ? '，' : ', ';
  const summaryEnd = settings.language === 'zh' ? '。' : '.';

  const handleFeedback = (feedback: Promise<ActionFeedback>) => {
    void feedback.then((result) => toast(result.message));
  };

  const tabHandlers = {
    onSwitch: (tab: BrowserTab) => handleFeedback(tabState.switchToTab(tab)),
    onClose: (tab: BrowserTab) => handleFeedback(tabState.closeOne(tab)),
    onSleep: (tab: BrowserTab) => handleFeedback(tabState.discardOne(tab)),
    onCloseAll: (tabs: BrowserTab[]) => handleFeedback(tabState.closeSelectedTabs(tabs)),
    onSleepAll: (tabs: BrowserTab[]) => handleFeedback(tabState.discardIdleTabs(tabs)),
  };

  const canSleepTab = useCallback(
    (tab: BrowserTab) => isDiscardable(tab, settings),
    [settings],
  );

  const batchAction = useMemo(() => {
    if (view === 'duplicate' && duplicateCount > 0) {
      return {
        label: copy.batch.closeDuplicate,
        count: duplicateCount,
        action: () => handleFeedback(tabState.closeDuplicateTabs()),
      };
    }

    return null;
  }, [copy, duplicateCount, sleepingTabs.length, tabState, view]);

  const handleChangeColor = useCallback(() => {
    setColorSample((current) => getNextAccentColor(current.hex));
  }, []);

  const handleToggleTheme = useCallback(() => {
    void updateSettings({ theme: isDarkMode ? 'light' : 'dark' });
  }, [isDarkMode, updateSettings]);

  const handleUseRandomAccentColor = useCallback(() => {
    randomAccentInitializedRef.current = true;
    setColorSample(getRandomAccentColor(accentColor));
    void updateSettings({ defaultAccentColor: null, randomAccentColor: true });
  }, [accentColor, updateSettings]);

  const handleUseAccentColor = useCallback(
    (hex: string) => {
      setColorSample(getAccentColorByHex(hex));
    },
    [],
  );

  const handleSetDefaultAccentColor = useCallback(
    (hex: string) => {
      setColorSample(getAccentColorByHex(hex));
      randomAccentInitializedRef.current = false;
      void updateSettings({ defaultAccentColor: hex, randomAccentColor: false });
    },
    [updateSettings],
  );

  const renderTabList = (activeView: ViewMode) => {
    const isEmpty =
      activeView === 'duplicate' ? duplicateTabs.length === 0 : filteredTabs.length === 0;

    if (tabState.loading && !tabState.tabs.length) {
      return (
        <div className="flex flex-col items-center gap-2 py-10 text-[16px] text-muted-foreground">
          <Layers size={26} strokeWidth={1.2} className="opacity-25" />
          <span>{copy.empty.loading}</span>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="flex flex-col items-center gap-2 py-10 text-[16px] text-muted-foreground">
          <Layers size={26} strokeWidth={1.2} className="opacity-25" />
          <span>{query.trim() ? copy.empty.noMatches : copy.empty.noTabs}</span>
        </div>
      );
    }

    if (activeView === 'all') {
      return (
        <VirtualTabList
          tabs={filteredTabs}
          accentColor={accentColor}
          onClose={tabHandlers.onClose}
          onSleep={tabHandlers.onSleep}
          onSwitch={tabHandlers.onSwitch}
          canSleepTab={canSleepTab}
          duplicateTabIds={duplicateTabIds}
          copy={copy}
        />
      );
    }

    if (activeView === 'duplicate') {
      return (
        <VirtualTabList
          tabs={duplicateTabs}
          accentColor={accentColor}
          onClose={tabHandlers.onClose}
          onSleep={tabHandlers.onSleep}
          onSwitch={tabHandlers.onSwitch}
          canSleepTab={canSleepTab}
          showDuplicateBadge
          copy={copy}
        />
      );
    }

    if (activeView === 'domain') {
      return (
        <div className="grid grid-cols-3 gap-2.5 min-w-0 max-h-[calc(100vh-330px)] overflow-y-auto overflow-x-hidden pb-2 max-[720px]:grid-cols-1">
          {domainGroups.map((group) => (
            <DomainCard
              key={group.id}
              group={group}
              accentColor={accentColor}
              onSwitch={tabHandlers.onSwitch}
              onClose={tabHandlers.onClose}
              onSleep={tabHandlers.onSleep}
              onCloseAll={tabHandlers.onCloseAll}
              onSleepAll={tabHandlers.onSleepAll}
              canSleepTab={canSleepTab}
              copy={copy}
            />
          ))}
        </div>
      );
    }

    // window view
    return (
      <div className="grid grid-cols-3 gap-2.5 min-w-0 max-h-[calc(100vh-330px)] overflow-y-auto overflow-x-hidden pb-2 max-[720px]:grid-cols-1">
        {windowGroups.map((group) => (
          <DomainCard
            key={group.id}
            group={group}
            accentColor={accentColor}
            onSwitch={tabHandlers.onSwitch}
            onClose={tabHandlers.onClose}
            onSleep={tabHandlers.onSleep}
            onCloseAll={tabHandlers.onCloseAll}
            onSleepAll={tabHandlers.onSleepAll}
            canSleepTab={canSleepTab}
            copy={copy}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <WaveBackground
        palette={currentPalette}
        accentColor={accentColor}
        paused={!settings.animationEnabled}
      />

      <div className="relative z-10 w-[min(980px,calc(100vw-48px))] mt-[clamp(28px,5vh,60px)] rounded-[20px] overflow-hidden bg-card/65 backdrop-blur-sm backdrop-saturate-150 border border-border/90 shadow-[var(--theme-shadow-soft)] transition-[background,border-color,box-shadow] duration-600 max-[720px]:w-[calc(100vw-32px)] max-[720px]:mt-4">
        <div className="h-[3px] w-full transition-[background] duration-500" style={{ background: accentColor }} />

        <div className="px-6 pt-5 pb-5 min-w-0 max-[720px]:p-4">
          {/* Header */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-baseline justify-between max-[720px]:flex-col max-[720px]:gap-1">
              <span className="text-[16px] tracking-[0.01em] text-foreground/65 dark:text-[rgba(255,255,255,0.60)] transition-colors duration-400">
                {copy.header.openPrefix} <strong className="font-semibold text-[rgba(0,0,0,0.85)] dark:text-[rgba(255,255,255,0.88)]">{tabState.tabs.length}</strong> {copy.header.openSuffix}
                {duplicateCount > 0 && (
                  <span className="text-foreground/65 dark:text-[rgba(255,255,255,0.60)]">
                    {summarySeparator}<strong className="font-semibold text-[rgba(0,0,0,0.85)] dark:text-[rgba(255,255,255,0.88)]">{duplicateCount}</strong> {copy.header.duplicate}
                  </span>
                )}
                {sleepingTabs.length > 0 && (
                  <span className="text-foreground/65 dark:text-[rgba(255,255,255,0.60)]">
                    {summarySeparator}<strong className="font-semibold text-[rgba(0,0,0,0.85)] dark:text-[rgba(255,255,255,0.88)]">{sleepingTabs.length}</strong> {copy.header.sleeping}
                  </span>
                )}
                {summaryEnd}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="font-crgk inline-flex items-center gap-1.5 text-[16px] font-normal tracking-[0.04em] cursor-pointer px-[12px] py-[4px] rounded-[999px] transition-all duration-300 opacity-85 hover:opacity-100 hover:bg-accent/15 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title={copy.accents.choose}
                    style={{ color: accentColor }}
                  >
                    <span>{colorSample.name}</span>
                    <ChevronDown size={14} strokeWidth={1.8} />
                  </button>
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
                          event.preventDefault();
                          event.stopPropagation();
                          handleUseRandomAccentColor();
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
                          event.preventDefault();
                          event.stopPropagation();
                          handleToggleTheme();
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
                      const isDefault = color.hex === settings.defaultAccentColor;

                      return (
                        <DropdownMenuItem
                          key={color.hex}
                          onSelect={(event) => event.preventDefault()}
                          className="group/color relative flex items-center gap-2.5 min-w-0 overflow-hidden rounded-xl px-2.5 py-2.5 cursor-default transition-all duration-200 focus:bg-[color-mix(in_srgb,var(--item-accent)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--item-accent)_8%,transparent)]"
                          style={{ '--item-accent': color.hex } as React.CSSProperties}
                        >
                          <span
                            className="size-[24px] shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.08)]"
                            style={{ background: color.hex }}
                          />
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground transition-colors duration-200 group-hover/color:text-[var(--item-accent)]">
                              <span className="font-crgk truncate">{color.name}</span>
                            </span>
                            <span className="block truncate text-[12px] text-muted-foreground">
                              {color.hex} · {color.pinyin}
                            </span>
                          </span>

                          <span className={`flex items-center gap-1.5 shrink-0 transition-opacity duration-150 ${active || isDefault ? '' : 'opacity-0'} group-hover/color:opacity-0`}>
                            {active && (
                              <span
                                className="inline-flex h-5 items-center gap-1 rounded-full px-2 text-[12px] font-medium"
                                style={{
                                  background: `color-mix(in srgb, ${color.hex} 16%, transparent)`,
                                  color: color.hex,
                                }}
                              >
                                <Check size={12} />
                                {copy.accents.current}
                              </span>
                            )}
                            {isDefault && (
                              <span
                                className="inline-flex h-5 items-center gap-1 rounded-full px-2 text-[12px] font-medium"
                                style={{
                                  background: `color-mix(in srgb, ${color.hex} 16%, transparent)`,
                                  color: color.hex,
                                }}
                              >
                                <Star size={11} className="fill-current" />
                                {copy.accents.default}
                              </span>
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
                                event.preventDefault();
                                event.stopPropagation();
                                handleUseAccentColor(color.hex);
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
                                event.preventDefault();
                                event.stopPropagation();
                                handleSetDefaultAccentColor(color.hex);
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
            </div>

            <SearchBar
              value={query}
              onChange={setQuery}
              accentColor={accentColor}
              toggleDisplay={settings.searchToggleDisplay}
              labels={copy.search}
            />
          </div>

          {/* Content with Radix Tabs */}
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as ViewMode)}
            className="flex flex-col flex-1 min-h-0 min-w-0 mt-4 outline-none"
          >
            <div className="flex items-center justify-between">
              <ViewToggle
                value={view}
                onChange={setView}
                accentColor={accentColor}
                options={viewOptions}
                counts={{
                  all: tabState.tabs.length,
                  domain: domainGroups.length,
                  window: windowGroups.length,
                  duplicate: duplicateCount,
                }}
              />

              {batchAction && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={batchAction.action}
                  className="gap-2"
                >
                  {batchAction.label}
                  <span className="inline-flex items-center justify-center min-w-4 h-4 rounded-full px-[5px] text-[12px] font-semibold bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.10)]">
                    {batchAction.count}
                  </span>
                </Button>
              )}
            </div>

            {tabState.error && (
              <p className="text-[#c0392b] text-[15px] py-2 opacity-80">{tabState.error}</p>
            )}

            <TabsContent key={view} value={view} className="min-w-0 mt-3">
              {renderTabList(view)}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {customSlogan && (
        <p className="bottom-slogan z-10 w-[min(760px,calc(100vw-48px))] leading-relaxed tracking-[0.08em] max-[720px]:px-4">
          <span>{customSlogan}</span>
          <span className="slogan-stamp">沈蔚</span>
        </p>
      )}

      {/* Floating control bar — bottom-right */}
      <div className="group fixed bottom-4 right-5 z-[2] flex items-center gap-0 hover:gap-[6px] p-[10px_14px] rounded-full cursor-pointer border border-transparent hover:border-[rgba(255,255,255,0.35)] dark:hover:border-[rgba(255,255,255,0.07)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-[color-mix(in_srgb,rgba(255,255,255,0.50)_65%,transparent)] dark:hover:bg-[color-mix(in_srgb,rgba(20,25,28,0.55)_65%,transparent)] transition-all duration-300">
        <button
          className="w-0 group-hover:w-[30px] h-[30px] rounded-full border-none bg-transparent text-[rgba(0,0,0,0.42)] dark:text-[rgba(255,255,255,0.42)] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 overflow-hidden p-0 m-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-250 hover:bg-[rgba(128,128,128,0.10)] dark:hover:bg-[rgba(255,255,255,0.08)] hover:text-[rgba(0,0,0,0.70)] dark:hover:text-[rgba(255,255,255,0.75)]"
          onClick={handleToggleTheme}
          title={isDarkMode ? copy.controls.light : copy.controls.dark}
        >
          {isDarkMode ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        <button
          className="w-0 group-hover:w-[30px] h-[30px] rounded-full border-none bg-transparent text-[rgba(0,0,0,0.42)] dark:text-[rgba(255,255,255,0.42)] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 overflow-hidden p-0 m-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-250 hover:bg-[rgba(128,128,128,0.10)] dark:hover:bg-[rgba(255,255,255,0.08)] hover:text-[rgba(0,0,0,0.70)] dark:hover:text-[rgba(255,255,255,0.75)]"
          onClick={() => updateSettings({ animationEnabled: !settings.animationEnabled })}
          title={settings.animationEnabled ? copy.controls.pause : copy.controls.play}
        >
          {settings.animationEnabled ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          )}
        </button>
        <button
          className="w-0 group-hover:w-[30px] h-[30px] rounded-full border-none bg-transparent text-[rgba(0,0,0,0.42)] dark:text-[rgba(255,255,255,0.42)] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 overflow-hidden p-0 m-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-250 hover:bg-[rgba(128,128,128,0.10)] dark:hover:bg-[rgba(255,255,255,0.08)] hover:text-[rgba(0,0,0,0.70)] dark:hover:text-[rgba(255,255,255,0.75)]"
          onClick={() => setSettingsOpen(true)}
          title={copy.controls.settings}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
        <div className="w-0 group-hover:w-[1px] h-4 bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.10)] mx-[2px] opacity-0 group-hover:opacity-100 transition-all duration-250" />
        <button
          className="w-[20px] h-[20px] shrink-0 rounded-full border-none shadow-[0_0_0_2px_rgba(255,255,255,0.40),0_2px_8px_rgba(0,0,0,0.10)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.20)] cursor-pointer transition-all duration-350 opacity-100 pointer-events-auto overflow-visible p-0 m-0 hover:scale-[1.18] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.70),0_2px_12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_0_2px_rgba(255,255,255,0.40)]"
          onClick={handleChangeColor}
          title={`${copy.accents.currentColor}: ${colorSample.name}`}
          style={{ background: accentColor }}
        />
      </div>

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        copy={copy}
        viewOptions={viewOptions}
        colorSample={colorSample}
        accentColor={accentColor}
        accentTextColor={accentTextColor}
        updateSettings={updateSettings}
        onSetDefaultAccentColor={handleSetDefaultAccentColor}
        onResetSettings={() => {
          randomAccentInitializedRef.current = false;
          setColorSample(getAccentColorByHex(DEFAULT_SETTINGS.defaultAccentColor ?? DEFAULT_ACCENT_COLOR));
          void updateSettings(DEFAULT_SETTINGS);
        }}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'rounded-full border border-border bg-card text-foreground text-base',
          style: {
            boxShadow: isDarkMode
              ? '0 12px 40px rgba(0,0,0,0.4)'
              : '0 12px 40px rgba(30,50,45,0.12)',
          },
        }}
      />
    </div>
  );
}
