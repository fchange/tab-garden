import { useEffect } from 'react';

import { getReadableTextColor } from '../lib/accentColors';
import { paletteToShadcnVars } from '../lib/theme';
import type { PaletteDefinition, ThemeMode } from '../types/settings';

export function useApplyThemeVars(
  palette: PaletteDefinition,
  accentColor: string,
  resolvedMode: ThemeMode,
) {
  useEffect(() => {
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

    document.documentElement.dataset.theme = resolvedMode;
    document.documentElement.style.colorScheme = resolvedMode;
    document.body.style.background = palette.bg;
  }, [accentColor, palette, resolvedMode]);
}
