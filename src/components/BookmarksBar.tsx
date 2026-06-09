import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Folder } from 'lucide-react';

import { cn } from '../lib/cn';
import type { BookmarksBarStyle } from '../types/settings';

interface BookmarkItem extends chrome.bookmarks.BookmarkTreeNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkItem[];
}

const BOOKMARK_BAR_INDEX = 0;
const BORDERLESS_MAX_VISIBLE_ITEMS = 18;
const BORDERLESS_MAX_VISIBLE_DEPTH = 5;
const BORDERLESS_PANEL_WIDTH = 220;
const BORDERLESS_ITEM_HEIGHT = 28;
const BORDERLESS_COLLAPSE_DELAY_MS = 150;

function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return '';
  }
}

function getBookmarkLabel(item: BookmarkItem): string {
  if (item.title) return item.title;
  if (!item.url) return '';

  try {
    return new URL(item.url).hostname;
  } catch {
    return item.url;
  }
}

function hasChildren(item: BookmarkItem): boolean {
  return !!item.children?.length;
}

function getVisibleItems(items: BookmarkItem[] | undefined): BookmarkItem[] {
  return (items ?? []).slice(0, BORDERLESS_MAX_VISIBLE_ITEMS);
}

export function BookmarksBar({ style }: { style: BookmarksBarStyle }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.bookmarks?.getTree) return;

    const loadBookmarks = () => {
      chrome.bookmarks.getTree((tree) => {
        const bookmarksBar = tree[0]?.children?.[BOOKMARK_BAR_INDEX];
        setBookmarks((bookmarksBar?.children ?? []) as BookmarkItem[]);
      });
    };

    loadBookmarks();

    const listeners = [
      chrome.bookmarks.onCreated,
      chrome.bookmarks.onRemoved,
      chrome.bookmarks.onChanged,
      chrome.bookmarks.onMoved,
      chrome.bookmarks.onChildrenReordered,
      chrome.bookmarks.onImportEnded,
    ].filter(Boolean);

    listeners.forEach((event) => event.addListener(loadBookmarks));
    return () => listeners.forEach((event) => event.removeListener(loadBookmarks));
  }, []);

  if (bookmarks.length === 0) return null;

  if (style === 'borderless') {
    return <BorderlessBookmarksBar bookmarks={bookmarks} />;
  }

  return <StandardBookmarksBar bookmarks={bookmarks} />;
}

function StandardBookmarksBar({ bookmarks }: { bookmarks: BookmarkItem[] }) {
  return (
    <nav
      aria-label="Bookmarks bar"
      className="relative z-20 flex w-full max-w-full items-center gap-1 overflow-x-auto border-b border-white/20 bg-white/22 px-3 py-1.5 shadow-[var(--theme-inset-highlight)] backdrop-blur-md dark:border-white/[0.06] dark:bg-black/10"
    >
      {bookmarks.map((item) => (
        <StandardBookmarkEntry key={item.id} item={item} />
      ))}
    </nav>
  );
}

function StandardBookmarkEntry({ item }: { item: BookmarkItem }) {
  if (hasChildren(item)) {
    return <StandardBookmarkFolder item={item} />;
  }

  return (
    <a
      href={item.url}
      className="flex h-8 max-w-[180px] shrink-0 items-center gap-1.5 rounded-md px-2 text-[13px] text-foreground/78 transition-colors hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]"
    >
      <img
        src={getFaviconUrl(item.url ?? '')}
        alt=""
        className="size-4 shrink-0 rounded-[3px]"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <span className="truncate">{getBookmarkLabel(item)}</span>
    </a>
  );
}

function StandardBookmarkFolder({ item }: { item: BookmarkItem }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<CSSProperties | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openMenu = () => {
    clearCloseTimer();

    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPosition({
        left: rect.left,
        top: rect.bottom + 2,
      });
    }

    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <div className="relative shrink-0" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        ref={triggerRef}
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-foreground/78 transition-colors hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]"
      >
        <Folder className="size-3.5 opacity-55" />
        <span className="truncate max-w-[120px]">{getBookmarkLabel(item)}</span>
      </button>
      {open && menuPosition && createPortal(
        <StandardBookmarkDropdownMenu
          item={item}
          position={menuPosition}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        />,
        document.body,
      )}
    </div>
  );
}

