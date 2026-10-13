import { WALLPAPERS } from './wallpaper-catalog.ts';

const CACHE_NAME = 'tab-garden-wallpapers-v1';
const knownUrls = new Set<string>(WALLPAPERS.flatMap((item) => [item.imageUrl, item.thumbnailUrl]));
const pending = new Map<string, Promise<Blob>>();

export interface WallpaperImageLease {
  url: string;
  release: () => void;
}

async function validateImage(blob: Blob): Promise<void> {
  if (!blob.size || !blob.type.toLowerCase().startsWith('image/')) {
    throw new Error('Wallpaper response is not an image');
  }
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = 'async';
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Unable to load wallpaper image'));
      image.src = url;
    });
    if (typeof image.decode === 'function') await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error('Wallpaper image has no usable dimensions');
    }
  } finally {
    image.onload = null;
    image.onerror = null;
    URL.revokeObjectURL(url);
  }
}

async function readImage(imageUrl: string): Promise<Blob> {
  let cache: Cache | undefined;
  try {
    cache = await globalThis.caches?.open(CACHE_NAME);
  } catch {
    // Storage can be unavailable in private mode; downloading must still work.
  }

  if (cache) {
    try {
      const response = await cache.match(imageUrl);
      if (response) {
        if (!response.ok) throw new Error('Invalid cached wallpaper response');
        const blob = await response.blob();
        await validateImage(blob);
        return blob;
      }
    } catch {
      // A corrupt entry must not permanently block retrying this wallpaper.
      try { await cache.delete(imageUrl); } catch { /* Persistence is best effort. */ }
    }
  }

  const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) throw new Error(`Unable to download wallpaper (${response.status})`);
  const blob = await response.blob();
  await validateImage(blob);
  try {
    await cache?.put(imageUrl, new Response(blob, {
      headers: { 'Content-Type': blob.type },
    }));
  } catch {
    // Quota failure must not discard an image that is already downloaded.
  }
  return blob;
}

export async function acquireWallpaperImage(imageUrl: string): Promise<WallpaperImageLease> {
  if (!knownUrls.has(imageUrl)) throw new Error('Unknown wallpaper URL');
  let request = pending.get(imageUrl);
  if (!request) {
    request = readImage(imageUrl);
    pending.set(imageUrl, request);
    void request.finally(() => pending.delete(imageUrl)).catch(() => {});
  }
  const url = URL.createObjectURL(await request);
  let released = false;
  return {
    url,
    release: () => {
      if (released) return;
      released = true;
      URL.revokeObjectURL(url);
    },
  };
}
