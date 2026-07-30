import { useState } from 'react';
import { ArrowLeft, Moon, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { BrowserTab, DomainGroupModel } from '../types/tab';
import { useCopy } from '../lib/appContext';
import { cn } from '../lib/cn';
import { getDomainColor } from '../lib/url';
import { TabItem } from './TabItem';

interface DomainCardProps {
  group: DomainGroupModel;
  accentColor?: string;
  mode?: 'overview' | 'focused';
  onSwitch?: (tab: BrowserTab) => void;
  onClose?: (tab: BrowserTab) => void;
  onSleep?: (tab: BrowserTab) => void;
  onCloseAll?: (tabs: BrowserTab[]) => Promise<void>;
  onSleepAll?: (tabs: BrowserTab[]) => Promise<void>;
  canSleepTab?: (tab: BrowserTab) => boolean;
  onFocusRequest?: () => void;
  onCollapse?: () => void;
}

const groupTransition = { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] } as const;

export function DomainCard({
  group,
  accentColor,
  mode = 'overview',
  onSwitch,
  onClose,
  onSleep,
  onCloseAll,
  onSleepAll,
  canSleepTab,
  onFocusRequest,
  onCollapse,
}: DomainCardProps) {
  const copy = useCopy();
  const domainColor = getDomainColor(group.id);
  const focused = mode === 'focused';
  const visibleTabs = focused ? group.tabs : group.tabs.slice(0, 5);
  const [pendingAction, setPendingAction] = useState<'sleep' | 'close' | null>(null);

  const runGroupAction = async (action: 'sleep' | 'close') => {
    if (pendingAction) return;
    const handler = action === 'sleep' ? onSleepAll : onCloseAll;
    if (!handler) return;

    setPendingAction(action);
    try {
      await handler(group.tabs);
    } finally {
      setPendingAction(null);
    }
  };

  const handleHeaderClick = () => {
    if (focused) {
      onCollapse?.();
    } else {
      onFocusRequest?.();
    }
  };

  return (
    <motion.div
      layout
      layoutId={`group-${group.id}`}
      transition={groupTransition}
      className={cn(
        'rounded-[14px] p-4 border border-solid min-w-0 overflow-hidden transition-colors duration-200 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] dark:bg-[rgba(255,255,255,0.03)] dark:hover:bg-[rgba(255,255,255,0.06)]',
        focused && 'min-h-full',
      )}
      style={{ borderColor: `${domainColor}22` }}
      onClick={(event) => event.stopPropagation()}
    >
      <motion.div
        layout
        className={cn('flex items-center gap-3 mb-3 min-w-0', !focused && 'cursor-pointer')}
        onClick={handleHeaderClick}
      >
        {focused && (
          <button
            type="button"
            className="size-8 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center text-[rgba(0,0,0,0.45)] transition-all duration-150 hover:bg-[rgba(128,128,128,0.10)] hover:text-[rgba(0,0,0,0.72)] dark:text-[rgba(255,255,255,0.42)] dark:hover:text-[rgba(255,255,255,0.78)]"
            aria-label="Back"
            title="Back"
            onClick={(event) => {
              event.stopPropagation();
              onCollapse?.();
            }}
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <motion.div
          layout
          className="size-[34px] rounded-[10px] flex items-center justify-center text-lg font-semibold shrink-0"
          style={{ background: `${domainColor}14`, color: domainColor }}
        >
          {group.label[0].toUpperCase()}
        </motion.div>
        <motion.div layout className="flex flex-col gap-px min-w-0 flex-1">
          <span className="text-[15px] font-semibold truncate text-[rgba(0,0,0,0.78)] dark:text-[rgba(255,255,255,0.82)]">
            {group.label}
          </span>
          <span
            className="text-[12.5px] font-medium opacity-75"
            style={{ color: domainColor }}
          >
            {copy.domainCard.tabCount(group.tabs.length)}
          </span>
        </motion.div>
        <div className="flex items-center gap-0.5 shrink-0" onClick={(event) => event.stopPropagation()}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9, y: 1 }}
            transition={{ duration: 0.14 }}
            className="size-8 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center text-[rgba(0,0,0,0.45)] transition-colors duration-150 hover:bg-[rgba(128,128,128,0.10)] hover:text-[rgba(0,0,0,0.72)] disabled:cursor-default disabled:opacity-25 dark:text-[rgba(255,255,255,0.42)] dark:hover:text-[rgba(255,255,255,0.78)]"
            aria-label={copy.domainCard.sleepAll}
            title={copy.domainCard.sleepAll}
            disabled={!group.discardableCount || pendingAction !== null}
            onClick={() => void runGroupAction('sleep')}
          >
            <motion.span animate={pendingAction === 'sleep' ? { opacity: 0.45, y: 2 } : { opacity: 1, y: 0 }}>
              <Moon size={16} />
            </motion.span>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9, y: 1 }}
            transition={{ duration: 0.14 }}
            className="size-8 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center text-[rgba(0,0,0,0.45)] transition-colors duration-150 hover:bg-red-500/10 hover:text-red-600 disabled:cursor-default disabled:opacity-25 dark:text-[rgba(255,255,255,0.42)] dark:hover:text-red-400"
            aria-label={copy.domainCard.closeAll}
            title={copy.domainCard.closeAll}
            disabled={pendingAction !== null}
            onClick={() => void runGroupAction('close')}
          >
            <X size={16} />
          </motion.button>
        </div>
      </motion.div>

      <motion.div layout className={cn('flex flex-col min-w-0', focused ? 'gap-1' : 'gap-1.5')}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleTabs.map((tab) => (
            <motion.div
              layout
              key={tab.id}
              exit={{ opacity: 0, height: 0, x: 12, marginBottom: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <TabItem
                tab={tab}
                accentColor={accentColor ?? domainColor}
                onSwitch={onSwitch}
                onClose={onClose}
                onSleep={onSleep}
                canSleep={canSleepTab?.(tab) ?? false}
                compact={!focused}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {!focused && group.tabs.length > 5 && (
          <div className="text-[12.5px] font-medium text-center py-1 opacity-[0.35] tracking-[0.02em]">
            {copy.domainCard.more(group.tabs.length - 5)}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