function StandardBookmarkDropdownMenu({
  item,
  position,
  onMouseEnter,
  onMouseLeave,
}: {
  item: BookmarkItem;
  position: CSSProperties;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="fixed z-[100] min-w-[200px] max-w-[320px] rounded-lg border border-border/60 bg-popover/96 py-1 shadow-[0_16px_40px_rgba(34,54,50,0.16)] backdrop-blur-md dark:shadow-[0_18px_44px_rgba(0,0,0,0.36)]"
      style={position}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {item.children!.map((child) => (
        <StandardBookmarkDropdownEntry key={child.id} item={child} />
      ))}
    </div>
  );
}

function StandardBookmarkDropdownEntry({ item }: { item: BookmarkItem }) {
  if (hasChildren(item)) {
    return (
      <div className="group relative">
        <div className="flex cursor-default items-center gap-2 px-3 py-1.5 text-[13px] text-foreground/78 hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]">
          <Folder className="size-3.5 shrink-0 opacity-55" />
          <span className="truncate">{getBookmarkLabel(item)}</span>
          <ChevronRight className="ml-auto size-3.5 opacity-38" />
        </div>
        <div className="absolute left-full top-0 z-[110] ml-0.5 hidden min-w-[200px] max-w-[320px] rounded-lg border border-border/60 bg-popover/96 py-1 shadow-[0_16px_40px_rgba(34,54,50,0.16)] backdrop-blur-md group-hover:block dark:shadow-[0_18px_44px_rgba(0,0,0,0.36)]">
          {item.children!.map((child) => (
            <StandardBookmarkDropdownEntry key={child.id} item={child} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <a
      href={item.url}
      className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-foreground/78 transition-colors hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]"
    >
      <img
        src={getFaviconUrl(item.url ?? '')}
        alt=""
        className="size-4 shrink-0 rounded-[3px]"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <span className="truncate">{getBookmarkLabel(item)}</span>
    </a>
  );
}

function BorderlessBookmarksBar({ bookmarks }: { bookmarks: BookmarkItem[] }) {
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [openPath, setOpenPath] = useState<string[]>([]);
  const [panelLeft, setPanelLeft] = useState(0);
  const visibleRoots = useMemo(() => getVisibleItems(bookmarks), [bookmarks]);
  const activeRoot = visibleRoots.find((item) => item.id === openPath[0]);
  const columns = useMemo(() => getBorderlessColumns(activeRoot, openPath), [activeRoot, openPath]);
  const columnOffsets = useMemo(() => getBorderlessColumnOffsets(columns, openPath), [columns, openPath]);

  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpenPath([]), BORDERLESS_COLLAPSE_DELAY_MS);
  };

  const handleRootEnter = (item: BookmarkItem, event: MouseEvent<HTMLElement>) => {
    clearCloseTimer();

    if (!hasChildren(item)) {
      setOpenPath([]);
      return;
    }

    const navRect = navRef.current?.getBoundingClientRect();
    const triggerRect = event.currentTarget.getBoundingClientRect();
    if (navRect) {
      const maxLeft = Math.max(0, navRect.width - BORDERLESS_PANEL_WIDTH);
      setPanelLeft(Math.max(0, Math.min(triggerRect.left - navRect.left, maxLeft)));
    }

    setOpenPath([item.id]);
  };

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <nav
      ref={navRef}
      aria-label="Bookmarks bar"
      className="relative z-20 flex h-10 w-full max-w-full items-center gap-1 overflow-visible px-3 py-1.5"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
        {visibleRoots.map((item) => {
          const active = item.id === openPath[0];
          const className = cn(
            'group flex h-7 max-w-[156px] shrink-0 items-center rounded-md px-2.5 text-[13px] leading-none text-foreground/74 transition-colors duration-150 hover:bg-foreground/[0.065] hover:text-foreground/90 dark:text-foreground/78 dark:hover:bg-white/[0.075] dark:hover:text-foreground/92',
            active && 'bg-foreground/[0.075] text-foreground/92 dark:bg-white/[0.085]',
          );

          if (hasChildren(item)) {
            return (
              <button
                key={item.id}
                type="button"
                className={className}
                onMouseEnter={(event) => handleRootEnter(item, event)}
              >
                <span className="min-w-0 truncate">{getBookmarkLabel(item)}</span>
                <span className="ml-1.5 text-[10px] opacity-36">v</span>
              </button>
            );
          }

          return (
            <a
              key={item.id}
              href={item.url}
              className={className}
              onMouseEnter={(event) => handleRootEnter(item, event)}
            >
              <span className="min-w-0 truncate">{getBookmarkLabel(item)}</span>
            </a>
          );
        })}
      </div>

      {activeRoot && columns.length > 0 && (
        <div
          className="absolute top-full z-[100] flex items-start gap-1.5 pt-1.5"
          style={{ left: panelLeft }}
        >
          {columns.map((items, columnIndex) => (
            <BorderlessBookmarkColumn
              key={`${activeRoot.id}-${columnIndex}`}
              items={items}
              columnIndex={columnIndex}
              offsetTop={columnOffsets[columnIndex] ?? 0}
              openPath={openPath}
              setOpenPath={setOpenPath}
            />
          ))}
        </div>
      )}
    </nav>
  );
}

