import type { IconType } from 'react-icons';
import { BiLogoBing } from 'react-icons/bi';
import { SiBaidu, SiDuckduckgo, SiGoogle } from 'react-icons/si';

import type { SearchEngineId } from '../types/settings';

export interface SearchEngineDefinition {
  id: SearchEngineId;
  name: string;
  shortName: string;
  Icon: IconType;
  buildUrl: (query: string) => string;
}

export const SEARCH_ENGINES: SearchEngineDefinition[] = [
  {
    id: 'google',
    name: 'Google',
    shortName: 'Google',
    Icon: SiGoogle,
    buildUrl: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    shortName: 'DDG',
    Icon: SiDuckduckgo,
    buildUrl: (query) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'bing',
    name: 'Bing',
    shortName: 'Bing',
    Icon: BiLogoBing,
    buildUrl: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: 'baidu',
    name: 'Baidu',
    shortName: 'Baidu',
    Icon: SiBaidu,
    buildUrl: (query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
  },
];

const SEARCH_ENGINE_MAP = Object.fromEntries(
  SEARCH_ENGINES.map((engine) => [engine.id, engine]),
) as Record<SearchEngineId, SearchEngineDefinition>;

export function isSearchEngineId(value: unknown): value is SearchEngineId {
  return typeof value === 'string' && value in SEARCH_ENGINE_MAP;
}

export function getSearchEngine(id: SearchEngineId): SearchEngineDefinition {
  return SEARCH_ENGINE_MAP[id] ?? SEARCH_ENGINE_MAP.google;
}

export function buildSearchUrl(engineId: SearchEngineId, query: string): string {
  return getSearchEngine(engineId).buildUrl(query);
}
