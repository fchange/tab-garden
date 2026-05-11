import { useCallback, useEffect, useMemo, useState, useDeferredValue } from 'react';
import { toast, Toaster } from 'sonner';

import { AppHeader } from './components/AppHeader';
import { EmptyState } from './components/EmptyState';
import { FloatingControlBar } from './components/FloatingControlBar';
import { GroupGrid } from './components/GroupGrid';
import { MainPanel } from './components/MainPanel';
import { PoemDisplay } from './components/PoemDisplay';
import { SettingsSheet } from './components/settings/SettingsSheet';
import { TabContentArea } from './components/TabContentArea';
import { VirtualTabList } from './components/VirtualTabList';
import { WaveBackground } from './components/WaveBackground';
import { useAccentColor } from './hooks/useAccentColor';
import { useApplyThemeVars } from './hooks/useApplyThemeVars';
import { useResolvedMode } from './hooks/useResolvedMode';
import { useSettings } from './hooks/useSettings';
import { useTabs } from './hooks/useTabs';
import { buildDomainGroups, buildWindowGroups, filterTabs } from './lib/groups';
import { getCopy, getViewOptions } from './lib/i18n';
import { DEFAULT_SETTINGS } from './lib/storage';
import { buildDuplicateGroups, isDiscardable } from './lib/tabs';
import { getThemePalette } from './lib/theme';
import type { ActionFeedback, BrowserTab, ViewMode } from './types/tab';

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

  const {
    accentColor,
    accentTextColor,
    colorSample,
    changeColor,
    useAccentColor: useSelectedAccentColor,
    useRandomAccentColor,
    setDefaultAccentColor,
    resetAccentColor,
  } = useAccentColor({
    ready,
    defaultAccentColor: settings.defaultAccentColor,
    randomAccentColor: settings.randomAccentColor,
    updateSettings,
  });

  const [view, setView] = useState<ViewMode>('all');
  const [query, setQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [poemExpanded, setPoemExpanded] = useState(false);

  const deferredQuery = useDeferredValue(query);
  const tabState = useTabs(settings, copy);

  useEffect(() => {
    if (ready) {
      setView(settings.defaultView);
    }
  }, [ready, settings.defaultView]);

  useEffect(() => {
    if (!settings.showPoem) {
      setPoemExpanded(false);
    }
  }, [settings.showPoem]);

  useApplyThemeVars(currentPalette, accentColor, resolvedMode);

  const filteredTabs = useMemo(
    () => filterTabs(tabState.tabs, deferredQuery),
    [deferredQuery, tabState.tabs],
  );

  const allDuplicateGroups = useMemo(
    () => buildDuplicateGroups(tabState.tabs, settings),
    [settings, tabState.tabs],
  );
  const domainGroups = useMemo(
    () => buildDomainGroups(filteredTabs, settings, {
      unnamedPage: copy.domainCard.unnamedPage,
      blankPage: copy.domainCard.blankPage,
    }),
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

  const handleToggleTheme = useCallback(() => {
    void updateSettings({ theme: isDarkMode ? 'light' : 'dark' });
  }, [isDarkMode, updateSettings]);

  const renderTabList = (activeView: ViewMode) => {
    const isEmpty =
      activeView === 'duplicate' ? duplicateTabs.length === 0 : filteredTabs.length === 0;

    if (tabState.loading && !tabState.tabs.length) {
      return (
        <EmptyState title={copy.empty.loading} />
      );
    }

    if (isEmpty) {
      return (
        <EmptyState
          title={query.trim() ? copy.empty.noMatches : copy.empty.noTabs}
          description={query.trim() ? copy.empty.noMatchesDescription : copy.empty.noTabsDescription}
        />
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
        <GroupGrid
          groups={domainGroups}
          accentColor={accentColor}
          onSwitch={tabHandlers.onSwitch}
          onClose={tabHandlers.onClose}
          onSleep={tabHandlers.onSleep}
          onCloseAll={tabHandlers.onCloseAll}
          onSleepAll={tabHandlers.onSleepAll}
          canSleepTab={canSleepTab}
          copy={copy}
        />
      );
    }

    // window view
    return (
      <GroupGrid
        groups={windowGroups}
        accentColor={accentColor}
        onSwitch={tabHandlers.onSwitch}
        onClose={tabHandlers.onClose}
        onSleep={tabHandlers.onSleep}
        onCloseAll={tabHandlers.onCloseAll}
        onSleepAll={tabHandlers.onSleepAll}
        canSleepTab={canSleepTab}
        copy={copy}
      />
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <WaveBackground
        palette={currentPalette}
        accentColor={accentColor}
        paused={!settings.animationEnabled}
      />

      <MainPanel accentColor={accentColor} poemExpanded={poemExpanded}>
          <AppHeader
            openTabCount={tabState.tabs.length}
            duplicateCount={duplicateCount}
            sleepingTabCount={sleepingTabs.length}
            summarySeparator={summarySeparator}
            summaryEnd={summaryEnd}
            query={query}
            accentColor={accentColor}
            colorSample={colorSample}
            defaultAccentColor={settings.defaultAccentColor}
            isDarkMode={isDarkMode}
            searchToggleDisplay={settings.searchToggleDisplay}
            searchEngine={settings.searchEngine}
            searchIconStyle={settings.searchIconStyle}
            copy={copy}
            onQueryChange={setQuery}
            onUseAccentColor={useSelectedAccentColor}
            onSetDefaultAccentColor={setDefaultAccentColor}
            onUseRandomAccentColor={useRandomAccentColor}
            onToggleTheme={handleToggleTheme}
          />

          <TabContentArea
            view={view}
            accentColor={accentColor}
            copy={copy}
            counts={{
              all: tabState.tabs.length,
              domain: domainGroups.length,
              window: windowGroups.length,
              duplicate: duplicateCount,
            }}
            batchAction={batchAction}
            error={tabState.error}
            onViewChange={setView}
          >
            {renderTabList(view)}
          </TabContentArea>

      </MainPanel>

      <PoemDisplay
        show={settings.showPoem}
        expanded={poemExpanded}
        copy={copy.poem}
        searchEngine={settings.searchEngine}
        onExpandedChange={setPoemExpanded}
      />

      <FloatingControlBar
        accentColor={accentColor}
        colorSample={colorSample}
        animationEnabled={settings.animationEnabled}
        isDarkMode={isDarkMode}
        copy={copy}
        onToggleTheme={handleToggleTheme}
        onToggleAnimation={() => updateSettings({ animationEnabled: !settings.animationEnabled })}
        onOpenSettings={() => setSettingsOpen(true)}
        onChangeColor={changeColor}
      />

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
        onSetDefaultAccentColor={setDefaultAccentColor}
        onResetSettings={() => {
          resetAccentColor(DEFAULT_SETTINGS.defaultAccentColor);
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
