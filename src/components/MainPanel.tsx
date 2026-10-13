import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { useTokenDrivenMotionY } from '../hooks/useTokenDrivenMotionY';
import { useTabActions } from '../hooks/useTabActions';
import { useTabs } from '../hooks/useTabs';
import { useTabViewModel } from '../hooks/useTabViewModel';
import { useCopy, useSettingsContext } from '../lib/appContext';
import { cn } from '../lib/cn';
import { readCssVarPx } from '../lib/cssLength';
import { calculateCollisionSafeHeight } from '../lib/layout';
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
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [contentMaxHeight, setContentMaxHeight] = useState<number>();
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

  // y from tokens via MotionValue — see useTokenDrivenMotionY contract.
  const exitY = useTokenDrivenMotionY({
    active: poemExpanded,
    duration: reducedMotion ? 0 : 0.74,
    enterDelay: reducedMotion ? 0 : 0.12,
    getActiveY: () => {
      const height = panelRef.current?.offsetHeight ?? 0;
      const gap = readCssVarPx('--layout-panel-exit-gap');
      return -(height + gap);
    },
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

  useEffect(() => {
    if (!settings.showPoem) {
      setContentMaxHeight(undefined);
      return;
    }

    const panel = panelRef.current;
    const content = panel?.querySelector<HTMLElement>('[role="tabpanel"]');
    if (!panel || !content) return;

    // Layout offsets ignore the shared y/scale animation, unlike client rects.
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      for (let current: HTMLElement | null = element; current; current = current.offsetParent as HTMLElement | null) {
        top += current.offsetTop + (current.offsetParent instanceof HTMLElement ? current.offsetParent.clientTop : 0);
      }
      return top;
    };

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const contentTop = layoutTop(content);
        const height = calculateCollisionSafeHeight({
          configuredMaxHeight: readCssVarPx('--layout-content-max-height'),
          minimumHeight: 120,
          panelBottomInset: Math.max(0, layoutTop(panel) + panel.offsetHeight - contentTop - content.offsetHeight),
          viewportTop: contentTop,
          poemTop: window.innerHeight - readCssVarPx('--poem-dock-inset'),
          safeGap: readCssVarPx('--poem-safe-gap'),
        });
        setContentMaxHeight((current) => current !== undefined && Math.abs(current - height) < 1 ? current : height);
      });
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      // Bookmark spacing changes position without triggering ResizeObserver.
      if (event.target === panel && event.propertyName === 'margin-top') update();
    };

    update();
    const observer = new ResizeObserver(update);
    [panel, content].forEach((element) => observer.observe(element));
    window.addEventListener('resize', update);
    panel.addEventListener('transitionend', onTransitionEnd);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', update);
      panel.removeEventListener('transitionend', onTransitionEnd);
    };
  }, [settings.showPoem, settings.showBookmarksBar, view]);

  return (
    <motion.div
      ref={panelRef}
      data-main-panel
      className={cn(
        'relative z-10 w-[var(--layout-panel-width)] mt-[var(--layout-panel-top)] rounded-[20px] overflow-hidden backdrop-saturate-150 border border-border/90 shadow-[var(--theme-shadow-soft)] transition-[background,border-color,box-shadow,width,margin] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        settings.wallpaperId ? 'bg-card/85 backdrop-blur-md' : 'bg-card/65 backdrop-blur-sm',
        settings.showBookmarksBar && 'main-panel-with-bookmarks',
        poemExpanded && 'pointer-events-none',
      )}
      style={{
        y: exitY,
        transformOrigin: 'top center',
        ...(contentMaxHeight === undefined ? {} : { '--layout-content-max-height': `${contentMaxHeight}px` }),
      }}
      animate={{
        scale: poemExpanded ? 0.52 : 1,
        opacity: 1,
      }}
      initial={false}
      transition={{ duration: reducedMotion ? 0 : 0.74, delay: poemExpanded && !reducedMotion ? 0.12 : 0, ease: [0.22, 1, 0.36, 1] }}
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
