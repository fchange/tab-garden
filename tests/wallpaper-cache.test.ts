import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { acquireWallpaperImage, loadWallpaperImage, WALLPAPERS } from '../src/lib/wallpapers.ts';

const imageUrl = WALLPAPERS[0].imageUrl;
const thumbnailUrl = WALLPAPERS[0].thumbnailUrl;
const response = (body = 'valid', type = 'image/webp', status = 200) => new Response(body, {
  status, headers: { 'Content-Type': type },
});

describe('persistent wallpaper image cache', () => {
  const globals = new Map(['Image', 'fetch', 'caches'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const createUrl = URL.createObjectURL;
  const revokeUrl = URL.revokeObjectURL;
  let stored: Map<string, Response>;
  let urls: Map<string, Blob>;
  let requests: string[];
  let revoked: string[];
  let network: () => Promise<Response>;
  let unavailable: boolean;
  let quota: boolean;
  let imageMode: 'ready' | 'load-error' | 'decode-error' | 'empty';

  beforeEach(() => {
    stored = new Map();
    urls = new Map();
    requests = [];
    revoked = [];
    unavailable = quota = false;
    imageMode = 'ready';
    network = async () => response();
    let nextUrl = 0;
    URL.createObjectURL = (blob) => {
      assert.ok(blob instanceof Blob);
      const url = `blob:wallpaper-test/${nextUrl++}`;
      urls.set(url, blob);
      return url;
    };
    URL.revokeObjectURL = (url) => { revoked.push(url); urls.delete(url); };
    Object.defineProperty(globalThis, 'Image', {
      configurable: true,
      value: class {
        decoding = '';
        naturalWidth = imageMode === 'empty' ? 0 : 3840;
        naturalHeight = imageMode === 'empty' ? 0 : 2160;
        onload?: () => void;
        onerror?: () => void;
        body = '';
        set src(url: string) {
          void urls.get(url)!.text().then((body) => {
            this.body = body;
            if (body === 'broken' || imageMode === 'load-error') this.onerror?.();
            else this.onload?.();
          });
        }
        async decode() {
          if (imageMode === 'decode-error') throw new Error('Decode failed');
        }
      },
    });
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: async (url: string, options: RequestInit) => {
        assert.deepEqual(options, { mode: 'cors', credentials: 'omit' });
        requests.push(url);
        return network();
      },
    });
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: {
        async open(name: string) {
          assert.equal(name, 'tab-garden-wallpapers-v1');
          if (unavailable) throw new Error('Storage disabled');
          return {
            async match(url: string) { return stored.get(url)?.clone(); },
            async put(url: string, value: Response) {
              if (quota) throw new Error('Quota exceeded');
              stored.set(url, value.clone());
            },
            async delete(url: string) { return stored.delete(url); },
          };
        },
      },
    });
  });

  afterEach(() => {
    URL.createObjectURL = createUrl;
    URL.revokeObjectURL = revokeUrl;
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });

  it('fetches only the acquired image and persists it across a fresh module/new tab', async () => {
    const first = await acquireWallpaperImage(imageUrl);
    assert.deepEqual(requests, [imageUrl]);
    assert.equal(stored.size, 1);
    first.release();
    const freshModule = await import(`../src/lib/wallpaper-cache.ts?newtab=${Date.now()}`);
    const second = await freshModule.acquireWallpaperImage(imageUrl);
    assert.deepEqual(requests, [imageUrl]);
    second.release();
    assert.equal(urls.size, 0);
  });

  it('loads a cached image offline and fails uncached images without poisoning later retry', async () => {
    stored.set(imageUrl, response());
    network = async () => { throw new Error('Offline'); };
    const cached = await acquireWallpaperImage(imageUrl);
    cached.release();
    assert.equal(requests.length, 0);
    await assert.rejects(acquireWallpaperImage(thumbnailUrl), /Offline/);
    network = async () => response();
    const retried = await acquireWallpaperImage(thumbnailUrl);
    retried.release();
    assert.equal(stored.size, 2);
    assert.equal(urls.size, 0);
  });

  it('deletes a corrupt cached image before downloading a valid replacement', async () => {
    stored.set(imageUrl, response('broken'));
    const result = await acquireWallpaperImage(imageUrl);
    assert.equal(await stored.get(imageUrl)!.clone().text(), 'valid');
    assert.deepEqual(requests, [imageUrl]);
    result.release();
    assert.equal(urls.size, 0);
  });

  it('rejects HTTP errors, HTML, empty payloads and invalid decoded images without caching', async () => {
    for (const failed of [response('error', 'image/webp', 403), response('<html/>', 'text/html'), response('', 'image/webp'), response('broken')]) {
      network = async () => failed;
      await assert.rejects(acquireWallpaperImage(imageUrl));
      assert.equal(stored.size, 0);
      assert.equal(urls.size, 0);
    }
    network = async () => response();
    for (const mode of ['load-error', 'decode-error', 'empty'] as const) {
      imageMode = mode;
      await assert.rejects(loadWallpaperImage(imageUrl));
      assert.equal(stored.size, 0);
      assert.equal(urls.size, 0);
    }
    imageMode = 'ready';
    await loadWallpaperImage(imageUrl);
    assert.equal(stored.size, 1);
    assert.equal(urls.size, 0);
  });

  it('still returns decoded images when persistent storage is unavailable or full', async () => {
    unavailable = true;
    const first = await acquireWallpaperImage(imageUrl);
    first.release();
    unavailable = false;
    quota = true;
    const second = await acquireWallpaperImage(imageUrl);
    second.release();
    assert.equal(stored.size, 0);
    assert.equal(requests.length, 2);
    assert.equal(urls.size, 0);
    Reflect.deleteProperty(globalThis, 'caches');
    await loadWallpaperImage(thumbnailUrl);
    assert.equal(requests.length, 3);
  });

  it('deduplicates concurrent fetches but gives each caller an independently releasable URL', async () => {
    const [first, second] = await Promise.all([acquireWallpaperImage(imageUrl), acquireWallpaperImage(imageUrl)]);
    assert.equal(requests.length, 1);
    assert.notEqual(first.url, second.url);
    first.release();
    first.release();
    assert.equal(revoked.filter((url) => url === first.url).length, 1);
    assert.ok(urls.has(second.url));
    second.release();
    assert.equal(urls.size, 0);
  });

  it('rejects arbitrary origins, modified hash URLs and local paths before any network access', async () => {
    for (const url of ['https://evil.example/image.webp', `${imageUrl}?x=1`, '/wallpapers/test.webp']) {
      await assert.rejects(acquireWallpaperImage(url), /Unknown wallpaper URL/);
    }
    assert.equal(requests.length, 0);
    assert.equal(urls.size, 0);
  });
});
