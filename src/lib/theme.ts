import type { PaletteDefinition, ThemeMode } from '../types/settings';

export function paletteToShadcnVars(
  palette: PaletteDefinition,
): Record<string, string> {
  const isDark = palette.mode === 'dark';

  return {
    '--theme-bg': palette.bg,
    '--theme-fg': palette.text,
    '--theme-card': palette.card,
    '--theme-popover': isDark ? 'rgba(28, 28, 28, 0.94)' : 'rgba(255, 255, 255, 0.92)',
    '--theme-surface': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.38)',
    '--theme-surface-strong': isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.56)',
    '--theme-surface-soft': isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.26)',
    '--theme-primary': palette.chipActive,
    '--theme-primary-fg': palette.chipText,
    '--theme-secondary': palette.chip,
    '--theme-muted': isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    '--theme-fg-soft': palette.textSoft,
    '--theme-accent': palette.wave3,
    '--theme-destructive': isDark ? '#ef4444' : '#dc2626',
    '--theme-destructive-fg': '#ffffff',
    '--theme-border': palette.border,
    '--theme-border-strong': isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.54)',
    '--theme-input': palette.input,
    '--theme-ring': palette.wave3,
    '--theme-shadow-soft': palette.shadow,
    '--theme-shadow-elevated': isDark
      ? '0 36px 96px rgba(0, 0, 0, 0.4)'
      : '0 30px 80px rgba(111, 131, 126, 0.16)',
    '--theme-inset-highlight': isDark
      ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.38)',
  };
}

const THEME_PALETTES: Record<ThemeMode, PaletteDefinition> = {
  light: {
    mode: 'light',
    bg: '#f6faf8',
    wave1: '#d8eee8',
    wave2: '#b9ddd3',
    wave3: '#8fbfaf',
    wave4: '#78a596',
    text: '#243833',
    textSoft: 'rgba(36, 56, 51, 0.68)',
    card: 'rgba(255, 255, 255, 0.62)',
    border: 'rgba(255, 255, 255, 0.48)',
    shadow: '0 24px 80px rgba(30, 50, 45, 0.12)',
    chip: 'rgba(255, 255, 255, 0.4)',
    chipActive: 'rgba(36, 56, 51, 0.88)',
    chipText: '#f5fbf9',
    input: 'rgba(255, 255, 255, 0.5)',
  },
  dark: {
    mode: 'dark',
    bg: '#323232',
    wave1: '#1d2f3a',
    wave2: '#264653',
    wave3: '#3a6b73',
    wave4: '#4e868c',
    text: '#edf6f4',
    textSoft: 'rgba(237, 246, 244, 0.7)',
    card: 'rgba(17, 24, 32, 0.58)',
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
    chip: 'rgba(255, 255, 255, 0.06)',
    chipActive: 'rgba(237, 246, 244, 0.88)',
    chipText: '#152126',
    input: 'rgba(255, 255, 255, 0.06)',
  },
};

export function getThemePalette(mode: ThemeMode): PaletteDefinition {
  return THEME_PALETTES[mode];
}
