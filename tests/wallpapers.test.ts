import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { getWallpaper, WALLPAPERS, WALLPAPER_CATEGORIES } from '../src/lib/wallpapers.ts';

describe('selected online wallpaper gallery', () => {
  it('includes exactly 42 unique wallpapers in every category, with Mix representing the whole collection', () => {
    assert.equal(WALLPAPERS.length, 42);
    assert.equal(new Set(WALLPAPERS.map((wallpaper) => wallpaper.id)).size, WALLPAPERS.length);
    for (const category of WALLPAPER_CATEGORIES.filter((category) => category !== 'mix')) {
      assert.ok(WALLPAPERS.some((wallpaper) => wallpaper.category === category), category);
    }
    for (const wallpaper of WALLPAPERS) assert.equal(getWallpaper(wallpaper.id), wallpaper);
    for (const id of [null, undefined, '', '__proto__', {}, 42]) assert.equal(getWallpaper(id), null);
  });

  it('uses only exact versioned HTTPS CDN hashes and retains verified attribution', () => {
    for (const wallpaper of WALLPAPERS) {
      for (const [url, kind] of [[wallpaper.imageUrl, 'image'], [wallpaper.thumbnailUrl, 'thumbnail']] as const) {
        assert.equal(new URL(url).origin, 'https://oos.jellys.rest');
        assert.match(new URL(url).pathname, new RegExp(`^/wallpapers/v1/${wallpaper.id}/${kind}-[a-f0-9]{16}\\.webp$`));
      }
      assert.ok(WALLPAPER_CATEGORIES.includes(wallpaper.category));
      assert.ok(wallpaper.name.zh.trim() && wallpaper.name.en.trim());
      assert.ok(wallpaper.author.trim() && wallpaper.license.trim());
      assert.equal(new URL(wallpaper.sourceUrl).protocol, 'https:');
      assert.equal(new URL(wallpaper.licenseUrl).protocol, 'https:');
      assert.ok(wallpaper.width > 0 && wallpaper.width <= 3840);
      assert.ok(wallpaper.height > 0 && wallpaper.height <= 2160);
    }
    assert.equal(WALLPAPERS.filter((item) => item.width === 3840 && item.height === 2160).length, 19);
    // Freeze reviewed attribution without depending on local curation exports.
    const attribution = WALLPAPERS.map(({ id, name, category, author, sourceUrl, license, licenseUrl }) => ({ id, name, category, author, sourceUrl, license, licenseUrl }));
    assert.equal(createHash('sha256').update(JSON.stringify(attribution)).digest('hex'), '9b975ee8a41eba7e34ae59ce4a209bf10f7d6156733da684819e1dae350b91eb');
    const delivery = WALLPAPERS.map(({ id, imageUrl, thumbnailUrl, width, height }) => ({ id, imageUrl, thumbnailUrl, width, height }));
    assert.equal(createHash('sha256').update(JSON.stringify(delivery)).digest('hex'), 'dbc7713accbbbf5c830452604cf67e50735d54fe1bed579fbe542b37f930f01c');
  });
});
