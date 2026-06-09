import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

import { cn } from '../../lib/cn';
import type { BookmarksBarStyle } from '../../types/settings';
import {
  BOOKMARK_MENU_NESTED_OPEN_DELAY_MS,
  BOOKMARK_MENU_TRANSITION,
} from './constants';
import { getMenuMaxHeight, hasChildren } from './bookmarkUtils';
import { BookmarkMenuEntry, BookmarkMenuSurface } from './BookmarkMenuPrimitives';
import type { BookmarkItem } from './types';

export function BookmarkMenuColumns({
  activeRootId,
  columns,
  columnOffsets,
  menuTop,
  panelLeft,
  openPath,
  setOpenPath,
  clearNestedOpenTimer,
  nestedOpenTimerRef,
  variant,
}: {
  activeRootId: string;
  columns: BookmarkItem[][];
  columnOffsets: number[];
  menuTop: number;
  panelLeft: number;
  openPath: string[];
  setOpenPath: Dispatch<SetStateAction<string[]>>;
  clearNestedOpenTimer: () => void;
  nestedOpenTimerRef: MutableRefObject<number | null>;
  variant: BookmarksBarStyle;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'absolute top-full z-[100] flex items-start pt-1.5',
          variant === 'standard' ? 'gap-0.5' : 'gap-1.5',
        )}
        style={{ left: panelLeft }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={BOOKMARK_MENU_TRANSITION}
      >
        {columns.map((items, columnIndex) => (
          <BookmarkMenuColumn
            key={`${activeRootId}-${columnIndex}`}
            items={items}
            columnIndex={columnIndex}
            offsetTop={columnOffsets[columnIndex] ?? 0}
            menuTop={menuTop}
            openPath={openPath}
            setOpenPath={setOpenPath}
            clearNestedOpenTimer={clearNestedOpenTimer}
            nestedOpenTimerRef={nestedOpenTimerRef}
            variant={variant}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

function BookmarkMenuColumn({
  items,
  columnIndex,
  offsetTop,
  menuTop,
  openPath,
  setOpenPath,
  clearNestedOpenTimer,
  nestedOpenTimerRef,
  variant,
}: {
  items: BookmarkItem[];
  columnIndex: number;
  offsetTop: number;
  menuTop: number;
  openPath: string[];
  setOpenPath: Dispatch<SetStateAction<string[]>>;
  clearNestedOpenTimer: () => void;
  nestedOpenTimerRef: MutableRefObject<number | null>;
  variant: BookmarksBarStyle;
}) {
  const basePath = openPath.slice(0, columnIndex + 1);
  const maxHeight = getMenuMaxHeight(menuTop, offsetTop);

  return (
    <BookmarkMenuSurface
      className={cn(
        'w-[min(220px,calc(100vw-24px))] max-w-full',
        variant === 'standard'
          ? 'border border-border/60 bg-popover/96 shadow-[0_16px_40px_rgba(34,54,50,0.16)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.36)]'
          : 'bg-background/72 shadow-[0_10px_28px_rgba(34,54,50,0.10)] dark:bg-background/72 dark:shadow-[0_14px_32px_rgba(0,0,0,0.28)]',
      )}
      style={{ marginTop: offsetTop, maxHeight }}
    >
      {items.map((item) => {
        const active = item.id === openPath[columnIndex + 1];
        const handleEnter = () => {
          const nextPath = hasChildren(item) ? [...basePath, item.id] : basePath;
          clearNestedOpenTimer();

          if (columnIndex === 0) {
            setOpenPath(nextPath);
            return;
          }

          nestedOpenTimerRef.current = window.setTimeout(() => {
            setOpenPath(nextPath);
            nestedOpenTimerRef.current = null;
          }, BOOKMARK_MENU_NESTED_OPEN_DELAY_MS);
        };

        if (hasChildren(item)) {
          return (
            <BookmarkMenuEntry
              key={item.id}
              item={item}
              active={active}
              variant={variant}
              onMouseEnter={handleEnter}
            >
              <ChevronRight className="ml-2 size-3.5 opacity-34" />
            </BookmarkMenuEntry>
          );
        }

        return (
          <BookmarkMenuEntry
            key={item.id}
            item={item}
            active={active}
            variant={variant}
            onMouseEnter={handleEnter}
          />
        );
      })}
    </BookmarkMenuSurface>
  );
}
