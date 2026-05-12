import { useCallback, useMemo } from 'react';

import { buildDomainGroups, buildWindowGroups, filterTabs } from '../lib/groups';
import { buildDuplicateGroups, isDiscardable } from '../lib/tabs';
import type { AppCopy } from '../lib/i18n';
import type { AppSettings } from '../types/settings';
import type { BrowserTab } from '../types/tab';

interface UseTabViewModelOptions {
  tabs: BrowserTab[];
  settings: AppSettings;
  copy: AppCopy;
  query: string;
}

export function useTabViewModel({ tabs, settings, copy, query }: UseTabViewModelOptions) {
  const filteredTabs = useMemo(() => filterTabs(tabs, query), [query, tabs]);

  const allDuplicateGroups = useMemo(
    () => buildDuplicateGroups(tabs, settings),
    [settings, tabs],
  );

  const domainGroups = useMemo(
    () => buildDomainGroups(filteredTabs, settings, {
      unnamedPage: copy.domainCard.unnamedPage,
      blankPage: copy.domainCard.blankPage,
    }),
    [copy, filteredTabs, settings],
  );

  const windowGroups = useMemo(
    () => buildWindowGroups(filteredTabs, settings, {
      windowLabel: copy.domainCard.windowLabel,
    }),
    [copy, filteredTabs, settings],
  );

  const duplicateCount = useMemo(
    () =>
      allDuplicateGroups.reduce(
        (count, group) => count + group.closable.length + group.protectedTabs.length,
        0,
      ),
    [allDuplicateGroups],
  );

  const sleepingTabs = useMemo(
    () => tabs.filter((tab) => tab.discarded),
    [tabs],
  );

  const duplicateTabIds = useMemo(
    () =>
      new Set(
        allDuplicateGroups.flatMap((group) =>
          [...group.closable, ...group.protectedTabs].map((tab) => tab.id),
        ),
      ),
    [allDuplicateGroups],
  );

  const duplicateTabs = useMemo(
    () => filteredTabs.filter((tab) => duplicateTabIds.has(tab.id)),
    [duplicateTabIds, filteredTabs],
  );

  const canSleepTab = useCallback(
    (tab: BrowserTab) => isDiscardable(tab, settings),
    [settings],
  );

  return {
    filteredTabs,
    allDuplicateGroups,
    domainGroups,
    windowGroups,
    duplicateCount,
    sleepingTabs,
    duplicateTabIds,
    duplicateTabs,
    canSleepTab,
  };
}
