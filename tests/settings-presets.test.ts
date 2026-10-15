import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isSettingsPresetActive, SETTINGS_PRESETS } from '../src/lib/settingsPresets.ts';
import { DEFAULT_SETTINGS } from '../src/lib/storage.ts';
import { getWallpaper } from '../src/lib/wallpapers.ts';

describe('settings presets', () => {
  it('defines the four requested combinations using only their shared settings', () => {
    assert.deepEqual(SETTINGS_PRESETS, [
      {
        id: 'mountain-verse',
        settings: {
          homeLayout: 'tabs',
          showPoem: true,
          openPoemExpandedByDefault: false,
          wallpaperId: null,
          language: 'zh',
        },
      },
      {
        id: 'mountain-poetry',
        settings: {
          homeLayout: 'tabs',
          showPoem: true,
          openPoemExpandedByDefault: true,
          wallpaperId: null,
          language: 'zh',
        },
      },
      {
        id: 'florence-clock',
        settings: {
          homeLayout: 'clock',
          showPoem: false,
          openPoemExpandedByDefault: false,
          wallpaperId: 'cleveland-136911',
          language: 'en',
        },
      },
      {
        id: 'prater-poetry',
        settings: {
          homeLayout: 'clock',
          showPoem: true,
          openPoemExpandedByDefault: false,
          wallpaperId: 'cleveland-151298',
          language: 'en',
        },
      },
    ]);
  });

  it('references available wallpapers and keeps mountains as the null background', () => {
    assert.equal(SETTINGS_PRESETS[0].settings.wallpaperId, null);
    assert.equal(SETTINGS_PRESETS[1].settings.wallpaperId, null);
    assert.equal(getWallpaper(SETTINGS_PRESETS[2].settings.wallpaperId)?.name.en, 'View of Florence');
    assert.equal(getWallpaper(SETTINGS_PRESETS[3].settings.wallpaperId)?.name.en, 'Prater Landscape');
  });

  it('recognizes a preset without treating unrelated preferences as part of it', () => {
    const preset = SETTINGS_PRESETS[0];
    const settings = {
      ...DEFAULT_SETTINGS,
      ...preset.settings,
      theme: 'dark' as const,
      showBookmarksBar: true,
      protectPinned: false,
    };

    assert.equal(isSettingsPresetActive(settings, preset), true);
    assert.equal(isSettingsPresetActive({ ...settings, language: 'en' }, preset), false);
  });
});
