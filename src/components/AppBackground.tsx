import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { acquireWallpaperImage, getWallpaper } from '../lib/wallpapers';
import type { PaletteDefinition } from '../types/settings';
import { WaveBackground } from './WaveBackground';

interface AppBackgroundProps {
  palette: PaletteDefinition;
  accentColor: string;
  animationEnabled: boolean;
  wallpaperId: string | null;
  onWallpaperError: (id: string) => void;
}

export function AppBackground({ palette, accentColor, animationEnabled, wallpaperId, onWallpaperError }: AppBackgroundProps) {
  const [displayed, setDisplayed] = useState<{ id: string; key: number; url: string; reveal: boolean } | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  // A selected wallpaper loads over the theme color, not a different scene.
  const [allowMountains, setAllowMountains] = useState(() => !getWallpaper(wallpaperId));
  const leases = useRef(new Map<number, { release: () => void }>());
  const displayedKey = useRef<number | null>(null);
  const sequence = useRef(0);
  const previousWallpaperId = useRef(wallpaperId);
  const errorHandler = useRef(onWallpaperError);
  const reducedMotion = useReducedMotion();
  const duration = animationEnabled && !reducedMotion ? 0.55 : 0;

  useEffect(() => { errorHandler.current = onWallpaperError; }, [onWallpaperError]);

  useEffect(() => {
    const retry = () => setRetryVersion((version) => version + 1);
    const retrySelection = (event: Event) => {
      if ((event as CustomEvent<string>).detail === wallpaperId) retry();
    };
    window.addEventListener('online', retry);
    window.addEventListener('tab-garden:retry-wallpaper', retrySelection);
    return () => {
      window.removeEventListener('online', retry);
      window.removeEventListener('tab-garden:retry-wallpaper', retrySelection);
    };
  }, [wallpaperId]);

  useEffect(() => {
    const ownedLeases = leases.current;
    return () => {
      for (const lease of ownedLeases.values()) lease.release();
      ownedLeases.clear();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const wallpaper = getWallpaper(wallpaperId);
    const reveal = wallpaperId !== previousWallpaperId.current;
    previousWallpaperId.current = wallpaperId;

    if (!wallpaper) {
      setAllowMountains(true);
      displayedKey.current = null;
      setDisplayed(null);
      return;
    }
    if (displayed?.id === wallpaper.id && displayedKey.current === displayed.key) return;

    // Keep the current background until the next image is ready to paint.
    acquireWallpaperImage(wallpaper.imageUrl)
      .then((lease) => {
        if (cancelled) {
          lease.release();
          return;
        }
        const key = ++sequence.current;
        leases.current.set(key, lease);
        displayedKey.current = key;
        setDisplayed({ id: wallpaper.id, key, url: lease.url, reveal });
      })
      .catch(() => {
        if (!cancelled) {
          setAllowMountains(true);
          displayedKey.current = null;
          setDisplayed(null);
          errorHandler.current(wallpaper.id);
        }
      });

    return () => { cancelled = true; };
  }, [wallpaperId, retryVersion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: palette.bg }}
    >
      {allowMountains && (
        <WaveBackground palette={palette} accentColor={accentColor} paused={!animationEnabled || !!reducedMotion || !!displayed} />
      )}
      <AnimatePresence custom={!!displayed} onExitComplete={() => {
        // An outgoing image must retain its URL until the next reveal is complete.
        for (const [key, lease] of leases.current) {
          if (key !== displayedKey.current) {
            lease.release();
            leases.current.delete(key);
          }
        }
      }}>
        {displayed && (
          <motion.div
            key={displayed.key}
            className="absolute inset-0"
            style={{ zIndex: displayed.key }}
            // A cached new tab should not replay the full-screen scene change.
            initial={displayed.reveal ? { clipPath: 'inset(0 0 100% 0)' } : false}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            variants={{
              exit: (hasIncoming: boolean) => ({
                opacity: 0,
                transition: {
                  delay: hasIncoming ? duration : 0,
                  duration: hasIncoming ? 0 : Math.min(duration, 0.25),
                },
              }),
            }}
            exit="exit"
            transition={{ duration, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <img
              src={displayed.url}
              alt=""
              decoding="async"
              className="h-full w-full object-cover"
              onError={() => {
                if (displayedKey.current === displayed.key) {
                  setAllowMountains(true);
                  displayedKey.current = null;
                  setDisplayed(null);
                  errorHandler.current(displayed.id);
                }
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: palette.mode === 'dark'
                  ? 'linear-gradient(180deg, rgba(10,18,24,0.48) 0%, rgba(10,18,24,0.18) 44%, rgba(10,18,24,0.56) 100%)'
                  : 'linear-gradient(180deg, rgba(246,250,248,0.42) 0%, rgba(246,250,248,0.12) 44%, rgba(246,250,248,0.48) 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
