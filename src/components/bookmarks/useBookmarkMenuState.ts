import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';

import type { BookmarksBarStyle } from '../../types/settings';
import {
  BOOKMARK_MENU_PANEL_WIDTH,
  BORDERLESS_COLLAPSE_DELAY_MS,
  STANDARD_COLLAPSE_DELAY_MS,
} from './constants';
import {
  getBookmarkMenuColumnOffsets,
  getBookmarkMenuColumns,
  hasChildren,
} from './bookmarkUtils';
import type { BookmarkItem } from './types';

export function useBookmarkMenuState(bookmarks: BookmarkItem[], variant: BookmarksBarStyle) {
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const nestedOpenTimerRef = useRef<number | null>(null);
  const [openPath, setOpenPath] = useState<string[]>([]);
  const [panelLeft, setPanelLeft] = useState(0);
  const [menuTop, setMenuTop] = useState(0);
  const activeRoot = bookmarks.find((item) => item.id === openPath[0]);
  const columns = useMemo(() => getBookmarkMenuColumns(activeRoot, openPath), [activeRoot, openPath]);
  const columnOffsets = useMemo(
    () => variant === 'borderless' ? getBookmarkMenuColumnOffsets(columns, openPath) : columns.map(() => 0),
    [columns, openPath, variant],
  );
  const closeDelay = variant === 'standard' ? STANDARD_COLLAPSE_DELAY_MS : BORDERLESS_COLLAPSE_DELAY_MS;

  const clearNestedOpenTimer = () => {
    if (nestedOpenTimerRef.current === null) return;
    window.clearTimeout(nestedOpenTimerRef.current);
    nestedOpenTimerRef.current = null;
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const scheduleClose = () => {
    clearCloseTimer();
    clearNestedOpenTimer();
    closeTimerRef.current = window.setTimeout(() => setOpenPath([]), closeDelay);
  };

  const handleRootEnter = (item: BookmarkItem, event: MouseEvent<HTMLElement>) => {
    clearCloseTimer();
    clearNestedOpenTimer();

    if (!hasChildren(item)) {
      setOpenPath([]);
      return;
    }

    const navRect = navRef.current?.getBoundingClientRect();
    const triggerRect = event.currentTarget.getBoundingClientRect();
    if (navRect) {
      const maxLeft = Math.max(0, navRect.width - BOOKMARK_MENU_PANEL_WIDTH);
      setPanelLeft(Math.max(0, Math.min(triggerRect.left - navRect.left, maxLeft)));
      setMenuTop(navRect.bottom);
    }

    setOpenPath([item.id]);
  };

  useEffect(() => () => {
    clearCloseTimer();
    clearNestedOpenTimer();
  }, []);

  return {
    activeRoot,
    clearNestedOpenTimer,
    clearCloseTimer,
    columnOffsets,
    columns,
    handleRootEnter,
    menuTop,
    nestedOpenTimerRef,
    navRef,
    openPath,
    panelLeft,
    scheduleClose,
    setOpenPath,
  };
}
