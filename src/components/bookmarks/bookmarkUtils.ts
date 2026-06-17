import type { BookmarkItem } from './types';
import { getChromeFaviconUrl } from '../../lib/url';
import {
  BOOKMARK_MENU_ITEM_HEIGHT,
  BOOKMARK_MENU_MAX_VISIBLE_DEPTH,
  BOOKMARK_MENU_MIN_HEIGHT,
  BOOKMARK_MENU_VIEWPORT_GAP,
} from './constants';

export function getFaviconUrl(url: string): string {
  return getChromeFaviconUrl(url);
}

export function getBookmarkLabel(item: BookmarkItem): string {
  if (item.title) return item.title;
  if (!item.url) return '';

  try {
    return new URL(item.url).hostname;
  } catch {
    return item.url;
  }
}

export function hasChildren(item: BookmarkItem): boolean {
  return !!item.children?.length;
}

export function getMenuMaxHeight(menuTop: number, offsetTop = 0): string {
  return `max(${BOOKMARK_MENU_MIN_HEIGHT}px, min(420px, calc(100vh - ${Math.ceil(menuTop + offsetTop + BOOKMARK_MENU_VIEWPORT_GAP)}px)))`;
}

export function getBookmarkMenuColumns(rootItem: BookmarkItem | undefined, openPath: string[]): BookmarkItem[][] {
  if (!rootItem || !hasChildren(rootItem)) return [];

  const columns: BookmarkItem[][] = [];
  let current: BookmarkItem | undefined = rootItem;

  for (let depth = 1; depth < BOOKMARK_MENU_MAX_VISIBLE_DEPTH; depth += 1) {
    const items: BookmarkItem[] = current?.children ?? [];
    if (items.length === 0) break;

    columns.push(items);

    const selectedId = openPath[depth];
    current = items.find((item) => item.id === selectedId);
    if (!current || !hasChildren(current)) break;
  }

  return columns;
}

export function getBookmarkMenuColumnOffsets(columns: BookmarkItem[][], openPath: string[]): number[] {
  if (columns.length === 0) return [];

  const offsets: number[] = [];

  columns.forEach((_, columnIndex) => {
    if (columnIndex === 0) return;

    const parentId = openPath[columnIndex];
    const parentColumn = columns[columnIndex - 1];
    const parentOffset = offsets[columnIndex - 1] ?? 0;
    const parentIndex = Math.max(0, parentColumn.findIndex((item) => item.id === parentId));
    offsets[columnIndex] = parentOffset + parentIndex * BOOKMARK_MENU_ITEM_HEIGHT;
  });

  offsets[0] = 0;
  return offsets;
}
