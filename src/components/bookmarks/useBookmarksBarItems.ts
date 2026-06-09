import { useEffect, useState } from 'react';

import { BOOKMARK_BAR_INDEX } from './constants';
import type { BookmarkItem } from './types';

export function useBookmarksBarItems() {
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

  return bookmarks;
}
