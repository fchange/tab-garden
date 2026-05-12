import type { AppSettings } from '../types/settings';
import { DEFAULT_ACCENT_COLOR } from './accentColors';

export const SETTINGS_KEY = 'zhi-li-tab:settings';

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'zh',
  defaultView: 'all',
  protectPinned: true,
  protectAudible: true,
  protectActive: true,
  whitelistDomains: ['mail.google.com', 'calendar.google.com'],
  theme: 'system',
  defaultAccentColor: DEFAULT_ACCENT_COLOR,
  randomAccentColor: false,
  animationEnabled: true,
  searchToggleDisplay: 'detailed',
  showPoem: true,
};

type StoredSettings = Partial<AppSettings> & {
  accentColor?: string;
  palette?: unknown;
  customSlogan?: string;
};

function normalizeSettings(storedSettings?: StoredSettings): AppSettings {
  if (!storedSettings) return DEFAULT_SETTINGS;

  const currentSettings = { ...storedSettings };

  delete currentSettings.accentColor;
  delete currentSettings.palette;
  delete currentSettings.customSlogan;

  const normalizedSettings = {
    ...DEFAULT_SETTINGS,
    ...currentSettings,
  };

  if (!normalizedSettings.randomAccentColor && !normalizedSettings.defaultAccentColor) {
    normalizedSettings.defaultAccentColor = DEFAULT_SETTINGS.defaultAccentColor;
  }

  if (normalizedSettings.searchToggleDisplay !== 'compact' && normalizedSettings.searchToggleDisplay !== 'detailed') {
    normalizedSettings.searchToggleDisplay = DEFAULT_SETTINGS.searchToggleDisplay;
  }

  return normalizedSettings;
}

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

export async function loadSettings(): Promise<AppSettings> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    return normalizeSettings(result[SETTINGS_KEY] as StoredSettings | undefined);
  }

  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;

  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;

  try {
    return normalizeSettings(JSON.parse(raw) as StoredSettings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    return;
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export function subscribeSettings(listener: (settings: AppSettings) => void): () => void {
  if (hasChromeStorage()) {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'local' || !changes[SETTINGS_KEY]?.newValue) return;
      listener(normalizeSettings(changes[SETTINGS_KEY].newValue as StoredSettings));
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== SETTINGS_KEY || !event.newValue) return;
    try {
      listener(normalizeSettings(JSON.parse(event.newValue) as StoredSettings));
    } catch {
      listener(DEFAULT_SETTINGS);
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}
