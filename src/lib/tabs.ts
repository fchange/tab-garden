import { DEFAULT_SETTINGS } from './storage';
import { getBaseDomain, getHostname, isSpecialUrl, matchesDomain, normalizeUrl } from './url';
import type { AppSettings } from '../types/settings';
import type { AppCopy } from './i18n';
import type { ActionFeedback, BrowserTab, DuplicateGroupModel } from '../types/tab';

export const MOCK_TABS: BrowserTab[] = [
  {
    id: 1001,
    title: 'GitHub - Repo',
    url: 'https://github.com/openai/openai-cookbook?utm_source=test',
    windowId: 1,
    active: true,
    pinned: false,
    audible: false,
    discarded: false,
    lastAccessed: Date.now() - 2_000,
  },
  {
    id: 1002,
    title: 'Pull Request #10',
    url: 'https://github.com/openai/openai-cookbook/pulls',
    windowId: 1,
    active: false,
    pinned: false,
    audible: false,
    discarded: false,
    lastAccessed: Date.now() - 60_000,
  },
  {
    id: 1003,
    title: 'ChatGPT',
    url: 'https://chatgpt.com/',
    windowId: 1,
    active: false,
    pinned: true,
    audible: false,
    discarded: false,
    lastAccessed: Date.now() - 160_000,
  },
  {
    id: 1004,
    title: 'Google Docs',
    url: 'https://docs.google.com/document/d/123',
    windowId: 2,
    active: false,
    pinned: false,
    audible: false,
    discarded: true,
    lastAccessed: Date.now() - 600_000,
  },
  {
    id: 1005,
    title: 'GitHub - Repo',
    url: 'https://github.com/openai/openai-cookbook/#readme',
    windowId: 2,
    active: false,
    pinned: false,
    audible: false,
    discarded: false,
    lastAccessed: Date.now() - 800_000,
  },
];

function hasChromeTabs() {
  return typeof chrome !== 'undefined' && !!chrome.tabs?.query;
}

function mapChromeTab(tab: chrome.tabs.Tab): BrowserTab | null {
  if (typeof tab.id !== 'number') return null;

  return {
    id: tab.id,
    title: tab.title || '',
    url: tab.url || '',
    favIconUrl: tab.favIconUrl,
    windowId: tab.windowId,
    active: !!tab.active,
    pinned: !!tab.pinned,
    audible: !!tab.audible,
    discarded: !!tab.discarded,
    lastAccessed: tab.lastAccessed,
    index: tab.index,
  };
}

export function getTabScore(tab: BrowserTab): number {
  return (
    (tab.active ? 1_000_000 : 0) +
    (tab.pinned ? 100_000 : 0) +
    (!tab.discarded ? 10_000 : 0) +
    (tab.lastAccessed ?? 0)
  );
}

export function sortTabsByPriority(tabs: BrowserTab[]): BrowserTab[] {
  return [...tabs].sort((left, right) => getTabScore(right) - getTabScore(left));
}

export function isWhitelistedTab(tab: BrowserTab, settings: AppSettings): boolean {
  const hostname = getHostname(tab.url);
  return settings.whitelistDomains.some((domain) => matchesDomain(hostname, domain));
}

export function isProtectedTab(
  tab: BrowserTab,
  settings: AppSettings = DEFAULT_SETTINGS,
  options?: { ignoreActive?: boolean; ignorePinned?: boolean; ignoreAudible?: boolean },
): boolean {
  if (!options?.ignoreActive && settings.protectActive && tab.active) return true;
  if (!options?.ignorePinned && settings.protectPinned && tab.pinned) return true;
  if (!options?.ignoreAudible && settings.protectAudible && tab.audible) return true;
  if (isWhitelistedTab(tab, settings)) return true;
  return false;
}

export function isDiscardable(tab: BrowserTab, settings: AppSettings = DEFAULT_SETTINGS): boolean {
  if (tab.discarded) return false;
  if (!tab.url || isSpecialUrl(tab.url)) return false;
  return !isProtectedTab(tab, settings);
}

