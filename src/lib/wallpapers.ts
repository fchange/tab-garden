import { WALLPAPERS } from './wallpaper-catalog.ts';
import { acquireWallpaperImage } from './wallpaper-cache.ts';

export { WALLPAPERS, acquireWallpaperImage };
export type { WallpaperImageLease } from './wallpaper-cache.ts';

export const WALLPAPER_CATEGORIES = ['mix', 'nature', 'water', 'city', 'minimal', 'art'] as const;

export type WallpaperCategory = (typeof WALLPAPER_CATEGORIES)[number];

export interface Wallpaper {
  id: string;
  category: Exclude<WallpaperCategory, 'mix'>;
  name: { zh: string; en: string };
  imageUrl: string;
  thumbnailUrl: string;
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  width: number;
  height: number;
}

export function getWallpaper(id: unknown): Wallpaper | null {
  return typeof id === 'string' ? WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? null : null;
}

export async function loadWallpaperImage(imageUrl: string): Promise<void> {
  const image = await acquireWallpaperImage(imageUrl);
  image.release();
}
