import { buildDuplicateGroups, isDiscardable } from './tabs';
import { getBaseDomain } from './url';
import type { AppSettings } from '../types/settings';
import type { BrowserTab, DomainGroupModel, WindowGroupModel } from '../types/tab';

export function filterTabs(tabs: BrowserTab[], query: string): BrowserTab[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return tabs;

  return tabs.filter((tab) => {
    const title = tab.title.toLowerCase();
    const url = tab.url.toLowerCase();
    return title.includes(normalizedQuery) || url.includes(normalizedQuery);
  });
}

export function buildDomainGroups(
  tabs: BrowserTab[],
  settings: AppSettings,
  options?: { unnamedPage?: string },
): DomainGroupModel[] {
  const groups = new Map<string, BrowserTab[]>();

  for (const tab of tabs) {
    const key = getBaseDomain(tab.url, options?.unnamedPage);
    const current = groups.get(key) ?? [];
    current.push(tab);
    groups.set(key, current);
  }

  return [...groups.entries()]
    .map(([label, groupTabs]) => ({
      id: label,
      label,
      tabs: groupTabs.sort((left, right) => (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0)),
      duplicateCount: buildDuplicateGroups(groupTabs, settings).reduce(
        (count, group) => count + group.closable.length + group.protectedTabs.length,
        0,
      ),
      discardableCount: groupTabs.filter((tab) => isDiscardable(tab, settings)).length,
    }))
    .sort((left, right) => right.tabs.length - left.tabs.length);
}

export function buildWindowGroups(
  tabs: BrowserTab[],
  settings: AppSettings,
  options?: { windowLabel?: (index: number) => string },
): WindowGroupModel[] {
  const groups = new Map<number, BrowserTab[]>();

  for (const tab of tabs) {
    const current = groups.get(tab.windowId) ?? [];
    current.push(tab);
    groups.set(tab.windowId, current);
  }

  return [...groups.entries()]
    .map(([windowId, groupTabs], index) => ({
      id: `window-${windowId}`,
      windowId,
      label: options?.windowLabel?.(index + 1) ?? `Window ${index + 1}`,
      tabs: groupTabs.sort((left, right) => (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0)),
      duplicateCount: buildDuplicateGroups(groupTabs, settings).reduce(
        (count, group) => count + group.closable.length + group.protectedTabs.length,
        0,
      ),
      discardableCount: groupTabs.filter((tab) => isDiscardable(tab, settings)).length,
    }))
    .sort((left, right) => left.windowId - right.windowId);
}
