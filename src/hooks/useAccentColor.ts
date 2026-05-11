import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DEFAULT_ACCENT_COLOR,
  getAccentColorByHex,
  getNextAccentColor,
  getRandomAccentColor,
  getReadableTextColor,
} from '../lib/accentColors';
import type { AppSettings } from '../types/settings';

interface UseAccentColorOptions {
  ready: boolean;
  defaultAccentColor: string | null;
  randomAccentColor: boolean;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

export function useAccentColor({
  ready,
  defaultAccentColor,
  randomAccentColor,
  updateSettings,
}: UseAccentColorOptions) {
  const [colorSample, setColorSample] = useState(() => getAccentColorByHex(DEFAULT_ACCENT_COLOR));
  const randomAccentInitializedRef = useRef(false);
  const accentColor = colorSample.hex;
  const accentTextColor = getReadableTextColor(accentColor);

  useEffect(() => {
    if (!ready) return;

    if (randomAccentColor) {
      if (!randomAccentInitializedRef.current) {
        randomAccentInitializedRef.current = true;
        setColorSample((current) => getRandomAccentColor(current.hex));
      }

      return;
    }

    randomAccentInitializedRef.current = false;
    setColorSample(getAccentColorByHex(defaultAccentColor ?? DEFAULT_ACCENT_COLOR));
  }, [defaultAccentColor, randomAccentColor, ready]);

  const changeColor = useCallback(() => {
    setColorSample((current) => getNextAccentColor(current.hex));
  }, []);

  const useRandomAccentColor = useCallback(() => {
    randomAccentInitializedRef.current = true;
    setColorSample(getRandomAccentColor(accentColor));
    void updateSettings({ defaultAccentColor: null, randomAccentColor: true });
  }, [accentColor, updateSettings]);

  const useAccentColor = useCallback((hex: string) => {
    setColorSample(getAccentColorByHex(hex));
  }, []);

  const setDefaultAccentColor = useCallback(
    (hex: string) => {
      setColorSample(getAccentColorByHex(hex));
      randomAccentInitializedRef.current = false;
      void updateSettings({ defaultAccentColor: hex, randomAccentColor: false });
    },
    [updateSettings],
  );

  const resetAccentColor = useCallback((hex?: string | null) => {
    randomAccentInitializedRef.current = false;
    setColorSample(getAccentColorByHex(hex ?? DEFAULT_ACCENT_COLOR));
  }, []);

  return {
    accentColor,
    accentTextColor,
    colorSample,
    changeColor,
    useAccentColor,
    useRandomAccentColor,
    setDefaultAccentColor,
    resetAccentColor,
  };
}
