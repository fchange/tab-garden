import { useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { getBaseDomain, getDisplayUrl, isSpecialUrl, getFaviconUrl, getDomainColor } from '../lib/url';
import type { BrowserTab } from '../types/tab';
import type { AppCopy } from '../lib/i18n';

interface TabItemProps {
  tab: BrowserTab;
  accentColor: string;
  onClose?: (tab: BrowserTab) => void;
  onSwitch?: (tab: BrowserTab) => void;
  showDuplicateBadge?: boolean;
  /** Compact variant used inside DomainCard / window cards */
  compact?: boolean;
  copy: AppCopy;
}

function tabFaviconUrl(tab: BrowserTab): string {
  if (!tab.url) return '';
  const domain = getBaseDomain(tab.url);
  if (tab.favIconUrl) return tab.favIconUrl;
  if (!domain || isSpecialUrl(tab.url)) return '';
  return getFaviconUrl(domain);
}

interface TabFaviconProps {
  faviconUrl: string;
  domain: string;
  audible?: boolean;
  compact?: boolean;
}

function TabFavicon({ faviconUrl, domain, audible, compact }: TabFaviconProps) {
  const fallbackLabel = domain[0]?.toUpperCase() || '?';

  if (compact) {
    return (
      <div className="relative shrink-0 size-4 flex items-center justify-center">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            width={16}
            height={16}
            className="rounded-[3px] shrink-0 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <span className="size-4 rounded-[4px] flex items-center justify-center text-[10px] font-semibold bg-[rgba(128,128,128,0.10)] text-[rgba(0,0,0,0.45)] dark:text-[rgba(255,255,255,0.35)]">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative shrink-0 size-[26px] flex items-center justify-center">
      {faviconUrl ? (
        <img
          src={faviconUrl}
          alt=""
          width={22}
          height={22}
          className="rounded object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <span className="size-[22px] rounded flex items-center justify-center text-[13px] font-semibold bg-[rgba(128,128,128,0.10)] text-[rgba(0,0,0,0.45)] dark:text-[rgba(255,255,255,0.35)]">
          {fallbackLabel}
        </span>
      )}
      {audible && (
        <span className="absolute -bottom-px -right-px size-[8px] rounded-full bg-green-500 border-[1.5px] border-white dark:border-[var(--panel-bg,#0d1419)] animate-pulse" />
      )}
    </div>
  );
}

interface TabActionsProps {
  visible: boolean;
  accentColor: string;
  isSpecial: boolean;
  onOpenExternal: (e: MouseEvent) => void;
  onClose: (e: MouseEvent) => void;
}

function TabActions({ visible, accentColor, isSpecial, onOpenExternal, onClose, copy }: TabActionsProps & { copy: AppCopy }) {
  return (
    <div
      className={cn(
        'absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 shrink-0 p-0.5 rounded-lg transition-all duration-150',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      style={{ background: accentColor }}
    >
      {!isSpecial && (
        <button
          className="size-7 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-100 opacity-60 hover:opacity-100 hover:scale-105 active:scale-95"
          onClick={onOpenExternal}
          title={copy.tab.openExternal}
        >
          <ExternalLink size={13} />
        </button>
      )}
      <button
        className="size-7 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-100 opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 hover:bg-[rgba(180,60,60,0.10)]"
        onClick={onClose}
        title={copy.tab.close}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function TabItem({
  tab,
  accentColor,
  onClose,
  onSwitch,
  showDuplicateBadge,
  compact = false,
  copy,
}: TabItemProps) {
  const [hovered, setHovered] = useState(false);
  const [closing, setClosing] = useState(false);

  const displayUrl = useMemo(() => getDisplayUrl(tab.url, copy.domainCard.blankPage), [copy, tab.url]);
  const faviconUrl = useMemo(() => tabFaviconUrl(tab), [tab]);
  const domain = useMemo(() => getBaseDomain(tab.url, copy.domainCard.unnamedPage), [copy, tab.url]);
  const domainColor = getDomainColor(domain);
  const specialUrl = isSpecialUrl(tab.url);

  const handleClose = (e: MouseEvent) => {
    e.stopPropagation();
    setClosing(true);
    window.setTimeout(() => onClose?.(tab), 280);
  };

  const handleOpenExternal = (e: MouseEvent) => {
    e.stopPropagation();
    if (!tab.url) return;
    window.open(tab.url, '_blank', 'noopener,noreferrer');
  };

  const handleClick = () => {
    onSwitch?.(tab);
  };

  if (compact) {
    return (
      <div
        className="group relative flex items-center gap-2 px-2 py-1.5 rounded-lg min-w-0 cursor-default transition-all duration-150 hover:bg-[rgba(128,128,128,0.05)] dark:hover:bg-[rgba(255,255,255,0.04)]"
        style={{
          '--tab-accent': accentColor,
          transform: closing ? 'translateX(12px)' : 'none',
          opacity: closing ? 0 : 1,
          transition: 'transform 280ms, opacity 280ms, background 0.15s',
        } as CSSProperties}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <TabFavicon faviconUrl={faviconUrl} domain={domain} compact />

        <span
          className="text-[14px] font-medium truncate flex-1 min-w-0 transition-colors duration-150 text-[rgba(0,0,0,0.74)] group-hover:text-[rgba(0,0,0,0.58)] dark:text-[rgba(255,255,255,0.75)] dark:group-hover:text-[rgba(255,255,255,0.58)]"
        >
          {tab.title || copy.tab.untitled}
        </span>

        <TabActions
          visible={hovered}
          accentColor={accentColor}
          isSpecial={specialUrl}
          onOpenExternal={handleOpenExternal}
          onClose={handleClose}
          copy={copy}
        />
      </div>
    );
  }

  return (
    <div
      className="group px-4 py-3 rounded-xl transition-all duration-200 cursor-default
        hover:bg-[rgba(128,128,128,0.05)] dark:hover:bg-[rgba(255,255,255,0.04)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div
        className="relative flex items-center gap-3 min-w-0"
        style={{
          transform: closing ? 'translateX(12px)' : 'none',
          opacity: closing ? 0 : 1,
          transition: 'transform 280ms, opacity 280ms',
        }}
      >
        <TabFavicon faviconUrl={faviconUrl} domain={domain} audible={tab.audible} />

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="text-[15px] font-medium truncate flex items-center gap-1.5 text-[rgba(0,0,0,0.82)] group-hover:text-[rgba(0,0,0,0.62)] dark:text-[rgba(255,255,255,0.82)] dark:group-hover:text-[rgba(255,255,255,0.62)] transition-colors duration-200">
            {tab.title || copy.tab.untitled}
            {tab.active && (
              <span
                className="text-[12px] font-medium px-1.5 h-4 rounded-full shrink-0"
                style={{
                  background: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
                  color: accentColor,
                }}
              >
                {copy.tab.current}
              </span>
            )}
            {tab.discarded && (
              <span className="text-[12px] font-medium px-1.5 h-4 rounded-full shrink-0 bg-[rgba(128,128,128,0.08)] text-[rgba(0,0,0,0.45)] dark:text-[rgba(255,255,255,0.30)]">
                {copy.tab.sleeping}
              </span>
            )}
          </div>
          <div className="text-[13px] truncate text-[rgba(0,0,0,0.38)] dark:text-[rgba(255,255,255,0.30)] transition-colors duration-300">
            {displayUrl}
          </div>
        </div>

        {/* Status indicators (visible when NOT hovered) */}
        <div className={cn('flex items-center gap-1.5 shrink-0 transition-opacity duration-150', hovered && 'opacity-0 pointer-events-none')}>
          {showDuplicateBadge && (
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full tracking-[0.01em] opacity-70 bg-[rgba(220,38,38,0.08)] text-red-600">
              {copy.tab.duplicate}
            </span>
          )}
          {!showDuplicateBadge && (
            <span
              className="text-[12px] font-medium px-2 py-0.5 rounded-full tracking-[0.01em] opacity-70"
              style={{ background: `${domainColor}1a`, color: domainColor }}
            >
              {domain}
            </span>
          )}
        </div>

        <TabActions
          visible={hovered}
          accentColor={accentColor}
          isSpecial={specialUrl}
          onOpenExternal={handleOpenExternal}
          onClose={handleClose}
          copy={copy}
        />
      </div>
    </div>
  );
}
