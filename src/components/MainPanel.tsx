import { useDeferredValue, useEffect, useState } from 'react';
import { motion } from 'motion/react';

import { useTabActions } from '../hooks/useTabActions';
import { useTabs } from '../hooks/useTabs';
import { useTabViewModel } from '../hooks/useTabViewModel';
import { useCopy, useSettingsContext } from '../lib/appContext';
import { cn } from '../lib/cn';
import type { ViewMode } from '../types/tab';
import { AppHeader } from './AppHeader';
import { TabContentArea } from './TabContentArea';
import { TabResults } from './TabResults';

interface MainPanelProps {
  poemExpanded: boolean;
}

export function MainPanel({ poemExpanded }: MainPanelProps) {
  const { ready, settings } = useSettingsContext();
  const copy = useCopy();
  const [view, setView] = useState<ViewMode>('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const tabState = useTabs(settings, copy);
  const {
    filteredTabs,
    domainGroups,
    windowGroups,
    duplicateCount,
    sleepingTabs,
    duplicateTabIds,
    duplicateTabs,
    canSleepTab,
  } = useTabViewModel({
    tabs: tabState.tabs,
    settings,
    copy,
    query: deferredQuery,
  });

  useEffect(() => {
    if (ready) {
      setView(settings.defaultView);
    }
  }, [ready, settings.defaultView]);

  const { handlers: tabHandlers, batchAction } = useTabActions({
    copy,
    view,
    duplicateCount,
    tabState,
  });

  return (
    <motion.div
      className={cn(
        'relative z-10 w-[min(980px,calc(100vw-48px))] mt-[clamp(28px,5vh,60px)] rounded-[20px] overflow-hidden bg-card/65 backdrop-blur-sm backdrop-saturate-150 border border-border/90 shadow-[var(--theme-shadow-soft)] transition-[background,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] max-[720px]:w-[calc(100vw-32px)] max-[720px]:mt-4',
        poemExpanded && 'pointer-events-none',
      )}
      animate={{
        y: poemExpanded ? 'calc(-100% - clamp(80px, 14vh, 150px))' : 0,
        scale: poemExpanded ? 0.52 : 1,
        opacity: 1,
      }}
      transition={{ duration: 0.74, delay: poemExpanded ? 0.12 : 0, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'top center' }}
    >
      <div className="px-6 pt-5 pb-5 min-w-0 max-[720px]:p-4">
        <AppHeader
          openTabCount={tabState.tabs.length}
          duplicateCount={duplicateCount}
          sleepingTabCount={sleepingTabs.length}
          query={query}
          onQueryChange={setQuery}
        />

        <TabContentArea
          view={view}
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
          <TabResults
            view={view}
            query={query}
            loading={tabState.loading}
            totalTabCount={tabState.tabs.length}
            filteredTabs={filteredTabs}
            duplicateTabs={duplicateTabs}
            domainGroups={domainGroups}
            windowGroups={windowGroups}
            duplicateTabIds={duplicateTabIds}
            canSleepTab={canSleepTab}
            handlers={tabHandlers}
          />
        </TabContentArea>
      </div>
    </motion.div>
  );
}
