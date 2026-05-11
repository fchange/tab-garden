import { useEffect, useState } from 'react';

import type { ThemeMode, ThemePreference } from '../types/settings';

export function useResolvedMode(theme: ThemePreference): ThemeMode {
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}
