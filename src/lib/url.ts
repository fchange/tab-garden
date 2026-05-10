const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'source',
  'fbclid',
  'gclid',
]);

const SPECIAL_PROTOCOLS = ['chrome:', 'edge:', 'about:', 'chrome-extension:'];
const DEFAULT_UNNAMED_PAGE = 'Untitled page';
const DEFAULT_BLANK_PAGE = 'Blank page';
const COMMON_SECOND_LEVEL_PUBLIC_SUFFIXES = new Set([
  'ac', 'co', 'com', 'edu', 'gov', 'net', 'org',
]);

function getSpecialPageLabel(url: string, blankPage = DEFAULT_BLANK_PAGE): string | null {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl === 'about:blank') return blankPage;
  if (normalizedUrl.startsWith('chrome://')) return 'chrome';
  if (normalizedUrl.startsWith('edge://')) return 'edge';
  if (normalizedUrl.startsWith('chrome-extension://')) return 'extension';
  if (normalizedUrl.startsWith('about:')) return 'about';

  return null;
}

export function isSpecialUrl(url: string): boolean {
  return SPECIAL_PROTOCOLS.some((protocol) => url.startsWith(protocol));
}

export function normalizeUrl(url?: string | null): string {
  if (!url) return '';
  if (isSpecialUrl(url)) return url;

  try {
    const parsed = new URL(url);
    parsed.hash = '';

    for (const key of [...parsed.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key)) {
        parsed.searchParams.delete(key);
      }
    }

    const pathname = parsed.pathname.replace(/\/+$/, '');
    parsed.pathname = pathname || '/';

    const normalized = parsed.toString();
    return normalized.endsWith('/') && pathname === '/' ? normalized.slice(0, -1) : normalized;
  } catch {
    return url;
  }
}

export function getHostname(url?: string | null, unnamedPage = DEFAULT_UNNAMED_PAGE): string {
  if (!url) return unnamedPage;
  if (isSpecialUrl(url)) return url.split('/')[0] ?? url;

  try {
    return new URL(url).hostname || unnamedPage;
  } catch {
    return unnamedPage;
  }
}

export function getBaseDomain(
  url?: string | null,
  unnamedPage = DEFAULT_UNNAMED_PAGE,
  blankPage = DEFAULT_BLANK_PAGE,
): string {
  if (url) {
    const specialPageLabel = getSpecialPageLabel(url, blankPage);
    if (specialPageLabel) return specialPageLabel;
  }

  const hostname = getHostname(url, unnamedPage);

  if (!hostname || hostname === unnamedPage) return hostname;
  if (hostname === 'localhost') return hostname;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return hostname;
  if (hostname.includes(':')) return hostname;
  if (!hostname.includes('.')) return hostname;

  const segments = hostname.split('.');
  const [secondLevel, topLevel] = segments.slice(-2);
  const hasCountryCodeSuffix = topLevel.length === 2;
  const hasCommonSecondLevelSuffix = COMMON_SECOND_LEVEL_PUBLIC_SUFFIXES.has(secondLevel);

  if (segments.length > 2 && hasCountryCodeSuffix && hasCommonSecondLevelSuffix) {
    return segments.slice(-3).join('.');
  }

  return segments.slice(-2).join('.');
}

export function getDisplayUrl(url?: string | null, blankPage = DEFAULT_BLANK_PAGE): string {
  if (!url) return blankPage;
  if (url.toLowerCase() === 'about:blank') return blankPage;
  if (isSpecialUrl(url)) return url;

  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
  } catch {
    return url;
  }
}

export function getFaviconUrl(domain: string, existingFavicon?: string): string {
  if (existingFavicon) return existingFavicon;
  if (!domain) return '';
  return `https://api.iowen.cn/favicon/${domain}.png`;
}

const domainColors = [
  '#5478c0', '#e8855c', '#5aab7f', '#b873d4', '#d4a05a',
  '#6bb8c9', '#d96c7b', '#7ab87a', '#c98b5a', '#8a7cc9',
];

export function getDomainColor(domain: string): string {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) - hash) + domain.charCodeAt(i);
  }
  return domainColors[Math.abs(hash) % domainColors.length];
}

export function matchesDomain(hostname: string, whitelistDomain: string): boolean {
  const normalizedHost = hostname.toLowerCase();
  const normalizedRule = whitelistDomain.toLowerCase().trim();

  if (!normalizedRule) return false;
  return normalizedHost === normalizedRule || normalizedHost.endsWith(`.${normalizedRule}`);
}
