import { useLayoutEffect } from 'react';

import { getReadableTextColor } from '../lib/accentColors';
import { paletteToShadcnVars } from '../lib/theme';
import type { PaletteDefinition, ThemeMode } from '../types/settings';

export function useApplyThemeVars(
  palette: PaletteDefinition,
  accentColor: string,
  resolvedMode: ThemeMode,
  ready: boolean,
) {
  useLayoutEffect(() => {
    if (!ready) return;

    const root = document.documentElement;
    const themeVars = {
      ...paletteToShadcnVars(palette),
      '--accent': accentColor,
      '--theme-accent': accentColor,
      '--theme-ring': accentColor,
      '--theme-primary': accentColor,
      '--theme-primary-fg': getReadableTextColor(accentColor),
    };

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.dataset.theme = resolvedMode;
    root.style.colorScheme = resolvedMode;
    document.body.style.background = palette.bg;

    if (root.dataset.themeReady === 'true') return;

    const frame = requestAnimationFrame(() => {
      root.dataset.themeReady = 'true';
    });

    return () => cancelAnimationFrame(frame);
  }, [accentColor, palette, ready, resolvedMode]);
}
