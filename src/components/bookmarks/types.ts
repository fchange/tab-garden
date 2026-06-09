export interface BookmarkItem extends chrome.bookmarks.BookmarkTreeNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkItem[];
}
