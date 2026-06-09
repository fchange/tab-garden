import type { MouseEvent } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '../../lib/cn';
import type { BookmarksBarStyle } from '../../types/settings';
import { getBookmarkLabel, hasChildren } from './bookmarkUtils';
import { BookmarkItemIcon } from './BookmarkMenuPrimitives';
import type { BookmarkItem } from './types';

export function BookmarkRootEntry({
  item,
  onMouseEnter,
  active,
  variant,
}: {
  item: BookmarkItem;
  onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
  active: boolean;
  variant: BookmarksBarStyle;
}) {
  const className = cn(
    'group flex shrink-0 items-center rounded-md text-[13px] transition-colors duration-150',
    variant === 'standard'
      ? 'h-8 max-w-[180px] gap-1.5 px-2 text-foreground/78 hover:bg-foreground/[0.06] dark:text-foreground/82 dark:hover:bg-white/[0.08]'
      : 'h-7 max-w-[156px] px-2.5 leading-none text-foreground/74 hover:bg-foreground/[0.065] hover:text-foreground/90 dark:text-foreground/78 dark:hover:bg-white/[0.075] dark:hover:text-foreground/92',
    active && 'bg-foreground/[0.075] text-foreground/92 dark:bg-white/[0.085]',
  );
  const labelClassName = cn('min-w-0 truncate', variant === 'standard' && hasChildren(item) && 'max-w-[120px]');
  const content = (
    <>
      {variant === 'standard' && <BookmarkItemIcon item={item} />}
      <span className={labelClassName}>{getBookmarkLabel(item)}</span>
      {hasChildren(item) && (
        <ChevronDown className={cn('ml-1.5 size-3 opacity-36 transition-transform duration-150', active && 'rotate-180')} />
      )}
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
