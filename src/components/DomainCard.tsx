import { MoreHorizontal, Moon, X } from 'lucide-react';
import type { BrowserTab, DomainGroupModel } from '../types/tab';
import { getDomainColor } from '../lib/url';
import { TabItem } from './TabItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { AppCopy } from '../lib/i18n';

interface DomainCardProps {
  group: DomainGroupModel;
  accentColor?: string;
  onSwitch?: (tab: BrowserTab) => void;
  onClose?: (tab: BrowserTab) => void;
  onCloseAll?: (tabs: BrowserTab[]) => void;
  onSleepAll?: (tabs: BrowserTab[]) => void;
  copy: AppCopy;
}

export function DomainCard({ group, accentColor, onSwitch, onClose, onCloseAll, onSleepAll, copy }: DomainCardProps) {
  const domainColor = getDomainColor(group.id);

  return (
    <div
      className="rounded-[14px] p-4 border border-solid min-w-0 overflow-hidden transition-all duration-200
        bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)]
        dark:bg-[rgba(255,255,255,0.03)] dark:hover:bg-[rgba(255,255,255,0.06)]"
      style={{ borderColor: `${domainColor}22` }}
    >
      <div className="flex items-center gap-3 mb-3 min-w-0">
        <div
          className="size-[34px] rounded-[10px] flex items-center justify-center text-lg font-semibold shrink-0"
          style={{ background: `${domainColor}14`, color: domainColor }}
        >
          {group.label[0].toUpperCase()}
        </div>
        <div className="flex flex-col gap-px min-w-0 flex-1">
          <span className="text-[15px] font-semibold truncate text-[rgba(0,0,0,0.78)] dark:text-[rgba(255,255,255,0.82)]">
            {group.label}
          </span>
          <span
            className="text-[12.5px] font-medium opacity-75"
            style={{ color: domainColor }}
          >
            {copy.domainCard.tabCount(group.tabs.length)}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="size-8 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center text-[rgba(0,0,0,0.45)] transition-all duration-150 hover:bg-[rgba(128,128,128,0.10)] hover:text-[rgba(0,0,0,0.72)] dark:text-[rgba(255,255,255,0.42)] dark:hover:text-[rgba(255,255,255,0.78)]"
              aria-label={copy.domainCard.menu}
              title={copy.domainCard.menu}
            >
              <MoreHorizontal size={17} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6}>
            <DropdownMenuItem onSelect={() => onSleepAll?.(group.tabs)} disabled={!group.discardableCount}>
              <Moon size={14} />
              {copy.domainCard.sleepAll}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onCloseAll?.(group.tabs)}>
              <X size={14} />
              {copy.domainCard.closeAll}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0">
        {group.tabs.slice(0, 5).map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            accentColor={accentColor ?? domainColor}
            onSwitch={onSwitch}
            onClose={onClose}
            compact
            copy={copy}
          />
        ))}
        {group.tabs.length > 5 && (
          <div className="text-[12.5px] font-medium text-center py-1 opacity-[0.35] tracking-[0.02em]">
            {copy.domainCard.more(group.tabs.length - 5)}
          </div>
        )}
      </div>
    </div>
  );
}
