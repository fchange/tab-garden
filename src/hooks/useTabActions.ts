import { useMemo } from 'react';
import { toast } from 'sonner';

import type { AppCopy } from '../lib/i18n';
import type { BrowserTab, ViewMode } from '../types/tab';
import { useTabs } from './useTabs';

export interface TabActionHandlers {
  onSwitch: (tab: BrowserTab) => void;
  onClose: (tab: BrowserTab) => void;
  onSleep: (tab: BrowserTab) => void;
  onCloseAll: (tabs: BrowserTab[]) => void;
  onSleepAll: (tabs: BrowserTab[]) => void;
}

export interface BatchAction {
  label: string;
  count: number;
  action: () => void;
}

interface UseTabActionsOptions {
  copy: AppCopy;
  view: ViewMode;
  duplicateCount: number;
  tabState: ReturnType<typeof useTabs>;
}

export function useTabActions({
  copy,
  view,
  duplicateCount,
  tabState,
}: UseTabActionsOptions) {
  const handleFeedback = (feedback: ReturnType<typeof tabState.switchToTab>) => {
    void feedback.then((result) => toast(result.message));
  };

  const handlers = useMemo<TabActionHandlers>(() => ({
    onSwitch: (tab) => handleFeedback(tabState.switchToTab(tab)),
    onClose: (tab) => handleFeedback(tabState.closeOne(tab)),
    onSleep: (tab) => handleFeedback(tabState.discardOne(tab)),
    onCloseAll: (tabs) => handleFeedback(tabState.closeSelectedTabs(tabs)),
    onSleepAll: (tabs) => handleFeedback(tabState.discardIdleTabs(tabs)),
  }), [tabState]);

  const batchAction = useMemo<BatchAction | null>(() => {
    if (view !== 'duplicate' || duplicateCount <= 0) {
      return null;
    }

    return {
      label: copy.batch.closeDuplicate,
      count: duplicateCount,
      action: () => handleFeedback(tabState.closeDuplicateTabs()),
    };
  }, [copy, duplicateCount, tabState, view]);

  return {
    handlers,
    batchAction,
  };
}
