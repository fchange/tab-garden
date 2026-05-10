const JINRISHICI_API = 'https://v2.jinrishici.com/one.json';
const LEGACY_TOKEN_KEYS = ['jinrishici-token', 'jinrishici-sdk-migrated'];

export interface PoemOrigin {
  title?: string;
  dynasty?: string;
  author?: string;
  content?: string[];
}

export interface PoemLine {
  content: string;
  origin?: PoemOrigin;
}

interface JinrishiciResponse {
  status?: string;
  token?: string;
  errMessage?: string;
  data?: {
    content?: string;
    origin?: PoemOrigin;
  };
}

export const DEFAULT_POEM: PoemLine = {
  content: '落日醉醒问，一春无此寒。',
  origin: {
    author: '沈蔚',
  },
};

function clearLegacySdkState() {
  try {
    for (const key of LEGACY_TOKEN_KEYS) {
      window.localStorage?.removeItem(key);
    }
  } catch {
  }
}

export async function loadPoem(): Promise<PoemLine> {
  clearLegacySdkState();

  const response = await fetch(JINRISHICI_API, {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`Poem request failed: ${response.status}`);
  }

  const result = (await response.json()) as JinrishiciResponse;
  if (result.status !== 'success' || !result.data?.content) {
    throw new Error(result.errMessage || 'Poem response is invalid');
  }

  return {
    content: result.data.content,
    origin: result.data.origin,
  };
}