function getBorderlessColumns(rootItem: BookmarkItem | undefined, openPath: string[]): BookmarkItem[][] {
  if (!rootItem || !hasChildren(rootItem)) return [];

  const columns: BookmarkItem[][] = [];
  let current: BookmarkItem | undefined = rootItem;

  for (let depth = 1; depth < BORDERLESS_MAX_VISIBLE_DEPTH; depth += 1) {
    const items = getVisibleItems(current?.children);
    if (items.length === 0) break;

    columns.push(items);

    const selectedId = openPath[depth];
    current = items.find((item) => item.id === selectedId);
    if (!current || !hasChildren(current)) break;
  }

  return columns;
}

function getBorderlessColumnOffsets(columns: BookmarkItem[][], openPath: string[]): number[] {
  if (columns.length === 0) return [];

  const offsets: number[] = [];

  columns.forEach((_, columnIndex) => {
    if (columnIndex === 0) return 0;

    const parentId = openPath[columnIndex];
    const parentColumn = columns[columnIndex - 1];
    const parentOffset = offsets[columnIndex - 1] ?? 0;
    const parentIndex = Math.max(0, parentColumn.findIndex((item) => item.id === parentId));
    offsets[columnIndex] = parentOffset + parentIndex * BORDERLESS_ITEM_HEIGHT;
  });

  offsets[0] = 0;
  return offsets;
}

function BorderlessBookmarkColumn({
  items,
  columnIndex,
  offsetTop,
  openPath,
  setOpenPath,
}: {
  items: BookmarkItem[];
  columnIndex: number;
  offsetTop: number;
  openPath: string[];
  setOpenPath: (openPath: string[]) => void;
}) {
  const basePath = openPath.slice(0, columnIndex + 1);

  return (
    <div
      className="w-[min(220px,calc(100vw-24px))] max-w-full rounded-lg bg-background/72 py-1 shadow-[0_10px_28px_rgba(34,54,50,0.10)] backdrop-blur-md dark:bg-background/72 dark:shadow-[0_14px_32px_rgba(0,0,0,0.28)]"
      style={{ marginTop: offsetTop }}
    >
      {items.map((item) => {
        const active = item.id === openPath[columnIndex + 1];
        const className = cn(
          'group flex h-7 w-full items-center rounded-md px-2.5 text-left text-[13px] leading-none text-foreground/74 transition-colors duration-150 hover:bg-foreground/[0.065] hover:text-foreground/90 dark:text-foreground/78 dark:hover:bg-white/[0.075] dark:hover:text-foreground/92',
          active && 'bg-foreground/[0.075] text-foreground/92 dark:bg-white/[0.085]',
        );
        const handleEnter = () => {
          setOpenPath(hasChildren(item) ? [...basePath, item.id] : basePath);
        };

        if (hasChildren(item)) {
          return (
            <button
              key={item.id}
              type="button"
              className={className}
              onMouseEnter={handleEnter}
            >
              <span className="min-w-0 flex-1 truncate">{getBookmarkLabel(item)}</span>
              <span className="ml-2 text-[12px] opacity-34">&gt;</span>
            </button>
          );
        }

        return (
          <a
            key={item.id}
            href={item.url}
            className={className}
            onMouseEnter={handleEnter}
          >
            <span className="min-w-0 flex-1 truncate">{getBookmarkLabel(item)}</span>
          </a>
        );
      })}
    </div>
  );
}
