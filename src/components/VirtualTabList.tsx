import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAccent } from '../lib/appContext';
import { readCssVarPx } from '../lib/cssLength';
import { calculateCollisionSafeHeight } from '../lib/layout';
import type { BrowserTab } from '../types/tab';
import { TabItem } from './TabItem';

const ITEM_HEIGHT = 74;
const OVERSCAN = 6;
const MIN_VIEWPORT_HEIGHT = 120;

interface VirtualTabListProps {
  tabs: BrowserTab[];
  onClose?: (tab: BrowserTab) => void;
  onSleep?: (tab: BrowserTab) => void;
  onSwitch?: (tab: BrowserTab) => void;
  canSleepTab?: (tab: BrowserTab) => boolean;
  duplicateTabIds?: Set<number>;
  showDuplicateBadge?: boolean;
}

export function VirtualTabList({
  tabs,
  onClose,
  onSleep,
  onSwitch,
  canSleepTab,
  duplicateTabIds,
  showDuplicateBadge,
}: VirtualTabListProps) {
  const { accentColor } = useAccent();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState<number>();

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frame = 0;
    const panel = viewport.closest<HTMLElement>('[data-main-panel]');

    const updateLayout = () => {
      frame = 0;

      const poem = document.querySelector<HTMLElement>('[data-poem-display]');
      const nextViewportHeight = viewport.clientHeight;
      setViewportHeight((current) =>
        current === nextViewportHeight ? current : nextViewportHeight,
      );

      if (!poem || !panel) {
        setMaxHeight(undefined);
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const poemRect = poem.getBoundingClientRect();
      const nextMaxHeight = calculateCollisionSafeHeight({
        configuredMaxHeight: readCssVarPx('--layout-content-max-height'),
        minimumHeight: MIN_VIEWPORT_HEIGHT,
        panelBottomInset: Math.max(0, panelRect.bottom - viewportRect.bottom),
        poemTop: poemRect.top,
        safeGap: readCssVarPx('--poem-safe-gap'),
        viewportTop: viewportRect.top,
      });

      setMaxHeight((current) =>
        current !== undefined && Math.abs(current - nextMaxHeight) < 1
          ? current
          : nextMaxHeight,
      );
    };

    const scheduleLayoutUpdate = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateLayout);
    };

    scheduleLayoutUpdate();

    const observer = new ResizeObserver(scheduleLayoutUpdate);
    observer.observe(viewport);
    if (panel) observer.observe(panel);
    window.addEventListener('resize', scheduleLayoutUpdate);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleLayoutUpdate);
    };
  }, []);

  const handleScroll = useCallback(() => {
    setScrollTop(viewportRef.current?.scrollTop ?? 0);
  }, []);

  const { startIndex, visibleTabs } = useMemo(() => {
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT);
    const nextStartIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(tabs.length, nextStartIndex + visibleCount + OVERSCAN * 2);

    return {
      startIndex: nextStartIndex,
      visibleTabs: tabs.slice(nextStartIndex, endIndex),
    };
  }, [scrollTop, tabs, viewportHeight]);

  return (
    <div
      ref={viewportRef}
      className="min-w-0 max-h-[var(--layout-content-max-height)] overflow-y-auto overflow-x-hidden pb-2"
      style={maxHeight === undefined ? undefined : { maxHeight }}
      onScroll={handleScroll}
    >
      <div className="relative min-w-0" style={{ height: tabs.length * ITEM_HEIGHT }}>
        {visibleTabs.map((tab, index) => (
          <div
            key={tab.id}
            className="absolute left-0 right-0"
            style={{ top: (startIndex + index) * ITEM_HEIGHT }}
          >
            <TabItem
              tab={tab}
              accentColor={accentColor}
              onClose={onClose}
              onSleep={onSleep}
              onSwitch={onSwitch}
              canSleep={canSleepTab?.(tab) ?? false}
              showDuplicateBadge={showDuplicateBadge || duplicateTabIds?.has(tab.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
