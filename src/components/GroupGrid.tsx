import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';

import { useAccent } from '../lib/appContext';
import { cn } from '../lib/cn';
import type { BrowserTab, DomainGroupModel, WindowGroupModel } from '../types/tab';
import { DomainCard } from './DomainCard';

type ViewMode = 'overview' | 'focused';

interface GroupGridProps {
  groups: Array<DomainGroupModel | WindowGroupModel>;
  onSwitch: (tab: BrowserTab) => void;
  onClose: (tab: BrowserTab) => void;
  onSleep: (tab: BrowserTab) => void;
  onCloseAll: (tabs: BrowserTab[]) => void;
  onSleepAll: (tabs: BrowserTab[]) => void;
  canSleepTab: (tab: BrowserTab) => boolean;
}

export function GroupGrid({
  groups,
  onSwitch,
  onClose,
  onSleep,
  onCloseAll,
  onSleepAll,
  canSleepTab,
}: GroupGridProps) {
  const { accentColor } = useAccent();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null);
  const focusedGroup = groups.find((group) => group.id === focusedGroupId) ?? null;

  const collapseFocusedGroup = () => {
    setViewMode('overview');
    setFocusedGroupId(null);
  };

  const focusGroup = (groupId: string) => {
    setFocusedGroupId(groupId);
    setViewMode('focused');
  };

  useEffect(() => {
    if (viewMode !== 'focused') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        collapseFocusedGroup();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  useEffect(() => {
    if (focusedGroupId && !groups.some((group) => group.id === focusedGroupId)) {
      collapseFocusedGroup();
    }
  }, [focusedGroupId, groups]);

  return (
    <LayoutGroup>
      <motion.div
        layout
        className={cn(
          'relative min-w-0 max-h-[calc(100vh-330px)]',
          viewMode === 'focused' && 'h-[calc(100vh-330px)] z-20',
        )}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <motion.div
          layout
          className={cn(
            'grid grid-cols-3 gap-2.5 min-w-0 overflow-y-auto overflow-x-hidden pb-2 max-[720px]:grid-cols-1',
            viewMode === 'focused' ? 'h-full' : 'max-h-[calc(100vh-330px)]',
          )}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {groups.map((group) => {
            const focused = focusedGroupId === group.id;
            const muted = viewMode === 'focused';

            return (
              <motion.div
                layout
                key={group.id}
                className={cn('min-w-0', muted && 'pointer-events-none')}
                animate={{ opacity: muted ? 0 : 1 }}
                transition={{ duration: muted ? 0.12 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {focused ? null : (
                  <DomainCard
                    group={group}
                    accentColor={accentColor}
                    onSwitch={onSwitch}
                    onClose={onClose}
                    onSleep={onSleep}
                    onCloseAll={onCloseAll}
                    onSleepAll={onSleepAll}
                    canSleepTab={canSleepTab}
                    onFocusRequest={() => focusGroup(group.id)}
                    onCollapse={collapseFocusedGroup}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <AnimatePresence initial={false}>
          {viewMode === 'focused' && focusedGroup && (
            <motion.div
              key={focusedGroup.id}
              className="absolute inset-0 z-30 overflow-y-auto pb-2"
              onClick={collapseFocusedGroup}
            >
              <DomainCard
                group={focusedGroup}
                accentColor={accentColor}
                mode="focused"
                onSwitch={onSwitch}
                onClose={onClose}
                onSleep={onSleep}
                onCloseAll={onCloseAll}
                onSleepAll={onSleepAll}
                canSleepTab={canSleepTab}
                onCollapse={collapseFocusedGroup}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
