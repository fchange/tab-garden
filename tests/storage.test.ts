import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { DEFAULT_SETTINGS, loadSettings, saveSettings, SETTINGS_KEY } from '../src/lib/storage.ts';
import { WALLPAPERS } from '../src/lib/wallpapers.ts';

describe('background settings', () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let values: Map<string, string>;

  beforeEach(() => {
    values = new Map();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  afterEach(() => {
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('keeps the mountain theme for existing settings without a wallpaper', async () => {
    values.set(SETTINGS_KEY, JSON.stringify({ theme: 'dark', showPoem: false }));
    const settings = await loadSettings();
    assert.equal(settings.wallpaperId, null);
    assert.equal(settings.theme, 'dark');
    assert.equal(settings.showPoem, false);
    assert.equal(DEFAULT_SETTINGS.wallpaperId, null);
  });

  it('falls back to mountains for unknown or malformed wallpaper IDs', async () => {
    for (const wallpaperId of ['removed-wallpaper', 'https://example.com/image.jpg', 42, { id: 'nature' }]) {
      values.set(SETTINGS_KEY, JSON.stringify({ wallpaperId }));
      assert.equal((await loadSettings()).wallpaperId, null);
    }
  });

  it('persists a chosen built-in wallpaper and restores the mountain default', async () => {
    const wallpaperId = WALLPAPERS[0].id;
    await saveSettings({ ...DEFAULT_SETTINGS, wallpaperId });
    assert.equal((await loadSettings()).wallpaperId, wallpaperId);
    await saveSettings(DEFAULT_SETTINGS);
    assert.equal((await loadSettings()).wallpaperId, null);
  });

  it('defaults legacy settings to the tabs layout without changing other preferences', async () => {
    values.set(SETTINGS_KEY, JSON.stringify({ theme: 'dark', showPoem: false, defaultView: 'window' }));
    const settings = await loadSettings();
    assert.equal(settings.homeLayout, 'tabs');
    assert.equal(settings.theme, 'dark');
    assert.equal(settings.showPoem, false);
    assert.equal(settings.defaultView, 'window');
  });

  it('persists the clock layout and resets to the tabs layout', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, homeLayout: 'clock' });
    assert.equal((await loadSettings()).homeLayout, 'clock');
    await saveSettings(DEFAULT_SETTINGS);
    assert.equal((await loadSettings()).homeLayout, 'tabs');
    assert.equal(DEFAULT_SETTINGS.homeLayout, 'tabs');
  });

  it('falls back to the tabs layout for invalid stored layout values', async () => {
    for (const homeLayout of ['unknown', '', null, false, 42, { layout: 'clock' }]) {
      values.set(SETTINGS_KEY, JSON.stringify({ homeLayout }));
      assert.equal((await loadSettings()).homeLayout, 'tabs');
    }
  });

  it('persists and normalizes the home layout through Chrome storage', async () => {
    const originalChrome = Object.getOwnPropertyDescriptor(globalThis, 'chrome');
    const stored: Record<string, unknown> = {};
    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        storage: {
          local: {
            get: async (key: string) => ({ [key]: stored[key] }),
            set: async (settings: Record<string, unknown>) => { Object.assign(stored, settings); },
          },
        },
      },
    });

    try {
      assert.equal((await loadSettings()).homeLayout, 'tabs');
      await saveSettings({ ...DEFAULT_SETTINGS, homeLayout: 'clock' });
      assert.equal((await loadSettings()).homeLayout, 'clock');
      assert.equal(values.size, 0);
      stored[SETTINGS_KEY] = { homeLayout: 'unknown', theme: 'dark' };
      assert.equal((await loadSettings()).homeLayout, 'tabs');
      assert.equal((await loadSettings()).theme, 'dark');
      await saveSettings(DEFAULT_SETTINGS);
      assert.equal((await loadSettings()).homeLayout, 'tabs');
    } finally {
      if (originalChrome) Object.defineProperty(globalThis, 'chrome', originalChrome);
      else Reflect.deleteProperty(globalThis, 'chrome');
    }
  });
});
