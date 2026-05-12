import type { ViewMode } from './tab';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemeMode = 'light' | 'dark';
export type LanguagePreference = 'en' | 'zh';
export type SearchToggleDisplay = 'compact' | 'detailed';

export interface ColorSample {
  hex: string;
  name: string;
  pinyin: string;
}

export interface PaletteDefinition {
  mode: ThemeMode;
  bg: string;
  wave1: string;
  wave2: string;
  wave3: string;
  wave4: string;
  text: string;
  textSoft: string;
  card: string;
  border: string;
  shadow: string;
  chip: string;
  chipActive: string;
  chipText: string;
  input: string;
}

export interface AppSettings {
  language: LanguagePreference;
  defaultView: ViewMode;
  protectPinned: boolean;
  protectAudible: boolean;
  protectActive: boolean;
  whitelistDomains: string[];
  theme: ThemePreference;
  defaultAccentColor: string | null;
  randomAccentColor: boolean;
  animationEnabled: boolean;
  searchToggleDisplay: SearchToggleDisplay;
  showPoem: boolean;
}
