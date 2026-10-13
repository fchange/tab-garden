import { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { FloatingControlBar } from './components/FloatingControlBar';
import { MainPanel } from './components/MainPanel';
import { BookmarksBar } from './components/BookmarksBar';
import { PoemDisplay } from './components/PoemDisplay';
import { AppBackground } from './components/AppBackground';
import { ClockDisplay } from './components/ClockDisplay';
import { cn } from './lib/cn';
import type { HomeLayout } from './types/settings';
import {
  AccentProvider,
  I18nProvider,
  SettingsProvider,
  ThemeProvider,
  useAccent,
  useCopy,
  useSettingsContext,
  useTheme,
} from './lib/appContext';

export default function App() {
  return (
    <SettingsProvider>
      <I18nProvider>
        <ThemeProvider>
          <AccentProvider>
            <AppShell />
          </AccentProvider>
        </ThemeProvider>
      </I18nProvider>
    </SettingsProvider>
  );
}

function AppShell() {
  const { ready, settings } = useSettingsContext();
  const copy = useCopy();
  const { currentPalette, isDarkMode } = useTheme();
  const { accentColor } = useAccent();
  const reducedMotion = useReducedMotion();
  const handleWallpaperError = useCallback((failedId: string) => {
    if (settings.wallpaperId !== failedId) return;
    toast.error(copy.background.unavailable);
  }, [copy.background.unavailable, settings.wallpaperId]);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {ready && (
        <AppBackground
          palette={currentPalette}
          accentColor={accentColor}
          animationEnabled={settings.animationEnabled}
          wallpaperId={settings.wallpaperId}
          onWallpaperError={handleWallpaperError}
        />
      )}

      {ready && settings.showBookmarksBar && <BookmarksBar style={settings.bookmarksBarStyle} />}
      <AnimatePresence initial={false} mode="wait">
        {ready && (
          <motion.div
            key={settings.homeLayout}
            data-home-layout={settings.homeLayout}
            className="absolute inset-0 z-10 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ReadyAppContent
              homeLayout={settings.homeLayout}
              initialPoemExpanded={settings.showPoem && settings.openPoemExpandedByDefault}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {ready && <FloatingControlBar />}

      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'rounded-full border border-border bg-card text-foreground text-base',
          style: {
            boxShadow: isDarkMode
              ? '0 12px 40px rgba(0,0,0,0.4)'
              : '0 12px 40px rgba(30,50,45,0.12)',
          },
        }}
      />
    </div>
  );
}

function ReadyAppContent({ homeLayout, initialPoemExpanded }: { homeLayout: HomeLayout; initialPoemExpanded: boolean }) {
  const { settings } = useSettingsContext();
  const [poemExpanded, setPoemExpanded] = useState(initialPoemExpanded);

  useEffect(() => {
    if (!settings.showPoem) {
      setPoemExpanded(false);
      return;
    }

    if (settings.openPoemExpandedByDefault) {
      setPoemExpanded(true);
    }
  }, [settings.openPoemExpandedByDefault, settings.showPoem]);

  return (
    <>
      {homeLayout === 'clock' ? (
        <div data-clock-layout className={cn('clock-layout', settings.wallpaperId && 'clock-layout-with-wallpaper')}>
          <ClockDisplay />
          {settings.showPoem && (
            <div className="mt-[clamp(40px,7vh,80px)] flex min-h-0 w-full flex-1 flex-col items-center">
              <PoemDisplay show expanded={poemExpanded} onExpandedChange={setPoemExpanded} layout="inline" />
            </div>
          )}
        </div>
      ) : (
        <>
          <MainPanel poemExpanded={poemExpanded} />
          <PoemDisplay show={settings.showPoem} expanded={poemExpanded} onExpandedChange={setPoemExpanded} />
        </>
      )}
    </>
  );
}
