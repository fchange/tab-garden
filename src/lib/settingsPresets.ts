import type { AppSettings } from '../types/settings';

const PRESET_FIELDS = [
  'homeLayout',
  'showPoem',
  'openPoemExpandedByDefault',
  'wallpaperId',
  'language',
] as const;

export type SettingsPresetId = 'mountain-verse' | 'mountain-poetry' | 'florence-clock' | 'prater-poetry';
export type SettingsPresetValues = Pick<AppSettings, (typeof PRESET_FIELDS)[number]>;

export interface SettingsPreset {
  id: SettingsPresetId;
  settings: SettingsPresetValues;
}

export const SETTINGS_PRESETS = [
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
] as const satisfies readonly SettingsPreset[];

export function isSettingsPresetActive(settings: AppSettings, preset: SettingsPreset): boolean {
  return PRESET_FIELDS.every((field) => settings[field] === preset.settings[field]);
}