export async function queryTabs(): Promise<{ tabs: BrowserTab[]; usingMockData: boolean }> {
  if (!hasChromeTabs()) {
    return { tabs: MOCK_TABS, usingMockData: true };
  }

  const currentTab = await chrome.tabs.getCurrent();
  const currentTabId = currentTab?.id;
  const currentPageUrl = typeof window !== 'undefined' ? window.location.href : null;
  const queriedTabs = await chrome.tabs.query({});

  return {
    tabs: queriedTabs
      .map(mapChromeTab)
      .filter((tab): tab is BrowserTab => tab !== null)
      .filter((tab) => {
        if (typeof currentTabId === 'number' && tab.id === currentTabId) {
          return false;
        }

        if (currentPageUrl && tab.url === currentPageUrl) {
          return false;
        }

        return true;
      })
      .sort((left, right) => (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0)),
    usingMockData: false,
  };
}

export function buildDuplicateGroups(
  tabs: BrowserTab[],
  settings: AppSettings = DEFAULT_SETTINGS,
): DuplicateGroupModel[] {
  const groups = new Map<string, BrowserTab[]>();

  for (const tab of tabs) {
    const key = normalizeUrl(tab.url);
    if (!key) continue;
    const current = groups.get(key) ?? [];
    current.push(tab);
    groups.set(key, current);
  }

  return [...groups.entries()]
    .filter(([, groupTabs]) => groupTabs.length > 1)
    .map(([normalizedUrl, groupTabs]) => {
      const ranked = sortTabsByPriority(groupTabs);
      const keep = ranked[0];
      const closable: BrowserTab[] = [];
      const protectedTabs: BrowserTab[] = [];

      for (const tab of ranked.slice(1)) {
        if (isProtectedTab(tab, settings)) {
          protectedTabs.push(tab);
        } else {
          closable.push(tab);
        }
      }

      return {
        id: normalizedUrl,
        normalizedUrl,
        label: keep.title || getBaseDomain(keep.url),
        keep,
        closable,
        protectedTabs,
        allTabs: ranked,
      };
    })
    .sort((left, right) => right.allTabs.length - left.allTabs.length);
}

export async function focusTab(tab: BrowserTab, copy?: AppCopy): Promise<ActionFeedback> {
  if (!hasChromeTabs()) {
    return { ok: true, message: copy?.feedback.mockSwitch ?? 'Preview mode: simulated switching tabs.' };
  }

  await chrome.windows.update(tab.windowId, { focused: true });
  await chrome.tabs.update(tab.id, { active: true });
  return { ok: true, message: copy?.feedback.switched ?? 'Switched to target tab.' };
}

export async function closeTabs(tabIds: number[]): Promise<number> {
  if (!tabIds.length) return 0;
  if (!hasChromeTabs()) return tabIds.length;
  await chrome.tabs.remove(tabIds);
  return tabIds.length;
}

export async function discardTabs(tabIds: number[]): Promise<number> {
  if (!tabIds.length) return 0;
  if (!hasChromeTabs()) return tabIds.length;

  await Promise.all(tabIds.map((tabId) => chrome.tabs.discard(tabId)));
  return tabIds.length;
}

export function tabsToClosableDuplicateIds(
  tabs: BrowserTab[],
  settings: AppSettings = DEFAULT_SETTINGS,
): number[] {
  return buildDuplicateGroups(tabs, settings).flatMap((group) => group.closable.map((tab) => tab.id));
}

export function tabsToDiscardIds(
  tabs: BrowserTab[],
  settings: AppSettings = DEFAULT_SETTINGS,
): number[] {
  return tabs.filter((tab) => isDiscardable(tab, settings)).map((tab) => tab.id);
}

export function tabsToKeepOneIds(
  tabs: BrowserTab[],
  settings: AppSettings = DEFAULT_SETTINGS,
): number[] {
  const ranked = sortTabsByPriority(tabs);
  const keep = ranked[0];

  return ranked
    .filter((tab) => tab.id !== keep.id)
    .filter((tab) => !isProtectedTab(tab, settings))
    .map((tab) => tab.id);
}
