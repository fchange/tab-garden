export type ViewMode = 'all' | 'domain' | 'window' | 'duplicate';

export interface BrowserTab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  windowId: number;
  active: boolean;
  pinned: boolean;
  audible: boolean;
  discarded: boolean;
  lastAccessed?: number;
  index?: number;
}

export interface DuplicateGroupModel {
  id: string;
  normalizedUrl: string;
  label: string;
  keep: BrowserTab;
  closable: BrowserTab[];
  protectedTabs: BrowserTab[];
  allTabs: BrowserTab[];
}

export interface DomainGroupModel {
  id: string;
  label: string;
  tabs: BrowserTab[];
  duplicateCount: number;
  discardableCount: number;
}

export interface WindowGroupModel {
  id: string;
  windowId: number;
  label: string;
  tabs: BrowserTab[];
  duplicateCount: number;
  discardableCount: number;
}

export interface ActionFeedback {
  ok: boolean;
  message: string;
  count?: number;
}
