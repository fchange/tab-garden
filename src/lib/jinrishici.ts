const POEM_CORPUS_VERSION = 'v2';
const POEM_CORPUS_PATH = 'data/poems.v1.min.json';
const DAILY_POEM_COUNT = 10;
const DAILY_CACHE_KEY = `tab-garden:daily-poems:${POEM_CORPUS_VERSION}`;
const LEGACY_TOKEN_KEYS = ['jinrishici-token', 'jinrishici-sdk-migrated'];

export interface PoemOrigin {
  title?: string;
  dynasty?: string;
  author?: string;
  content?: string[];
}

export interface PoemLine {
  id?: string;
  content: string;
  origin?: PoemOrigin;
}

interface LocalPoem {
  id: string;
  t: string;
  a: string;
  d: string;
  k: string;
  l: 5 | 7;
  c: string[];
}

interface DailyPoemCache {
  date: string;
  version: string;
  items: PoemLine[];
}

export const DEFAULT_POEM: PoemLine = {
  content: '落日醉醒问，一春无此寒。',
  origin: {
    author: '沈蔚',
  },
};

let dailyPoemCache: DailyPoemCache | null = null;
let corpusPromise: Promise<LocalPoem[]> | null = null;

function clearLegacySdkState() {
  try {
    for (const key of LEGACY_TOKEN_KEYS) {
      window.localStorage?.removeItem(key);
    }
  } catch {
  }
}

function getShanghaiDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function getCorpusUrl() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(POEM_CORPUS_PATH);
  }

  return `/${POEM_CORPUS_PATH}`;
}

async function loadCorpus() {
  corpusPromise ??= fetch(getCorpusUrl(), { cache: 'force-cache' }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Local poem corpus request failed: ${response.status}`);
    }

    return (await response.json()) as LocalPoem[];
  });

  return corpusPromise;
}

function toPoemLine(poem: LocalPoem): PoemLine {
  return {
    id: poem.id,
    content: poem.c[0] || poem.t,
    origin: {
      title: poem.t,
      dynasty: poem.d,
      author: poem.a,
      content: poem.c,
    },
  };
}

function selectDailyPoems(corpus: LocalPoem[], dateKey: string) {
  const random = createRandom(hashString(`${dateKey}:${POEM_CORPUS_VERSION}`));
  const remaining = corpus.map((poem, index) => ({
    poem,
    weight: 1 / Math.pow(index + 30, 0.75),
  }));
  const selected: LocalPoem[] = [];
  const authors = new Set<string>();

  while (selected.length < DAILY_POEM_COUNT && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
    let cursor = random() * totalWeight;
    let selectedIndex = remaining.length - 1;

    for (let index = 0; index < remaining.length; index += 1) {
      cursor -= remaining[index].weight;
      if (cursor <= 0) {
        selectedIndex = index;
        break;
      }
    }

    const [item] = remaining.splice(selectedIndex, 1);
    if (authors.has(item.poem.a) && remaining.length >= DAILY_POEM_COUNT - selected.length) {
      continue;
    }

    selected.push(item.poem);
    authors.add(item.poem.a);
  }

  return selected.map(toPoemLine);
}

function readChromeCache(): Promise<DailyPoemCache | null> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve(null);
  }

  return chrome.storage.local.get(DAILY_CACHE_KEY).then((result) => {
    const cache = result[DAILY_CACHE_KEY] as DailyPoemCache | undefined;
    return cache || null;
  });
}

async function writeChromeCache(cache: DailyPoemCache) {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  await chrome.storage.local.set({ [DAILY_CACHE_KEY]: cache });
}

function readLocalStorageCache() {
  try {
    const rawCache = window.localStorage?.getItem(DAILY_CACHE_KEY);
    return rawCache ? (JSON.parse(rawCache) as DailyPoemCache) : null;
  } catch {
    return null;
  }
}

function writeLocalStorageCache(cache: DailyPoemCache) {
  try {
    window.localStorage?.setItem(DAILY_CACHE_KEY, JSON.stringify(cache));
  } catch {
  }
}

async function readDailyCache(dateKey: string) {
  if (dailyPoemCache?.date === dateKey && dailyPoemCache.version === POEM_CORPUS_VERSION) {
    return dailyPoemCache;
  }

  const storageCache = (await readChromeCache()) || readLocalStorageCache();
  if (storageCache?.date === dateKey && storageCache.version === POEM_CORPUS_VERSION) {
    dailyPoemCache = storageCache;
    return storageCache;
  }

  return null;
}

async function writeDailyCache(cache: DailyPoemCache) {
  dailyPoemCache = cache;
  writeLocalStorageCache(cache);
  await writeChromeCache(cache);
}

export async function loadDailyPoems(): Promise<PoemLine[]> {
  clearLegacySdkState();

  const dateKey = getShanghaiDateKey();
  const cached = await readDailyCache(dateKey);
  if (cached?.items.length) {
    return cached.items;
  }

  const corpus = await loadCorpus();
  const items = selectDailyPoems(corpus, dateKey);
  const cache: DailyPoemCache = {
    date: dateKey,
    version: POEM_CORPUS_VERSION,
    items,
  };

  await writeDailyCache(cache);
  return items;
}

export async function loadPoem(): Promise<PoemLine> {
  const dailyPoems = await loadDailyPoems();
  return dailyPoems[0] || DEFAULT_POEM;
}
