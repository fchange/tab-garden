import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useAccentColor } from '../hooks/useAccentColor';
import { useApplyThemeVars } from '../hooks/useApplyThemeVars';
import { useResolvedMode } from '../hooks/useResolvedMode';
import { useSettings as useStoredSettings } from '../hooks/useSettings';
import { getCopy, type AppCopy } from './i18n';
import { getThemePalette } from './theme';
import type { AppSettings, ColorSample, PaletteDefinition } from '../types/settings';

type UpdateSettings = (updater: Partial<AppSettings> | ((current: AppSettings) => AppSettings)) => Promise<void>;

interface SettingsContextValue {
  ready: boolean;
  settings: AppSettings;
  updateSettings: UpdateSettings;
}

interface I18nContextValue {
  copy: AppCopy;
}

interface ThemeContextValue {
  resolvedMode: 'light' | 'dark';
  isDarkMode: boolean;
  currentPalette: PaletteDefinition;
  toggleTheme: () => void;
}

interface AccentContextValue {
  accentColor: string;
  accentTextColor: string;
  colorSample: ColorSample;
  changeColor: () => void;
  useAccentColor: (hex: string) => void;
  useRandomAccentColor: () => void;
  setDefaultAccentColor: (hex: string) => void;
  resetAccentColor: (defaultAccentColor: string | null) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const I18nContext = createContext<I18nContextValue | null>(null);
const ThemeContext = createContext<ThemeContextValue | null>(null);
const AccentContext = createContext<AccentContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const value = useStoredSettings();

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettingsContext();
  const copy = useMemo(() => getCopy(settings.language), [settings.language]);
  const value = useMemo(() => ({ copy }), [copy]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useSettingsContext();
  const resolvedMode = useResolvedMode(settings.theme);
  const isDarkMode = resolvedMode === 'dark';
  const currentPalette = useMemo(() => getThemePalette(resolvedMode), [resolvedMode]);
  const value = useMemo(
    () => ({
      resolvedMode,
      isDarkMode,
      currentPalette,
      toggleTheme: () => {
        void updateSettings({ theme: isDarkMode ? 'light' : 'dark' });
      },
    }),
    [currentPalette, isDarkMode, resolvedMode, updateSettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function AccentProvider({ children }: { children: ReactNode }) {
  const { ready, settings, updateSettings } = useSettingsContext();
  const { currentPalette, resolvedMode } = useTheme();
  const value = useAccentColor({
    ready,
    defaultAccentColor: settings.defaultAccentColor,
    randomAccentColor: settings.randomAccentColor,
    updateSettings,
  });

  useApplyThemeVars(currentPalette, value.accentColor, resolvedMode);

  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }

  return context;
}

export function useCopy() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useCopy must be used within I18nProvider');
  }

  return context.copy;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

export function useAccent() {
  const context = useContext(AccentContext);

  if (!context) {
    throw new Error('useAccent must be used within AccentProvider');
  }

  return context;
}
