import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

import { FloatingControlBar } from './components/FloatingControlBar';
import { MainPanel } from './components/MainPanel';
import { BookmarksBar } from './components/BookmarksBar';
import { PoemDisplay } from './components/PoemDisplay';
import { WaveBackground } from './components/WaveBackground';
import {
  AccentProvider,
  I18nProvider,
  SettingsProvider,
  ThemeProvider,
  useAccent,
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
  const { settings } = useSettingsContext();
  const { currentPalette, isDarkMode } = useTheme();
  const { accentColor } = useAccent();

  const [poemExpanded, setPoemExpanded] = useState(false);

  useEffect(() => {
    if (!settings.showPoem) {
      setPoemExpanded(false);
    }
  }, [settings.showPoem]);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <WaveBackground palette={currentPalette} accentColor={accentColor} paused={!settings.animationEnabled} />

      {settings.showBookmarksBar && <BookmarksBar style={settings.bookmarksBarStyle} />}

      <MainPanel poemExpanded={poemExpanded} />

      <PoemDisplay show={settings.showPoem} expanded={poemExpanded} onExpandedChange={setPoemExpanded} />

      <FloatingControlBar />

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
