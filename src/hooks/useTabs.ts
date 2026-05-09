import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';

import {
  closeTabs,
  discardTabs,
  focusTab,
  queryTabs,
  tabsToClosableDuplicateIds,
  tabsToDiscardIds,
  tabsToKeepOneIds,
} from '../lib/tabs';
import type { AppSettings } from '../types/settings';
import type { ActionFeedback, BrowserTab } from '../types/tab';
import type { AppCopy } from '../lib/i18n';

function hasChromeTabEvents() {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome.tabs?.onCreated &&
    !!chrome.tabs?.onRemoved &&
    !!chrome.tabs?.onUpdated &&
    !!chrome.tabs?.onActivated
  );
}

export function useTabs(settings: AppSettings, copy: AppCopy) {
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await queryTabs();
      setTabs(result.tabs);
      setUsingMockData(result.usingMockData);
      setError(result.usingMockData ? copy.feedback.mockData : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.feedback.readError);
    } finally {
      setLoading(false);
    }
  }, [copy]);

  const handleRefresh = useEffectEvent(() => {
    void load();
  });

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!hasChromeTabEvents()) return;

    const scheduleRefresh = () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = window.setTimeout(() => handleRefresh(), 120);
    };

    chrome.tabs.onCreated.addListener(scheduleRefresh);
    chrome.tabs.onRemoved.addListener(scheduleRefresh);
    chrome.tabs.onUpdated.addListener(scheduleRefresh);
    chrome.tabs.onActivated.addListener(scheduleRefresh);

    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
      chrome.tabs.onCreated.removeListener(scheduleRefresh);
      chrome.tabs.onRemoved.removeListener(scheduleRefresh);
      chrome.tabs.onUpdated.removeListener(scheduleRefresh);
      chrome.tabs.onActivated.removeListener(scheduleRefresh);
    };
  }, [handleRefresh]);

  const refresh = useCallback(async (): Promise<ActionFeedback> => {
    await load();
    return { ok: true, message: copy.feedback.refreshed };
  }, [copy, load]);

  const switchToTab = useCallback(async (tab: BrowserTab): Promise<ActionFeedback> => {
    try {
      const result = await focusTab(tab, copy);
      await load();
      return result;
    } catch {
      return { ok: false, message: copy.feedback.switchFailed };
    }
  }, [copy, load]);

  const closeOne = useCallback(async (tab: BrowserTab): Promise<ActionFeedback> => {
    try {
      const count = await closeTabs([tab.id]);
      await load();
      return { ok: true, count, message: copy.feedback.closedOne };
    } catch {
      return { ok: false, message: copy.feedback.closeFailed };
    }
  }, [copy, load]);

  const closeSelectedTabs = useCallback(async (scopeTabs: BrowserTab[]): Promise<ActionFeedback> => {
    try {
      const count = await closeTabs(scopeTabs.map((tab) => tab.id));
      await load();
      return {
        ok: true,
        count,
        message: copy.feedback.closedTabs(count),
      };
    } catch {
      return { ok: false, message: copy.feedback.closeFailed };
    }
  }, [copy, load]);

  const discardOne = useCallback(async (tab: BrowserTab): Promise<ActionFeedback> => {
    try {
      const count = await discardTabs([tab.id]);
      await load();
      return { ok: true, count, message: copy.feedback.sleptOne };
    } catch {
      return { ok: false, message: copy.feedback.sleepFailed };
    }
  }, [copy, load]);

  const closeDuplicateTabs = useCallback(async (scopeTabs = tabs): Promise<ActionFeedback> => {
    try {
      const ids = tabsToClosableDuplicateIds(scopeTabs, settings);
      const count = await closeTabs(ids);
      await load();
      return {
        ok: true,
        count,
        message: copy.feedback.closedDuplicates(count),
      };
    } catch {
      return { ok: false, message: copy.feedback.closeDuplicatesFailed };
    }
  }, [copy, load, settings, tabs]);

  const closeSleepingTabs = useCallback(async (scopeTabs = tabs): Promise<ActionFeedback> => {
    try {
      const ids = scopeTabs.filter((tab) => tab.discarded).map((tab) => tab.id);
      const count = await closeTabs(ids);
      await load();
      return {
        ok: true,
        count,
        message: copy.feedback.closedSleeping(count),
      };
    } catch {
      return { ok: false, message: copy.feedback.closeSleepingFailed };
    }
  }, [copy, load, tabs]);

  const discardIdleTabs = useCallback(async (scopeTabs = tabs): Promise<ActionFeedback> => {
    try {
      const ids = tabsToDiscardIds(scopeTabs, settings);
      const count = await discardTabs(ids);
      await load();
      return {
        ok: true,
        count,
        message: copy.feedback.discardedIdle(count),
      };
    } catch {
      return { ok: false, message: copy.feedback.discardIdleFailed };
    }
  }, [copy, load, settings, tabs]);

  const keepOneTab = useCallback(async (scopeTabs: BrowserTab[]): Promise<ActionFeedback> => {
    try {
      const ids = tabsToKeepOneIds(scopeTabs, settings);
      const count = await closeTabs(ids);
      await load();
      return {
        ok: true,
        count,
        message: copy.feedback.keptOne(count),
      };
    } catch {
      return { ok: false, message: copy.feedback.keepOneFailed };
    }
  }, [copy, load, settings]);

  return {
    tabs,
    loading,
    usingMockData,
    error,
    refresh,
    switchToTab,
    closeOne,
    closeSelectedTabs,
    discardOne,
    closeDuplicateTabs,
    closeSleepingTabs,
    discardIdleTabs,
    keepOneTab,
  };
}
