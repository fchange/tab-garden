import { cn } from '../lib/cn';
import type { BookmarksBarStyle } from '../types/settings';
import { BookmarkMenuColumns } from './bookmarks/BookmarkMenuColumns';
import { BookmarkRootEntry } from './bookmarks/BookmarkRootEntry';
import { useBookmarkMenuState } from './bookmarks/useBookmarkMenuState';
import { useBookmarksBarItems } from './bookmarks/useBookmarksBarItems';
import type { BookmarkItem } from './bookmarks/types';

export function BookmarksBar({ style }: { style: BookmarksBarStyle }) {
  const bookmarks = useBookmarksBarItems();

  if (bookmarks.length === 0) return null;

  return <BookmarkMenuBar bookmarks={bookmarks} variant={style} />;
}

function BookmarkMenuBar({ bookmarks, variant }: { bookmarks: BookmarkItem[]; variant: BookmarksBarStyle }) {
  const {
    activeRoot,
    clearCloseTimer,
    clearNestedOpenTimer,
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
  } = useBookmarkMenuState(bookmarks, variant);

  const barClassName = cn(
    'absolute inset-x-0 top-0 z-20 flex w-full max-w-full items-center gap-1 px-3 py-1.5',
    variant === 'standard'
      ? 'overflow-visible border-b border-white/20 bg-white/22 shadow-[var(--theme-inset-highlight)] backdrop-blur-md dark:border-white/[0.06] dark:bg-black/10'
      : 'h-10 overflow-visible',
  );
  const rootListClassName = cn(
    'flex min-w-0 flex-1 flex-nowrap items-center gap-1',
    variant === 'standard' ? 'overflow-x-auto' : 'overflow-hidden',
  );

  return (
    <nav
      ref={navRef}
      aria-label="Bookmarks bar"
      className={barClassName}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      <div className={rootListClassName}>
        {bookmarks.map((item) => (
          <BookmarkRootEntry
            key={item.id}
            item={item}
            active={item.id === openPath[0]}
            variant={variant}
            onMouseEnter={(event) => handleRootEnter(item, event)}
          />
        ))}
      </div>

      {activeRoot && columns.length > 0 && (
        <BookmarkMenuColumns
          activeRootId={activeRoot.id}
          columns={columns}
          columnOffsets={columnOffsets}
          menuTop={menuTop}
          panelLeft={panelLeft}
          openPath={openPath}
          setOpenPath={setOpenPath}
          clearNestedOpenTimer={clearNestedOpenTimer}
          nestedOpenTimerRef={nestedOpenTimerRef}
          variant={variant}
        />
      )}
    </nav>
  );
}
