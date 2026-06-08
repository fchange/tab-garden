import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Folder } from 'lucide-react';

interface BookmarkItem extends chrome.bookmarks.BookmarkTreeNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkItem[];
}

const BOOKMARK_BAR_INDEX = 0;

function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return '';
  }
}

export function BookmarksBar() {
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

  return (
    <nav
      aria-label="Bookmarks bar"
      className="relative z-20 flex w-full max-w-full items-center gap-1 overflow-x-auto border-b border-white/20 bg-white/22 px-3 py-1.5 shadow-[var(--theme-inset-highlight)] backdrop-blur-md dark:border-white/[0.06] dark:bg-black/10"
    >
      {bookmarks.map((item) => (
        <BookmarkEntry key={item.id} item={item} />
      ))}
    </nav>
  );
}

function BookmarkEntry({ item }: { item: BookmarkItem }) {
  if (item.children && item.children.length > 0) {
    return <BookmarkFolder item={item} />;
  }

  return (
    <a
      href={item.url}
      title={item.title}
      className="flex h-8 max-w-[180px] shrink-0 items-center gap-1.5 rounded-md px-2 text-[13px] text-foreground/78 transition-colors hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]"
    >
      <img
        src={getFaviconUrl(item.url ?? '')}
        alt=""
        className="size-4 shrink-0 rounded-[3px]"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <span className="truncate">{item.title || new URL(item.url ?? '').hostname}</span>
    </a>
  );
}

function BookmarkFolder({ item }: { item: BookmarkItem }) {
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
        <span className="truncate max-w-[120px]">{item.title}</span>
      </button>
      {open && menuPosition && createPortal(
        <BookmarkDropdownMenu
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

function BookmarkDropdownMenu({
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
        <BookmarkDropdownEntry key={child.id} item={child} />
      ))}
    </div>
  );
}

function BookmarkDropdownEntry({ item }: { item: BookmarkItem }) {
  if (item.children && item.children.length > 0) {
    return (
      <div className="group relative">
        <div className="flex cursor-default items-center gap-2 px-3 py-1.5 text-[13px] text-foreground/78 hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]">
          <Folder className="size-3.5 shrink-0 opacity-55" />
          <span className="truncate">{item.title}</span>
          <ChevronRight className="ml-auto size-3.5 opacity-38" />
        </div>
        <div className="absolute left-full top-0 z-[110] ml-0.5 hidden min-w-[200px] max-w-[320px] rounded-lg border border-border/60 bg-popover/96 py-1 shadow-[0_16px_40px_rgba(34,54,50,0.16)] backdrop-blur-md group-hover:block dark:shadow-[0_18px_44px_rgba(0,0,0,0.36)]">
          {item.children.map((child) => (
            <BookmarkDropdownEntry key={child.id} item={child} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <a
      href={item.url}
      title={item.title}
      className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-foreground/78 transition-colors hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]"
    >
      <img
        src={getFaviconUrl(item.url ?? '')}
        alt=""
        className="size-4 shrink-0 rounded-[3px]"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <span className="truncate">{item.title || new URL(item.url ?? '').hostname}</span>
    </a>
  );
}
