import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AppCopy } from '../lib/i18n';
import type { BrowserTab } from '../types/tab';
import { TabItem } from './TabItem';

const ITEM_HEIGHT = 74;
const OVERSCAN = 6;

interface VirtualTabListProps {
  tabs: BrowserTab[];
  accentColor: string;
  onClose?: (tab: BrowserTab) => void;
  onSwitch?: (tab: BrowserTab) => void;
  duplicateTabIds?: Set<number>;
  showDuplicateBadge?: boolean;
  copy: AppCopy;
}

export function VirtualTabList({
  tabs,
  accentColor,
  onClose,
  onSwitch,
  duplicateTabIds,
  showDuplicateBadge,
  copy,
}: VirtualTabListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateHeight = () => setViewportHeight(viewport.clientHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(viewport);

    return () => observer.disconnect();
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
      className="min-w-0 max-h-[calc(100vh-330px)] overflow-y-auto overflow-x-hidden pb-2"
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
              onSwitch={onSwitch}
              showDuplicateBadge={showDuplicateBadge || duplicateTabIds?.has(tab.id)}
              copy={copy}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
