import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SETTINGS, loadSettings, saveSettings, subscribeSettings } from '../lib/storage';
import type { AppSettings } from '../types/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadSettings()
      .then((loadedSettings) => {
        if (!mounted) return;
        setSettings(loadedSettings);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setSettings(DEFAULT_SETTINGS);
        setReady(true);
      });

    const unsubscribe = subscribeSettings((nextSettings) => {
      if (!mounted) return;
      setSettings(nextSettings);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const updateSettings = useCallback(async function updateSettings(
    updater: Partial<AppSettings> | ((current: AppSettings) => AppSettings),
  ) {
    const nextSettings =
      typeof updater === 'function'
        ? updater(settings)
        : {
            ...settings,
            ...updater,
          };

    setSettings(nextSettings);
    await saveSettings(nextSettings);
  }, [settings]);

  return {
    ready,
    settings,
    updateSettings,
  };
}
