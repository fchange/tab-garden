import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Folder } from 'lucide-react';

import { cn } from '../../lib/cn';
import type { BookmarksBarStyle } from '../../types/settings';
import { BOOKMARK_MENU_TRANSITION } from './constants';
import { getBookmarkLabel, getFaviconUrl, hasChildren } from './bookmarkUtils';
import type { BookmarkItem } from './types';

export function BookmarkItemIcon({ item }: { item: BookmarkItem }) {
  if (hasChildren(item)) {
    return <Folder className="size-3.5 shrink-0 opacity-55" />;
  }

  return (
    <img
      src={getFaviconUrl(item.url ?? '')}
      alt=""
      className="size-4 shrink-0 rounded-[3px]"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

export function BookmarkMenuSurface({
  children,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -3, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -2, scale: 0.985 }}
      transition={BOOKMARK_MENU_TRANSITION}
      className={cn(
        'origin-top overflow-y-auto overscroll-contain rounded-lg py-1 backdrop-blur-md',
        className,
      )}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export function BookmarkMenuEntry({
  item,
  active,
  variant,
  onMouseEnter,
  children,
}: {
  item: BookmarkItem;
  active?: boolean;
  variant: BookmarksBarStyle;
  onMouseEnter?: () => void;
  children?: ReactNode;
}) {
  const className = cn(
    'group flex w-full items-center text-left text-[13px] transition-colors duration-150',
    variant === 'standard'
      ? 'gap-2 px-3 py-1.5 text-foreground/78 hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]'
      : 'h-8 gap-2 rounded-md px-3 leading-[1.25] text-foreground/74 hover:bg-foreground/[0.065] hover:text-foreground/90 dark:text-foreground/78 dark:hover:bg-white/[0.075] dark:hover:text-foreground/92',
    active && 'bg-foreground/[0.075] text-foreground/92 dark:bg-white/[0.085]',
  );
  const content = (
    <>
      {variant === 'standard' && <BookmarkItemIcon item={item} />}
      <span className="min-w-0 flex-1 truncate">{getBookmarkLabel(item)}</span>
      {children}
    </>
  );

  if (hasChildren(item)) {
    return (
      <button type="button" className={className} onMouseEnter={onMouseEnter}>
        {content}
      </button>
    );
  }

  return (
    <a href={item.url} className={className} onMouseEnter={onMouseEnter}>
      {content}
    </a>
  );
}
